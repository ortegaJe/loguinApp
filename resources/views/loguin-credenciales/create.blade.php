@extends('layouts.backend')

@section('title', 'LOG.'.$solicitud->ticket_id)

@section('css')
    <link rel="stylesheet" href="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.css') }}">
    <style>
        .add-btn-container {
            position: fixed;
            bottom: 40px;
            right: 20px;
        }

        .Btn {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 45px;
            height: 45px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition-duration: .3s;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
            background-color: #c1e4ec;
        }

        /* plus sign */
        .sign {
            width: 100%;
            transition-duration: .3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .sign svg {
            width: 17px;
        }

        .sign svg path {
            fill: white;
        }

        /* text */
        .text {
            position: absolute;
            right: 0%;
            width: 0%;
            opacity: 0;
            color: #015162;
            font-size: 1.0em;
            font-weight: 600;
            transition-duration: .3s;
        }

        /* hover effect on button width */
        .Btn:hover {
            width: 125px;
            border-radius: 40px;
            transition-duration: .3s;
        }

        .Btn:hover .sign {
            width: 30%;
            transition-duration: .3s;
            padding-left: 20px;
        }

        /* hover effect button's text */
        .Btn:hover .text {
            opacity: 1;
            width: 70%;
            transition-duration: .3s;
            padding-right: 10px;
        }

        /* button click effect*/
        .Btn:active {
            transform: translate(2px, 2px);
        }

        .button {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 60px;
            height: 60px;
            border-radius: 100%;
            border: none;
            background-color: #007bff;
        }

        .button:hover {
            background-color: #0079fac9;
            ;
        }
    </style>
@endsection

@section('js')
    <script src="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/jquery-validation/jquery.validate.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/jquery-validation/additional-methods.js') }}"></script>
    <script src="{{ asset('/js/plugins/bootstrap-notify/bootstrap-notify.min.js') }}"></script>
    <script type="module">
        Codebase.helpersOnLoad(['jq-select2', 'jq-notify', 'jq-validation']);
    </script>

    @vite(['resources/js/pages/credenciales.registrar.js'])
@endsection

@section('content')
    <div id="page-loader" class="show bg-gd-sea"></div>
    <div class="content">
        <nav class="breadcrumb push bg-body-extra-light rounded-pill px-4 py-2">
            <a class="breadcrumb-item" href="{{ route('loguin.app') }}" id="solicitud"
                data-solicitud-id="{{ $solicitud->solicitud }}">
                Solicitudes
            </a>
            <span class="breadcrumb-item active">Ticket #LOG.{{ $solicitud->ticket_id }}</span>
        </nav>
        <div class="row">
            <!-- Billing Address -->
            <div class="col-md-12">
                <div class="block block-themed block-rounded">
                    <div class="block-header block-header-default">
                        <h3 class="block-title">Información Loguin</i></h3>
                    </div>
                    <div class="block-content" id="data-identificacion">
                        <div class="fw-bold mb-1" id="loguin-identificacion"></div>
                        <div class="row">
                            <div class="col-sm-6">
                                <address id="data-usuario">
                                    <span id="loguin-nombre"></span><br>
                                    <span id="loguin-email"></span><br>
                                    <span id="loguin-sede"></span><br>
                                    <span id="loguin-cargo"></span><br>
                                    <span id="loguin-especialidad" hidden></span>
                                    <br>
                                    <a type="button" class="fw-bold mb-2" id="loguin-ticket" href="javascript:void(0)"
                                        data-bs-toggle="tooltip" data-bs-placement="right" title="Ticket Mesa de Servicio">
                                        <span id="modal-ticket-numero"></span></a>
                                </address>
                            </div>
                            <div class="col-sm-6">
                                <address id="loguin-observacion">
                                    <span id="observacion-loguin"></span>
                                </address>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- END Billing Address -->
        </div>
        <form id="form-loguin">
            <div class="add-btn-container">
                <button class="Btn" id="btn-save">
                    <div class="sign">
                        <i class="fa fa-save opacity-50" style="color: #015162"></i>
                    </div>
                    <div class="text">Guardar</div>
                </button>
            </div>
        </form>
        <div class="col-md-12" id="loguin-container" hidden>
            <div class="block block-rounded">
                <div class="block-header block-header-default">
                    <h3 class="block-title">LOGUIN</h3>
                    <div class="block-options">
                        <button type="button" class="btn-block-option" data-bs-toggle="tooltip" data-bs-placement="top"
                            title="Copiar">
                            <i class="far fa-fw fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="block-content block-content-full loguin-content"></div>
            </div>
        </div>
    </div>
    <div class="mb-4"></div>
    <div class="mb-4"></div>
    <div class="mb-4"></div>
    <div class="mb-4"></div>
@endsection
