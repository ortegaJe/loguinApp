<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GlpiAuthController extends Controller
{

    public function login(Request $request)
    {
        // Valida solo el campo name
        $credentials = $request->validate([
            'name' => 'required|string',
        ]);

        $user = DB::connection('glpi')
            ->table('glpi_users as a')
            ->where('a.name', $credentials['name'])
            ->where('a.is_active', 1)
            ->first('a.id');

        if ($user) {
            // Autentica manualmente al usuario
            Auth::guard('glpi')->loginUsingId($user->id);

            // Redirige al dashboard o a la ruta deseada
            return redirect()->intended('loguin/formulario');
        }

        // Si el usuario no existe, redirige con un mensaje de error
        return redirect()->route('login')->withErrors(['name' => 'Usuario no encontrado.']);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'You are logged out.');
    }
}
