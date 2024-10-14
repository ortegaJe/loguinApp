<?php

namespace App\Http\Controllers;

use App\Enums\OpcionesConstantes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DropdownController extends Controller
{
    protected $glpi;

    public function __construct()
    {
        $this->glpi = DB::connection('glpi');
    }

    public function index()
    {
/*         $dataUsuario = $this->glpi->table('loguin_solicitud as a')
        ->join('loguin_usuarios as b', 'b.id', 'a.usuario_id')
        ->join('loguin_tipo_identificacion as c', 'c.id', 'b.tipoidentificacion_id')
        ->where('a.usuario_id', 4)
        ->select([
            'a.usuario_id',
            'c.abreviatura',
            'b.identificacion',
            DB::raw("CONCAT(b.nombres,' ',b.apellidos) as nombres_apellidos"),
            'b.email',
        ])->first();

        //return $dataUsuario;

        $dataAplicacioPerfil = $this->glpi->table('loguin_solicitud as a')
        ->join('loguin_usuarios as b', 'b.id', 'a.usuario_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->join('loguin_aplicaciones as d', 'd.id', 'a.aplicacion_id')
        ->join('loguin_perfil as e', 'e.id', 'a.perfil_id')
        ->where('a.usuario_id', $dataUsuario->usuario_id)
        ->select([
            'a.usuario_id',
            'c.name as sede',
            'd.name as aplicaciones',
            'e.name as perfiles'
        ])->get();

        return ['usuario' => $dataUsuario, 'aplicacionesPerfiles' => $dataAplicacioPerfil];
 */
        $data = [];

        //LOCAL
        //$data['zonales'] = DB::table('glpi_locations')->where('sw_regional', 1)->get(['name', 'id']);
        //REMOTO
        $data['zonales'] = $this->glpi->table('glpi_locations')->where('sw_regional', 1)->orderBy('name')->get(['name', 'id']);
        $data['tipos_identificacion'] = $this->glpi->table('loguin_tipo_identificacion')->orderBy('abreviatura')->get(['abreviatura', 'id']);
        $data['opciones_constantes'] = OpcionesConstantes::OPCIONES;

        return view('loguin-create.index', $data);
    }

    public function fetchSedes(Request $request)
    {
        $zonal_id = $request->input('zonal_id');

        //LOCAL
        //$data['sedes'] = DB::table('app_sedes')->where('zonal_id', $zonal_id)->get(['nombre', 'id']);
        //REMOTO
        $data['sedes'] = $this->glpi->table('glpi_locations')->where('locations_id', $zonal_id)->orderBy('name')->get(['name', 'id']);
        return response()->json($data);
    }

    public function fetchTipoCargoSede(Request $request)
    {
        $request->validate([
            'sede_id' => 'required|integer',
        ]);

        $sede_id = $request->input('sede_id');

        $data['tipo_cargo_sede'] = $this->glpi->table('loguin_rel_tipo_cargo_sede as a')
                                        ->join('loguin_tipo_cargo as b', 'b.id', 'a.tipocargo_id')
                                        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
                                        ->where('c.id', $sede_id)
                                        ->where('b.estado', true)
                                        ->distinct('b.name')
                                        ->orderBy('b.name')
                                        ->get(['b.name', 'b.id']);

        return response()->json($data);
    }

    public function fetchCargoSede(Request $request)
    {
       $request->validate([
            'tipo_cargo_id' => 'required|integer',
        ]);

        $tipo_cargo_id = $request->input('tipo_cargo_id');

        $data['cargo_sede'] = $this->glpi->table('loguin_rel_tipo_cargo_sede as a')
                                        ->join('loguin_tipo_cargo as b', 'b.id', 'a.tipocargo_id')
                                        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
                                        ->join('loguin_cargo as d', 'd.id', 'a.cargo_id')
                                        //->where('c.id', 16)
                                        ->where('a.tipocargo_id', $tipo_cargo_id)
                                        //->get(['b.name as tipo_cargo','d.name as cargo']);
                                        ->get(['d.name','d.id']);

        return response()->json($data);
    }

    public function fetchCargoAppPerfil(Request $request)
    {
       /* $request->validate([
            'cargo_id' => 'required|integer',
        ]); */

        $cargo_id = $request->input('cargo_id');
        $sede_id = $request->input('sede_id');

        $data['perfiles'] = $this->glpi->table('loguin_rel_cargo_sede as a')
                                        ->join('loguin_cargo as b', 'b.id', 'a.cargo_id')
                                        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
                                        ->join('loguin_perfil as d', 'd.id', 'a.perfil_id')
                                        ->join('loguin_aplicaciones as e', 'e.id', 'd.aplicacion_id')
                                        ->where('a.cargo_id', $cargo_id)
                                        ->where('a.sede_id',  $sede_id)
                                        ->get(['d.id as perfil_id','d.name as perfil','e.id as aplicacion_id','e.name as aplicacion']);


        if ($data['perfiles']->isEmpty()) {
            return response()->json(['message' => 'No se encontraron perfiles para este cargo'], 404);
        }

        return response()->json($data, 200);
    }

    public function fetchApps(Request $request)
    {
        $request->validate([
            'sede_id' => 'required|integer',
        ]);

        $sede_id = $request->input('sede_id');

        $data['app_sede'] = DB::table('app_sede_aplicacion as a')
                                ->leftJoin('app_sedes as b', 'b.id', 'a.sede_id')
                                ->leftJoin('app_aplicaciones as c', 'c.id', 'a.aplicacion_id')
                                ->distinct('c.nombre')
                                ->where('a.sede_id', $sede_id)
                                ->orderBy('c.nombre')
                                ->get(['c.nombre', 'c.id']);

        return response()->json($data);
    }

    public function fetchAppsPerfiles(Request $request)
    {
        $app_id = $request->input('app_id');

        $data['perfiles'] = DB::table('app_perfiles')->where('aplicacion_id', $app_id)->get(['nombre', 'id']);
        return response()->json($data);
    }

    public function store(Request $request)
    {
        // Datos enviados desde el frontend
        $tipo_identificacion_id = $request->input('tipo_identificacion');
        $identificacion = $request->input('identificacion');
        $nombre = $request->input('nombre');
        $apellido = $request->input('apellido');
        $email = $request->input('email');
        $zonal_id = $request->input('zonal_id');
        $sede_id = $request->input('sede_id');
        $aplicaciones = $request->input('aplicaciones'); // Array con los IDs de apps y perfiles
        $infraestructura = $request->input('infraestructura');
        $ticketLoguin = [];
        $ticketInfraestructura = [];
        //dd($infraestructura);
        //error_log(__LINE__ . __METHOD__ . ' respuesta --->' .var_export($infraestructura, true));

        $appUserId = $this->glpi->table('loguin_usuarios')->insertGetId([
            'tipoidentificacion_id' => $tipo_identificacion_id,
            'identificacion' => $identificacion,
            'apellidos' => $apellido,
            'nombres' => $nombre,
            'email' => $email,
            'fecha_creacion' => now('America/Bogota'),
        ]);

        foreach ($aplicaciones as $aplicacion) {
            // Guardar cada aplicación y perfil
            $this->glpi->table('loguin_solicitud')->insert([
                'usuario_id' => $appUserId,
                'zonal_id' => $zonal_id,
                'sede_id' => $sede_id,
                'aplicacion_id' => $aplicacion['app_id'],
                'perfil_id' => $aplicacion['perfil_id'],
                'fecha_creacion' => now('America/Bogota'),
            ]);
        }

        $dataUsuario = $this->glpi->table('loguin_solicitud as a')
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

        //return $dataUsuario;

        $dataAplicacioPerfil = $this->glpi->table('loguin_solicitud as a')
        ->join('loguin_usuarios as b', 'b.id', 'a.usuario_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->join('loguin_aplicaciones as d', 'd.id', 'a.aplicacion_id')
        ->join('loguin_perfil as e', 'e.id', 'a.perfil_id')
        ->where('a.usuario_id', $appUserId)
        ->select([
            'a.usuario_id',
            'c.name as sede',
            'd.name as aplicaciones',
            'e.name as perfiles'
        ])->get();

        //return ['usuario' => $dataUsuario, 'aplicacionesPerfiles' => $dataAplicacioPerfil];

        // Contenido de la tabla codificada
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
                        <th>SEDES</th>
                        <th>APLICACIONES</th>
                        <th>PERFILES</th>
                    </tr>
                </thead>';
        
        // Aquí comienza el bucle foreach
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
        </div>';
        
        // Insertar en la categoria grupo LOGUIN
        $ticket = $this->glpi->table('glpi_tickets')->insertGetId([
            'name' => '[PRUEBA] SOLICITUD USUARIO LOGIN DE PANA EVEREST - '.$identificacion, 
            'date'=> now('America/Bogota'), 
            'content' => $encodedTable, 
            'users_id_recipient' => 102, // usuario quien envia solicitud
            'date_mod'=> now('America/Bogota'), // revisar
            'users_id_lastupdater' => 102, // usuario quien envia solicitud
            'itilcategories_id' => 8, // categoria VIVA 1A > 2. APLICACIONES > LOGUIN O USUARIOS
            'time_to_resolve' => now('America/Bogota'), 
            'time_to_own' => now('America/Bogota'), 
            'locations_id' => 183, // sede
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

        $this->glpi->table('glpi_groups_tickets')->insert([
            'tickets_id' => $ticket,
            'groups_id' => 6, // grupo loguin
            'type' => 2
        ]);

        $ticketLoguin = $this->glpi->table('glpi_tickets')->where('id', $ticket)->get(['id']);

        // Contenido de la tabla codificada
        $encodedTableInfra = '
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

        foreach($infraestructura as $req){
            if($req['radio_valor'] == 1){
                $encodedTableInfra .='
                        <tr>
                            <th>'.$req['radio_solicitud']. ':</th>
                            <td>' . ($req['radio_valor'] == 1 ? 'SI' : null) . '</td>
                        </tr>';
            }
        }

        $encodedTableInfra .='
                </thead>
                <tbody></tbody>
            </table>
        </div>';

        // Insertar en la categoria grupo INFRAESTRUCTURA
        $solicitudes = [
            'solicito_correo' => isset($infraestructura[0]['radio_valor']) ? $infraestructura[0]['radio_valor'] : 0,
            'solicito_usuario_dominio' => isset($infraestructura[1]['radio_valor']) ? $infraestructura[1]['radio_valor'] : 0,
            'solicito_vpn' => isset($infraestructura[2]['radio_valor']) ? $infraestructura[2]['radio_valor'] : 0,
        ];
        
        // Verificar si al menos uno de los valores es 1
        if (in_array(1, $solicitudes, true)) {
            $solicitudes['usuario_id'] = $appUserId;
            $solicitudes['fecha_creacion'] = now('America/Bogota');
        
            // Insertar en la base de datos
            $this->glpi->table('loguin_infraestructura')->insert($solicitudes);

            $ticketInfra = $this->glpi->table('glpi_tickets')->insertGetId([
                'name' => '[PRUEBA] SOLICITUD USUARIO (CORREO, USUARIO DOMINIO, VPN)- '.$identificacion, 
                'date'=> now('America/Bogota'), 
                'content' => $encodedTableInfra, 
                'users_id_recipient' => 102, // usuario quien envia solicitud
                'date_mod'=> now('America/Bogota'), // revisar
                'users_id_lastupdater' => 102, // usuario quien envia solicitud
                'itilcategories_id' => 48, // categoria VIVA 1A > 3. INFRAESTRUCTURA > CUENTAS > SOLICITUD CUENTA OFFICE 365
                'time_to_resolve' => now('America/Bogota'), 
                'time_to_own' => now('America/Bogota'), 
                'locations_id' => 183, // sede
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

            $ticketInfraestructura = $this->glpi->table('glpi_tickets')->where('id', $ticketInfra)->get(['id']);
    
            $this->glpi->table('glpi_groups_tickets')->insert([
                'tickets_id' => $ticketInfra,
                'groups_id' => 2, // grupo INFRAESTRUCTURA
                'type' => 2
            ]);

            return response()->json([
                'message' => 'Datos guardados exitosamente',
                'ticketLoguin' => $ticketLoguin[0],
                'ticketInfraestructura' => $ticketInfraestructura[0], 200]);
        }

        return response()->json([
            'message' => 'Datos guardados exitosamente',
            'ticketLoguin' => $ticketLoguin[0], 200]);
    }
}
