@extends('layouts.backend')

@section('css')
    <link rel="stylesheet" href="{{ asset('js/plugins/datatables-bs5/css/dataTables.bootstrap5.min.css') }}">
    <link rel="stylesheet" href="{{ asset('js/plugins/datatables-buttons-bs5/css/buttons.bootstrap5.min.css') }}">
    <link rel="stylesheet" href="{{ asset('js/plugins/datatables-responsive-bs5/css/responsive.bootstrap5.min.css') }}">
    <link rel="stylesheet" href="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.css') }}">
@endsection

@section('js')
    <script src="{{ asset('/js/lib/jquery.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables/dataTables.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-bs5/js/dataTables.bootstrap5.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-responsive/js/dataTables.responsive.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-responsive-bs5/js/responsive.bootstrap5.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-buttons/dataTables.buttons.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-buttons-bs5/js/buttons.bootstrap5.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-buttons-jszip/jszip.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-buttons-pdfmake/pdfmake.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-buttons-pdfmake/vfs_fonts.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-buttons/buttons.print.min.js') }}"></script>
    <script src="{{ asset('js/plugins/datatables-buttons/buttons.html5.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.js') }}"></script>

    @vite(['resources/js/pages/datatables.solicitudes.infra.credenciales.js'])
@endsection

