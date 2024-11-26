<?php
namespace App\Enums;

enum UserProfiles: int
{
    case SUPER_ADMIN     = 4;
    case ANALISTA_APP    = 12;
    case INFRAESTRUCTURA = 14;
    case CONTRATACION    = 15;

    public static function values(): array
    {
        return array_column(self::cases(), 'value','name');
    }
    public static function fromName(string $name): ?self
    {
    return collect(self::cases())->firstWhere('name', strtoupper($name));
    }
    public static  function isSuperAdmin( UserProfiles $useRole)
    {
        return $useRole->value == UserProfiles::SUPER_ADMIN->value;
    }
    public static  function isAnalistaApp( UserProfiles $useRole)
    {
        return $useRole->value == UserProfiles::ANALISTA_APP->value;
    }
    public static  function isInfraestructura( UserProfiles $useRole)
    {
        return $useRole->value == UserProfiles::INFRAESTRUCTURA->value;
    }
    public static  function isContratacion( UserProfiles $useRole)
    {
        return $useRole->value == UserProfiles::CONTRATACION->value;
    }
}