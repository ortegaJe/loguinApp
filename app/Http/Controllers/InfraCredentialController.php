<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InfraCredentialController extends Controller
{
    protected $glpi;

    public function __construct()
    {
        $this->glpi = DB::connection('glpi');
    }

    public function index()
    {
        return view('loguin-credenciales.index');
    }

    public function registerCredential($id)
    {
        $solicitud = $this->glpi->table('loguin_solicitud_infraestructura')
                        ->where('id', $id)
                        ->first(['id as solicitud', 'ticket_id']);

        return view('infra-credenciales.create', compact('solicitud'));
    }

    public function fetchDataLoguinInfra($id)
    {
        $solicitudId = $id;

        $usuario = $this->getUsuario($solicitudId);
        $loguinInfraSolicitud = $this->getLoguinInfraSolicitud($solicitudId);
        $especialidadUsuario = $this->getEspecialidadUsuario($solicitudId);
        $hasLoguin = $this->hasLoguins($solicitudId);

        if ($usuario->isEmpty() && $loguinInfraSolicitud->isEmpty() && $especialidadUsuario->isEmpty()) {
            return response()->json(['message' => 'No se encontró información'], 404);
        }
    
        return response()->json([
            'usuario' => $usuario,
            'loguin_infra_solicitud' => $loguinInfraSolicitud,
            'especialidad_usuario' => $especialidadUsuario ?? null,
            'has_loguin' => $hasLoguin ?? null
        ], 200);
    }

    private function getUsuario($solicitudId)
    {
        return $this->glpi->table('loguin_solicitud_infraestructura as a')
            ->join('loguin_usuarios as b', 'b.id', 'a.usuario_id')
            ->join('glpi_locations as c', 'c.id', 'a.sede_id')
            ->join('loguin_tipo_identificacion as d', 'd.id', 'b.tipoidentificacion_id')
            ->join('loguin_cargo as e', 'e.id', 'a.cargo_id')
            ->where('a.id', $solicitudId)
            ->select([
                'a.id as solicitud_id',
                'b.id as usuario_id',
                DB::raw("CONCAT(d.abreviatura,' ',b.identificacion) as identificacion"),
                DB::raw("UPPER(CONCAT(b.nombres, ' ', b.apellidos)) as nombreCompleto"), 
                'b.email',
                'c.name as sede',
                DB::raw("UPPER(e.name) as cargo"),
                'a.ticket_id',
                'a.observaciones',
                DB::raw("DATE_FORMAT(a.fecha_creacion, '%d/%m%/%Y') as fecha_creacion")
            ])->get();
    }
    
    private function getLoguinInfraSolicitud($solicitudId)
    {
        return $this->glpi->table('loguin_solicitud_infraestructura as a')
            ->where('a.id', $solicitudId)
            ->select([
                'a.id as solicitud_id',
                'a.solicito_correo',
                'a.solicito_usuario_dominio',
                'a.solicito_vpn'
            ])->get();
    }

    private function getEspecialidadUsuario($solicitudId)
    {
        return $this->glpi->table('loguin_especialidad_usuario as a')
            ->join('loguin_especialidades as b', 'b.id', 'a.especialidad_id')
            ->join('loguin_solicitud as c', 'c.id', 'a.solicitud_id')
            //->where('a.usuario_id', $userId)
            ->where('a.solicitud_id', $solicitudId)
            ->select('b.name as especialidad')
            ->get();
    }

    public function storeLoguinInfra(Request $request)
    {
        // Iniciar una transacción para asegurar la consistencia de los datos
        DB::beginTransaction();
    
        try {
            $validatedData = $request->validate([
                'solicitud' => 'integer',
                'infra_solicitud' => 'required|array',
            ]);
    
            // Datos enviados desde el frontend
            $solicitud = $validatedData['solicitud'];
            $infraLoguin = $validatedData['infra_solicitud'];

            $this->registerLoguinApplications($infraLoguin, $solicitud);

            // Confirmar la transacción si todo salió bien
            DB::commit();

            return response()->json([
                'message' => 'Datos guardados exitosamente',
                'solicitud' => $solicitud,
            ], 200);
    
        } catch (\Exception $e) {
            // Manejar errores y hacer rollback si es necesario
            DB::rollBack();
    
            return response()->json([
                'message' => 'Error al guardar los datos '.$e->getMessage(), 
                'error' => $e->getFile(), 'line '.$e->getLine(),
            ], 500);
        }
    }

    private function registerLoguinApplications($infraLoguin, $solicitud)
    {
        foreach ($infraLoguin as $loguin) {
            $this->glpi->table('loguin_solicitud_infraestructura_detalle')
            ->where('solicitud_id', $solicitud)
            ->insert([
                'solicitud_id' => $solicitud,
                'solicitud_infra_id' => $loguin['solicitud_infra_id'],
                'usuario_loguin' => $loguin['usuario_loguin'],
                'password_loguin' => $loguin['password_loguin'],
                'fecha_creacion' => now('America/Bogota'),
            ]);
        }
    }
 
    private function hasLoguins($solicitudId)
    {
        return $this->glpi->table('loguin_solicitud_infraestructura as a')
        ->join('loguin_solicitud_infraestructura_detalle as b', 'b.solicitud_id', 'a.id')
        ->join('loguin_solicitudes_infraestructura as c', 'c.id', 'b.solicitud_infra_id')
        ->where('b.solicitud_id', $solicitudId)
        ->select([
            'a.id as solicitud_id',
            'b.solicitud_infra_id',
            'c.name as nombre_solicitud',
            'b.usuario_loguin',
            'b.password_loguin'
        ])->get();
    }

    public function getLoguinInfra($solicitudId)
    {
        return $this->glpi->table('loguin_solicitud_infraestructura as a')
        ->join('loguin_solicitud_infraestructura_detalle as b', 'b.solicitud_id', 'a.id')
        ->join('loguin_solicitudes_infraestructura as c', 'c.id', 'b.solicitud_infra_id')
        ->where('b.solicitud_id', $solicitudId)
        ->select([
            'a.id as solicitud_id',
            'b.solicitud_infra_id',
            'c.name as nombre_solicitud',
            'b.usuario_loguin',
            'b.password_loguin'
        ])->get();
    }
}