@section('content')
    <div class="content">
        <div class="content-heading d-flex justify-content-between align-items-center">
            <span>
                Credenciales <small class="d-none d-sm-inline">Infraestructura</small>
            </span>
        </div>
        <!-- Partial Table -->
        <div class="block block-rounded">
            <div class="block-content block-content-full">
                <table class="table table-borderless table-hover table-vcenter js-dataTable-full" id="solicitudesTable">
                    <thead class="text-end border-bottom">
                        <tr>
                            <th class="d-none d-md-table-cell">#</th>
                            <th class="text-center">Ticket</th>
                            <th class="text-center d-none d-sm-table-cell">Estado</th>
                            <th class="d-none d-md-table-cell" style="width: 5%;">Fecha</th>
                            <th>Documento</th>
                            <th class="d-none d-md-table-cell" style="width: 30%;">Nombre Completo</th>
                            {{-- <th class="d-none d-md-table-cell"th>Cargo</th> --}}
                            <th class="text-center" style="width: 100px;">Opciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $contador = 1; @endphp
                        @foreach ($data['infra'] as $loguin)
                            <tr data-usuario-id="{{ $loguin->usuario_id }}">
                                <td class="text-center d-none d-md-table-cell">{{ $contador++ }}</td>
                                <td class="text-center"><a class="fw-semibold"
                                        href="http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id={{ $loguin->infra_ticket }}"
                                        target="_blank">INF.{{ $loguin->infra_ticket }}</a></td>
                                <td class="d-none d-sm-table-cell">
                                    <span class="badge bg-{{ $loguin->status_color }} w-100">
                                        <i class="{{ $loguin->status_icon }} me-1"></i>
                                        {{ $loguin->status_title }}</span>
                                </td>
                                <td class="text-muted d-none d-md-table-cell">
                                    {{ Carbon\Carbon::parse($loguin->fecha_creacion)->format('d/m/Y') }}
                                </td>
                                <td class="fw-semibold">{{ $loguin->identificacion }}</td>
                                <td class="fw-semibold d-none d-md-table-cell">{{ $loguin->nombreCompleto }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button type="button" class="btn btn-sm btn-secondary btn-show"
                                            data-toggle="click-ripple" data-bs-toggle="tooltip" title="Ver detalle"
                                            data-solicitud-id="{{ $loguin->solicitud_infra_id }}"
                                            data-solicitud-tipo="infra">
                                            <i class="fa fa-eye"></i>
                                        </button>
                                        <button type="button" class="btn btn-sm btn-secondary btn-register-infra"
                                            data-toggle="click-ripple" data-bs-toggle="tooltip"
                                            title="Registrar credenciales"
                                            data-solicitud-id="{{ $loguin->solicitud_infra_id }}"
                                            data-solicitud-tipo="infra">
                                            <i class="fa fa-user-pen"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        <!-- END Partial Table -->
        <!-- Modal Infra -->
        <div class="modal fade" id="solicitudModalInfra" tabindex="-1" aria-labelledby="solicitudModalInfraLabel"
            aria-hidden="true">
            <div class="modal-dialog modal-dialog-popout modal-lg" role="document">
                <div class="modal-content">
                    <div class="block block-rounded shadow-none mb-0">
                        <div class="modal-header text-end border-bottom">
                            <h5 class="modal-title" id="solicitudModalInfraLabel">Detalle de Solicitud</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="block-content fs-md">
                            <div class="row">
                                <div class="col-sm-12">
                                    <div class="block block-rounded block-bordered">
                                        <div class="block-header">
                                            <h3 class="block-title"><i class="fa fa-user fa-2x text-muted"></i></h3>
                                        </div>
                                        <div class="block-content">
                                            <p class="mb-1">
                                                <strong>Documento:</strong> <span id="modal-infra-documento"></span>
                                            </p>
                                            <p class="mb-1">
                                                <strong>Nombre Completo:</strong> <span id="modal-infra-nombre"></span>
                                            </p>
                                            <p>
                                                <strong>Email:</strong> <span id="modal-infra-email"></span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <a class="block block-rounded block-bordered" id="modal-infra-ticket"
                                        href="javascript:void(0)">
                                        <div class="block-header">
                                            <h3 class="block-title"><i class="fa fa-ticket fa-2x text-muted"></i></h3>
                                        </div>
                                        <div class="block-content">
                                            <p class="mb-1">
                                                <strong>Ticket Mesa de Servicio:</strong> <span
                                                    id="modal-infra-ticket-numero"></span>
                                            </p>
                                            <p>
                                                <strong>Fecha de Creación:</strong> <span id="modal-infra-fecha"></span>
                                            </p>
                                        </div>
                                    </a>
                                </div>
                                <div class="col-sm-6">
                                    <div class="block block-rounded block-bordered">
                                        <div class="block-header">
                                            <h3 class="block-title"><i class="fa fa-building fa-2x me-1 text-muted"></i>
                                            </h3>
                                        </div>
                                        <div class="block-content">
                                            <p class="mb-1">
                                                <strong>Sede:</strong> <span id="modal-infra-sede"></span>
                                            </p>
                                            <p>
                                                <strong>Zonal:</strong> <span id="modal-infra-zonal"></span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-4" id="correo" hidden>
                                    <div class="block block-rounded block-bordered">
                                        <div class="block-header">
                                            <h3 class="block-title text-muted"><i class="fa fa-envelope fa-2x me-1"></i>
                                                <small>Correo Institucional</small>
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-4" id="dominio" hidden>
                                    <div class="block block-rounded block-bordered">
                                        <div class="block-header">
                                            <h3 class="block-title text-muted"><i
                                                    class="fa fa-user-circle fa-2x me-1"></i>
                                                <small>Usuario de Dominio</small>
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-sm-4" id="vpn" hidden>
                                    <div class="block block-rounded block-bordered">
                                        <div class="block-header">
                                            <h3 class="block-title text-muted"><i class="fa fa-globe fa-2x me-1"></i>
                                                <small>VPN</small>
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                {{--                                 <div class="col-sm-12">
                                    <div class="block block-rounded block-bordered">
                                        <div class="block-header">
                                            <h3 class="block-title"><i class="fa fa-cogs fa-2x me-1 text-muted"></i>
                                                Aplicaciones y Perfiles Solicitados
                                            </h3>
                                        </div>
                                        <div class="block-content">
                                            <ul class="list-group push" id="modal-aplicaciones-perfiles"></ul>
                                            <h6 id="title-especialidad" hidden><i
                                                    class="fa fa-book-medical fa-2x me-2 text-muted"></i>Especialidad</h6>
                                            <ul class="list-group push" id="modal-especialidad-usuario" hidden></ul>
                                        </div>
                                    </div>
                                </div> --}}
                            </div>
                        </div>
                        <div class="block-content block-content-full block-content-sm text-end border-top">
                            <button type="button" class="btn btn-alt-secondary" data-bs-dismiss="modal">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- END Modal Infra -->
    </div>
@endsection
