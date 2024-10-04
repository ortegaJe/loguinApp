class ApplicationFormManager {
    static panaAppNames = ["PANA PROFESIONALES", "PANA ADMINISTRATIVO"];
    static selectedPerfiles = [];

    static initFormElements() {
        this.mainForm = document.getElementById('main-form');
        this.zonalDropdown = document.getElementById('zonal-dropdown');
        this.sedeDropdown = document.getElementById('sede-dropdown');
        this.appDropdown = document.getElementById('app-dropdown');
        this.perfilDropdown = document.getElementById('perfil-dropdown');
        this.applicationsList = document.getElementById('applications-list');
        this.btnAdd = document.getElementById('btn-add');
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
            dropdown.insertAdjacentHTML('beforeend', `<option value="${item.id}">${item.nombre}</option>`);
        });
        dropdown.disabled = data.length === 0;
    }

    static resetAll() {
        this.updateDropdown('sede-dropdown', [], '-- Select Sede --');
        this.updateDropdown('app-dropdown', [], '-- Select Aplicación --');
        this.resetPerfilDropdown();
        this.applicationsList.innerHTML = '';
        this.btnAdd.style.display = 'none';
        this.selectedPerfiles = [];
    }

    static resetPerfilDropdown() {
        this.perfilDropdown.innerHTML = '<option value="">-- Select Perfil --</option>';
        this.perfilDropdown.disabled = true;
        this.btnAdd.style.display = 'none';
    }

    static disableSelectedPerfiles() {
        const options = this.perfilDropdown.querySelectorAll('option');
        options.forEach(option => {
            if (this.selectedPerfiles.includes(option.value)) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    }

    static async zonalChangeHandler() {
        const idZonal = this.zonalDropdown.value;
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
            this.updateDropdown('sede-dropdown', data.sedes, '-- Select Sede --');
            this.resetPerfilDropdown();
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
            const response = await fetch("/fetchApps", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ sede_id: idSede })
            });

            const data = await this.handleFetchResponse(response);
            this.updateDropdown('app-dropdown', data.app_sede, '-- Select Aplicación --');
            this.resetPerfilDropdown();
            this.selectedPerfiles = [];
        } catch (error) {
            console.error('Fetch error:', error);
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
            const response = await fetch("/fetchAppsPerfiles", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ app_id: idApp })
            });

            const data = await this.handleFetchResponse(response);
            this.updateDropdown('perfil-dropdown', data.perfiles, '-- Select Perfil --');

            if (this.panaAppNames.includes(selectedAppText)) {
                this.perfilDropdown.multiple = true;
            } else {
                this.perfilDropdown.multiple = false;
                this.btnAdd.style.display = data.perfiles.length > 0 ? 'inline-block' : 'none';
            }
            this.btnAdd.style.display = 'inline-block';
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
            this.selectedPerfiles.push(selectedPerfilId);
            this.disableSelectedPerfiles();

            if (!this.panaAppNames.includes(selectedAppText)) {
                this.appDropdown.querySelectorAll('option').forEach(appOption => {
                    if (appOption.text === selectedAppText) {
                        appOption.disabled = true;
                    }
                });
            }
        });

        this.appDropdown.value = '';
        this.resetPerfilDropdown();
        this.btnAdd.style.display = 'none';
    }

    static removeApplicationHandler(event) {
        if (event.target.classList.contains('btn-remove')) {
            const row = event.target.closest('.form-group');
            const perfilId = row.querySelector('input[data-perfil-id]').getAttribute('data-perfil-id');
            this.selectedPerfiles = this.selectedPerfiles.filter(id => id !== perfilId);
            this.disableSelectedPerfiles();
            row.remove();
        }
    }

    static init() {
        this.initFormElements();
        this.zonalDropdown.addEventListener('change', () => this.zonalChangeHandler());
        this.sedeDropdown.addEventListener('change', () => this.sedeChangeHandler());
        this.appDropdown.addEventListener('change', () => this.appChangeHandler());
        this.btnAdd.addEventListener('click', () => this.addApplicationHandler());
        this.applicationsList.addEventListener('click', (event) => this.removeApplicationHandler(event));
    }
}

// Initialize when page loads
Codebase.onLoad(() => ApplicationFormManager.init());