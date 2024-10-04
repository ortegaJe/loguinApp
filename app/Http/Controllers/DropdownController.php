<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DropdownController extends Controller
{
    public function index()
    {
        $data['zonales'] = DB::table('app_zonales')->get(['nombre', 'id']);
        return view('loguin-create.index', $data);
    }

    public function fetchSedes(Request $request)
    {
        $zonal_id = $request->input('zonal_id');

        $data['sedes'] = DB::table('app_sedes')->where('zonal_id', $zonal_id)->get(['nombre', 'id']);
        return response()->json($data);
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
        $nombre = $request->input('nombre');
        $cc = $request->input('cc');
        $cargo = $request->input('cargo');
        $email = $request->input('email');
        $zonal_id = $request->input('zonal_id');
        $sede_id = $request->input('sede_id');
        $aplicaciones = $request->input('aplicaciones'); // Array con los IDs de apps y perfiles

        $appUserId = DB::table('app_user')->insertGetId([
            'nombre' => $nombre,
            'cc' => $cc,
            'cargo' => $cargo,
            'email' => $email,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($aplicaciones as $aplicacion) {
            // Guardar cada aplicación y perfil
            DB::table('app_user_perfil_aplicaciones')->insert([
                'app_user_id' => $appUserId,
                'zonal_id' => $zonal_id,
                'sede_id' => $sede_id,
                'aplicacion_id' => $aplicacion['app_id'],
                'perfil_id' => $aplicacion['perfil_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Datos guardados exitosamente'], 200);
    }
}
