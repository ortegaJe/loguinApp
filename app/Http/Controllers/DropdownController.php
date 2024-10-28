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
/*         return $this->glpi->table('loguin_solicitud as a')
            ->join('loguin_solicitud_detalle as b', 'b.solicitud_id', 'a.id')
            ->join('glpi_locations as c', 'c.id', 'a.sede_id')
            ->join('loguin_aplicaciones as d', 'd.id', 'b.aplicacion_id')
            ->join('loguin_perfil as e', 'e.id', 'b.perfil_id')
            ->where('a.usuario_id', 1)
            ->where('b.solicitud_id', 284)
            ->select([
                'a.usuario_id',
                'c.name as sede',
                'd.name as aplicaciones',
                'e.name as perfiles',
            ])->get(); */

/*           $word = 'CIRUGIA GENERAL';
                $especialidadId = $this->glpi->table('loguin_especialidades')
        ->whereIn('name', [$word])
        ->where('estado', 1)
        ->first('id');

        return count($especialidadId); */

/*         $dataUsuario = $this->glpi->table('loguin_solicitud as a')
        ->join('loguin_usuarios as b', 'b.id', 'a.usuario_id')
        ->join('loguin_tipo_identificacion as c', 'c.id', 'b.tipoidentificacion_id')
        ->where('a.usuario_id', 117)
        ->select([
            'a.usuario_id',
            'c.abreviatura',
            'b.identificacion',
            DB::raw("CONCAT(b.nombres,' ',b.apellidos) as nombres_apellidos"),
            'b.email',
        ])->first();

        //return $dataUsuario;

        $dataAplicacioPerfil = $this->glpi->table('loguin_solicitud as a')
        ->leftJoin('loguin_usuarios as b', 'b.id', 'a.usuario_id')
        ->leftJoin('glpi_locations as c', 'c.id', 'a.sede_id')
        ->leftJoin('loguin_aplicaciones as d', 'd.id', 'a.aplicacion_id')
        ->leftJoin('loguin_perfil as e', 'e.id', 'a.perfil_id')
        ->leftJoin('loguin_especialidad_usuario as f', 'f.usuario_id', 'b.id')
        ->leftJoin('loguin_especialidades as g', 'g.id', 'f.especialidad_id')
        ->where('a.usuario_id', $dataUsuario->usuario_id)
        ->select([
            'a.usuario_id',
            'c.name as sede',
            'd.name as aplicaciones',
            'e.name as perfiles',
            'g.name as especialidad'
        ])->get();

        return ['usuario' => $dataUsuario, 'aplicacionesPerfiles' => $dataAplicacioPerfil]; */

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
            'sede_id' => 'required|integer',
        ]);

        $tipo_cargo_id = $request->input('tipo_cargo_id');
        $sede_id = $request->input('sede_id');

        $data['cargo_sede'] = $this->glpi->table('loguin_rel_tipo_cargo_sede as a')
        ->join('loguin_tipo_cargo as b', 'b.id', 'a.tipocargo_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->join('loguin_cargo as d', 'd.id', 'a.cargo_id')
        ->where('c.id', $sede_id)
        ->where('a.tipocargo_id', $tipo_cargo_id)
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

        $perfiles = $this->glpi->table('loguin_rel_cargo_sede as a')
        ->join('loguin_cargo as b', 'b.id', 'a.cargo_id')
        ->join('glpi_locations as c', 'c.id', 'a.sede_id')
        ->join('loguin_perfil as d', 'd.id', 'a.perfil_id')
        ->join('loguin_aplicaciones as e', 'e.id', 'd.aplicacion_id')
        ->where('a.cargo_id', $cargo_id)
        ->where('a.sede_id',  $sede_id)
        ->get([
            'd.id as perfil_id',
            'd.name as perfil',
            'e.id as aplicacion_id',
            'e.name as aplicacion',
        ]);

        $solicitud_infra = $this->glpi->table('loguin_rel_cargo_sede as a')
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

        $filterResult = $this->glpi->table('loguin_especialidades')
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

        $filterResult = $this->glpi->table('loguin_usuarios')
            ->where('identificacion', 'LIKE', '%' . $query . '%')
            ->pluck('identificacion')
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

        $user = $this->glpi->table('loguin_usuarios as a')
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
}
