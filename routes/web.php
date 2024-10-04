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

Route::get('creacion-usuarios', [DropdownController::class, 'index']);
Route::post('fetchSedes', [DropdownController::class, 'fetchSedes']);
Route::post('fetchApps', [DropdownController::class, 'fetchApps']);
Route::post('fetchAppsPerfiles', [DropdownController::class, 'fetchAppsPerfiles']);
Route::post('saveApplications', [DropdownController::class, 'store']);
//Route::view('creacion-usuarios', 'loguin-create.index');
//Route::view('loguin', 'loguin-create.index');
