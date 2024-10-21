class ApplicationFormManager {
    static cargoTipo = ["ADMINISTRATIVO"];
    static perfilesEspecialistaId = ["5","6"] // ID desde la base de datos especilidades everest y pana
    static nameEspecialidad = [];

    static initFormElements() {
        this.mainForm = document.getElementById('main-form');
        this.zonalDropdown = document.getElementById('zonal-dropdown');
        this.sedeDropdown = document.getElementById('sede-dropdown');
        this.tipoCargoDropdown = document.getElementById('tipo-cargo-dropdown');
        this.cargoSedeDropdown = document.getElementById('cargo-dropdown');
        this.rowEspecialidad = document.getElementById('row-especialidad');
        this.searchEspecialidad = document.getElementById('search-especialidad');
        this.checkboxRow = document.getElementById('checkbox-row');
        this.checkboxDescLabel = document.getElementById('checkbox-label');
        this.checkboxContainer = document.getElementById('checkbox-container');
        this.radioContainer = document.getElementById('radio-container');
        this.radioCheck = document.getElementById('radio-check');
        this.appDropdown = document.getElementById('app-dropdown');
        this.perfilDropdown = document.getElementById('perfil-dropdown');
        this.applicationsList = document.getElementById('applications-list');
        this.btnAdd = document.getElementById('btn-add');
        this.btnReset = document.getElementById('btn-reset');
        this.btnRefresh = document.getElementById('btn-refresh');
        this.toast = Swal.mixin({
            buttonsStyling: false,
            target: '#page-container',
            customClass: {
              confirmButton: 'btn btn-primary m-1',
              cancelButton: 'btn btn-danger m-1',
              input: 'form-control'
            }
          });
        // Load default options for jQuery Validation plugin
        Codebase.helpers('jq-validation');

        jQuery.validator.addMethod("atLeastOneChecked", function(value, element, params) {
            return jQuery(params).filter(':checked').length > 0;
        }, "Please select at least one option.");

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
/*             'search-especialidad': {
            required: true,
            }, */
            'val-currency': {
            required: true,
            currency: ['$', true]
            },
            'val-website': {
            required: true,
            url: true
            },
            'val-phoneus': {
            required: true,
            phoneUS: true
            },
            'val-digits': {
            required: true,
            digits: true
            },
            'val-number': {
            required: true,
            number: true
            },
            'val-range': {
            required: true,
            range: [1, 5]
            },
            'val-terms': {
            required: true
            },
            'val-select2': {
            required: true
            },
            'val-select2-multiple': {
            required: true,
            minlength: 2
            }
        },
        messages: {
            'first_name': {
            required: 'Please enter a username',
            minlength: 'Your username must consist of at least 3 characters'
            },
            'val-email': 'Please enter a valid email address',
            'val-password': {
            required: 'Please provide a password',
            minlength: 'Your password must be at least 5 characters long'
            },
            'val-confirm-password': {
            required: 'Please provide a password',
            minlength: 'Your password must be at least 5 characters long',
            equalTo: 'Please enter the same password as above'
            },
            'checkbox-group': {
                atLeastOneChecked: 'Please select at least one checkbox.'
            },
            'val-select2': 'Please select a value!',
            'val-select2-multiple': 'Please select at least 2 values!',
            'val-suggestions': 'What can we do to become better?',
            'val-skill': 'Please select a skill!',
            'val-currency': 'Please enter a price!',
            'val-website': 'Please enter your website!',
            'val-phoneus': 'Please enter a US phone!',
            'val-digits': 'Please enter only digits!',
            'val-number': 'Please enter a number!',
            'val-range': 'Please enter a number between 1 and 5!',
            'val-terms': 'You must agree to the service terms!'
        }
        });

        jQuery('.js-select2').on('change', e => {
            jQuery(e.currentTarget).valid();
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

    static resetAll() {
        this.updateDropdown('sede-dropdown', [], 'Seleccione sede..');
        this.updateDropdown('tipo-cargo-dropdown', [], 'Seleccione tipo de cargo..');
        this.updateDropdown('cargo-dropdown', [], 'Seleccione cargo..');
        this.resetPerfilDropdown();
    }

     static resetPerfilDropdown() {
        this.checkboxRow.hidden = true;
        this.checkboxDescLabel.innerHTML = '';
        this.checkboxContainer.innerHTML = '';
        this.radioContainer.hidden = true;
        this.rowEspecialidad.hidden = true;
    }

    static async showToast(title, message, type) {
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

    static async zonalChangeHandler() {
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
            //this.resetPerfilDropdown();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static async sedeChangeHandler() {
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

    static async cargoSedeChangeHandler() {
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
            //console.log(data);
            this.resetPerfilDropdown();
            this.checkboxContainer.innerHTML = '';
            this.rowEspecialidad.hidden = true;
            this.searchEspecialidad.value = '';

        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static async CargoAppPerfilChangeHandler() {
        const idSede = this.sedeDropdown.value;
        const idCargo = this.cargoSedeDropdown.value;
        const selectedTipoCargoText = this.tipoCargoDropdown.options[this.tipoCargoDropdown.selectedIndex].text;
        const selectedCargoText = this.cargoSedeDropdown.options[this.cargoSedeDropdown.selectedIndex].text;
        console.log(selectedCargoText);
        //console.log(idSede);
        console.log(idCargo);
        if (!idCargo) {
            this.resetAll();
            return;
        }

        try {
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

            this.checkboxRow.hidden = false;
            this.checkboxContainer.innerHTML = '';

            // Crea los checkboxes dinámicamente con los datos recibidos
            data.perfiles.forEach((perfil, index) => {
                this.checkboxDescLabel.textContent = 'Aplicaciones y perfiles disponibles para el cargo seleccionado:';

                // Crea un div para cada checkbox
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add('form-check', 'form-check-inline');

                // Crea el input del checkbox
                const checkboxInput = document.createElement('input');
                checkboxInput.classList.add('form-check-input', 'checkbox-group');
                checkboxInput.type = 'checkbox';
                checkboxInput.value = perfil.perfil;
                checkboxInput.id = `perfil-${index}`;
                checkboxInput.setAttribute('data-perfil-id', perfil.perfil_id);
                checkboxInput.setAttribute('data-app-id', perfil.aplicacion_id);
                checkboxInput.name = `checkbox-group`;

                // Crea la etiqueta del checkbox
                const checkboxLabel = document.createElement('label');
                checkboxLabel.classList.add('form-check-label');
                checkboxLabel.htmlFor = `perfil-${index}`;
                checkboxLabel.textContent = `${perfil.aplicacion} - ${perfil.perfil.toUpperCase()}`;

                // Añade el checkbox y su etiqueta al div contenedor
                checkboxDiv.appendChild(checkboxInput);
                checkboxDiv.appendChild(checkboxLabel);

                // Añade el div al contenedor de checkboxes
                this.checkboxContainer.appendChild(checkboxDiv);
            });
        } catch (error) {
            //console.error('Fetch error:', error);
            this.showToast('Oops...', `${error.message}`, 'warning');
            this.cargoSedeDropdown.value = '';
            this.checkboxRow.hidden = true;
            this.radioContainer.hidden = true;
        }

        // Limpia el contenedor de checkboxes antes de agregar nuevos elementos PENDIENTE SETEAR
        this.radioContainer.hidden = this.cargoTipo.includes(selectedTipoCargoText) ? false : true;

        //console.log(this.perfilesEspecialistaId);

        // oculta y setea el contenedor del input especialidaddes antes de agregar nuevos elementos
        this.rowEspecialidad.hidden = this.perfilesEspecialistaId.includes(idCargo) ? false : true;
        this.perfilesEspecialistaId.includes(idCargo) ? this.searchEspecialidad.value = '' : this.rowEspecialidad.value;
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

    static clearForm() {
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

    static async handleSubmit(event) {
        event.preventDefault();

        //console.log(this.searchEspecialidad.value);

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

        console.log(appData);

        const radioData = [];
        const radioContainers = document.querySelectorAll('#radio-container'); // Seleccionamos todos los contenedores de radio
        
        radioContainers.forEach(container => {
            const checkedRadio = container.querySelector('input[type="radio"]:checked'); // Buscamos el radio seleccionado dentro del contenedor
                if (checkedRadio) {
                    const radioSolicitud = container.querySelector('.form-label').textContent.trim();
                    const radioLabel = container.querySelector('label[for="' + checkedRadio.id + '"]').textContent.trim();
                    const radioValue = (radioLabel === "SI") ? 1 : 0;
                    radioData.push({radio_solicitud: radioSolicitud,radio_valor: radioValue});
            }

        });

        console.log(radioData);

        const formData = {
            tipo_identificacion: document.getElementById('type_identity_number').value,
            identificacion: document.getElementById('identity_number').value,
            nombre: document.getElementById('first_name').value,
            apellido: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            zonal_id: this.zonalDropdown.value,
            sede_id: this.sedeDropdown.value,
            aplicaciones: appData,
            infraestructura: radioData,
            especialidad: this.searchEspecialidad.value,
        };

        console.log(formData);
        //this.showToast('Oops...', `Formulario loguin enviado correctamente`, 'success');

        this.toast.fire({
            title: 'Esta seguro?',
            text: 'Se enviaran los datos del formulario para la creacion del loguin!',
            icon: 'warning',
            showCancelButton: true,
            customClass: {
              confirmButton: 'btn btn-danger m-1',
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
                    if (!ticketLoguinNumber) {
                        throw new Error('ticketLoguin Error');
                    }

                    console.log('ID de ticketLoguin:', ticketLoguinNumber);
                    this.showToast('Enviado!', `Formulario Loguin enviado <br> correctamente TICKET Loguin #${ticketLoguinNumber}`, 'success');

                    const ticketInfraNumber = result.ticketInfraestructura !== null ? result.ticketInfraestructura : null 

                    if (ticketInfraNumber) {
                        console.log('ID de ticketInfraestructura:', ticketInfraNumber);
                        this.showToast('Enviado!', `Formulario Loguin enviado correctamente <br> TICKET Loguin #${ticketLoguinNumber} <br> TICKET Infraestructura #${ticketInfraNumber}`, 'success');
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

    static init() {
        this.initFormElements();
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