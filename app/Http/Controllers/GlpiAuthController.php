<?php

namespace App\Http\Controllers;

use App\Enums\UserProfiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GlpiAuthController extends Controller
{

    public function login(Request $request)
    {
        // handel GET /login
        if ($request->isMethod('get')) {
            return view('auth.loguin');
        }

        // handel POST /login
        // Valida solo el campo name
        $credentials = $request->validate([
            'name' => 'required|string',
        ]);

        $user = DB::table('glpi_users as a')
            ->where('a.name', $credentials['name'])
            ->where('a.is_active', 1)
            ->first('a.id');

        if ($user) {
            // Autentica manualmente al usuario
            $currentUser = Auth::guard('glpi')->loginUsingId($user->id);

            $userProfile = DB::table('glpi_profiles_users')
            ->where('users_id', $currentUser->id)
            ->value('profiles_id');

            // Definir un array de perfiles y sus rutas
            $routes = [
                UserProfiles::SUPER_ADMIN->value     => 'loguin/formulario',
                UserProfiles::CONTRATACION->value    => 'loguin/formulario',
                UserProfiles::ANALISTA_APP->value    => 'loguin/aplicaciones/credenciales',
                UserProfiles::INFRAESTRUCTURA->value => 'loguin/infraestructura/credenciales',
            ];
        
            // Verificar si el perfil tiene una ruta asociada
            if (array_key_exists($userProfile, $routes)) {
                return redirect()->intended($routes[$userProfile]); // Redirige a la ruta correspondiente
            }
        }

        // Si el usuario no existe, redirige con un mensaje de error
        return redirect()->route('login')->withErrors(['name' => 'Usuario no encontrado.']);
    }

    public function logout(Request $request)
    {
        Auth::guard('glpi')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'You are logged out.');
    }
}
