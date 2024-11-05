<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoguinTicketStoreController extends Controller
{
    protected $glpi;

    public function __construct()
    {
        $this->glpi = DB::connection('glpi');
    }
    
    public function storeLoguinTicket(Request $request)
    {
        // Iniciar una transacción para asegurar la consistencia de los datos
        DB::beginTransaction();

        try {
            // Validar los datos del request para asegurar que sean válidos
            $validatedData = $request->validate([
                'tipo_identificacion' => 'required|integer',
                'identificacion' => 'required|string|max:255',
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'zonal_id' => 'required|integer',
                'sede_id' => 'required|integer',
                'aplicaciones' => 'required|array',
                'infraestructura' => 'nullable|array',
                'especialidad' => 'nullable|string|max:255',
            ]);

            // Datos enviados desde el frontend
            $tipo_identificacion_id = $validatedData['tipo_identificacion'];
            $identificacion = $validatedData['identificacion'];
            $nombre = $validatedData['nombre'];
            $apellido = $validatedData['apellido'];
            $email = $validatedData['email'];
            $zonal_id = $validatedData['zonal_id'];
            $sede_id = $validatedData['sede_id'];
            $aplicaciones = $validatedData['aplicaciones'];
            $infraestructura = $validatedData['infraestructura'] ?? [];
            $nombre_especialidad = $validatedData['especialidad'] ?? null;
    
            // Crear usuario en la tabla loguin_usuarios
            $appUserId = $this->createUser($tipo_identificacion_id, $identificacion, $nombre, $apellido, $email);
    
            // Registrar solicitudes asociados al usuario
            $solicitudId = $this->registerUserRequest($appUserId, $zonal_id, $sede_id);

            // Registrar aplicaciones y perfiles asociados al usuario
            $this->registerUserApplications($aplicaciones, $solicitudId);
    
            // Registrar especialidad si es necesario
            $nombreEspecialidad = $this->registerUserSpeciality($nombre_especialidad, $appUserId, $solicitudId);
    
            // Generar tabla codificada para el ticket
            $dataUsuario = $this->getUserData($appUserId);
            $dataAplicacioPerfil = $this->getUserApplicationsAndProfiles($appUserId, $solicitudId);
            $encodedTable = $this->generateEncodedTable($dataUsuario, $dataAplicacioPerfil, $nombreEspecialidad);
    
            // Crear el ticket de loguin
            $ticketLoguin = $this->createLoguinTicket($identificacion, $encodedTable);

            // Actualizar la solicitud con el ticket de loguin
            $this->updateLoguinRequest($solicitudId, $ticketLoguin);
    
            // Crear el ticket de infraestructura si es necesario
            if ($this->shouldCreateInfrastructureTicket($infraestructura)) {
                $ticketInfra = $this->createInfrastructureTicket($identificacion, $dataUsuario, $infraestructura, $appUserId, $zonal_id, $sede_id);
            }

            // Confirmar la transacción si todo salió bien
            DB::commit();

            //error_log(__LINE__ . __METHOD__ . ' respuesta --->' .var_export($ticketLoguin, true));
    
            return response()->json([
                'message' => 'Datos guardados exitosamente',
                'ticketLoguin' => $ticketLoguin,
                'ticketInfraestructura' => $ticketInfra ?? null,
            ], 200);
    
        } catch (\Exception $e) {
            // Manejar errores y hacer rollback si es necesario
            // En caso de error, revertir la transacción
            DB::rollBack();

            return response()->json([
                'message' => 'Error al guardar los datos '.$e->getMessage(), 
                'error' => $e->getFile(), 'line '.$e->getLine(),
            ], 500);
        }
    }
    
    // Función para crear un usuario
    private function createUser($tipo_identificacion_id, $identificacion, $nombre, $apellido, $email)
    {
        // Intentar encontrar el usuario existente
        $user = $this->glpi->table('loguin_usuarios')
            ->where('tipoidentificacion_id', $tipo_identificacion_id)
            ->where('identificacion', $identificacion)
            ->first();

        if ($user) {
            // Si el usuario ya existe, actualizar sus datos
            $this->glpi->table('loguin_usuarios')
                ->where('id', $user->id)
                ->update([
                    'apellidos' => $apellido,
                    'nombres' => $nombre,
                    'email' => $email,
                ]);

            // Usar el ID del usuario existente
            $appUserId = $user->id;
        } else {
            // Si no existe, insertarlo y obtener el ID
            $appUserId = $this->glpi->table('loguin_usuarios')->insertGetId([
                'tipoidentificacion_id' => $tipo_identificacion_id,
                'identificacion' => $identificacion,
                'apellidos' => $apellido,
                'nombres' => $nombre,
                'email' => $email,
                'fecha_creacion' => now('America/Bogota'),
            ]);
        }

        return $appUserId;
    }
    
    // Función para registrar solicitudes asociados al usuario
    private function registerUserRequest($appUserId, $zonal_id, $sede_id)
    {
        $solicitudId = $this->glpi->table('loguin_solicitud')->insertGetId([
            'usuario_id' => $appUserId,
            'zonal_id' => $zonal_id,
            'sede_id' => $sede_id,
        ]);

        return $solicitudId;
    }

    // Función para registrar aplicaciones y perfiles asociados al usuario
    private function registerUserApplications($aplicaciones, $solicitudId)
    {
        foreach ($aplicaciones as $aplicacion) {
            $this->glpi->table('loguin_solicitud_detalle')->insert([
                'solicitud_id' => $solicitudId,
                'aplicacion_id' => $aplicacion['app_id'],
                'perfil_id' => $aplicacion['perfil_id'],
                'fecha_creacion' => now('America/Bogota'),
            ]);
        }
    }
    
    // Función para registrar la especialidad del usuario si aplica
    private function registerUserSpeciality($nombre_especialidad, $appUserId, $solicitudId)
    {
        if (!empty($nombre_especialidad)) {
            $especialidadId = $this->glpi->table('loguin_especialidades')
                ->whereIn('name', [$nombre_especialidad])
                ->where('estado', 1)
                ->first(['id', 'name']);
    
            if ($especialidadId) {
                 $this->glpi->table('loguin_especialidad_usuario')->insert([
                    'especialidad_id' => $especialidadId->id,
                    'usuario_id' => $appUserId,
                    'solicitud_id' => $solicitudId,
                    'fecha_creacion' => now('America/Bogota'),
                ]);
                
                $nombreEspecialidad = $especialidadId->name;
    
                return $nombreEspecialidad;
            }
        }
    }
    
    // Función para obtener la información del usuario
    private function getUserData($appUserId)
    {
        return $this->glpi->table('loguin_solicitud as a')
            ->join('loguin_usuarios as b', 'b.id', 'a.usuario_id')
            ->join('loguin_tipo_identificacion as c', 'c.id', 'b.tipoidentificacion_id')
            ->where('a.usuario_id', $appUserId)
            ->select([
                'a.usuario_id',
                'c.abreviatura as tipo_documento',
                'b.identificacion',
                DB::raw("CONCAT(b.nombres,' ',b.apellidos) as nombres_apellidos"),
                'b.email',
            ])->first();
    }
    
    // Función para obtener las aplicaciones y perfiles asociados al usuario
    private function getUserApplicationsAndProfiles($appUserId, $solicitudId)
    {
        return $this->glpi->table('loguin_solicitud as a')
            ->join('loguin_solicitud_detalle as b', 'b.solicitud_id', 'a.id')
            ->join('glpi_locations as c', 'c.id', 'a.sede_id')
            ->join('loguin_aplicaciones as d', 'd.id', 'b.aplicacion_id')
            ->join('loguin_perfil as e', 'e.id', 'b.perfil_id')
            ->where('a.usuario_id', $appUserId)
            ->where('b.solicitud_id', $solicitudId)
            ->select([
                'a.usuario_id',
                'c.name as sede',
                'd.name as aplicaciones',
                'e.name as perfiles',
            ])->get();
    }
    
    // Función para generar la tabla codificada para el ticket
    private function generateEncodedTable($dataUsuario, $dataAplicacioPerfil, $nombreEspecialidad)
    {
        $encodedTable = '
        <div tabindex="0">
            <table style="border: 1px solid #87aa8a;">
                <thead>
                    <tr>
                        <th>TIPO DE DOCUMENTO:</th>
                        <td>' . $dataUsuario->tipo_documento . '</td>
                    </tr>
                    <tr>
                        <th>NÚMERO DE DOCUMENTO:</th>
                        <td>' . $dataUsuario->identificacion . '</td>
                    </tr>
                    <tr>
                        <th>NOMBRES Y APELLIDOS:</th>
                        <td>' . $dataUsuario->nombres_apellidos . '</td>
                    </tr>
                    <tr>
                        <th>EMAIL:</th>
                        <td>' . $dataUsuario->email . '</td>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <br>
        <div tabindex="0">
            <table style="border: 1px solid #87aa8a;">
                <thead>
                    <tr>
                        <th>SEDE</th>
                        <th>APLICACIONES</th>
                        <th>PERFILES</th>
                    </tr>
                </thead>';
    
        foreach ($dataAplicacioPerfil as $appPerfil) {
            $encodedTable .= '
                <tr>
                    <td>' . $appPerfil->sede . '</td>
                    <td>' . $appPerfil->aplicaciones . '</td>
                    <td>' . strtoupper($appPerfil->perfiles) . '</td>
                </tr>';
        }
    
        $encodedTable .= '
                <tbody></tbody>
            </table>
        </div>
        <br>';

        if ($nombreEspecialidad) {
            $encodedTable .= '
                <div tabindex="0">
                    <table style="border: 1px solid #87aa8a;">
                        <thead>
                            <tr>
                                <th>ESPECIALIDAD</th>
                            </tr>
                        </thead>
                        <tr>
                            <td>' . $nombreEspecialidad . '</td>
                        </tr>
                        <tbody></tbody>
                    </table>
                </div>';
        }
    
        return $encodedTable;
    }

    // Función para crear un ticket de Loguin
    private function createLoguinTicket($identificacion, $encodedTable)
    {
        // Insertar el ticket en la base de datos
        $ticketId = $this->glpi->table('glpi_tickets')->insertGetId([
            'name' => '[PRUEBA] SOLICITUD USUARIO LOGIN DE PANA EVEREST - ' . $identificacion,
            'date' => now('America/Bogota'),
            'content' => $encodedTable,
            'users_id_recipient' => 102, // ID del usuario que envía la solicitud
            'date_mod' => now('America/Bogota'),
            'users_id_lastupdater' => 102, // ID del usuario que envía la solicitud
            'itilcategories_id' => 8, // Categoría del ticket
            'time_to_resolve' => now('America/Bogota'),
            'time_to_own' => now('America/Bogota'),
            'locations_id' => 183, // ID de la sede
            'date_creation' => now('America/Bogota'),
            'entities_id' => 0,
            'closedate' => null,
            'solvedate' => null,
            'takeintoaccountdate' => null,
            'status' => 2,
            'requesttypes_id' => 1,
            'urgency' => 3,
            'impact' => 3,
            'priority' => 3,
            'type' => 2,
            'global_validation' => 1,
            'slas_id_ttr' => 5,
            'slas_id_tto' => 7,
            'slalevels_id_ttr' => 0,
            'begin_waiting_date' => null,
            'sla_waiting_duration' => 0,
            'ola_waiting_duration' => 0,
            'olas_id_tto' => 0,
            'olas_id_ttr' => 0,
            'olalevels_id_ttr' => 0,
            'ola_ttr_begin_date' => null,
            'internal_time_to_resolve' => null,
            'internal_time_to_own' => null,
            'waiting_duration' => 0,
            'close_delay_stat' => 0,
            'solve_delay_stat' => 0,
            'takeintoaccount_delay_stat' => 0,
            'actiontime' => 0,
            'is_deleted' => 0,
            'validation_percent' => 0,
            'ola_tto_begin_date' => null
        ]);

        // Asignar el ticket al grupo "Loguin"
        $this->glpi->table('glpi_groups_tickets')->insert([
            'tickets_id' => $ticketId,
            'groups_id' => 6, // ID del grupo "Loguin"
            'type' => 2
        ]);

        // Retornar el ID del ticket creado
        return $ticketId;
    }

    // Función para actualizar un ticket de Loguin con la solicitud
    private function updateLoguinRequest($solicitudId, $ticketLoguin)
    {
        $this->glpi->table('loguin_solicitud')->where('id', $solicitudId)->update(['ticket_id' => $ticketLoguin]);
    }
    
    // Función para verificar si se debe crear un ticket de infraestructura
    private function shouldCreateInfrastructureTicket(array $infraestructura): bool
    {
        foreach ($infraestructura as $req) {
            if (isset($req['radio_valor']) && $req['radio_valor'] == 1) {
                return true;
            }
        }
        return false;
    }

    // Función para generar la tabla codificada para el ticket de infraestructura
    private function generateInfrastructureEncodedTable($dataUsuario, $infraestructura)
    {
        $encodedTable = '
        <div tabindex="0">
            <table style="border: 1px solid #87aa8a;">
                <thead>
                    <tr>
                        <th>TIPO DE DOCUMENTO:</th>
                        <td>' . $dataUsuario->tipo_documento . '</td>
                    </tr>
                    <tr>
                        <th>NÚMERO DE DOCUMENTO:</th>
                        <td>' . $dataUsuario->identificacion . '</td>
                    </tr>
                    <tr>
                        <th>NOMBRES Y APELLIDOS:</th>
                        <td>' . $dataUsuario->nombres_apellidos . '</td>
                    </tr>
                    <tr>
                        <th>EMAIL:</th>
                        <td>' . $dataUsuario->email . '</td>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <br>
        <div tabindex="0">
            <table style="border: 1px solid #87aa8a;">
                <thead>';

        // Agregar filas para cada requerimiento de infraestructura
        foreach ($infraestructura as $req) {
            if ($req['radio_valor'] == 1) {
                $encodedTable .= '
                    <tr>
                        <th>' . $req['radio_solicitud'] . '</th>
                        <td>' . ($req['radio_valor'] == 1 ? 'Sí' : null) . '</td>
                    </tr>';
            }
        }

        $encodedTable .= '
                </thead>
                <tbody></tbody>
            </table>
        </div>';

        return $encodedTable;
    }
    
    // Función para crear el ticket de infraestructura
    private function createInfrastructureTicket($identificacion, $dataUsuario, $infraestructura, $appUserId, $zonal_id, $sede_id)
    {
        $encodedTableInfra = $this->generateInfrastructureEncodedTable($dataUsuario, $infraestructura);

        // Insertar en la base de datos
        $solicitudes = [
            'usuario_id' => $appUserId,
            'zonal_id' => $zonal_id,
            'sede_id' => $sede_id,
            'solicito_correo' => isset($infraestructura[0]['radio_valor']) ? $infraestructura[0]['radio_valor'] : 0,
            'solicito_usuario_dominio' => isset($infraestructura[1]['radio_valor']) ? $infraestructura[1]['radio_valor'] : 0,
            'solicito_vpn' => isset($infraestructura[2]['radio_valor']) ? $infraestructura[2]['radio_valor'] : 0,
            'fecha_creacion' => now('America/Bogota'),
        ];

        $solicitudInfra = $this->glpi->table('loguin_solicitud_infraestructura')->insertGetId($solicitudes);
    
        $ticketInfra = $this->glpi->table('glpi_tickets')->insertGetId([
            'name' => '[PRUEBA] SOLICITUD USUARIO (CORREO, USUARIO DOMINIO, VPN)- ' . $identificacion,
            'date' => now('America/Bogota'),
            'content' => $encodedTableInfra,
            'users_id_recipient' => 102,
            'date_mod' => now('America/Bogota'),
            'users_id_lastupdater' => 102,
            'itilcategories_id' => 48,
            'time_to_resolve' => now('America/Bogota'),
            'time_to_own' => now('America/Bogota'),
            'locations_id' => 183,
            'date_creation' => now('America/Bogota'),
            'entities_id' => 0, 
            'closedate' => null, 
            'solvedate' => null , 
            'takeintoaccountdate' => null, 
            'status' => 2, 
            'requesttypes_id' => 1, 
            'urgency' => 3, 
            'impact' => 3, 
            'priority' => 3, 
            'type' => 2, 
            'global_validation' => 1, 
            'slas_id_ttr' => 5, 
            'slas_id_tto' => 7, 
            'slalevels_id_ttr' => 0, 
            'begin_waiting_date' => null,
            'sla_waiting_duration' => 0,
            'ola_waiting_duration' => 0, 
            'olas_id_tto' => 0, 
            'olas_id_ttr' => 0, 
            'olalevels_id_ttr' => 0, 
            'ola_ttr_begin_date' => null, 
            'internal_time_to_resolve' => null, 
            'internal_time_to_own'=> null, 
            'waiting_duration' => 0, 
            'close_delay_stat' => 0, 
            'solve_delay_stat' => 0, 
            'takeintoaccount_delay_stat' => 0, 
            'actiontime' => 0, 
            'is_deleted' => 0, 
            'validation_percent' => 0, 
            'ola_tto_begin_date' => null
        ]);
    
        // Asociar ticket con el grupo
        $this->glpi->table('glpi_groups_tickets')->insert([
            'tickets_id' => $ticketInfra,
            'groups_id' => 38,
        ]);
        
        // Update de la solicitud creada con el ticket
        $this->glpi->table('loguin_solicitud_infraestructura')->where('id', $solicitudInfra)->update(['ticket_id' => $ticketInfra]);

        return $ticketInfra;
    }
}
