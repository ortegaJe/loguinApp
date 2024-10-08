<?php

namespace App\Http\Controllers;

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
        $data = [];

        //LOCAL
        //$data['zonales'] = DB::table('glpi_locations')->where('sw_regional', 1)->get(['name', 'id']);
        //REMOTO
        $data['zonales'] = $this->glpi->table('glpi_locations')->where('sw_regional', 1)->orderBy('name')->get(['name', 'id']);
        $data['tipos_identificacion'] = $this->glpi->table('loguin_tipo_identificacion')->orderBy('abreviatura')->get(['abreviatura', 'id']);

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
        $identificacion = $request->input('identificacion');
        $tipo_identificacion = $request->input('tipo_identificacion');
        $nombre = $request->input('nombre');
        $apellido = $request->input('apellido');
        $email = $request->input('email');
        $zonal_id = $request->input('zonal_id');
        $sede_id = $request->input('sede_id');
        $aplicaciones = $request->input('aplicaciones'); // Array con los IDs de apps y perfiles

        $appUserId = DB::table('app_user')->insertGetId([
            'tipo_identificacion' => $tipo_identificacion,
            'identificacion' => $identificacion,
            'apellido' => $apellido,
            'nombre' => $nombre,
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
