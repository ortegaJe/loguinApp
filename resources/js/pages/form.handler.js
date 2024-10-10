class ApplicationFormManager {

    static initFormElements() {
        this.mainForm = document.getElementById('main-form');
        this.zonalDropdown = document.getElementById('zonal-dropdown');
        this.sedeDropdown = document.getElementById('sede-dropdown');
        this.tipoCargoDropdown = document.getElementById('tipo-cargo-dropdown');
        this.cargoSedeDropdown = document.getElementById('cargo-dropdown');
        this.checkboxContainer = document.getElementById('checkbox-container');
        //this.appDropdown = document.getElementById('app-dropdown');
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
        this.applicationsList.innerHTML = '';
        //this.btnAdd.disabled = true;
    }

     static resetPerfilDropdown() {
        this.checkboxContainer.innerHTML = '';
        //this.btnAdd.disabled = true;
    }

    static disableSelectedPerfiles() {
        const options = this.cargoSedeDropdown.querySelectorAll('option');
        options.forEach(option => {
            if (this.selectedPerfiles.includes(option.value)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }

    static showToast(title, message, type) {
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

    static validateButtonState() {
        // Seleccionar todos los checkboxes dentro del contenedor
        const checkboxes = this.checkboxContainer.querySelectorAll('input[type="checkbox"]');
    
        // Comprobar si al menos uno de los checkboxes está marcado
        const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    
        // Habilitar o deshabilitar el botón en función de si hay un checkbox marcado
        this.btnAdd.disabled = !isAnyChecked;
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
                checkboxLabel.htmlFor = `${perfil.aplicacion} - ${perfil.perfil}`;
                checkboxLabel.textContent = `${perfil.aplicacion} - ${perfil.perfil}`;

                // Añade el checkbox y su etiqueta al div contenedor
                checkboxDiv.appendChild(checkboxInput);
                checkboxDiv.appendChild(checkboxLabel);

                // Añade el div al contenedor de checkboxes
                this.checkboxContainer.appendChild(checkboxDiv);

                // Añadir evento change al checkbox para validar el estado del botón
                checkboxInput.addEventListener('change', () => this.validateButtonState());
            });
            // Validar el estado del botón por si no se selecciona ningún checkbox
            this.validateButtonState();
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

    static addApplicacionPerfilHandler() {
        const selectedAppId = this.cargoSedeDropdown.value;
    
        // Recoge los checkboxes seleccionados
        const selectedPerfilCheckboxes = [...this.checkboxContainer.querySelectorAll('input[type="checkbox"]:checked')];
        
        // Verifica que haya una aplicación seleccionada y al menos un perfil seleccionado
        if (!selectedAppId || selectedPerfilCheckboxes.length === 0) return;
    
        // Recorre los checkboxes seleccionados para crear el HTML correspondiente
        selectedPerfilCheckboxes.forEach(checkbox => {
            const selectedPerfilId = checkbox.getAttribute('data-perfil-id');  // ID del perfil
            const selectedAppId = checkbox.getAttribute('data-app-id');        // ID de la aplicación
            const selectedPerfilText = checkbox.value;                         // Nombre del perfil
            const selectedAppText = checkbox.closest('.form-check-inline').querySelector('label').textContent;  // Nombre de la aplicación desde el label
    
            // Genera el HTML para mostrar la aplicación y el perfil seleccionados
            const appHtml = `<div class="form-group mb-2">
                <div class="row push">
                    <div class="col-4">
                        <input type="text" class="form-control" value="${selectedAppText}" data-app-id="${selectedAppId}" data-app-id="${selectedPerfilId}" readonly>
                    </div>
                    <div class="col-4">
                    <h2><span class="badge bg-success" data-app-id="${selectedAppId}" data-app-id="${selectedPerfilId}">${selectedAppText}</span></h2>
                    </div>
                    <div class="col-2">
                        <button type="button" class="btn btn-alt-danger btn-remove"><i class="fa fa-trash-can"></i></button>
                    </div>
                </div>
            </div>`;
    
            // Inserta el HTML en la lista de aplicaciones y perfiles
            this.applicationsList.insertAdjacentHTML('beforeend', appHtml);
    
            // Añadir el perfil seleccionado a la lista de perfiles seleccionados
            //this.selectedPerfiles.push(selectedPerfilId);
    
            // Deshabilitar el perfil seleccionado en los checkboxes
            checkbox.disabled = true;
        });
    
        // Restablecer el dropdown de aplicaciones y desactivar el botón 'Agregar'
        this.cargoSedeDropdown.value = '';
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
        this.showToast('Oops...', `Formulario loguin enviado correctamente`, 'success');

/*         try {
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
                this.clearForm();
            } else {
                console.error('Error al enviar el formulario:', response.statusText);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        } */
    }

    static init() {
        this.initFormElements();
        this.zonalDropdown.addEventListener('change', () => this.zonalChangeHandler());
        this.sedeDropdown.addEventListener('change', () => this.sedeChangeHandler());
        this.tipoCargoDropdown.addEventListener('change', () => this.cargoSedeChangeHandler());
        this.cargoSedeDropdown.addEventListener('change', () => this.CargoAppPerfilChangeHandler());
        this.btnAdd.addEventListener('click', () => this.addApplicacionPerfilHandler());
        this.btnReset.addEventListener('click', () => this.clearForm());
        this.mainForm.addEventListener('submit', (event) => this.handleSubmit(event));
    }
}

// Initialize when page loads
Codebase.onLoad(() => ApplicationFormManager.init());