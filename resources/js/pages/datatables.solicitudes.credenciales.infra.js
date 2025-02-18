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
      const btnRegisterLoguin = event.target.closest('.btn-register-infra');
      if (button) {
        const solicitudId = button.getAttribute('data-solicitud-id');
        const solicitudTipo = button.getAttribute('data-solicitud-tipo');
        const usuarioId = button.closest('tr').getAttribute('data-usuario-id');

        this.fetchSolicitudInfraData(solicitudId, usuarioId);
      }
      if (btnRegisterLoguin) {
        const loguinSolicitudId = btnRegisterLoguin.getAttribute('data-solicitud-id');
        const url = `/loguin/infraestructura/solicitud/registrar/${loguinSolicitudId}`;
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

  static async fetchSolicitudInfraData(solicitudId, usuarioId) {
    if (!solicitudId) {
      this.showToast('Error', 'No se pudo cargar los datos de la solicitud', 'error');
      return;
    }

    try {
      const response = await fetch("/fetchSolicitudInfra", {
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
      if (!data.infra_solicitud || !data.infra_solicitud[0]) {
        throw new Error('Datos incompletos recibidos del servidor');
      }

      this.showSolicitudInfraModal(data.infra_solicitud[0]);

    } catch (error) {
      this.showToast('Error', `${error}`, 'error');
      console.error('Fetch error:', error);
    }
  }

  static async showSolicitudInfraModal(InfraSolicitud) {
    //console.log(InfraSolicitud);
    const modalInfra = document.getElementById('solicitudModalInfra');
    modalInfra.querySelector('#modal-infra-documento').textContent = InfraSolicitud.identificacion || 'N/A';
    modalInfra.querySelector('#modal-infra-nombre').textContent = InfraSolicitud.nombreCompleto || 'N/A';
    modalInfra.querySelector('#modal-infra-email').textContent = InfraSolicitud.email || 'N/A';
    modalInfra.querySelector('#modal-infra-zonal').textContent = InfraSolicitud.zonal || 'N/A';
    modalInfra.querySelector('#modal-infra-sede').textContent = InfraSolicitud.sede || 'N/A';
    modalInfra.querySelector('#modal-infra-ticket').href = `http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${InfraSolicitud.ticket_id}` || 'N/A';
    modalInfra.querySelector('#modal-infra-ticket').setAttribute('target', '_blank');
    modalInfra.querySelector('#modal-infra-ticket-numero').textContent = `#${InfraSolicitud.ticket_id}` || 'N/A';
    modalInfra.querySelector('#modal-infra-fecha').textContent = InfraSolicitud.fecha_creacion || 'N/A';
    modalInfra.querySelector('#modal-infra-observacion').textContent = InfraSolicitud.observaciones;
    //console.log(InfraSolicitud.solicito_correo,InfraSolicitud.solicito_usuario_dominio,InfraSolicitud.solicito_vpn);
    const infraElements = {
      solicito_correo: '#correo',
      solicito_usuario_dominio: '#dominio',
      solicito_vpn: '#vpn'
    };

    Object.values(infraElements).forEach(selector => {
      modalInfra.querySelector(selector).hidden = true;
    });

    Object.keys(infraElements).forEach(key => {
      if (InfraSolicitud[key] === 1) {
        modalInfra.querySelector(infraElements[key]).hidden = false;
      }
    });

   /*  if (InfraSolicitud.solicito_correo) {
      modalInfra.querySelector('#correo').hidden = false;
    }
    if (InfraSolicitud.solicito_usuario_dominio) {
      modalInfra.querySelector('#dominio').hidden = false;
    }
    if (InfraSolicitud.solicito_vpn) {
      modalInfra.querySelector('#vpn').hidden = false;
    } */

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
