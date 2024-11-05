<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SolicitudController extends Controller
{
    protected $glpi;

    public function __construct()
    {
        $this->glpi = DB::connection('glpi');
    }
    
    public function index()
    {
        $data['loguin'] = $this->getUsuariosConSolicitudes();
    
        if ($data['loguin']->isEmpty()) {
            return response()->json(['message' => 'No se encontró información'], 404);
        }
    
        return view('loguin-solicitud.index', $data);
    }
    
    public function fetchSolicitudLoguin(Request $request)
    {
        $solicitudId = $request->solicitud_id;
        $userId = $request->usuario_id;
    
        $usuario = $this->getUsuario($solicitudId);
        $loguinSolicitud = $this->getLoguinSolicitud($solicitudId);
        $infraSolicitud = $this->getInfraSolicitud($solicitudId);
        $especialidadUsuario = $this->getEspecialidadUsuario($userId, $solicitudId);
    
        if ($usuario->isEmpty() && $loguinSolicitud->isEmpty() && $especialidadUsuario->isEmpty()) {
            return response()->json(['message' => 'No se encontró información'], 404);
        }
    
        return response()->json([
            'usuario' => $usuario,
            'loguin_solicitud' => $loguinSolicitud,
            'infra_solicitud' => $infraSolicitud,
            'especialidad_usuario' => $especialidadUsuario,
        ], 200);
    }
        
    public function getUsuariosConSolicitudes()
    {
        $loguin = $this->glpi->table('loguin_usuarios as a')
            ->leftJoin('loguin_solicitud as b', 'b.usuario_id', 'a.id')
            ->leftJoin('loguin_solicitud_infraestructura as c', 'c.usuario_id', 'a.id')
            ->orderByDesc('b.fecha_creacion')
            ->select([
                'a.id as usuario_id', 
                'b.id as solicitud_id',
                'c.id as solicitud_infra_id',
                'a.identificacion',
                DB::raw("CONCAT(a.nombres,' ', a.apellidos) as nombreCompleto"), 
                'a.email',
                'b.ticket_id as loguin_ticket',
                'c.ticket_id as infra_ticket',
                'b.fecha_creacion',
            ])->get();

            $titleWords = ['En curso', 'Respuesta', 'Cerrado'];
            $colors = ['success', 'info', 'secondary'];

            // Asignar estado y color aleatorio a cada solicitud
            $loguin = $loguin->map(function ($item) use ($titleWords, $colors) {
                $randomKey = array_rand($titleWords);
                $item->status_title = $titleWords[$randomKey];
                $item->status_color = $colors[$randomKey];
                return $item;
            });

        return $loguin;
    }
    
    private function getUsuario($solicitudId)
    {
        return $this->glpi->table('loguin_solicitud as a')
            ->join('loguin_usuarios as b', 'b.id', 'a.usuario_id')
            ->join('glpi_locations as c', 'c.id', 'a.sede_id')
            ->where('a.id', $solicitudId)
            ->select([
                'a.id as solicitud_id',
                'b.id as usuario_id',
                'b.identificacion',
                DB::raw("CONCAT(b.nombres, ' ', b.apellidos) as nombreCompleto"), 
                'b.email',
                'c.name as sede',
                'a.ticket_id',
                DB::raw("DATE_FORMAT(a.fecha_creacion, '%d/%m%/%Y') as fecha_creacion")
            ])->get();
    }
    
    private function getLoguinSolicitud($solicitudId)
    {
        return $this->glpi->table('loguin_solicitud as a')
            ->join('loguin_solicitud_detalle as b', 'b.solicitud_id', 'a.id')
            ->join('loguin_aplicaciones as c', 'c.id', 'b.aplicacion_id')
            ->join('loguin_perfil as d', 'd.id', 'b.perfil_id')
            ->where('b.solicitud_id', $solicitudId)
            ->select([
                'a.id as solicitud_id',
                'c.name as aplicacion',
                'd.name as perfil',
            ])->get();
    }

    private function getInfraSolicitud($solicitudId)
    {
        return $this->glpi->table('loguin_solicitud_infraestructura as a')
            ->join('glpi_locations as b', 'b.id', 'a.sede_id')
            ->where('a.id', $solicitudId)
            ->orderByDesc('a.fecha_creacion')
            ->select([
                'a.id as solicitud_infra_id',
                'a.usuario_id',
                //'a.zonal_id',
                'b.name as sede',
                'a.solicito_correo',
                'a.solicito_usuario_dominio',
                'a.solicito_vpn',
                'a.ticket_id',
                DB::raw("DATE_FORMAT(a.fecha_creacion, '%d/%m%/%Y') as fecha_creacion")
            ])->get();
    }
    
    private function getEspecialidadUsuario($userId, $solicitudId)
    {
        return $this->glpi->table('loguin_especialidad_usuario as a')
            ->leftJoin('loguin_especialidades as b', 'b.id', 'a.especialidad_id')
            ->leftJoin('loguin_solicitud as c', 'c.id', 'a.solicitud_id')
            ->where('a.usuario_id', $userId)
            ->where('a.solicitud_id', $solicitudId)
            ->select('b.name as especialidad')
            ->get();
    }

    public function buscarPorDocumento(Request $request)
    {
        $documento = $request->input('documento');
        
        $solicitudes = $this->getUsuariosConSolicitudes();

        $solicitudesFiltradas = $solicitudes->where('identificacion', $documento);

        if ($solicitudesFiltradas->isEmpty()) {
            return response()->json(['message' => 'No se encontraron solicitudes para este documento'], 404);
        }

        return response()->json($solicitudesFiltradas->values());
    }
    
}
