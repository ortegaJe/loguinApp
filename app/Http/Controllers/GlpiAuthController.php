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

            $userProfileId = DB::table('glpi_profiles_users')
            ->where('users_id', $currentUser->id) // Relacionar el usuario autenticado con su ID
            ->whereIn('profiles_id', UserProfiles::values()) // Obtener el ID del perfil del usuario
            ->value('profiles_id'); // Obtener el ID del perfil del usuario

            $userProfile = $userProfileId ? UserProfiles::tryFrom($userProfileId) : null;

            if ($userProfile === null) {
                return redirect()->route('login')->withErrors(['message' => 'Perfil no encontrado.']);
            }

            // Definir un array de perfiles y sus rutas
            $routes = [
                UserProfiles::SUPER_ADMIN->value     => 'loguin/formulario',
                UserProfiles::CONTRATACION->value    => 'loguin/formulario',
                UserProfiles::ANALISTA_APP->value    => 'loguin/aplicaciones/solicitudes',
                UserProfiles::INFRAESTRUCTURA->value => 'loguin/infraestructura/solicitudes',
            ];
        
            // Verificar si el perfil tiene una ruta asociada
            if (array_key_exists($userProfile->value, $routes)) {
                return redirect()->intended($routes[$userProfile->value]); // Redirige a la ruta correspondiente
            }
        }

        // Si el usuario no existe, redirige con un mensaje de error
        return redirect()->route('login')->withErrors(['message' => 'Usuario no encontrado.']);
    }

    public function logout(Request $request)
    {
        Auth::guard('glpi')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'You are logged out.');
    }
}
