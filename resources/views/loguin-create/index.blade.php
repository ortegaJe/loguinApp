@extends('layouts.backend')

@section('css')
    <link rel="stylesheet" href="{{ asset('/js/plugins/select2/css/select2.min.css') }}">
    <link rel="stylesheet" href="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.css') }}">
@endsection

@section('js')
    <script src="{{ asset('js/lib/jquery.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/select2/js/select2.full.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.js') }}"></script>

    <script type="module">
        Codebase.helpersOnLoad(['jq-select2']);
    </script>

    {{-- <script type="module" src="{{ asset('js/form.handler.js') }}"></script> --}}

    @vite(['resources/js/pages/form.handler.js'])
@endsection

@section('content')
    <!-- Page Content -->
    <div class="content">
        <div class="row">
            <div class="col-lg-12">
                <form id="main-form">
                    <div class="block block-rounded">
                        <div class="block-header block-header-default">
                            <h3 class="block-title">Block Form</h3>
                            <div class="block-options">
                                <button type="button" class="btn-block-option" data-toggle="block-option"
                                    data-action="content_toggle">
                                </button>
                                <button type="button" id="btn-refresh" class="btn-block-option" data-toggle="block-option"
                                    data-action="state_toggle" hidden>
                                    <i class="si si-refresh"></i>
                                </button>
                            </div>
                        </div>
                        <div class="block-content">
                            <div class="row justify-content-center py-sm-3 py-md-5">
                                <div class="col-lg-8 col-xl-10">
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <select class="form-select" id="type_identity_number"
                                                    name="type_identity_number" style="width: 100%;">
                                                    <option selected disabled>Seleccione tipo..</option>
                                                    <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                                    @foreach ($tipos_identificacion as $data)
                                                        <option value="{{ $data->id }}">
                                                            {{ $data->abreviatura }}
                                                        </option>
                                                    @endforeach
                                                </select>
                                                <label class="form-label" for="type_identity_number">Tipo de
                                                    documento</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="identity_number"
                                                    name="identity_number" placeholder="identity_number">
                                                <label class="form-label" for="identity_number">Número de documento</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="first_name" name="first_name"
                                                    placeholder="first_name">
                                                <label class="form-label" for="first_name">Nombres</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="last_name" name="last_name"
                                                    placeholder="last_name">
                                                <label class="form-label" for="last_name">Apellidos</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 mb-4">
                                        <div class="form-floating">
                                            <input type="email" class="form-control" id="email" name="email"
                                                placeholder="email">
                                            <label class="form-label" for="email">Correo</label>
                                        </div>
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <select class="form-select" id="zonal-dropdown" name="zonal-dropdown"
                                                    style="width: 100%;">
                                                    <option selected disabled>Seleccione zonal..</option>
                                                    <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                                    @foreach ($zonales as $data)
                                                        <option value="{{ $data->id }}">
                                                            {{ $data->name }}
                                                        </option>
                                                    @endforeach
                                                </select>
                                                <label class="form-label" for="zonal-dropdown">Zonal</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <select class="form-select" id="sede-dropdown" name="sede-dropdown"
                                                    style="width: 100%;" disabled>
                                                    <option></option>
                                                    <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                                </select>
                                                <label class="form-label" for="sede-dropdown">Sede</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <select class="form-select" id="tipo-cargo-dropdown"
                                                    name="tipo-cargo-dropdown" style="width: 100%;" disabled>
                                                    <option></option>
                                                    <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                                </select>
                                                <label class="form-label" for="tipo-cargo-dropdown">Tipo de cargo</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <select class="form-select" id="cargo-dropdown" name="cargo-dropdown"
                                                    style="width: 100%;" disabled>
                                                    <option></option>
                                                    <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                                </select>
                                                <label class="form-label" for="cargo-dropdown">Cargo</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row item-push">
                                        <div class="mb-4">
                                            <label class="form-label">Aplicaciones y perfiles disponibles para el cargo
                                                seleccionado:</label>
                                            <div class="space-x-2" id="checkbox-container"></div>
                                        </div>
                                    </div>
                                    <div class="row push">
                                        <div class="col-lg-4">
                                            <p class="text-muted">
                                                Aplicaciones y perfiles disponibles para el cargo seleccionado:
                                            </p>
                                        </div>
                                        <div class="col-lg-8">
                                            <div class="row items-push">
                                                <div class="col-md-6">
                                                    <div class="form-check form-block">
                                                        <input class="form-check-input" type="checkbox" value=""
                                                            id="example-checkbox-block1" name="example-checkbox-block1">
                                                        <label class="form-check-label" for="example-checkbox-block1">
                                                            <span class="d-flex align-items-center">
                                                                <i class="fa fa-user-tag fa-2x"></i>
                                                                <span class="ms-2">
                                                                    <span class="fw-bold">LINEA DE FRENTE</span>
                                                                    <span class="d-block fs-sm text-muted">
                                                                        DIGITURNO
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <div class="form-check form-block">
                                                        <input class="form-check-input" type="checkbox" value=""
                                                            id="example-checkbox-block1" name="example-checkbox-block1">
                                                        <label class="form-check-label" for="example-checkbox-block1">
                                                            <span class="d-flex align-items-center">
                                                                <i class="fa fa-user-tag fa-2x"></i>
                                                                <span class="ms-2">
                                                                    <span class="fw-bold">AUXILIAR ADMISIONES</span>
                                                                    <span class="d-block fs-sm text-muted">
                                                                        EVEREST
                                                                    </span>
                                                                </span>
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-6 mb-4">
                                        <div class="d-grid gap-2">
                                            <button type="button" id="btn-add"
                                                class="btn btn-lg btn-block btn-alt-success py-sm-6 py-md-3" disabled>
                                                <i class="fa fa-plus opacity-50 me-1"></i>
                                                Añadir cargo
                                            </button>
                                        </div>
                                    </div>
                                    <div id="applications-list"></div>
                                </div>
                            </div>
                        </div>
                        <div class="block-content block-content-full block-content-sm bg-body-light text-end">
                            <button type="reset" class="btn btn-alt-secondary" id="btn-reset">
                                <i class="fa fa-eraser opacity-50 me-1"></i> Limpiar
                            </button>
                            <button type="submit" class="btn btn-alt-primary" id="btn-save">
                                <i class="fa fa-check opacity-50 me-1"></i> Enviar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- END Page Content -->
@endsection
