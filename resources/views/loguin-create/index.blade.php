@extends('layouts.backend')

@section('css')
    <link rel="stylesheet" href="{{ asset('/js/plugins/select2/css/select2.min.css') }}">
@endsection

@section('js')
    <script src="{{ asset('js/lib/jquery.min.js') }}"></script>

    <script src="{{ asset('js/plugins/select2/js/select2.full.min.js') }}"></script>

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
                                <div class="col-lg-8 col-xl-6">
                                    <div class="form-floating mb-4">
                                        <input type="text" class="form-control" id="identity_number"
                                            name="identity_number" placeholder="identity_number">
                                        <label class="form-label" for="identity_number">Número de documento</label>
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
                                    <div class="row mb-4">
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="job_title" name="job_title"
                                                    placeholder="job_title">
                                                <label class="form-label" for="job_title">Cargo</label>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="form-floating">
                                                <input type="email" class="form-control" id="email" name="email"
                                                    placeholder="email">
                                                <label class="form-label" for="email">Correo</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-floating mb-4">
                                        <select class="form-select" id="zonal-dropdown" name="zonal-dropdown"
                                            style="width: 100%;">
                                            <option selected disabled>Seleccione zonal..</option>
                                            <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                            @foreach ($zonales as $data)
                                                <option value="{{ $data->id }}">
                                                    {{ $data->nombre }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <label class="form-label" for="zonal-dropdown">Zonal</label>
                                    </div>
                                    <div class="form-floating mb-4">
                                        <select class="form-select" id="sede-dropdown" name="sede-dropdown"
                                            style="width: 100%;" disabled>
                                            <option></option>
                                            <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                        </select>
                                        <label class="form-label" for="zonal-dropdown">Sede</label>
                                    </div>
                                    <div class="form-floating mb-4">
                                        <select class="form-select" id="app-dropdown" name="app-dropdown"
                                            style="width: 100%;" disabled>
                                            <option></option>
                                            <!-- Required for data-placeholder attribute to work with Select2 plugin -->
                                        </select>
                                        <label class="form-label" for="zonal-dropdown">Aplicación</label>
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-10">
                                            <div class="form-floating mb-4">
                                                <select class="form-select" id="perfil-dropdown" name="perfil-dropdown"
                                                    disabled>
                                                </select>
                                                <label class="form-label" for="zonal-dropdown">Perfil</label>
                                            </div>
                                        </div>
                                        <div class="col-2">
                                            <button type="button" id="btn-add"
                                                class="btn btn-lg btn-alt-success py-sm-6 py-md-3 mb-4" disabled>
                                                <i class="fa fa-plus opacity-50"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div id="applications-list"></div>
                                </div>
                            </div>
                        </div>
                        <div class="block-content block-content-full block-content-sm bg-body-light text-end">
                            <button type="reset" class="btn btn-alt-secondary" id="btn-reset">
                                <i class="fa fa-sync-alt opacity-50 me-1"></i> Reset
                            </button>
                            <button type="submit" class="btn btn-alt-primary" id="btn-save">
                                <i class="fa fa-check opacity-50 me-1"></i> Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- END Page Content -->
@endsection
