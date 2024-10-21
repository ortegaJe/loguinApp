@extends('layouts.backend')

@section('css')
    <link rel="stylesheet" href="{{ asset('/js/plugins/select2/css/select2.min.css') }}">
    <link rel="stylesheet" href="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.css') }}">
@endsection

@section('js')
    <script src="{{ asset('/js/lib/jquery.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/select2/js/select2.full.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/sweetalert2/sweetalert2.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/jquery-validation/jquery.validate.min.js') }}"></script>
    <script src="{{ asset('/js/plugins/jquery-validation/additional-methods.js') }}"></script>
    <script src="{{ asset('/js/plugins/bootstrap3-typeahead.min.js') }}"></script>

    <script type="module">
        Codebase.helpersOnLoad(['jq-select2']);
    </script>

    <script type="module">
        let route = "{{ url('fetchEspecialidades') }}";

        $('#search-especialidad').typeahead({
            source: function(query, process) {
                return $.get(route, {
                    query: query
                }, function(data) {
                    return process(data);
                });
            }
        });
    </script>

    {{-- <script type="module" src="{{ asset('js/form.handler.js') }}"></script> --}}

    @vite(['resources/js/pages/form.handler.js'])
    @vite(['resources/js/pages/be_pages_generic_todo.js'])
@endsection

