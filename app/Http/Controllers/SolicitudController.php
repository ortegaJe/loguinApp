<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SolicitudController extends Controller
{
    public function index()
    {
        $data = $this->getUsuariosConSolicitudes();
    
        /* if ($data['loguin']->isEmpty()) {
            return response()->json(['message' => 'No se encontró información'], 404);
        } */
    
        return view('loguin-solicitud.index', compact('data'));
    }

    public function getRequestLoguin()
    {
        $data = $this->getUsuariosConSolicitudes();
        return view('loguin-credenciales.index', compact('data'));
    }

    public function getRequestLoguinInfra()
    {
        $data = $this->getUsuariosConSolicitudes();
        return view('infra-credenciales.index', compact('data'));
    }
    
    public function fetchSolicitudLoguin(Request $request)
    {
        $solicitudId = $request->solicitud_id;
        $userId = $request->usuario_id;
    
        $usuario = $this->getUsuario($solicitudId);
        $loguinSolicitud = $this->getLoguinSolicitud($solicitudId);
        $especialidadUsuario = $this->getEspecialidadUsuario($userId, $solicitudId);
    
        if ($usuario->isEmpty() && $loguinSolicitud->isEmpty() && $especialidadUsuario->isEmpty()) {
            return response()->json(['message' => 'No se encontró información'], 404);
        }
    
        return response()->json([
            'usuario' => $usuario,
            'loguin_solicitud' => $loguinSolicitud,
            'especialidad_usuario' => $especialidadUsuario,
        ], 200);
    }

    public function fetchSolicitudInfra(Request $request)
    {
        $solicitudId = $request->solicitud_id;
        $userId = $request->usuario_id;
    
        $infraSolicitud = $this->getInfraSolicitud($solicitudId, $userId);
    
        if ($infraSolicitud->isEmpty()) {
            return response()->json(['message' => 'No se encontró información'], 404);
        }
    
        return response()->json([
            'infra_solicitud' => $infraSolicitud,
        ], 200);
    }
        
    public function getUsuariosConSolicitudes()
    {
        $data = [];

        $loguin = DB::table('loguin_usuarios as a')
            ->join('loguin_solicitud as b', 'b.usuario_id', 'a.id')
            ->orderByDesc('b.fecha_creacion')
            ->select([
                'b.id as solicitud_id',
                'a.id as usuario_id', 
                'a.identificacion',
                DB::raw("CONCAT(a.nombres,' ', a.apellidos) as nombreCompleto"), 
                'a.email',
                'b.ticket_id as loguin_ticket',
                'b.fecha_creacion',
                DB::raw("(
                    SELECT 
                        CASE 
                            WHEN c.status = 2 AND d.items_id IS NULL THEN 'En curso'
                            WHEN c.status = 2 AND c.id = d.items_id THEN 'Respuesta'
                            WHEN c.status >= 5 THEN 'Cerrado'
                            ELSE 0
                        END
                    FROM glpi_tickets c
                    LEFT JOIN glpi_itilfollowups d ON d.items_id = c.id
                    WHERE c.id = b.ticket_id
                    LIMIT 1
                ) AS status_title"),
                DB::raw("(
                    SELECT 
                        CASE 
                            WHEN c.status = 2 AND d.items_id IS NULL THEN 'success'
                            WHEN c.status = 2 AND c.id = d.items_id THEN 'secondary'
                            WHEN c.status >= 5 THEN 'info'
                            ELSE 0
                        END 
                    FROM glpi_tickets c
                    LEFT JOIN glpi_itilfollowups d ON d.items_id = c.id
                    WHERE c.id = b.ticket_id
                    LIMIT 1
                ) AS status_color"),
                DB::raw("(
                    SELECT 
                        CASE 
                            WHEN c.status = 2 AND d.items_id IS NULL THEN 'far fa-circle'
                            WHEN c.status = 2 AND c.id = d.items_id THEN 'far fa-comment'
                            WHEN c.status >= 5 THEN 'fa fa-check'
                            ELSE 0
                        END 
                    FROM glpi_tickets c
                    LEFT JOIN glpi_itilfollowups d ON d.items_id = c.id
                    WHERE c.id = b.ticket_id
                    LIMIT 1
                ) AS status_icon")
            ])
            ->get();

        $infra = DB::table('loguin_usuarios as a')
            ->join('loguin_solicitud_infraestructura as b', 'b.usuario_id', 'a.id')
            ->orderByDesc('b.fecha_creacion')
            ->select([
                'b.id as solicitud_infra_id',
                'a.id as usuario_id', 
                'a.identificacion',
                DB::raw("CONCAT(a.nombres,' ', a.apellidos) as nombreCompleto"), 
                'a.email',
                'b.ticket_id as infra_ticket',
                'b.fecha_creacion',
                DB::raw("(
                    SELECT 
                        CASE 
                            WHEN c.status = 2 AND d.items_id IS NULL THEN 'En curso'
                            WHEN c.status = 2 AND c.id = d.items_id THEN 'Respuesta'
                            WHEN c.status >= 5 THEN 'Cerrado'
                            ELSE 0
                        END 
                    FROM glpi_tickets c
                    LEFT JOIN glpi_itilfollowups d ON d.items_id = c.id
                    WHERE c.id = b.ticket_id
                    LIMIT 1
                ) AS status_title"),
                DB::raw("(
                    SELECT 
                        CASE 
                            WHEN c.status = 2 AND d.items_id IS NULL THEN 'success'
                            WHEN c.status = 2 AND c.id = d.items_id THEN 'secondary'
                            WHEN c.status >= 5 THEN 'info'
                            ELSE 0
                        END 
                    FROM glpi_tickets c
                    LEFT JOIN glpi_itilfollowups d ON d.items_id = c.id
                    WHERE c.id = b.ticket_id
                    LIMIT 1
                ) AS status_color"),
                DB::raw("(
                    SELECT 
                        CASE 
                            WHEN c.status = 2 AND d.items_id IS NULL THEN 'far fa-circle'
                            WHEN c.status = 2 AND c.id = d.items_id THEN 'far fa-comment'
                            WHEN c.status >= 5 THEN 'fa fa-check'
                            ELSE 0
                        END 
                    FROM glpi_tickets c
                    LEFT JOIN glpi_itilfollowups d ON d.items_id = c.id
                    WHERE c.id = b.ticket_id
                    LIMIT 1
                ) AS status_icon")
            ])
            ->get();

            //$titleWords = ['En curso', 'Respuesta', 'Cerrado'];
            //$colors = ['success', 'info', 'secondary'];

            // Asignar estado y color aleatorio a cada solicitud
            /* $loguin = $loguin->map(function ($item) use ($titleWords, $colors) {
                $randomKey = array_rand($titleWords);
                $item->status_title = $titleWords[$randomKey];
                $item->status_color = $colors[$randomKey];
                return $item;
            });

            $infra = $infra->map(function ($item) use ($titleWords, $colors) {
                $randomKey = array_rand($titleWords);
                $item->status_title = $titleWords[$randomKey];
                $item->status_color = $colors[$randomKey];
                return $item;
            }); */

            $data = [
                'loguin' => $loguin,
                'infra' => $infra,
            ];

        return $data;
    }
    
    private function getUsuario($solicitudId)
    {
        return DB::table('loguin_solicitud as a')
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
        return DB::table('loguin_solicitud as a')
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

    private function getInfraSolicitud($solicitudId, $userId)
    {
        return DB::table('loguin_solicitud_infraestructura as a')
            ->join('glpi_locations as b', 'b.id', 'a.sede_id')
            ->join('loguin_usuarios as c', 'c.id', 'a.usuario_id')
            ->where('a.id', $solicitudId)
            ->where('a.usuario_id', $userId)
            ->orderByDesc('a.fecha_creacion')
            ->select([
                'a.id as solicitud_infra_id',
                'c.identificacion',
                DB::raw("CONCAT(c.nombres, ' ', c.apellidos) as nombreCompleto"), 
                'c.email',
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
        return DB::table('loguin_especialidad_usuario as a')
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
