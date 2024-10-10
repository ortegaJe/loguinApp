class ApplicationFormManager {

    static initFormElements() {
        this.mainForm = document.getElementById('main-form');
        this.zonalDropdown = document.getElementById('zonal-dropdown');
        this.sedeDropdown = document.getElementById('sede-dropdown');
        this.tipoCargoDropdown = document.getElementById('tipo-cargo-dropdown');
        this.cargoSedeDropdown = document.getElementById('cargo-dropdown');
        this.checkboxContainer = document.getElementById('checkbox-container');
        this.appDropdown = document.getElementById('app-dropdown');
        this.perfilDropdown = document.getElementById('perfil-dropdown');
        this.applicationsList = document.getElementById('applications-list');
        this.btnAdd = document.getElementById('btn-add');
        this.btnReset = document.getElementById('btn-reset');
        this.btnRefresh = document.getElementById('btn-refresh');
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
        this.checkboxContainer.innerHTML = '';
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
            this.resetPerfilDropdown();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static async cargoSedeChangeHandler() {
        const idTipoCargo = this.tipoCargoDropdown.value;
        const idSede = this.sedeDropdown.value;
        console.log(idSede);
        console.log(idTipoCargo);
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
                body: JSON.stringify({ tipo_cargo_id: idTipoCargo })
            });

            const data = await this.handleFetchResponse(response);
            this.updateDropdown('cargo-dropdown', data.cargo_sede, 'Seleccione cargo..');
            console.log(data);
            this.resetPerfilDropdown();
            this.checkboxContainer.innerHTML = '';
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    static async CargoAppPerfilChangeHandler() {
        const idCargo = this.cargoSedeDropdown.value;
        const idSede = this.sedeDropdown.value;
        console.log(idSede);
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
            console.log(data);

            // Limpia el contenedor de checkboxes antes de agregar nuevos elementos
            this.checkboxContainer.innerHTML = '';

            // Crea los checkboxes dinámicamente con los datos recibidos
            data.perfiles.forEach((perfil, index) => {
                // Crea un div para cada checkbox
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add('form-check', 'form-check-inline');

                // Crea el input del checkbox
                const checkboxInput = document.createElement('input');
                checkboxInput.classList.add('form-check-input');
                checkboxInput.type = 'checkbox';
                checkboxInput.value = perfil.perfil;
                checkboxInput.id = `perfil-${index}`;
                checkboxInput.setAttribute('data-perfil-id', perfil.perfil_id);
                checkboxInput.setAttribute('data-app-id', perfil.aplicacion_id);
                checkboxInput.name = `perfil-${index}`;

                // Crea la etiqueta del checkbox
                const checkboxLabel = document.createElement('label');
                checkboxLabel.classList.add('form-check-label');
                checkboxLabel.htmlFor = `perfil-${index}`;
                checkboxLabel.textContent = `${perfil.aplicacion} - ${perfil.perfil}`;

                // Añade el checkbox y su etiqueta al div contenedor
                checkboxDiv.appendChild(checkboxInput);
                checkboxDiv.appendChild(checkboxLabel);

                // Añade el div al contenedor de checkboxes
                this.checkboxContainer.appendChild(checkboxDiv);
            });
            //this.resetPerfilDropdown();
            //this.checkboxContainer.innerHTML = '';
        } catch (error) {
            //console.error('Fetch error:', error);
            this.showToast('Oops...', `${error.message}`, 'info');
            this.cargoSedeDropdown.value = '';
        }
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
        document.getElementById('type_identity_number').value = '';
        document.getElementById('email').value = '';
        this.zonalDropdown.value = '';
        this.sedeDropdown.value = '';
        this.tipoCargoDropdown.value = '';
        this.cargoSedeDropdown.value = '';
        this.resetAll();
    }

    static async handleSubmit(event) {
        event.preventDefault();

        const appData = [];
        const appDivs = this.checkboxContainer.querySelectorAll('.form-check');

        appDivs.forEach(div => {
            const appInput = div.querySelector('input[data-app-id]:checked');
            const perfilInput = div.querySelector('input[data-perfil-id]:checked');

            if (appInput && perfilInput) {
                const appId = appInput.getAttribute('data-app-id');
                const perfilId = perfilInput.getAttribute('data-perfil-id');
                appData.push({app_id: appId, perfil_id: perfilId });
            }
        });

        const formData = {
            tipo_identificacion: document.getElementById('type_identity_number').value,
            identificacion: document.getElementById('identity_number').value,
            nombre: document.getElementById('first_name').value,
            apellido: document.getElementById('type_identity_number').value,
            email: document.getElementById('email').value,
            zonal_id: this.zonalDropdown.value,
            sede_id: this.sedeDropdown.value,
            aplicaciones: appData
        };

        console.log(formData);
        //this.showToast('Oops...', `Formulario loguin enviado correctamente`, 'success');

         try {
            const response = await fetch('/saveApplicacionesPerfiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                console.log('Formulario enviado correctamente');
                this.showToast('Oops...', `Formulario loguin enviado correctamente`, 'success');
                this.clearForm();
            } else {
                console.error('Error al enviar el formulario:', response.statusText);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
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