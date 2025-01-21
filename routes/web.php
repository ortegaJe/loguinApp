<?php

use App\Http\Controllers\DropdownController;
use App\Http\Controllers\GlpiAuthController;
use App\Http\Controllers\InfraCredentialController;
use App\Http\Controllers\LoguinCredentialController;
use App\Http\Controllers\LoguinTicketStoreController;
use App\Http\Controllers\SolicitudController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
        return view('auth.loguin');
    }
);

Route::middleware(['auth:glpi', 'profile:SUPER_ADMIN|CONTRATACION'])->group(function () {
    Route::get('loguin/formulario', [DropdownController::class, 'index']);
    Route::post('fetchSedes', [DropdownController::class, 'fetchSedes']);
    Route::post('fetchTipoCargoSede', [DropdownController::class, 'fetchTipoCargoSede']);
    Route::post('fetchCargoSede', [DropdownController::class, 'fetchCargoSede']);
    Route::post('fetchCargoAppPerfil', [DropdownController::class, 'fetchCargoAppPerfil']);
    Route::get('fetchEspecialidades', [DropdownController::class, 'fetchEspecialidades']);
    Route::get('fetchDataIdentificacionLoguin', [DropdownController::class, 'fetchDataIdentificacionLoguin']);
    Route::get('fetchDataAutoCompleteLoguin', [DropdownController::class, 'fetchDataAutoCompleteLoguin']);

    Route::post('storeLoguinTicket', [LoguinTicketStoreController::class, 'storeLoguinTicket']);

    Route::get('loguin/solicitudes', [SolicitudController::class, 'index']);
    Route::get('getUsuariosConSolicitudes', [SolicitudController::class, 'getUsuariosConSolicitudes']);
});

Route::middleware(['auth:glpi', 'profile:SUPER_ADMIN|CONTRATACION|ANALISTA_APP|INFRAESTRUCTURA'])->group(function () {
    Route::post('fetchSolicitudLoguin', [SolicitudController::class, 'fetchSolicitudLoguin']);
    Route::post('fetchSolicitudInfra', [SolicitudController::class, 'fetchSolicitudInfra']);
});

Route::middleware(['auth:glpi', 'profile:SUPER_ADMIN|ANALISTA_APP'])->group(function () {
    Route::get('loguin/aplicaciones/credenciales', [SolicitudController::class, 'getRequestLoguin']);
    Route::get('loguin/aplicaciones/credenciales/registrar/{id}', [LoguinCredentialController::class, 'registerCredential'])->name('register.loguin');
    Route::get('fetchDataLoguin/{id}', [LoguinCredentialController::class, 'fetchDataLoguin']);
    Route::post('storeLoguin', [LoguinCredentialController::class, 'storeLoguin']);
    Route::get('getLoguins/aplicaciones/{id}', [LoguinCredentialController::class, 'getLoguins']);

});

Route::middleware(['auth:glpi', 'profile:SUPER_ADMIN||INFRAESTRUCTURA'])->group(function () {
    Route::get('loguin/infraestructura/credenciales', [SolicitudController::class, 'getRequestLoguinInfra']);
    Route::get('loguin/infraestructura/credenciales/registrar/{id}', [InfraCredentialController::class, 'registerCredential'])->name('register.infra');
    Route::get('fetchDataLoguinInfra/{id}', [InfraCredentialController::class, 'fetchDataLoguinInfra']);
    Route::post('storeLoguinInfra', [InfraCredentialController::class, 'storeLoguinInfra']);
    Route::get('getLoguins/infraestructura/{id}', [InfraCredentialController::class, 'getLoguinInfra']);

});

Route::match(['get', 'post'], '/login',  [GlpiAuthController::class, 'login'])->name('login');
Route::match(['get', 'post'], '/logout', [GlpiAuthController::class, 'logout'])->name('logout');

Route::get('query', function () {
    $glpi = DB::table('glpi_locations')->where('sw_regional', 1)->get();
    return response()->json($glpi);
});
