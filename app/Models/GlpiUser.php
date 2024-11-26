<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Model;

class GlpiUser extends Authenticatable
{
    use Notifiable;

    protected $table = 'glpi_users';
    protected $primaryKey = 'id';
}
