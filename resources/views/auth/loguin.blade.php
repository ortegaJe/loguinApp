<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">

    <title>{{ config('app.name') }}</title>

    <!-- Modules -->
    @yield('css')
    @vite(['resources/sass/main.scss', 'resources/js/codebase/app.js'])

    <!-- Alternatively, you can also include a specific color theme after the main stylesheet to alter the default color theme of the template -->
    {{-- @vite(['resources/sass/main.scss', 'resources/sass/codebase/themes/corporate.scss', 'resources/js/codebase/app.js']) --}}
    @yield('js')
</head>

<body>
    <!-- Page Container -->
    <!--
      Available classes for #page-container:

      GENERIC

        'remember-theme'                            Remembers active color theme and dark mode between pages using localStorage when set through
                                                    - Theme helper buttons [data-toggle="theme"],
                                                    - Layout helper buttons [data-toggle="layout" data-action="dark_mode_[on/off/toggle]"]
                                                    - ..and/or Codebase.layout('dark_mode_[on/off/toggle]')

      SIDEBAR & SIDE OVERLAY

        'sidebar-r'                                 Right Sidebar and left Side Overlay (default is left Sidebar and right Side Overlay)
        'sidebar-mini'                              Mini hoverable Sidebar (screen width > 991px)
        'sidebar-o'                                 Visible Sidebar by default (screen width > 991px)
        'sidebar-o-xs'                              Visible Sidebar by default (screen width < 992px)
        'sidebar-dark'                              Dark themed sidebar

        'side-overlay-hover'                        Hoverable Side Overlay (screen width > 991px)
        'side-overlay-o'                            Visible Side Overlay by default

        'enable-page-overlay'                       Enables a visible clickable Page Overlay (closes Side Overlay on click) when Side Overlay opens

        'side-scroll'                               Enables custom scrolling on Sidebar and Side Overlay instead of native scrolling (screen width > 991px)

      HEADER

        ''                                          Static Header if no class is added
        'page-header-fixed'                         Fixed Header

      HEADER STYLE

        ''                                          Classic Header style if no class is added
        'page-header-modern'                        Modern Header style
        'page-header-dark'                          Dark themed Header (works only with classic Header style)
        'page-header-glass'                         Light themed Header with transparency by default
                                                    (absolute position, perfect for light images underneath - solid light background on scroll if the Header is also set as fixed)
        'page-header-glass page-header-dark'        Dark themed Header with transparency by default
                                                    (absolute position, perfect for dark images underneath - solid dark background on scroll if the Header is also set as fixed)

      MAIN CONTENT LAYOUT

        ''                                          Full width Main Content if no class is added
        'main-content-boxed'                        Full width Main Content with a specific maximum width (screen width > 1200px)
        'main-content-narrow'                       Full width Main Content with a percentage width (screen width > 1200px)

      DARK MODE

        'sidebar-dark page-header-dark dark-mode'   Enable dark mode (light sidebar/header is not supported with dark mode)
    -->
    <div id="page-container" class="main-content-boxed">

        <!-- Main Container -->
        <main id="main-container">
            <!-- Page Content -->
            <div class="hero-static content content-full bg-body-extra-light">
                <!-- Header -->
                <div class="py-4 px-1 text-center mb-4">
                    <a class="link-fx fw-bold" href="index.html">
                        <i class="fa fa-users-cog"></i>
                        <span class="fs-4 text-body-color">Log</span><span class="fs-4">uin</span>
                    </a>
                    <h1 class="h3 fw-bold mt-5 mb-2">Bienvenido</h1>
                    <h2 class="h5 fw-medium text-muted mb-0">Por favor ingresa usuario GLPI</h2>
                </div>
                <!-- END Header -->

                <!-- Sign In Form -->
                <div class="row justify-content-center px-1">
                    <div class="col-sm-8 col-md-6 col-xl-4">
                        <!-- jQuery Validation functionality is initialized with .js-validation-signin class in js/pages/op_auth_signin.min.js which was auto compiled from _js/pages/op_auth_signin.js -->
                        <!-- For more examples you can check out https://github.com/jzaefferer/jquery-validation -->
                        <form class="js-validation-signin" action="{{ route('login') }}" method="POST"
                            autocomplete="off">
                            @csrf
                            <div class="form-floating mb-4">
                                <input type="text" class="form-control" id="name" name="name"
                                    placeholder="Enter your username">
                                <label class="form-label" for="name">Usuario</label>
                            </div>
{{--                             <div class="form-floating mb-4">
                                <input type="password" class="form-control" id="password" name="password"
                                    placeholder="Enter your password">
                                <label class="form-label" for="password">Password</label>
                            </div> --}}
                            <div class="row g-sm mb-4">
                                <div class="col-12 mb-2">
                                    <button type="submit" class="btn btn-lg btn-alt-primary w-100 py-3 fw-semibold">
                                        Iniciar Sesión
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- END Sign In Form -->
            </div>

            <!-- END Page Content -->
        </main>
        <!-- END Main Container -->
    </div>
    <!-- END Page Container -->
</body>

</html>