@section('content')
    <!-- Page Content -->
    <div class="content">
        <div class="row">
            <div class="col-lg-12">
                <form id="main-form">
                    <div class="block block-rounded">
                        <div class="block-header block-header-default">
                            <h3 class="block-title">Formulario Creación de Usuarios</h3>
                            <div class="block-options">
                                <button type="button" class="btn-block-option" data-toggle="block-option"
                                    data-action="content_toggle" hidden>
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
                                                    for="type_identity_number" name="type_identity_number"
                                                    style="width: 100%;">
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
                                                    for="identity_number" name="identity_number"
                                                    placeholder="identity_number">
                                                <label class="form-label" for="identity_number">Número de documento</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="first_name" name="first_name"
                                                    for="first_name" placeholder="first_name">
                                                <label class="form-label" for="first_name">Nombres</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="last_name" name="last_name"
                                                    for="last_name" placeholder="last_name">
                                                <label class="form-label" for="last_name">Apellidos</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-12 mb-4">
                                        <div class="form-floating">
                                            <input type="email" class="form-control" id="email" name="email"
                                                for="email" placeholder="email">
                                            <label class="form-label" for="email">Correo</label>
                                        </div>
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <select class="form-select" id="zonal-dropdown" name="zonal-dropdown"
                                                    for="zonal-dropdown" style="width: 100%;">
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
                                                    for="sede-dropdown" style="width: 100%;" disabled>
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
                                                    for="tipo-cargo-dropdown" name="tipo-cargo-dropdown"
                                                    style="width: 100%;" disabled>
                                                    <option></option>
                                                    <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                                </select>
                                                <label class="form-label" for="tipo-cargo-dropdown">Tipo de cargo</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <select class="form-select" id="cargo-dropdown" name="cargo-dropdown"
                                                    for="cargo-dropdown" style="width: 100%;" disabled>
                                                    <option></option>
                                                    <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                                </select>
                                                <label class="form-label" for="cargo-dropdown">Cargo</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-8 col-xl-6">
                                        <label class="form-label">Aplicaciones y perfiles disponibles para el cargo
                                            seleccionado</label>
                                        <!-- Tasks -->
                                        <!-- Tasks functionality is initialized in js/pages/be_pages_generic_todo.min.js which was auto compiled from _js/pages/be_pages_generic_todo.js -->
                                        <div class="js-tasks">
                                            <h2
                                                class="content-heading pb-0 mb-3 border-0 d-flex justify-content-between align-items-center">
                                                Disponibles <span
                                                    class="js-task-badge badge rounded-pill bg-primary animated fadeIn"></span>
                                            </h2>
                                            <div class="js-task-list">
                                                <!-- Task -->
                                                <div class="js-task block block-rounded mb-2 animated fadeIn overflow-hidden"
                                                    data-task-id="9" data-task-completed="false"
                                                    data-task-starred="false">
                                                    <table class="table table-borderless table-vcenter mb-0">
                                                        <tr>
                                                            <td class="js-task-content fw-medium ps-2">
                                                                DIGITURNO - LINEA DE FRENTE
                                                            </td>
                                                            <td class="text-end" style="width: 100px;">
                                                                <button type="button"
                                                                    class="js-task-star btn btn-sm btn-link text-primary">
                                                                    <i class="fa fa-fw fa-check text-muted opacity-50"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                                <!-- END Task -->
                                            </div>
                                            <!-- END Tasks List -->

                                            <!-- Starred Tasks List -->
                                            <h2
                                                class="content-heading pb-0 mb-3 border-0 d-flex justify-content-between align-items-center">
                                                Seleccionadas <span
                                                    class="js-task-badge-starred badge rounded-pill bg-primary animated fadeIn"></span>
                                            </h2>
                                            <div class="js-task-list-starred">
                                                <!-- Task -->
                                                <div class="js-task block block-rounded mb-2 animated fadeIn overflow-hidden"
                                                    data-task-id="5" data-task-completed="false"
                                                    data-task-starred="true">
                                                    <table class="table table-borderless table-vcenter mb-0">
                                                        <tr>
                                                            <td class="js-task-content fw-medium ps-2">
                                                                EVEREST - AUXILIAR DE ADMISIONES
                                                            </td>
                                                            <td class="text-end" style="width: 100px;">
                                                                <button type="button"
                                                                    class="js-task-star btn btn-sm btn-link text-primary">
                                                                    <i class="fa fa-fw fa-check"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </div>
                                                <!-- END Task -->
                                            </div>
                                            <!-- END Starred Tasks List -->
                                        </div>
                                        <!-- END Tasks -->
                                    </div>
                                    <div class="row mb-4" id="row-especialidad" hidden>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="search-especialidad"
                                                    name="search-especialidad" for="search-especialidad"
                                                    placeholder="search-especialidad" autocomplete="off">
                                                <label class="form-label" for="search-especialidad">
                                                    Buscar especialidad..
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row item-push" id="checkbox-row" hidden>
                                        <div class="mb-4">
                                            <label class="form-label" id="checkbox-label"></label>
                                            <div class="space-x-2" id="checkbox-container"></div>
                                        </div>
                                    </div>
                                    <div class="mb-4" id="radio-container" hidden>
                                        @foreach ($opciones_constantes as $opcion)
                                            <label class="form-label">{{ $opcion['label'] }}</label>
                                            <div class="space-x-2">
                                                @foreach ($opcion['opciones'] as $value => $label)
                                                    <div class="form-check form-check-inline radio-check mb-4">
                                                        <input class="form-check-input" type="radio"
                                                            name="{{ $opcion['label'] }}" value="{{ $value }}"
                                                            id="{{ $value }}_{{ $opcion['label'] }}"
                                                            data-radio-value="{{ $opcion['label'] }}" checked>
                                                        <label for="{{ $value }}_{{ $opcion['label'] }}">
                                                            {{ $label }}
                                                        </label>
                                                    </div>
                                                @endforeach
                                            </div>
                                        @endforeach
                                    </div>
                                    {{-- <div class="row push">
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
                                    </div> --}}
                                </div>
                            </div>
                        </div>
                        <div class="block-content block-content-full block-content-sm bg-body-light text-end">
                            <button type="reset" class="btn btn-alt-secondary" id="btn-reset">
                                <i class="fa fa-eraser opacity-50 me-1"></i> Limpiar
                            </button>
                            <button type="submit" class="btn btn-alt-primary" id="btn-save">
                                <i class="fa fa-paper-plane opacity-50 me-1"></i> Enviar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- END Page Content -->
@endsection
