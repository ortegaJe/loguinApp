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
      if (button) {
        const solicitudId = button.getAttribute('data-solicitud-id');
        const solicitudTipo = button.getAttribute('data-solicitud-tipo');
        const usuarioId = button.closest('tr').getAttribute('data-usuario-id');
  
        this.fetchSolicitudData(solicitudId, solicitudTipo, usuarioId);
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

  static async fetchSolicitudData(solicitudId, solicitudTipo, usuarioId) {
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
      if (!data.usuario || !data.usuario[0] || !data.loguin_solicitud) {
        throw new Error('Datos incompletos recibidos del servidor');
      }

      if (solicitudTipo === 'loguin') {
        this.showSolicitudModal(data.usuario[0], data.loguin_solicitud, data.especialidad_usuario);
      }

      if (solicitudTipo === 'infra') {
        this.showSolicitudInfraModal(data.usuario[0], data.infra_solicitud[0]);
      }

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

    const aplicacionesPerfilesContainer = modal.querySelector('#modal-aplicaciones-perfiles');
    aplicacionesPerfilesContainer.innerHTML = '';

    loguinSolicitud.map((item) => {
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      listItem.textContent = `${item.aplicacion} ${item.perfil.toUpperCase()}`;
      aplicacionesPerfilesContainer.appendChild(listItem);
    });

    const hasMedicoEspecialista = loguinSolicitud.some(item => item.perfil === 'medico especialista');
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

  static async showSolicitudInfraModal(usuario, InfraSolicitud) {
    //console.log(InfraSolicitud);
    const modalInfra = document.getElementById('solicitudModalInfra');
    modalInfra.querySelector('#modal-infra-documento').textContent = usuario.identificacion || 'N/A';
    modalInfra.querySelector('#modal-infra-nombre').textContent = usuario.nombreCompleto || 'N/A';
    modalInfra.querySelector('#modal-infra-email').textContent = usuario.email || 'N/A';
    modalInfra.querySelector('#modal-infra-sede').textContent = InfraSolicitud.sede || 'N/A';
    modalInfra.querySelector('#modal-infra-ticket').href = `http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${InfraSolicitud.ticket_id}` || 'N/A';
    modalInfra.querySelector('#modal-infra-ticket').setAttribute('target', '_blank');
    modalInfra.querySelector('#modal-infra-ticket-numero').textContent = `#${InfraSolicitud.ticket_id}` || 'N/A';
    modalInfra.querySelector('#modal-infra-fecha').textContent = InfraSolicitud.fecha_creacion || 'N/A';
    const infraElements = {
      solicito_correo: '#correo',
      solicito_usuario_dominio: '#dominio',
      solicito_vpn: '#vpn'
    };
    
    Object.keys(infraElements).forEach(key => {
      if (InfraSolicitud[key] === 1) {
        modalInfra.querySelector(infraElements[key]).hidden = false;
      }
    });

    const modalInfraInstance = new bootstrap.Modal(modalInfra);
    modalInfraInstance.show();
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
