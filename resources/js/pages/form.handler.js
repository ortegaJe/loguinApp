class ApplicationFormManager {
    static perfilesEspecialistaId = ["5","6"] // ID desde la base de datos especilidades everest y pana

    static initFormElements() {
        this.mainForm = document.getElementById('main-form');
        this.zonalDropdown = document.getElementById('zonal-dropdown');
        this.sedeDropdown = document.getElementById('sede-dropdown');
        this.tipoCargoDropdown = document.getElementById('tipo-cargo-dropdown');
        this.cargoSedeDropdown = document.getElementById('cargo-dropdown');
        this.blockElement  = document.querySelector('.block.block-rounded.block-transparent');
        this.blockSolicitud = document.getElementById('block-solicitud');
        this.rowEspecialidad = document.getElementById('row-especialidad');
        this.searchEspecialidad = document.getElementById('search-especialidad');
        this.checkboxRow = document.getElementById('checkbox-row');
        this.checkboxDescLabel = document.getElementById('checkbox-label');
        this.checkboxContainer = document.getElementById('checkbox-container');
        this.checboxInfraRow = document.getElementById('checkbox-infra-row');
        this.cheboxInfraLabel = document.getElementById('checkbox-infra-label');
        this.checkboxInfraContainer = document.getElementById('checkbox-infra-container');
        this.observaciones = document.getElementById('observaciones');
        this.modalContainer = document.getElementById('modal-container');

        this.appDropdown = document.getElementById('app-dropdown');
        this.perfilDropdown = document.getElementById('perfil-dropdown');
        this.applicationsList = document.getElementById('applications-list');
        this.btnAdd = document.getElementById('btn-add');

        this.btnRefreshBlock = document.getElementById('btn-refresh');
        this.btnReset = document.getElementById('btn-reset');
        this.toast = Swal.mixin({
            buttonsStyling: false,
            target: '#page-container',
            customClass: {
              confirmButton: 'btn btn-primary m-1',
              cancelButton: 'btn btn-danger m-1',
              input: 'form-control'
            }
          });

        jQuery.validator.addMethod("atLeastOneChecked", function(value, element, params) {
            return jQuery(params).filter(':checked').length > 0;
        }, "Please select at least one option.");

        // Inicializar validación del formulario
        let notificationShown = false; // Variable para rastrear si la notificación ya fue mostrada

        // Init Form Validation
        jQuery('#main-form').validate({
        ignore: [],
        rules: {
            'type_identity_number': {
            required: true,
            },
            'first_name': {
            required: true,
            },
            'identity_number': {
            required: true,
            },
            'last_name': {
            required: true,
            },
            'email': {
            required: true,
            emailWithDot: true
            },
            'zonal-dropdown': {
            required: true,
            },
            'sede-dropdown': {
            required: true,
            },
            'tipo-cargo-dropdown': {
            required: true,
            },
            'cargo-dropdown': {
            required: true,
            },
            'checkbox-group': {
            atLeastOneChecked: '.checkbox-group' // Aplica la validación a los checkboxes con la clase .checkbox-group
            },
            'search-especialidad': {
            required: {
                    depends: function (element) {
                        return !jQuery(element).is(':hidden'); // La validación solo ocurre si el campo NO está oculto
                    }
                }
            },
        },
        messages: {
            'type_identity_number': {
                required: "Este campo es obligatorio",
            },
            'first_name': {
                required: "Este campo es obligatorio",
            },
            'identity_number': {
                required: "Este campo es obligatorio",
            },
            'last_name': {
                required: "Este campo es obligatorio",
            },
            'email': {
                required: "Este campo es obligatorio",
                emailWithDot: "Debe ser un correo válido"
            },
            'zonal-dropdown': {
                required: "Este campo es obligatorio",
            },
            'sede-dropdown': {
                required: "Este campo es obligatorio",
            },
            'tipo-cargo-dropdown': {
                required: "Este campo es obligatorio",
            },
            'cargo-dropdown': {
                required: "Este campo es obligatorio",
            },
            'checkbox-group': {
                atLeastOneChecked: "Debe seleccionar al menos una opción"
            },
            'search-especialidad': {
                required: "Este campo es obligatorio"
            }
        },
        errorPlacement: function(error, element) {
            // No mostrar mensajes de error junto a los checkboxes
            if (element.hasClass('checkbox-group')) {
                return;
            }
            error.insertAfter(element); // Colocar errores para otros elementos
        },
        invalidHandler: function(event, validator) {
            // Verifica si la validación falló en el grupo de checkboxes
            if (validator.errorList.some(error => error.method === "atLeastOneChecked")) {
                Codebase.helpers('jq-notify', {
                    align: 'right',
                    from: 'top',
                    type: 'danger',
                    icon: 'fa fa-exclamation-triangle me-5',
                    message: 'Debe seleccionar al menos una opción en la sección de Aplicaciones y Perfiles o Solicitudes de Infraestructura disponibles'
                });
                notificationShown = true; // Marca la notificación como mostrada
            }
        },
        success: function(label) {
            // Reinicia la variable para permitir futuras notificaciones si se arregla el error y luego vuelve a ocurrir
            notificationShown = false;
        }
    });

    jQuery('.checkbox-group').on('change', function() {
        jQuery('#main-form').validate().element('.checkbox-group');
    });

    jQuery('.js-select2').on('change', e => {
        jQuery(e.currentTarget).valid();
    });

    tippy('#myButton', {
        content: 'My tooltip!',
    });
    }

    static async handleFetchResponse(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }

    static updateDropdown(dropdownId, data, placeholder) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        data.forEach(item => {
            dropdown.insertAdjacentHTML('beforeend', `<option value="${item.id}">${item.name.toUpperCase()}</option>`);
        });
        dropdown.disabled = data.length === 0;
    }   

    static resetCheckboxesButtons()
    {
        this.checkboxRow.hidden = true;
        this.checkboxDescLabel.innerHTML = '';
        this.checkboxContainer.innerHTML = '';

        this.checboxInfraRow.hidden = true;
        this.cheboxInfraLabel.innerHTML = '';
        this.checkboxInfraContainer.innerHTML = '';

        // Desmarcar todos los radios
        jQuery('#checkbox-container input[type="checkbox"]').prop('checked', false);
        jQuery('#checkbox-infra-container input[type="checkbox"]').prop('checked', false);

        // Marcar un valor específico (por ejemplo, "NO" para cada grupo)
        //jQuery('#checkbox-infra-container input[type="checkbox"][value="0"]').prop('checked', true);
    }

    static resetAll() 
    {
        this.updateDropdown('sede-dropdown', [], 'Seleccione sede..');
        this.updateDropdown('tipo-cargo-dropdown', [], 'Seleccione tipo de cargo..');
        this.updateDropdown('cargo-dropdown', [], 'Seleccione cargo..');
        this.resetPerfilDropdown();
    }

     static resetPerfilDropdown() 
    {
        this.resetCheckboxesButtons();
        this.rowEspecialidad.hidden = true;
        this.searchEspecialidad.value = '';
        this.observaciones.value = '';
    }

    static async showToast(title, message, type) 
    {
        let toast = Swal.mixin({
            buttonsStyling: false,
            target: '#page-container',
            customClass: {
                confirmButton: 'btn btn-primary m-1',
                cancelButton: 'btn btn-danger m-1',
                input: 'form-control'
            }
        });
    
        toast.fire(title, message, type);
    }

    static async AutocompleteDataLoguin() 
    {
        const route = "/fetchDataIdentificacionLoguin";
        const routeAutocompletarDatoUsuario = "/fetchDataAutoCompleteLoguin";
    
        jQuery('#identity_number').typeahead({
            source: function(query, process) {
                fetch(`${route}?query=${query}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Convertir cada identificacion a string
                    const stringData = data.map(item => item.toString());
                    return process(stringData);
                })
                .catch(error => console.error('Error en la búsqueda o documento no encontrado:', error.message));
            },
            afterSelect: function(item) {
                fetch(`${routeAutocompletarDatoUsuario}?identificacion=${item}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Rellenar los campos del formulario con la información recibida
                    jQuery('#type_identity_number').val(data.tipo_doc_id);
                    jQuery('#identity_number').val(data.identificacion);
                    jQuery('#first_name').val(data.nombres);
                    jQuery('#last_name').val(data.apellidos);
                    jQuery('#email').val(data.email);
                })
                .catch(error => console.error('Error al obtener los datos del usuario:', error));

            }
        });
    }

    static async zonalChangeHandler() 
    {
        const idZonal = this.zonalDropdown.value;
        //console.log(idZonal);
        if (!idZonal) {
            this.resetAll();
            return;
        }

        try {
            const response = await fetch("/fetchSedes", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ zonal_id: idZonal })
            });

            const data = await this.handleFetchResponse(response);
            //console.log(data);
            this.updateDropdown('sede-dropdown', data.sedes, 'Seleccione sede..');
            this.updateDropdown('tipo-cargo-dropdown', [], 'Seleccione tipo de cargo..');
            this.updateDropdown('cargo-dropdown', [], 'Seleccione cargo..');
            this.resetPerfilDropdown();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static async sedeChangeHandler() 
    {
        const idSede = this.sedeDropdown.value;
        if (!idSede) {
            this.resetAll();
            return;
        }

        try {
            const response = await fetch("/fetchTipoCargoSede", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ sede_id: idSede })
            });

            const data = await this.handleFetchResponse(response);
            this.updateDropdown('tipo-cargo-dropdown', data.tipo_cargo_sede, 'Seleccione tipo de cargo..');
            this.updateDropdown('cargo-dropdown', [], 'Seleccione cargo..');
            this.resetPerfilDropdown();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static async cargoSedeChangeHandler() 
    {
        const idTipoCargo = this.tipoCargoDropdown.value;
        const idSede = this.sedeDropdown.value;
        if (!idTipoCargo) {
            this.resetAll();
            return;
        }

        try {
            const response = await fetch("/fetchCargoSede", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ tipo_cargo_id: idTipoCargo, sede_id: idSede })
            });

            const data = await this.handleFetchResponse(response);
            this.updateDropdown('cargo-dropdown', data.cargo_sede, 'Seleccione cargo..');
            this.resetPerfilDropdown();
            //this.rowEspecialidad.hidden = true;
            //this.searchEspecialidad.value = '';

        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static async CargoAppPerfilChangeHandler() 
    {
        const idSede = this.sedeDropdown.value;
        const idCargo = this.cargoSedeDropdown.value;
    
        if (!idCargo) {
            this.resetAll();
            return;
        }
    
        try {
            // Mostrar el bloque
            this.blockSolicitud.hidden = false;
            // Mostrar el bloque de solicitudes y activar el estado de "cargando"
            this.blockElement.classList.add('block-mode-loading');
    
            const response = await fetch("/fetchCargoAppPerfil", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ cargo_id: idCargo, sede_id: idSede })
            });
    
            if (!response.ok) {
                const errorData = await response.json();  // Extraer el mensaje desde el backend
                throw new Error(errorData.message || 'Something went wrong..');
            }
    
            const data = await this.handleFetchResponse(response);
            //console.log(data);
            const renderPerfilesCheckboxes = data.perfiles;
            const renderInfraCheckboxes = data.solicitud_infra;

            //console.log(this.perfilesEspecialistaId);
    
            // oculta y setea el contenedor del input especialidaddes antes de agregar nuevos elementos
            this.rowEspecialidad.hidden = this.perfilesEspecialistaId.includes(idCargo) ? false : true;
            this.searchEspecialidad.value = '';
            
            // Limpiar los contenedores de checkboxes después de la animación
            this.checkboxContainer.innerHTML = '';
            this.checkboxInfraContainer.innerHTML = '';
            // Mostrar los nuevos checkboxes
            this.checkboxRow.hidden = false;
            this.checboxInfraRow.hidden = false;
                
            // Remover las clases de animación para próximas ejecuciones
            this.blockElement.classList.remove('block-mode-loading');
            
            // Crear los checkboxes dinámicamente
            renderPerfilesCheckboxes.forEach((perfil, index) => {
                this.checkboxDescLabel.textContent = 'Aplicaciones y perfiles disponibles para el cargo seleccionado:';
                
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add('form-check', 'form-check-inline');

                const checkboxInput = document.createElement('input');
                checkboxInput.classList.add('form-check-input', 'checkbox-group');
                checkboxInput.type = 'checkbox';
                checkboxInput.value = perfil.perfil;
                checkboxInput.id = `perfil-${index}`;
                checkboxInput.setAttribute('data-perfil-id', perfil.perfil_id);
                checkboxInput.setAttribute('data-app-id', perfil.aplicacion_id);
                checkboxInput.name = `checkbox-group`;

                const checkboxLabel = document.createElement('label');
                checkboxLabel.classList.add('form-check-label');
                checkboxLabel.htmlFor = `perfil-${index}`;
                checkboxLabel.textContent = `${perfil.aplicacion} - ${perfil.perfil.toUpperCase()}`;

                checkboxDiv.appendChild(checkboxInput);
                checkboxDiv.appendChild(checkboxLabel);

                this.checkboxContainer.appendChild(checkboxDiv);
            });

            const explicaciones = {
                correo: {
                    titulo: '¿Qué es un Correo Institucional?',
                    descripcion: 'Es una cuenta de correo asignada por la institución, utilizada para comunicaciones oficiales y acceso a recursos internos.',
                },
                dominio: {
                    titulo: '¿Qué es un Usuario de Dominio?',
                    descripcion: 'Es una cuenta que permite a los usuarios autenticarse y acceder a recursos compartidos en la red de la institución.',
                },
                vpn: {
                    titulo: '¿Qué es una VPN?',
                    descripcion: 'Una VPN (Red Privada Virtual) permite a los usuarios conectarse de forma segura a los recursos internos de la institución desde ubicaciones remotas.',
                },
            };

            renderInfraCheckboxes.forEach((solicitud, index) => {
                this.cheboxInfraLabel.textContent = 'Solicitudes de Infraestructura disponibles para el cargo seleccionado:';

                const checkboxCorreo = document.createElement('div');
                checkboxCorreo.className = 'form-check';
                checkboxCorreo.innerHTML = `
                    <input type="checkbox" class="form-check-input checkbox-group" name="sw_correo_${index}" value="1"
                        id="sw_correo_${solicitud.sw_correo}" ${solicitud.sw_correo === 0 ? 'disabled' : ''}>
                    <label for="sw_correo_${solicitud.sw_correo}" class="form-check-label">Requiere Correo Institucional</label>
                    <span class="badge bg-primary rounded-pill btn-tooltip" data-tippy-tipo="correo">
                        <i class="fa fa-question"></i> 
                    </span>`;
                                    
                const checkboxDominio = document.createElement('div');
                checkboxDominio.className = 'form-check';
                checkboxDominio.innerHTML = `
                    <input type="checkbox" class="form-check-input checkbox-group" name="sw_dominio_${index}" value="1"
                        id="sw_dominio_${solicitud.sw_dominio}" ${solicitud.sw_dominio === 0 ? 'disabled' : ''}>
                    <label for="sw_dominio_${solicitud.sw_dominio}" class="form-check-label">Requiere Usuario Dominio</label>
                    <span class="badge bg-primary rounded-pill btn-tooltip" data-tippy-tipo="dominio">
                        <i class="fa fa-question"></i> 
                    </span>`;
                
                const checkboxVPN = document.createElement('div');
                checkboxVPN.className = 'form-check';
                checkboxVPN.innerHTML = `
                    <input type="checkbox" class="form-check-input checkbox-group" name="sw_vpn_${index}" value="1"
                        id="sw_vpn_${solicitud.sw_vpn}" ${solicitud.sw_vpn === 0 ? 'disabled' : ''}>
                    <label for="sw_vpn_${solicitud.sw_vpn}" class="form-check-label">Requiere VPN</label>
                    <span class="badge bg-primary rounded-pill btn-tooltip" data-tippy-tipo="vpn">
                        <i class="fa fa-question"></i> 
                    </span>`;

                this.checkboxInfraContainer.appendChild(checkboxCorreo);
                this.checkboxInfraContainer.appendChild(checkboxDominio);
                this.checkboxInfraContainer.appendChild(checkboxVPN);
            });

            tippy('.btn-tooltip', {
                content(reference) {
                    const tipo = reference.getAttribute('data-tippy-tipo');
                    if (explicaciones[tipo]) {
                        const { titulo, descripcion } = explicaciones[tipo];
                        return `<strong>${titulo}</strong><br>${descripcion}`;
                    }
                    return 'Información no disponible';
                },
                allowHTML: true,
                theme: 'material',
                animation: 'fade',
                placement: 'right',
                arrow: true,
            });

        } catch (error) {
            // Remover la clase `block-mode-loading` si ocurre un error
            this.blockElement.classList.remove('block-mode-loading');
            //console.log('Error', error);
            this.showToast('Oops...', `${error.message}`, 'warning');
            this.cargoSedeDropdown.value = '';
            this.blockSolicitud.hidden = true;
            this.resetPerfilDropdown();
        }
    }

    static mostrarModal({ titulo, descripcion }) {
        const modalHtml = `
            <div class="modal fade" id="ayudaModal" tabindex="-1" aria-labelledby="ayudaModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="ayudaModalLabel">${titulo}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${descripcion}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>`;
    
        this.modalContainer.innerHTML = modalHtml;
    
        // Inicializar y mostrar el modal usando Bootstrap
        const ayudaModal = new bootstrap.Modal(document.getElementById('ayudaModal'));
        ayudaModal.show();
    }
    
    static async appChangeHandler() {
        const idApp = this.appDropdown.value;
        const selectedAppText = this.appDropdown.options[this.appDropdown.selectedIndex].text;

        if (!idApp) {
            this.resetPerfilDropdown();
            return;
        }

        try {
            const response = await fetch("fetchAppsPerfiles", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ app_id: idApp })
            });

            const data = await this.handleFetchResponse(response);
            this.updateDropdown('perfil-dropdown', data.perfiles, 'Seleccione Perfil..');

            if (this.panaAppNames.includes(selectedAppText)) {
                this.perfilDropdown.size = "10";
                this.perfilDropdown.multiple = true;
            } else {
                this.perfilDropdown.multiple = false;
                this.btnAdd.disabled = data.perfiles.length > 0 ? false : true;
            }
            this.btnAdd.disabled = false;
            this.disableSelectedPerfiles();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static addApplicationHandler() {
        const selectedAppId = this.appDropdown.value;
        const selectedAppText = this.appDropdown.options[this.appDropdown.selectedIndex].text;
        const selectedPerfilOptions = [...this.perfilDropdown.selectedOptions];
    
        if (!selectedAppId || selectedPerfilOptions.length === 0) return;
    
        selectedPerfilOptions.forEach(option => {
            const selectedPerfilId = option.value;
            const selectedPerfilText = option.text;
    
            const appHtml = `<div class="form-group mb-2">
                <div class="row">
                    <div class="col-5">
                        <input type="text" class="form-control" value="${selectedAppText}" data-app-id="${selectedAppId}" readonly>
                    </div>
                    <div class="col-5">
                        <input type="text" class="form-control" value="${selectedPerfilText}" data-perfil-id="${selectedPerfilId}" readonly>
                    </div>
                    <div class="col-2">
                        <button type="button" class="btn btn-alt-danger btn-remove"><i class="fa fa-trash-can"></i></button>
                    </div>
                </div>
            </div>`;
    
            this.applicationsList.insertAdjacentHTML('beforeend', appHtml);
    
            // Añadir el perfil seleccionado a la lista de perfiles seleccionados
            this.selectedPerfiles.push(selectedPerfilId);
    
            // Deshabilitar el perfil seleccionado
            this.perfilDropdown.querySelectorAll('option').forEach(option => {
                if (option.value === selectedPerfilId) {
                    option.disabled = true; // Deshabilitar el perfil en el dropdown
                }
            });
    
            if (!this.panaAppNames.includes(selectedAppText)) {
                this.appDropdown.querySelectorAll('option').forEach(appOption => {
                    if (appOption.text === selectedAppText) {
                        appOption.disabled = true; // Deshabilitar la aplicación si no es PANA
                    }
                });
            }
        });
    
        this.appDropdown.value = '';
        this.resetPerfilDropdown();
        this.btnAdd.disabled = true;
    }

    static removeApplicationHandler(event) {
        if (event.target.classList.contains('btn-remove')) {
            const row = event.target.closest('.form-group');
            const perfilId = row.querySelector('input[data-perfil-id]').getAttribute('data-perfil-id');
            const appId = row.querySelector('input[data-app-id]').getAttribute('data-app-id');
            const appText = this.appDropdown.querySelector(`option[value="${appId}"]`).text;
    
            // Remover el perfil de la lista de perfiles seleccionados
            this.selectedPerfiles = this.selectedPerfiles.filter(id => id !== perfilId);
    
            // Rehabilitar el perfil en el dropdown de perfiles
            this.perfilDropdown.querySelectorAll('option').forEach(option => {
                if (option.value === perfilId) {
                    option.disabled = false; // Rehabilitar el perfil en el dropdown
                }
            });
    
            // Si no es una aplicación PANA, también habilitamos la aplicación en el dropdown
            if (!this.panaAppNames.includes(appText)) {
                this.appDropdown.querySelectorAll('option').forEach(appOption => {
                    if (appOption.value === appId) {
                        appOption.disabled = false; // Rehabilitar la aplicación en el dropdown
                    }
                });
            }
    
            // Eliminar la fila correspondiente en la lista de aplicaciones
            row.remove();
        }
    }

    static clearForm() 
    {
        document.getElementById('type_identity_number').value = '',
        document.getElementById('identity_number').value = '';
        document.getElementById('first_name').value = '';
        document.getElementById('last_name').value = '';
        document.getElementById('email').value = '';
        this.zonalDropdown.value = '';
        this.sedeDropdown.value = '';
        this.tipoCargoDropdown.value = '';
        this.cargoSedeDropdown.value = '';
        this.searchEspecialidad.value = '';
        this.resetAll();
    }

    static async handleSubmit(event) 
    {
        event.preventDefault();

        if (!jQuery('#main-form').valid()) {
            // Si la validación falla, detén el proceso y no envíes el formulario
            console.log('El formulario contiene campos que deben ser validados, no se enviará.');
            return;
        }

        const appData = [];
        const appDivs = this.checkboxContainer.querySelectorAll('.form-check');

        appDivs.forEach(div => {
            const appInput = div.querySelector('input[data-app-id]:checked');
            const perfilInput = div.querySelector('input[data-perfil-id]:checked');

            if (appInput && perfilInput) {
                const appId = appInput.getAttribute('data-app-id');
                const perfilId = perfilInput.getAttribute('data-perfil-id');
                appData.push({app_id: appId, perfil_id: perfilId});
            }
        });

        //console.log(appData);

        const radioData = [];
        const radioContainers = this.checkboxInfraContainer.querySelectorAll('.form-check'); // Seleccionamos todos los contenedores de checkbox
        
        radioContainers.forEach(container => {
            const checkedRadio = container.querySelector('input[type="checkbox"]:checked'); // Buscamos el checkbox seleccionado dentro del contenedor
                 
            if (checkedRadio) {
                    const radioSolicitud = container.querySelector('.form-check-label').textContent.trim();
                    const radioValue = checkedRadio.value;
                    radioData.push({radio_solicitud: radioSolicitud,radio_valor: radioValue});
            }
        });

        //console.log(radioData);

        const formData = {
            tipo_identificacion: document.getElementById('type_identity_number').value,
            identificacion: document.getElementById('identity_number').value,
            nombre: document.getElementById('first_name').value,
            apellido: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            zonal_id: this.zonalDropdown.value,
            sede_id: this.sedeDropdown.value,
            cargo_id: this.cargoSedeDropdown.value,
            aplicaciones: appData,
            infraestructura: radioData,
            especialidad: this.searchEspecialidad.value,
            observaciones: this.observaciones.value,
        };

        console.log('Request del Formulario');
        console.group();
        console.log('loguin usuario', formData);
        //this.showToast('Oops...', `Formulario loguin enviado correctamente`, 'success');

        this.toast.fire({
        title: 'Esta seguro?',
        text: 'Se enviaran los datos del formulario para la creacion del loguin!',
        icon: 'warning',
        showCancelButton: true,
        customClass: {
            confirmButton: 'btn btn-success m-1',
            cancelButton: 'btn btn-secondary m-1'
        },
        confirmButtonText: 'Si, enviar!',
        cancelButtonText: 'Cancelar',
        html: false,
        preConfirm: e => {
            return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 50);
            });
        }
        }).then(async result => {
            if (result.value) {                
            try {
                const response = await fetch('/storeLoguinTicket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    this.showToast('Error...', `Error al enviar Formulario Loguin ${response.statusText}`, 'error');
                    throw new Error(`Error en la respuesta del servidor: ${response.statusText} - ${response.status}`);
                }

                const result = await response.json();

                const ticketLoguinNumber = result.ticketLoguin !== null ? result.ticketLoguin : null;
                const ticketInfraNumber = result.ticketInfraestructura !== null ? result.ticketInfraestructura : null;

                if (ticketLoguinNumber) {
                    const URLTicketLoguin = `<a class="fw-semibold" href="http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${ticketLoguinNumber}" target="_blank">#${ticketLoguinNumber}</a>`;
                    console.log('ID de ticketLoguin:', ticketLoguinNumber);
                    this.showToast('Formulario Loguin Enviado!', `TICKET Loguin ${URLTicketLoguin}`, 'success');
                }
                
                if (ticketInfraNumber) {
                    const URLticketInfraNumber = `<a class="fw-semibold" href="http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${ticketInfraNumber}" target="_blank">#${ticketInfraNumber}</a>`;
                    console.log('ID de ticketInfraestructura:', ticketInfraNumber);
                    this.showToast('Formulario Loguin Enviado!', `TICKET Infraestructura ${URLticketInfraNumber}`, 'success');
                }

                if (ticketLoguinNumber && ticketInfraNumber) {
                    const URLTicketLoguin = `<a class="fw-semibold" href="http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${ticketLoguinNumber}" target="_blank">#${ticketLoguinNumber}</a>`;
                    const URLticketInfraNumber = `<a class="fw-semibold" href="http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${ticketInfraNumber}" target="_blank">#${ticketInfraNumber}</a>`;
                    console.log('ID de ticketInfraestructura:', ticketInfraNumber);
                    console.log('ID de ticketLoguin:', ticketLoguinNumber);
                    this.showToast('Formulario Loguin Enviado!', `TICKET Loguin ${URLTicketLoguin} <br> TICKET Infraestructura ${URLticketInfraNumber}`, 'success');
                }

                this.clearForm();
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                this.showToast('Error...', `Error al enviar formulario loguin ${error}`, 'error');
            }
        } else if (result.dismiss === 'cancel') {
            //toast.fire('Cancelled', 'Your imaginary file is safe :)', 'error');
        }
        });
    }

    static init() 
    {
        this.initFormElements();
        this.AutocompleteDataLoguin();
        this.zonalDropdown.addEventListener('change', () => this.zonalChangeHandler());
        this.sedeDropdown.addEventListener('change', () => this.sedeChangeHandler());
        this.tipoCargoDropdown.addEventListener('change', () => this.cargoSedeChangeHandler());
        this.cargoSedeDropdown.addEventListener('change', () => this.CargoAppPerfilChangeHandler());
        this.btnReset.addEventListener('click', () => this.clearForm());
        this.mainForm.addEventListener('submit', (event) => this.handleSubmit(event));
    }
}

// Initialize when page loads
Codebase.onLoad(() => ApplicationFormManager.init());