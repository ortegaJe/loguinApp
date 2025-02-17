/*
 *  Document   : datatables.js
 *  Author     : pixelcave
 *  Description: Using custom JS code to init DataTables plugin
 */

// DataTables, for more examples you can check out https://www.datatables.net/
class pageTablesDatatables {

  static SolicitudDetalleViewer() {
    const table = document.getElementById('solicitudesTable');
  
    table.addEventListener('click', event => {
      const button = event.target.closest('.btn-show');
      const btnRegisterLoguin = event.target.closest('.btn-register-loguin');
      if (button) {
        const solicitudId = button.getAttribute('data-solicitud-id');
        const solicitudTipo = button.getAttribute('data-solicitud-tipo');
        const usuarioId = button.closest('tr').getAttribute('data-usuario-id');

        if (solicitudTipo === 'loguin') {
          this.fetchSolicitudLoguinData(solicitudId, usuarioId);
        }
  
        if (solicitudTipo === 'infra') {
          this.fetchSolicitudInfraData(solicitudId, usuarioId);
        }
      }

      if (btnRegisterLoguin) {
        const loguinSolicitudId = btnRegisterLoguin.getAttribute('data-solicitud-id');
        const url = `/loguin/aplicaciones/solicitud/registrar/${loguinSolicitudId}`;
        window.location.href = url;
      }

    });
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

  static async fetchSolicitudLoguinData(solicitudId, usuarioId) {
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
      //console.log(data);
      if (!data.usuario || !data.usuario[0] || !data.loguin_solicitud || !data.especialidad_usuario) {
        throw new Error('Datos incompletos recibidos del servidor');
      }

      this.showSolicitudModal(data.usuario[0], data.loguin_solicitud, data.especialidad_usuario);

    } catch (error) {
      this.showToast('Error', `${error}`, 'error');
      console.error('Fetch error:', error);
    }
  }

  static async showSolicitudModal(usuario, loguinSolicitud, especialidadUsuario) {
    //console.log(loguinSolicitud);
    const modal = document.getElementById('solicitudModal');
    modal.querySelector('#modal-documento').textContent = usuario.identificacion || 'N/A';
    modal.querySelector('#modal-nombre').textContent = usuario.nombreCompleto || 'N/A';
    modal.querySelector('#modal-email').textContent = usuario.email || 'N/A';
    modal.querySelector('#modal-sede').textContent = usuario.sede || 'N/A';
    modal.querySelector('#modal-ticket').href = `http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${usuario.ticket_id}` || 'N/A';
    modal.querySelector('#modal-ticket').setAttribute('target', '_blank');
    modal.querySelector('#modal-ticket-numero').textContent = `#${usuario.ticket_id}` || 'N/A';
    modal.querySelector('#modal-fecha').textContent = usuario.fecha_creacion || 'N/A';
    modal.querySelector('#modal-observacion').textContent = usuario.observaciones;

    const aplicacionesPerfilesContainer = modal.querySelector('#modal-aplicaciones-perfiles');
    aplicacionesPerfilesContainer.innerHTML = '';

    loguinSolicitud.map((item) => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      listItem.textContent = `${item.aplicacion} ${item.perfil.toUpperCase()}`;
      aplicacionesPerfilesContainer.appendChild(listItem);
    });

    const perfilesEspecialistaId = [5,6]; // ID desde la base de datos medicos especilistas de everest y pana
    const hasMedicoEspecialista = loguinSolicitud.some(item => perfilesEspecialistaId.includes(item.perfil_id));
    const hasEspecialidad = especialidadUsuario && especialidadUsuario.length > 0;

    if (hasMedicoEspecialista || hasEspecialidad) {
      const titleEspecialidadUsuario = modal.querySelector('#title-especialidad');
      const especialidadUsuarioContainer = modal.querySelector('#modal-especialidad-usuario');
      titleEspecialidadUsuario.hidden = false;
      especialidadUsuarioContainer.hidden = false;
      especialidadUsuarioContainer.innerHTML = '';

      if (hasEspecialidad) {
        especialidadUsuario.forEach((item) => {
          const listItem = document.createElement('li');
          listItem.classList.add('list-group-item');
          listItem.textContent = `${item.especialidad}`;
          especialidadUsuarioContainer.appendChild(listItem);
        });
      }
    } else {
      modal.querySelector('#title-especialidad').hidden = true;
      modal.querySelector('#modal-especialidad-usuario').hidden = true;
    }

    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  /*
   * Init DataTables functionality
   */
  static initDataTables() {
    jQuery.extend(true, DataTable.ext.classes, {
      search: { input: "form-control" },
      length: { select: "form-select" }
    });

    jQuery.extend(true, DataTable.defaults, {
      language: {
        lengthMenu: "_MENU_",
        search: "_INPUT_",
        searchPlaceholder: "Buscar documento..",
        info: "Page <strong>_PAGE_</strong> of <strong>_PAGES_</strong>",
        paginate: {
          first: '<i class="fa fa-angle-double-left"></i>',
          previous: '<i class="fa fa-angle-left"></i>',
          next: '<i class="fa fa-angle-right"></i>',
          last: '<i class="fa fa-angle-double-right"></i>'
        }
      }
    });

    jQuery.extend(true, DataTable.Buttons.defaults, {
      dom: { button: { className: 'btn btn-sm btn-primary' } }
    });

    jQuery('.js-dataTable-full').DataTable({
      pagingType: "simple_numbers",
      pageLength: 10,
      autoWidth: false,
    });

    jQuery('.js-dataTable-buttons').DataTable({
      pagingType: "simple_numbers",
      pageLength: 5,
      autoWidth: false,
    });
  }

  /*
   * Init functionality
   */
  static init() {
    this.initDataTables();
    this.SolicitudDetalleViewer();
  }
}

// Initialize when page loads
Codebase.onLoad(() => pageTablesDatatables.init());
