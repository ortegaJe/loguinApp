<?php

use App\Http\Controllers\DropdownController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Example Routes
Route::view('/', 'landing');
Route::match(['get', 'post'], '/dashboard', function(){
    return view('dashboard');
});
Route::view('/pages/slick', 'pages.slick');
Route::view('/pages/datatables', 'pages.datatables');
Route::view('/pages/blank', 'pages.blank');

Route::get('loguin', [DropdownController::class, 'index']);
Route::post('fetchSedes', [DropdownController::class, 'fetchSedes']);
Route::post('fetchTipoCargoSede', [DropdownController::class, 'fetchTipoCargoSede']);
Route::post('fetchCargoSede', [DropdownController::class, 'fetchCargoSede']);
Route::post('fetchCargoAppPerfil', [DropdownController::class, 'fetchCargoAppPerfil']);
Route::post('saveApplicacionesPerfiles', [DropdownController::class, 'store']);

Route::get('/get-mysecond-connection', function () {
    $glpi = DB::connection('glpi');
    $products = $glpi->table('glpi_locations')->where('sw_regional', 1)->get();
    
    return response()->json($products);
});
//Route::view('creacion-usuarios', 'loguin-create.index');
//Route::view('loguin', 'loguin-create.index');
//Route::post('fetchApps', [DropdownController::class, 'fetchApps']);
//Route::post('fetchAppsPerfiles', [DropdownController::class, 'fetchAppsPerfiles']);
