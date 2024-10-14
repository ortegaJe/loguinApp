<?php

namespace App\Enums;

class OpcionesConstantes
{
    const OPCIONES = [
        'solicitar_correo' => [
            'label' => 'Requiere Correo Institucional',
            'opciones' => [1 => 'SI', 0 => 'NO']
        ],
        'solicitar_usuario_dominio' => [
            'label' => 'Requiere Usuario Dominio',
            'opciones' => [1 => 'SI', 0 => 'NO']
        ],
        'solicitar_vpn' => [
            'label' => 'Requiere VPN',
            'opciones' => [1 => 'SI', 0 => 'NO']
        ]
    ];
}
