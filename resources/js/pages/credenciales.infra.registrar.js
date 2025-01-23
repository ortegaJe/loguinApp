class RenderDataSolicitudLoguinInfra {

  static initFormElements() {
    this.formLoguin = document.getElementById('form-loguin');
    this.solicitudLoguin = document.getElementById('solicitud');
    this.toast = Swal.mixin({
      buttonsStyling: false,
      target: '#page-container',
      customClass: {
        confirmButton: 'btn btn-primary m-1',
        cancelButton: 'btn btn-danger m-1',
        input: 'form-control'
      }
    });
    jQuery('#form-loguin').validate({
      ignore: [],
      rules: {
          'usuario-loguin': {
          required: true,
          },
          'password-loguin': {
          required: true,
          }
      },
      messages: {
          'usuario-loguin': {
              required: "Este campo es obligatorio",
          },
          'password-loguin': {
              required: "Este campo es obligatorio",
          }
        }
    });
  }

  static SolicitudLoguin() {
    const SolicitudId = this.solicitudLoguin.getAttribute('data-solicitud-id');
    this.fetchSolicitudLoguinData(SolicitudId);
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

  // Verificar si hay loguins registrados
  static async hasLoguin(loguins)
  {
    const container = document.getElementById('loguin-container');
    const loguinContent = document.querySelector('.loguin-content');
  
      if (loguins.length > 0) {
        loguinContent.innerHTML = '';
        loguins.forEach((loguin) => {
          const table = this.createLoguinTable(loguin.nombre_solicitud, loguin.usuario_loguin, loguin.password_loguin);
          loguinContent.appendChild(table);
        });
  
        // Mostrar el contenedor si tiene loguins creados
        container.hidden = false;
        // Ocultar el formulario si tiene loguins creados
        this.formLoguin.hidden = true;
        this.copyTableFeature();
      } else {
        // Ocultar el contenedor si no hay loguins
        container.hidden = true;
      }
  }

  static async fetchSolicitudLoguinData(solicitudId) {
    if (!solicitudId) {
      this.showToast('Error', 'No se pudo cargar los datos de la solicitud', 'error');
      return;
    }

    Codebase.loader('show', 'bg-gd-sea');

    try {
      const response = await fetch(`/fetchDataLoguinInfra/${solicitudId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
        },
      });

      if (!response.ok) throw new Error('Error al obtener los datos de la solicitud');

      const data = await response.json();
      Codebase.loader('hide');
      //console.log(data);
      if (!data.usuario || !data.usuario[0] || !data.loguin_infra_solicitud || !data.loguin_infra_solicitud[0] || !data.especialidad_usuario === null || !data.especialidad_usuario || !data.has_loguin === null || !data.has_loguin) {
        throw new Error('Datos incompletos recibidos del servidor');
      }

      this.showDataUserBlock(data.usuario[0], data.especialidad_usuario);
      this.renderApplicationBlocks(data.loguin_infra_solicitud[0]);
      this.hasLoguin(data.has_loguin);

    } catch (error) {
      this.showToast('Error', `${error}`, 'error');
      console.error('Fetch error:', error);
      Codebase.loader('hide');
    }
  }

  static async showDataUserBlock(usuario, especialidadUsuario) {
    //console.log(usuario);
    //console.log(especialidadUsuario);
    const blockIDUser = document.getElementById('data-identificacion');
    const blockDataUser = document.getElementById('data-usuario');
    const BlockObservation = document.getElementById('loguin-observacion');
    blockIDUser.querySelector('#loguin-identificacion').innerHTML = `<i class="fa fa-address-card me-1"></i>${usuario.identificacion}` || 'N/A';
    blockDataUser.querySelector('#loguin-nombre').innerHTML = `<i class="fa fa-user me-1"></i>${usuario.nombreCompleto}` || 'N/A';
    blockDataUser.querySelector('#loguin-email').innerHTML = `<i class="fa fa-envelope me-1"></i>${usuario.email}` || 'N/A';
    blockDataUser.querySelector('#loguin-sede').innerHTML = `<i class="fa fa-building me-1"></i>${usuario.sede}` || 'N/A';
    blockDataUser.querySelector('#loguin-cargo').innerHTML = `<i class="fa fa-briefcase me-1"></i>${usuario.cargo}` || 'N/A';
    blockDataUser.querySelector('#loguin-ticket').href = `http://mesadeservicios.viva1a.com.co/glpi/front/ticket.form.php?id=${usuario.ticket_id}` || 'N/A';
    blockDataUser.querySelector('#loguin-ticket').setAttribute('target', '_blank');
    blockDataUser.querySelector('#modal-ticket-numero').innerHTML = `<span class="badge bg-${usuario.status_color}"><i class="${usuario.status_icon} me-1"></i>${usuario.ticket_id}</span>` || 'N/A';
    BlockObservation.querySelector('#observacion-loguin').innerHTML = `<i class="fa fa-circle-info me-1"></i>${usuario.observaciones === '' ? 'Sin observaciones' : usuario.observaciones}` || 'N/A';
    
    const hasEspecialidad = especialidadUsuario && especialidadUsuario.length > 0;
    //console.log(hasEspecialidad);
    if (hasEspecialidad) {
      blockDataUser.querySelector('#loguin-especialidad').hidden = false;
      blockDataUser.querySelector('#loguin-especialidad').innerHTML = `<i class="fa fa-book-medical me-1"></i>${especialidadUsuario[0].especialidad}` || 'N/A';
    } else {
    blockDataUser.querySelector('#loguin-especialidad').hidden = true;
    }
  }

  static async renderApplicationBlocks(loguinSolicitud) {
    const formLoguin = document.getElementById('form-loguin');

    const keyMapping = {
      solicito_correo: 'Correo Institucional',
      solicito_usuario_dominio: 'Usuario de Dominio',
      solicito_vpn: 'VPN'
    };

    const infraElements = {
      solicito_correo: 1,
      solicito_usuario_dominio: 2,
      solicito_vpn: 3
    };

    Object.entries(loguinSolicitud).forEach(([key, value]) => {
      if (value === 1 && infraElements[key]) {
        //console.log('Key:', key, 'Value:', value, 'Infra Element:', infraElements[key]);

        const infraBlockDiv = document.createElement('div');
        infraBlockDiv.classList.add('block', 'block-themed', 'block-rounded');
        infraBlockDiv.id = 'infraestructura';
        //infraBlockDiv.setAttribute('data-solicitud-id', `${loguinSolicitud.solicitud_id}`)

        const infraHeaderDiv = document.createElement('div');
        infraHeaderDiv.classList.add('block-header', 'block-header-default');
        const infraTitleH3 = document.createElement('h3');
        infraTitleH3.classList.add('block-title');
        infraTitleH3.textContent = `${keyMapping[key] || key}`;
        infraHeaderDiv.appendChild(infraTitleH3);

        const infraContentDiv = document.createElement('div');
        infraContentDiv.classList.add('block-content', 'block-content-full');

        const infraRowDiv = document.createElement('div');
        infraRowDiv.classList.add('row');

        const infraColLeftDiv = document.createElement('div');
        infraColLeftDiv.classList.add('col-lg-4');
        
        // Mostrar las aplicaciones y perfiles de coraza en una lista
        const infraTextP = document.createElement('p');
        infraTextP.classList.add('text-muted');

        const infraSolicitudSpan = document.createElement('span');
        //infraSolicitudSpan.classList.add('badge', 'bg-gray');
        infraSolicitudSpan.classList.add('badge', 'bg-primary-lighter', 'infra');
        infraSolicitudSpan.setAttribute('data-solicitud-key', `${key}`);
        infraSolicitudSpan.setAttribute('data-solicitud-value', `${infraElements[key]}`);
        infraSolicitudSpan.textContent = `Solicitud ${keyMapping[key] || key}`;
        infraTextP.appendChild(infraSolicitudSpan);
        //infraTextP.appendChild(document.createTextNode(' '));

        infraColLeftDiv.appendChild(infraTextP);

        const infraColRightDiv = document.createElement('div');
        infraColRightDiv.classList.add('col-lg-8', 'space-y-2');

        const infraFormRowDiv = document.createElement('div');
        infraFormRowDiv.classList.add('row', 'row-cols-lg-auto', 'g-3', 'align-items-center');

        const userColDiv = document.createElement('div');
        userColDiv.classList.add('col-12');
        const userInput = document.createElement('input');
        userInput.type = 'text';
        userInput.classList.add('form-control', 'usuario-loguin');
        userInput.placeholder = 'Usuario';
        //userInput.setAttribute('onkeypress', "return /[0-9a-zA-Z]/i.test(event.key);");
        userColDiv.appendChild(userInput);

        const passColDiv = document.createElement('div');
        passColDiv.classList.add('col-12');
        const passInput = document.createElement('input');
        passInput.type = 'text';
        passInput.classList.add('form-control', 'password-loguin');
        passInput.placeholder = 'Contraseña';
        //passInput.setAttribute('onkeypress', "return /[0-9a-zA-Z]/i.test(event.key);");
        passColDiv.appendChild(passInput);

        infraFormRowDiv.appendChild(userColDiv);
        infraFormRowDiv.appendChild(passColDiv);

        infraColRightDiv.appendChild(infraFormRowDiv);
        infraRowDiv.appendChild(infraColLeftDiv);
        infraRowDiv.appendChild(infraColRightDiv);
        infraContentDiv.appendChild(infraRowDiv);

        infraBlockDiv.appendChild(infraHeaderDiv);
        infraBlockDiv.appendChild(infraContentDiv);
        formLoguin.appendChild(infraBlockDiv);
      }
    });
  }

  static clearLoguinInputs() {
    const loguinContainers = document.querySelectorAll('#infraestructura');
    
    loguinContainers.forEach((container) => {
        const loguinUserInput = container.querySelector('.usuario-loguin');
        const loguinPasswordInput = container.querySelector('.password-loguin');
        
        if (loguinUserInput) loguinUserInput.value = '';
        if (loguinPasswordInput) loguinPasswordInput.value = '';
    });
  }

  static async handleSubmit(event) 
  {
      event.preventDefault();

      if (!jQuery('#form-loguin').valid()) {
          // Si la validación falla, detén el proceso y no envíes el formulario
          console.log('El formulario contiene campos que deben ser validados, no se enviará.');
          return;
      }

      const solicitud = document.getElementById('solicitud');
      const numberSolicitud = solicitud.getAttribute('data-solicitud-id');

      const infraLoguin = [];

      const infraContainers = document.querySelectorAll('#infraestructura');

      infraContainers.forEach((container) => {
        const infraBadges = container.querySelectorAll('.infra');
        const loguinUser = container.querySelector('.usuario-loguin')?.value || null;
        const loguinPassword = container.querySelector('.password-loguin')?.value || null;

        infraBadges.forEach((badge) => {
          const solicitudKey= badge.getAttribute('data-solicitud-key');
          const solicitudValue = badge.getAttribute('data-solicitud-value');

          if (solicitudKey&& solicitudValue) {
            infraLoguin.push({
              solicitud: solicitudKey,
              solicitud_infra_id: solicitudValue,
              usuario_loguin: loguinUser,
              password_loguin: loguinPassword,
            });
          }
        });
      });

      // Crear el objeto final
      const formData = {
        solicitud: numberSolicitud,
        infra_solicitud: infraLoguin,
      };

      //console.log(formData);

     this.toast.fire({
      title: 'Esta seguro?',
      text: 'Se enviaran los datos del formulario para la creación de las credenciales Loguin!',
      icon: 'warning',
      showCancelButton: true,
      customClass: {
          confirmButton: 'btn btn-success m-1',
          cancelButton: 'btn btn-secondary m-1'
      },
      confirmButtonText: 'Si, guardar!',
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
              const response = await fetch('/storeLoguinInfra', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                  },
                  body: JSON.stringify(formData)
              });

              if (!response.ok) {
                  this.showToast('Error...', `Error al guardar credenciales Loguin ${response.statusText}`, 'error');
                  throw new Error(`Error en la respuesta del servidor: ${response.statusText} - ${response.status}`);
              }

              const result = await response.json();
              //console.log('datos desde la db',result);
              this.showToast('Loguin creado!', `${result.message}`,'success');
              this.clearLoguinInputs();
              this.formLoguin.hidden = true;
              await this.fetchAndRenderLoguins(result.solicitud);
              this.copyTableFeature();
          } catch (error) {
              console.error('Error al guardar las credenciales:', error);
              this.showToast('Error...', `Error al guardar credenciales loguin ${error}`, 'error');
          }
      } else if (result.dismiss === 'cancel') {
          //toast.fire('Cancelled', 'Your imaginary file is safe :)', 'error');
      }
    });
  }

  static async fetchAndRenderLoguins(solicitudId) {
    try {
      const response = await fetch(`/getLoguins/infraestructura/${solicitudId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.statusText} - ${response.status}`);
      }
  
      const loguins = await response.json();
      //console.log(loguins);
  
      const container = document.getElementById('loguin-container');
      const loguinContent = document.querySelector('.loguin-content');
  
      // Verificar si hay loguins registrados
      if (loguins.length > 0) {
        loguinContent.innerHTML = ''; // Limpiar el contenedor antes de renderizar
        loguins.forEach((loguin) => {
          const table = this.createLoguinTable(loguin.nombre_solicitud, loguin.usuario_loguin, loguin.password_loguin);
          loguinContent.appendChild(table);
        });
  
        // Mostrar el contenedor si tiene loguins
        container.hidden = false;
      } else {
        // Ocultar el contenedor si no hay loguins
        container.hidden = true;
      }
    } catch (error) {
      console.error('Error al obtener los loguins:', error);
      this.showToast('Error...', 'Error al obtener los loguins', 'error');
    }
  }

  static createLoguinTable(appName, user, password) {
    // Crear el elemento tabla
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');

    // Crear el encabezado de la tabla
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const thHead = document.createElement('th');
    thHead.colSpan = 2;
    thHead.textContent = appName;
    trHead.appendChild(thHead);
    thead.appendChild(trHead);

    // Crear el cuerpo de la tabla
    const tbody = document.createElement('tbody');

    // Fila del usuario
    const trUser = document.createElement('tr');
    const thUser = document.createElement('th');
    thUser.textContent = 'USUARIO';
    const tdUser = document.createElement('td');
    tdUser.textContent = user;
    trUser.appendChild(thUser);
    trUser.appendChild(tdUser);

    // Fila de la contraseña
    const trPassword = document.createElement('tr');
    const thPassword = document.createElement('th');
    thPassword.textContent = 'CONTRASEÑA';
    const tdPassword = document.createElement('td');
    tdPassword.textContent = password;
    trPassword.appendChild(thPassword);
    trPassword.appendChild(tdPassword);

    // Agregar las filas al cuerpo
    tbody.appendChild(trUser);
    tbody.appendChild(trPassword);

    // Agregar encabezado y cuerpo a la tabla
    table.appendChild(thead);
    table.appendChild(tbody);

    // Retornar la tabla generada
    return table;
  }

  // Función para copiar tablas al portapapeles
  static async copyTableFeature() {
    const copyButton = document.querySelector(
      ".block-options .btn-block-option"
    );

    if (copyButton) {
      copyButton.addEventListener("click", () => {
        const tables = document.querySelectorAll(".block-content table");

        if (tables.length > 0) {
          const contentText = Array.from(tables)
            .map((table) => {
              return Array.from(table.querySelectorAll("tr"))
                .map((row) => {
                  const cells = Array.from(row.querySelectorAll("th, td"));
                  return cells
                    .map((cell) => cell.textContent.trim())
                    .join(": ");
                })
                .join("\n");
            })
            .join("\n\n");

          // Intenta copiar usando navigator.clipboard
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
              .writeText(contentText)
              .then(() => {
                Codebase.helpers("jq-notify", {
                  type: "success",
                  icon: "fa fa-check",
                  message: "Loguin copiado al portapapeles",
                });
              })
              .catch((err) => {
                console.error("Error al copiar usando Clipboard API:", err);
                // Fallback si Clipboard API falla
                this.copyToClipboardFallback(contentText);
              });
          } else {
            // Usa el método de fallback si Clipboard API no está disponible
            this.copyToClipboardFallback(contentText);
          }
        } else {
          Codebase.helpers("jq-notify", {
            type: "warning",
            icon: "fa fa-exclamation-triangle",
            message: "No se encontraron tablas para copiar",
          });
        }
      });
    }
  }

  // Función para copiar texto al portapapeles sin `navigator.clipboard`
  static copyToClipboardFallback(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Evita que el textarea aparezca en pantalla
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      const msg = successful
        ? "Loguin copiado al portapapeles"
        : "No se pudo copiar el loguin";
      Codebase.helpers("jq-notify", {
        type: successful ? "success" : "danger",
        icon: successful ? "fa fa-check" : "fa fa-times",
        message: msg,
      });
    } catch (err) {
      console.error("Fallback: Error al copiar el loguin", err);
      Codebase.helpers("jq-notify", {
        type: "danger",
        icon: "fa fa-times",
        message: "Error al copiar el loguin",
      });
    }

    document.body.removeChild(textArea);
  }

  /*
   * Init functionality
   */
  static init() {
    this.initFormElements();
    this.SolicitudLoguin();
    this.formLoguin.addEventListener('submit', (event) => this.handleSubmit(event));
  }
}

// Initialize when page loads
Codebase.onLoad(() => RenderDataSolicitudLoguinInfra.init());
