class RenderDataSolicitudLoguin {

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
  static async hasLoguin(loguins) {
    const container = document.getElementById('loguin-container');
    const loguinContent = document.querySelector('.loguin-content');

    // Filtros independientes
    const validLoguins = loguins.filter(loguin => loguin.usuario_loguin !== null && loguin.password_loguin !== null && loguin.aplicacion_id !== 7 && loguin.aplicacion_id !== 8);
    const validLoguinFilterMipres = loguins.filter(loguin => loguin.aplicacion_id === 7 && loguin.mipres !== null);
    const validLoguinFilterRuaf = loguins.filter(loguin => loguin.aplicacion_id === 8 && loguin.ruaf !== null);

    // Verificar si hay loguins válidos en cualquier categoría
    if (validLoguins.length > 0 || validLoguinFilterMipres.length > 0 || validLoguinFilterRuaf.length > 0) {
      loguinContent.innerHTML = '';

      // Agregar tablas para loguins generales
      validLoguins.forEach((loguin) => {
        const table = this.createLoguinTable(loguin.aplicacion_perfil, loguin.usuario_loguin, loguin.password_loguin);
        loguinContent.appendChild(table);
      });

      // Agregar tabla para loguins de Mipres
      validLoguinFilterMipres.forEach((loguin) => {
        const table = this.createLoguinMipresTable(loguin.aplicacion_perfil, loguin.mipres);
        loguinContent.appendChild(table);
      });

      // Agregar tabla para loguins de Ruaf
      validLoguinFilterRuaf.forEach((loguin) => {
        const table = this.createLoguinRuafTable(loguin.aplicacion_perfil, loguin.ruaf);
        loguinContent.appendChild(table);
      });

      // Mostrar el contenedor si hay loguins
      container.hidden = false;
      this.formLoguin.hidden = true;
      this.copyTableFeature();
    } else {
      // Ocultar el contenedor si no hay loguins válidos
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
      const response = await fetch(`/fetchDataLoguin/${solicitudId}`, {
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
      if (!data.usuario || !data.usuario[0] || !data.loguin_solicitud || !data.especialidad_usuario === null || !data.especialidad_usuario || !data.has_loguin === null || !data.has_loguin) {
        throw new Error('Datos incompletos recibidos del servidor');
      }

      this.showDataUserBlock(data.usuario[0], data.especialidad_usuario);
      this.renderApplicationBlocks(data.loguin_solicitud);
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
    blockDataUser.querySelector('#modal-ticket-numero').innerHTML = `<span class="badge bg-${usuario.status_color}"></i><i class="${usuario.status_icon} me-1"></i>${usuario.ticket_id}</span>` || 'N/A';
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
    
    // Filtrar las aplicaciones para obtener las de coraza y las demás
    const corazaApps = loguinSolicitud.filter(app => app.is_coraza === 1);
    const otherApps = loguinSolicitud.filter(app => app.is_coraza === 0 && app.aplicacion_id != 7 && app.aplicacion_id != 8);
    const mipres = loguinSolicitud.filter(app => app.aplicacion_id === 7);
    const ruaf = loguinSolicitud.filter(app => app.aplicacion_id === 8);
    
    // Crear un bloque unificado para las aplicaciones con is_coraza = 1
    if (corazaApps.length > 0) {
      const corazaBlockDiv = document.createElement('div');
      corazaBlockDiv.classList.add('block', 'block-themed', 'block-rounded');
      corazaBlockDiv.id = 'aplicacion';
      corazaBlockDiv.setAttribute('data-solicitud-id', `${loguinSolicitud[0].solicitud_id}`)

      const corazaHeaderDiv = document.createElement('div');
      corazaHeaderDiv.classList.add('block-header', 'block-header-default');
      const corazaTitleH3 = document.createElement('h3');
      corazaTitleH3.classList.add('block-title');
      corazaTitleH3.textContent = 'CORAZA';
      corazaHeaderDiv.appendChild(corazaTitleH3);

      const corazaContentDiv = document.createElement('div');
      corazaContentDiv.classList.add('block-content', 'block-content-full');

      const corazaRowDiv = document.createElement('div');
      corazaRowDiv.classList.add('row');

      const corazaColLeftDiv = document.createElement('div');
      corazaColLeftDiv.classList.add('col-lg-4');
      
      // Mostrar las aplicaciones y perfiles de coraza en una lista
      const corazaTextP = document.createElement('p');
      corazaTextP.classList.add('text-muted');

      corazaApps.forEach(app => {
        const appProfileSpan = document.createElement('span');
        //appProfileSpan.classList.add('badge', 'bg-gray');
        appProfileSpan.classList.add('badge', 'bg-primary-lighter', 'app');
        appProfileSpan.setAttribute('data-app-id', `${app.aplicacion_id}`);
        appProfileSpan.setAttribute('data-perfil-id', `${app.perfil_id}`);
        appProfileSpan.textContent = `${app.aplicacion} ${app.perfil}`;
        
        corazaTextP.appendChild(appProfileSpan);
        corazaTextP.appendChild(document.createTextNode(' ')); // Espacio entre badges
      });

      corazaColLeftDiv.appendChild(corazaTextP);

      const corazaColRightDiv = document.createElement('div');
      corazaColRightDiv.classList.add('col-lg-8', 'space-y-2');

      const corazaFormRowDiv = document.createElement('div');
      corazaFormRowDiv.classList.add('row', 'row-cols-lg-auto', 'g-3', 'align-items-center');

      const userColDiv = document.createElement('div');
      userColDiv.classList.add('col-12');
      const userInput = document.createElement('input');
      userInput.type = 'text';
      userInput.classList.add('form-control', 'usuario-loguin');
      userInput.placeholder = 'Usuario';
      userInput.setAttribute('onkeypress', "return /[0-9a-zA-Z]/i.test(event.key);");
      userColDiv.appendChild(userInput);

      const passColDiv = document.createElement('div');
      passColDiv.classList.add('col-12');
      const passInput = document.createElement('input');
      passInput.type = 'text';
      passInput.classList.add('form-control', 'password-loguin');
      passInput.placeholder = 'Contraseña';
      passInput.setAttribute('onkeypress', "return /[0-9a-zA-Z]/i.test(event.key);");
      passColDiv.appendChild(passInput);

      corazaFormRowDiv.appendChild(userColDiv);
      corazaFormRowDiv.appendChild(passColDiv);

      corazaColRightDiv.appendChild(corazaFormRowDiv);
      corazaRowDiv.appendChild(corazaColLeftDiv);
      corazaRowDiv.appendChild(corazaColRightDiv);
      corazaContentDiv.appendChild(corazaRowDiv);

      corazaBlockDiv.appendChild(corazaHeaderDiv);
      corazaBlockDiv.appendChild(corazaContentDiv);
      formLoguin.appendChild(corazaBlockDiv);
    }

    // Crear bloques separados para las aplicaciones con is_coraza = 0
    otherApps.forEach(app => {
      const blockDiv = document.createElement('div');
      blockDiv.classList.add('block', 'block-themed', 'block-rounded');
      blockDiv.id = 'aplicacion';

      const headerDiv = document.createElement('div');
      headerDiv.classList.add('block-header', 'block-header-default');
      const titleH3 = document.createElement('h3');
      titleH3.classList.add('block-title');
      titleH3.textContent = app.aplicacion;
      headerDiv.appendChild(titleH3);

      const contentDiv = document.createElement('div');
      contentDiv.classList.add('block-content', 'block-content-full');

      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');

      const colLeftDiv = document.createElement('div');
      colLeftDiv.classList.add('col-lg-4');
      const textP = document.createElement('p');
      textP.classList.add('text-muted');
      const appProfileSpan = document.createElement('span');
      appProfileSpan.classList.add('badge', 'bg-primary-lighter', 'app');
      appProfileSpan.setAttribute('data-app-id', `${app.aplicacion_id}`);
      appProfileSpan.setAttribute('data-perfil-id', `${app.perfil_id}`);
      appProfileSpan.textContent = `${app.perfil}`;
      textP.appendChild(appProfileSpan);
      colLeftDiv.appendChild(textP);

      const colRightDiv = document.createElement('div');
      colRightDiv.classList.add('col-lg-8', 'space-y-2');

      const formRowDiv = document.createElement('div');
      formRowDiv.classList.add('row', 'row-cols-lg-auto', 'g-3', 'align-items-center');
      formRowDiv.id = 'container-loguin';

      const userColDiv = document.createElement('div');
      userColDiv.classList.add('col-12');
      const userInput = document.createElement('input');
      userInput.type = 'text';
      userInput.classList.add('form-control', 'usuario-loguin');
      userInput.placeholder = 'Usuario';
      userInput.setAttribute('onkeypress', "return /[0-9a-zA-Z]/i.test(event.key);");
      userColDiv.appendChild(userInput);

      const passColDiv = document.createElement('div');
      passColDiv.classList.add('col-12');
      const passInput = document.createElement('input');
      passInput.type = 'text';
      passInput.classList.add('form-control', 'password-loguin');
      passInput.placeholder = 'Contraseña';
      passInput.setAttribute('onkeypress', "return /[0-9a-zA-Z]/i.test(event.key);");
      passColDiv.appendChild(passInput);

      formRowDiv.appendChild(userColDiv);
      formRowDiv.appendChild(passColDiv);

      colRightDiv.appendChild(formRowDiv);
      rowDiv.appendChild(colLeftDiv);
      rowDiv.appendChild(colRightDiv);
      contentDiv.appendChild(rowDiv);

      blockDiv.appendChild(headerDiv);
      blockDiv.appendChild(contentDiv);
      formLoguin.appendChild(blockDiv);
    });

    // Crear bloque MIPRES
    mipres.forEach(mipres => {
      const miprescolDiv = document.createElement('div');
      miprescolDiv.classList.add('col-md-6');

      // Crear el bloque mipres
      const mipresblockDiv = document.createElement('div');
      mipresblockDiv.classList.add('block', 'block-themed', 'block-rounded');
      mipresblockDiv.id = 'aplicacion-mipres';
      miprescolDiv.appendChild(mipresblockDiv);

      // Crear el encabezado del bloque
      const blockHeader = document.createElement('div');
      blockHeader.classList.add('block-header', 'block-header-default');
      mipresblockDiv.appendChild(blockHeader);

      const blockTitle = document.createElement('h3');
      blockTitle.classList.add('block-title');
      blockTitle.textContent = mipres.aplicacion;
      blockHeader.appendChild(blockTitle);

      // Crear el contenido del bloque
      const blockContent = document.createElement('div');
      blockContent.classList.add('block-content', 'block-content-full');
      mipresblockDiv.appendChild(blockContent);

      // Crear fila principal
      const mipresrowDiv = document.createElement('div');
      mipresrowDiv.classList.add('row');
      blockContent.appendChild(mipresrowDiv);

      // Columna izquierda
      const miprescolLeftDiv = document.createElement('div');
      miprescolLeftDiv.classList.add('col-lg-4');
      mipresrowDiv.appendChild(miprescolLeftDiv);

      const leftText = document.createElement('p');
      leftText.classList.add('text-muted');
      const appProfileSpanMipres = document.createElement('span');
      appProfileSpanMipres.classList.add('badge', 'bg-primary-lighter', 'app');
      appProfileSpanMipres.setAttribute('data-app-id', `${mipres.aplicacion_id}`);
      appProfileSpanMipres.setAttribute('data-perfil-id', `${mipres.perfil_id}`);
      appProfileSpanMipres.textContent = `${mipres.perfil}`;
      leftText.appendChild(appProfileSpanMipres);
      miprescolLeftDiv.appendChild(leftText);

      // Columna derecha
      const miprescolRightDiv = document.createElement('div');
      miprescolRightDiv.classList.add('col-lg-8', 'space-y-2');
      mipresrowDiv.appendChild(miprescolRightDiv);

      const rowInnerDiv = document.createElement('div');
      rowInnerDiv.classList.add('row', 'row-cols-lg-auto', 'g-3', 'align-items-center');
      miprescolRightDiv.appendChild(rowInnerDiv);

      const mb4Div = document.createElement('div');
      mb4Div.classList.add('mb-4');
      rowInnerDiv.appendChild(mb4Div);

      const formLabel = document.createElement('label');
      formLabel.classList.add('form-label');
      formLabel.textContent = 'Asociado';
      mb4Div.appendChild(formLabel);

      const spaceDiv = document.createElement('div');
      spaceDiv.classList.add('space-x-2');
      mb4Div.appendChild(spaceDiv);

      const formCheckDiv = document.createElement('div');
      formCheckDiv.classList.add('form-check', 'form-switch', 'form-check-inline', 'form-switch-lg');
      spaceDiv.appendChild(formCheckDiv);

      const formInput = document.createElement('input');
      formInput.classList.add('form-check-input');
      formInput.type = 'checkbox';
      formInput.value = '1';
      formInput.id = 'mipres';
      formInput.name = 'mipres';
      formCheckDiv.appendChild(formInput);

      const formLabelFor = document.createElement('label');
      formLabelFor.classList.add('form-check-label');
      formLabelFor.htmlFor = 'mipres';
      formCheckDiv.appendChild(formLabelFor);

      formLoguin.appendChild(miprescolDiv);
    });

    // Crear bloque RUAF
    ruaf.forEach(ruaf => {
      const ruafcolDiv = document.createElement('div');
      ruafcolDiv.classList.add('col-md-6');

      // Crear el bloque ruaf
      const ruafblockDiv = document.createElement('div');
      ruafblockDiv.classList.add('block', 'block-themed', 'block-rounded');
      ruafblockDiv.id = 'aplicacion-ruaf';
      ruafcolDiv.appendChild(ruafblockDiv);

      // Crear el encabezado del bloque
      const blockHeader = document.createElement('div');
      blockHeader.classList.add('block-header', 'block-header-default');
      ruafblockDiv.appendChild(blockHeader);

      const blockTitle = document.createElement('h3');
      blockTitle.classList.add('block-title');
      blockTitle.textContent = ruaf.aplicacion;
      blockHeader.appendChild(blockTitle);

      // Crear el contenido del bloque
      const blockContent = document.createElement('div');
      blockContent.classList.add('block-content', 'block-content-full');
      ruafblockDiv.appendChild(blockContent);

      // Crear fila principal
      const ruafrowDiv = document.createElement('div');
      ruafrowDiv.classList.add('row');
      blockContent.appendChild(ruafrowDiv);

      // Columna izquierda
      const ruafcolLeftDiv = document.createElement('div');
      ruafcolLeftDiv.classList.add('col-lg-4');
      ruafrowDiv.appendChild(ruafcolLeftDiv);

      const leftText = document.createElement('p');
      leftText.classList.add('text-muted');
      const appProfileSpanRuaf = document.createElement('span');
      appProfileSpanRuaf.classList.add('badge', 'bg-primary-lighter', 'app');
      appProfileSpanRuaf.setAttribute('data-app-id', `${ruaf.aplicacion_id}`);
      appProfileSpanRuaf.setAttribute('data-perfil-id', `${ruaf.perfil_id}`);
      appProfileSpanRuaf.textContent = `${ruaf.perfil}`;
      leftText.appendChild(appProfileSpanRuaf);
      ruafcolLeftDiv.appendChild(leftText);

      // Columna derecha
      const ruafcolRightDiv = document.createElement('div');
      ruafcolRightDiv.classList.add('col-lg-8', 'space-y-2');
      ruafrowDiv.appendChild(ruafcolRightDiv);

      const rowInnerDiv = document.createElement('div');
      rowInnerDiv.classList.add('row', 'row-cols-lg-auto', 'g-3', 'align-items-center');
      ruafcolRightDiv.appendChild(rowInnerDiv);

      const mb4Div = document.createElement('div');
      mb4Div.classList.add('mb-4');
      rowInnerDiv.appendChild(mb4Div);

      const formLabel = document.createElement('label');
      formLabel.classList.add('form-label');
      formLabel.textContent = 'Asociado';
      mb4Div.appendChild(formLabel);

      const spaceDiv = document.createElement('div');
      spaceDiv.classList.add('space-x-2');
      mb4Div.appendChild(spaceDiv);

      const formCheckDiv = document.createElement('div');
      formCheckDiv.classList.add('form-check', 'form-switch', 'form-check-inline', 'form-switch-lg');
      spaceDiv.appendChild(formCheckDiv);

      const formInput = document.createElement('input');
      formInput.classList.add('form-check-input');
      formInput.type = 'checkbox';
      formInput.value = '1';
      formInput.id = 'ruaf';
      formInput.name = 'ruaf';
      formCheckDiv.appendChild(formInput);

      const formLabelFor = document.createElement('label');
      formLabelFor.classList.add('form-check-label');
      formLabelFor.htmlFor = 'ruaf';
      formCheckDiv.appendChild(formLabelFor);

      formLoguin.appendChild(ruafcolDiv);
    });
  }

  static clearLoguinInputs() {
    const loguinContainers = document.querySelectorAll('#aplicacion');
    
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

      const AppLoguin = [];

      // Capturar datos de los bloques de aplicaciones, MIPRES, RUAF y observaciones
      const appsContainers = document.querySelectorAll('#aplicacion, #aplicacion-mipres, #aplicacion-ruaf');

      appsContainers.forEach((container) => {
        const appBadges = container.querySelectorAll('.app');
        const loguinUser = container.querySelector('.usuario-loguin')?.value || null;
        const loguinPassword = container.querySelector('.password-loguin')?.value || null;

        const mipresCheckbox = container.querySelector('input[type="checkbox"][id="mipres"]');
        const mipres = mipresCheckbox ? (mipresCheckbox.checked ? 1 : 0) : null;

        const ruafCheckbox = container.querySelector('input[type="checkbox"][id="ruaf"]');
        const ruaf = ruafCheckbox ? (ruafCheckbox.checked ? 1 : 0) : null;

        appBadges.forEach((badge) => {
          const appId = badge.getAttribute('data-app-id');
          const perfilId = badge.getAttribute('data-perfil-id');

          if (appId && perfilId) {
            AppLoguin.push({
              app_id: appId,
              perfil_id: perfilId,
              usuario_loguin: loguinUser,
              password_loguin: loguinPassword,
              mipres: mipres,
              ruaf: ruaf,
            });
          }
        });
      });

      // Crear el objeto final
      const formData = {
        solicitud: numberSolicitud,
        aplicaciones_loguin: AppLoguin
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
              const response = await fetch('/storeLoguin', {
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
              this.formLoguin.hidden = true;
              this.clearLoguinInputs();
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
      const response = await fetch(`/getLoguins/aplicaciones/${solicitudId}`, {
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
      const loguinFilter = loguins.filter(app => app.aplicacion_id != 7 && app.aplicacion_id != 8); // Si la aplicacion es diferente a 7 que es mipres id en db
      const loguinFilterMipres = loguins.filter(app => app.aplicacion_id === 7);
      const loguinFilterRuaf = loguins.filter(app => app.aplicacion_id === 8);

      if (loguins.length > 0) {
        loguinContent.innerHTML = ''; // Limpiar el contenedor antes de renderizar
        loguinFilter.forEach((loguin) => {
          const table = this.createLoguinTable(loguin.aplicacion_perfil, loguin.usuario_loguin, loguin.password_loguin);
          loguinContent.appendChild(table);
        });
        loguinFilterMipres.forEach((loguin) => {
          const table = this.createLoguinMipresTable(loguin.aplicacion_perfil, loguin.mipres);
          loguinContent.appendChild(table);
        });
        loguinFilterRuaf.forEach((loguin) => {
          const table = this.createLoguinRuafTable(loguin.aplicacion_perfil, loguin.ruaf);
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

  static createLoguinMipresTable(appName, mipres) {
    // Crear el elemento tabla
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');

    // Crear el encabezado de la tabla
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const thHead = document.createElement('th');
    thHead.textContent = appName;
    const tdHead = document.createElement('td');
    tdHead.textContent = `${mipres === 1 ? 'SI' : 'NO'}`
    trHead.appendChild(thHead);
    trHead.appendChild(tdHead);
    thead.appendChild(trHead);

    // Agregar encabezado y cuerpo a la tabla
    table.appendChild(thead);
    //table.appendChild(tbody);

    // Retornar la tabla generada
    return table;
  }

  static createLoguinRuafTable(appName, ruaf) {
    // Crear el elemento tabla
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered');

    // Crear el encabezado de la tabla
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const thHead = document.createElement('th');
    thHead.textContent = appName;
    const tdHead = document.createElement('td');
    tdHead.textContent = `${ruaf === 1 ? 'SI' : 'NO'}`
    trHead.appendChild(thHead);
    trHead.appendChild(tdHead);
    thead.appendChild(trHead);

    // Agregar encabezado y cuerpo a la tabla
    table.appendChild(thead);
    //table.appendChild(tbody);

    // Retornar la tabla generada
    return table;
  }

  // Función para inicializar la funcionalidad de copia
  static async copyTableFeature() {
    const copyButton = document.querySelector('.block-options .btn-block-option');

    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const tables = document.querySelectorAll('.block-content table');

            if (tables.length > 0) {
                const contentText = Array.from(tables)
                    .map(table => {
                        return Array.from(table.querySelectorAll('tr'))
                            .map(row => {
                                const cells = Array.from(row.querySelectorAll('th, td'));
                                return cells.map(cell => cell.textContent.trim()).join(': ');
                            })
                            .join('\n');
                    })
                    .join('\n\n');

          // Copiar el texto al portapapeles
          if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(contentText)
                  .then(() => {
                      Codebase.helpers('jq-notify', {
                          type: 'success',
                          icon: 'fa fa-check',
                          message: 'Loguin copiado al portapapeles',
                      });
                  })
                  .catch((err) => {
                      console.error('Error al copiar el loguin:', err);
                      fallbackCopyTextToClipboard(contentText);
                  });
          } else {
              fallbackCopyTextToClipboard(contentText);
          }
          } else {
              Codebase.helpers('jq-notify', {
                  type: 'warning',
                  icon: 'fa fa-exclamation-triangle',
                  message: 'No se encontraron tablas para copiar',
            });
          }
      });
    }
  }

  static fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'Loguin copiado al portapapeles' : 'Error al copiar el loguin';
        Codebase.helpers('jq-notify', {
            type: successful ? 'success' : 'danger',
            icon: successful ? 'fa fa-check' : 'fa fa-times',
            message: msg,
        });
    } catch (err) {
        console.error('Error al copiar el loguin:', err);
        Codebase.helpers('jq-notify', {
            type: 'danger',
            icon: 'fa fa-times',
            message: 'Error al copiar el loguin',
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
Codebase.onLoad(() => RenderDataSolicitudLoguin.init());
