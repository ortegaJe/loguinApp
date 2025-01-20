<?php

namespace App\Http\Controllers;

use App\Enums\OpcionesConstantes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DropdownController extends Controller
{
    public function index()
    {
        $data = [];
        $data['zonales'] = DB::table('glpi_locations')->where('sw_regional', 1)->orderBy('name')->get(['name', 'id']);
        $data['tipos_identificacion'] = DB::table('loguin_tipo_identificacion')->where('estado', 1)->orderBy('abreviatura')->get(['abreviatura', 'id']);

        return view('loguin-create.index', $data);
    }

    public function fetchSedes(Request $request)
    {
        $zonal_id = $request->input('zonal_id');
        $data['sedes'] = DB::table('glpi_locations')->where('locations_id', $zonal_id)->orderBy('name')->get(['name', 'id']);

        return response()->json($data);
    }

    public function fetchTipoCargoSede(Request $request)
    {
        $request->validate([
            'sede_id' => 'required|integer',
        ]);

        $sede_id = $request->input('sede_id');

        $data['tipo_cargo_sede'] = DB::table('loguin_rel_tipo_cargo_sede as a')
        ->join('loguin_tipo_cargo as b', 'b.id', 'a.tipocargo_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->where('c.id', $sede_id)
        ->where('a.estado', 1)
        ->distinct('b.name')
        ->orderBy('b.name')
        ->get(['b.name', 'b.id']);

        return response()->json($data);
    }

    public function fetchCargoSede(Request $request)
    {
       $request->validate([
            'tipo_cargo_id' => 'required|integer',
            'sede_id' => 'required|integer',
        ]);

        $tipo_cargo_id = $request->input('tipo_cargo_id');
        $sede_id = $request->input('sede_id');

        $data['cargo_sede'] = DB::table('loguin_rel_tipo_cargo_sede as a')
        ->join('loguin_tipo_cargo as b', 'b.id', 'a.tipocargo_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->join('loguin_cargo as d', 'd.id', 'a.cargo_id')
        ->where('c.id', $sede_id)
        ->where('a.tipocargo_id', $tipo_cargo_id)
        ->where('d.estado', 1)
        //->get(['b.name as tipo_cargo','d.name as cargo']);
        ->get(['d.name','d.id']);

        return response()->json($data);
    }

    public function fetchCargoAppPerfil(Request $request)
    {
       $request->validate([
            'cargo_id' => 'required|integer',
            'sede_id' => 'required|integer',
        ]);

        $cargo_id = $request->input('cargo_id');
        $sede_id = $request->input('sede_id');

        $perfiles = DB::table('loguin_rel_cargo_sede as a')
        ->join('loguin_cargo as b', 'b.id', 'a.cargo_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->join('loguin_perfil as d', 'd.id', 'a.perfil_id')
        ->join('loguin_aplicaciones as e', 'e.id', 'd.aplicacion_id')
        ->where('a.cargo_id', $cargo_id)
        ->where('a.sede_id',  $sede_id)
        ->where('a.estado', 1)
        ->orderBy('e.name')
        ->get([
            'd.id as perfil_id',
            'd.name as perfil',
            'e.id as aplicacion_id',
            'e.name as aplicacion',
        ]);

        $solicitud_infra = DB::table('loguin_rel_cargo_sede as a')
        ->join('loguin_cargo as b', 'b.id', 'a.cargo_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->join('loguin_perfil as d', 'd.id', 'a.perfil_id')
        ->join('loguin_aplicaciones as e', 'e.id', 'd.aplicacion_id')
        ->where('a.cargo_id', $cargo_id)
        ->where('a.sede_id',  $sede_id)
        ->distinct('cargo_id')
        ->get([
            'b.sw_correo',
            'b.sw_dominio',
            'b.sw_vpn'
        ]);

        if ($perfiles->isEmpty() && $solicitud_infra->isEmpty()) {
            return response()->json(['message' => 'No se encontraron perfiles o solicitudes de infraestructuras para este cargo'], 404);
        }

        $data = [
            'perfiles' => $perfiles,
            'solicitud_infra' => $solicitud_infra,
        ];

        return response()->json($data, 200);
    }

    public function fetchEspecialidades(Request $request)
    {
        $query = $request->get('search');

        $filterResult = DB::table('loguin_especialidades')
            ->where('name', 'LIKE', '%' . $query . '%')
            ->where('estado', 1)
            ->orderBy('name')
            ->get(['name', 'id']);

        if ($filterResult->isEmpty()) {
            return response()->json(['message' => 'No se encontraron especialidades para este cargo'], 404);
        }

        return response()->json($filterResult, 200);
    }

    public function fetchDataIdentificacionLoguin(Request $request)
    {
        $query = $request->input('query');

        $filterResult = DB::table('loguin_usuarios')
            ->select(DB::raw("CONCAT(identificacion,' | ',nombres,' ',apellidos) as id_nombre"))
            ->where('identificacion', 'LIKE', '%' . $query . '%')
            ->pluck('id_nombre')
            ->map(function ($item) {
                return (string) $item; // Convertir cada identificacion a string
            })
            ->toArray();

        if (!$filterResult) {
            return response()->json(['message' => 'Indentificacion no encontrada'], 404);
        }

        return response()->json($filterResult, 200);
    }

    public function fetchDataAutoCompleteLoguin(Request $request)
    {
        $userId = $request->input('identificacion');

        $user = DB::table('loguin_usuarios as a')
            ->join('loguin_tipo_identificacion as b', 'b.id', 'a.tipoidentificacion_id')
            ->where('a.identificacion', $userId)
            ->select([
                'b.id as tipo_doc_id',
                'a.identificacion',
                'a.nombres',
                'a.apellidos',
                'a.email'
            ])->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json([
            'tipo_doc_id' => $user->tipo_doc_id,
            'identificacion' => $user->identificacion,
            'nombres' => $user->nombres,
            'apellidos' => $user->apellidos,
            'email' => $user->email,
        ]);
    }
}
