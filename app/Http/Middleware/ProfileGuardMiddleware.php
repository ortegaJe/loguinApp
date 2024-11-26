<?php

namespace App\Http\Middleware;

use App\Enums\UserProfiles;
use App\Enums\UserRoles;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ProfileGuardMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $roles): Response
    {
        // Roles permitidos por la ruta (separados por '|')
        $route_roles_array = explode('|', $roles);

        // Validar si el usuario está autenticado
        if (Auth::guard('glpi')->check()) {
            $currentUser = Auth::guard('glpi')->user();

            // Consultar el rol del usuario desde la tabla glpi_profiles_users
            $userProfile = DB::table('glpi_profiles_users')
                ->where('users_id', $currentUser->id) // Relacionar el usuario autenticado con su ID
                ->value('profiles_id'); // Obtener el ID del perfil del usuario

            // Verificar si el perfil obtenido coincide con alguno de los roles permitidos
            foreach ($route_roles_array as $role) {
                $roleValue = UserProfiles::fromName($role); // Usar Enum para obtener el valor correspondiente al nombre del rol

                if ($roleValue && $roleValue->value == $userProfile) {
                    return $next($request); // Continuar si el rol coincide
                }
            }
        }

        // Si el rol no coincide, denegar el acceso
        return response()->json(['message' => 'No tienes permiso para acceder a esta página.'], 403);
    }
}
