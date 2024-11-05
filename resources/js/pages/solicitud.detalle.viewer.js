class SolicitudDetalleViewer {

    static initializeEventListeners() {
        // Evento para abrir el modal al hacer clic en el botón "Ver detalle"
        this.btnId = document.querySelectorAll('.btn-show');
        this.searchButton = document.getElementById('buscarButton');
        this.clearButton = document.getElementById('clearButton');
    }

    static async getId()
    {
        this.btnId.forEach(button => {
            button.addEventListener('click', event => {
                const solicitudId = event.target.closest('button').getAttribute('data-solicitud-id');
                const usuarioId = event.target.closest('tr').getAttribute('data-usuario-id');
                this.fetchSolicitudData(solicitudId, usuarioId);
                console.log(usuarioId);
            });
        });
    }

    static async fetchSolicitudData(solicitudId, usuarioId) 
    {
        if (!solicitudId) {
            this.showToast('Error', 'No se pudo cargar los datos de la solicitud', 'error');
            return;
        }

        try {
            const response = await fetch("/fetchSolicitudLoguin", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ solicitud_id: solicitudId, usuario_id: usuarioId })
            });
        
            if (!response.ok) throw new Error('Error al obtener los datos de la solicitud');
        
            const data = await response.json();

            console.log(data);
        
            if (!data.usuario || !data.usuario[0] || !data.loguin_solicitud) {
                throw new Error('Datos incompletos recibidos del servidor');
            }
        
            this.showSolicitudModal(data.usuario[0], data.loguin_solicitud, data.especialidad_usuario);
        
        } catch (error) {
            this.showToast('Error', `${error}`, 'error');
            console.error('Fetch error:', error);
        }
        
    }

    static async showSolicitudModal(usuario, loguinSolicitud, especialidadUsuario) {
        console.log(usuario, loguinSolicitud, especialidadUsuario);

        const modal = document.getElementById('solicitudModal');
        modal.querySelector('#modal-documento').textContent = usuario.identificacion || 'N/A';
        modal.querySelector('#modal-nombre').textContent = usuario.nombreCompleto || 'N/A';
        modal.querySelector('#modal-email').textContent = usuario.email || 'N/A';
        modal.querySelector('#modal-sede').textContent = usuario.sede || 'N/A';
        modal.querySelector('#modal-ticket').innerHTML = `<a class"fw-semibold" href="http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${usuario.ticket_id}" target="_blank">#${usuario.ticket_id}</a>` || 'N/A';
        modal.querySelector('#modal-fecha').textContent = usuario.fecha_creacion || 'N/A';

        const aplicacionesPerfilesContainer = modal.querySelector('#modal-aplicaciones-perfiles');
        aplicacionesPerfilesContainer.innerHTML = '';

        loguinSolicitud.map((item) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.aplicacion} - ${item.perfil}`;
            aplicacionesPerfilesContainer.appendChild(listItem);
        });

        // Condición para mostrar especialidad solo si cumple criterios
        const hasMedicoEspecialista = loguinSolicitud.some(item => item.perfil === 'medico especialista');
        const hasEspecialidad = especialidadUsuario && especialidadUsuario.length > 0;

        if (hasMedicoEspecialista || hasEspecialidad) {
            const titleEspecialidadUsuario = modal.querySelector('#title-especialidad');
            const especialidadUsuarioContainer = modal.querySelector('#modal-especialidad-usuario');
            titleEspecialidadUsuario.hidden = false;
            especialidadUsuarioContainer.hidden = false;
            especialidadUsuarioContainer.innerHTML = '';

            // Renderizar lista de especialidades si existen
            if (hasEspecialidad) {
                especialidadUsuario.forEach((item) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${item.especialidad}`;
                    especialidadUsuarioContainer.appendChild(listItem);
                });
            }
        } else {
            // Ocultar sección de especialidad si no cumple criterios
            modal.querySelector('#title-especialidad').hidden = true;
            modal.querySelector('#modal-especialidad-usuario').hidden = true;
        }


        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
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

    static async limpiarTabla()
    {
        this.searchButton.value = ''; // Limpiar el campo de búsqueda
        this.clearTable(); // Limpiar la tabla
        this.getAllSolicitudes(); // Recargar los datos originales
    }

    static async getAllSolicitudes() 
    {
        try {
            const response = await fetch('/getUsuariosConSolicitudes'); // Ruta para obtener todos los datos originales
            const solicitudes = await response.json();
            this.renderTable(solicitudes);
        } catch (error) {
            console.error('Error al obtener todas las solicitudes:', error);
        }
    }

    static async buscarPorDocumento() 
    {
        const documento = document.getElementById('documentoInput').value;

        if (!documento) {
            alert('Por favor ingrese un número de documento');
            return;
        }

        try {
            const response = await fetch('/buscarPorDocumento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                },
                body: JSON.stringify({ documento: documento })
            });

            if (!response.ok) {
                throw new Error('No se encontraron solicitudes para este documento');
            }

            const data = await response.json();
            console.log(data);
            this.clearTable();
            this.renderTable(data);

        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error', `${error.message}`, 'error');
        }
    }

    static clearTable() {
        const table = document.getElementById('solicitudesTable');
        table.innerHTML = ''; // Eliminar todas las filas
    }

    // Mostrar los resultados en la tabla
    static renderTable(solicitudes) {
        const table = document.getElementById('solicitudesTable');
        //table.innerHTML = '';
        table.innerHTML = `
        <thead>
            <tr>
                <th>#</th>
                <th>TICKET</th>
                <th>ESTADO</th>
                <th>FECHA</th>
                <th>DOCUMENTO</th>
                <th>NAME</th>
                <th>ACTIONS</th>
            </tr>
        </thead>
        `;
        
        let contador = 1;
        solicitudes.forEach(solicitud => {
            const row = document.createElement('tr');

            const contadorCell = document.createElement('td');
            contadorCell.textContent = contador++;
            row.appendChild(contadorCell);
    
            // Columna de estado con estilo dinámico
            const estadoCell = document.createElement('td');
            estadoCell.textContent = solicitud.status_title;
    
            // Aplica la clase CSS según el estado
            estadoCell.classList.add('badge', `bg-${solicitud.status_color}`, 'w-100');
            row.appendChild(estadoCell);
    
            // Agregar el resto de las celdas
            // Ejemplo para columna de Ticket
            const ticketCell = document.createElement('td');
            ticketCell.textContent = solicitud.ticket_id || 'N/A';
            row.appendChild(ticketCell);
    
            // Columna de Fecha
            const fechaCell = document.createElement('td');
            fechaCell.textContent = solicitud.fecha_creacion;
            row.appendChild(fechaCell);
    
            // Columna de Documento
            const documentoCell = document.createElement('td');
            documentoCell.textContent = solicitud.identificacion;
            row.appendChild(documentoCell);
    
            // Columna de Nombre
            const nombreCell = document.createElement('td');
            nombreCell.textContent = solicitud.nombreCompleto;
            row.appendChild(nombreCell);
    
            // Columna de acción (botón Ver)
            const actionCell = document.createElement('td');
            const viewButton = document.createElement('button');
            viewButton.setAttribute('type', 'button');
            viewButton.textContent = 'Ver';
            viewButton.classList.add('btn', 'btn-sm','btn-secondary');
            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);
    
            table.appendChild(row);
        });
    }

    static init() 
    {
        this.initializeEventListeners();
        this.getId();
        this.searchButton.addEventListener('click', () => this.buscarPorDocumento());
        this.clearButton.addEventListener('click', () => this.limpiarTabla());
    }
}

// Initialize when page loads
Codebase.onLoad(() => SolicitudDetalleViewer.init());