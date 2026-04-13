// =============================================================
// Comandos personalizados - CRM Pentview QA Automation
// =============================================================

/**
 * cy.login(username, password)
 * Realiza el login en la plataforma CRM Pentview.
 * Endpoint real: POST /ms-authentication/login-crm
 * Si no se pasan parametros, usa las credenciales de cypress.config.js
 */
Cypress.Commands.add('login', (username, password) => {
  const user = username || Cypress.env('username');
  const pass = password || Cypress.env('password');

  cy.visit('/login');

  // Selectores reales verificados: formcontrolname="username" y formcontrolname="password"
  cy.get('input[formcontrolname="username"]', { timeout: 20000 })
    .should('be.visible')
    .clear()
    .type(user);

  // parseSpecialCharSequences: false para que el @ en la password no se interprete como comando
  cy.get('input[formcontrolname="password"]')
    .should('be.visible')
    .clear()
    .type(pass, { parseSpecialCharSequences: false });

  // Interceptar la peticion de login para verificar la respuesta
  cy.intercept('POST', '**/ms-authentication/login-crm').as('loginRequest');

  // El boton de submit tiene la clase btn-custom-secondary (texto: "Einloggen" en aleman)
  cy.get('button[type="submit"]').click();

  // Esperar la respuesta del login
  cy.wait('@loginRequest', { timeout: 15000 }).then((interception) => {
    expect(interception.response.statusCode).to.eq(200);
  });

  // Verificar redireccion exitosa al main-screen
  cy.url({ timeout: 30000 }).should('include', '/main-screen');
});

/**
 * cy.navigateToUsers()
 * Navega al listado de usuarios del modulo Users.
 * Intercepta la carga de la tabla para confirmar que los datos estan listos.
 */
Cypress.Commands.add('navigateToUsers', () => {
  cy.intercept('POST', '**/ms-users/v3/partner/table*').as('loadUsersTable');
  cy.visit('/main-screen/users/list');
  cy.wait('@loadUsersTable', { timeout: 15000 });
  cy.get('table', { timeout: 15000 }).should('be.visible');
});

/**
 * cy.clickAddUser()
 * Hace clic en el boton "+ Add user" y espera que el formulario sea visible.
 * Intercepta la carga de datos del formulario (roles, paises, timezones).
 */
Cypress.Commands.add('clickAddUser', () => {
  cy.intercept('GET', '**/ms-roles/user-data').as('loadUserFormData');

  cy.contains('button', /add\s*user/i, { timeout: 10000 })
    .should('be.visible')
    .click();

  // Esperar que el formulario cargue los datos necesarios (roles, paises, etc.)
  cy.wait('@loadUserFormData', { timeout: 15000 });

  // Verificar que el campo firstName del formulario sea visible
  cy.get('input[formcontrolname="firstName"]', { timeout: 10000 })
    .should('be.visible');
});

/**
 * cy.fillUserForm(userData)
 * Completa el formulario de creacion de usuario.
 * Basado en el payload real capturado en el HAR:
 * POST /ms-users/create con campos: firstName, lastName, phone, phoneCode,
 * countryPhoneAcronym, username, password, email, idCountry, extension,
 * ipAddress, timeZone, idRol, idSalaryType, idOffice, active, uuidAffiliate
 */
Cypress.Commands.add('fillUserForm', (userData) => {
  if (userData.firstName) {
    cy.get('input[formcontrolname="firstName"]')
      .clear()
      .type(userData.firstName);
  }

  if (userData.lastName) {
    cy.get('input[formcontrolname="lastName"]')
      .clear()
      .type(userData.lastName);
  }

  if (userData.phone) {
    cy.get('input[formcontrolname="phone"], input[type="tel"]')
      .first()
      .clear()
      .type(userData.phone);
  }

  if (userData.username) {
    cy.get('input[formcontrolname="username"]')
      .clear()
      .type(userData.username);
  }

  if (userData.password) {
    cy.get('input[formcontrolname="password"]')
      .clear()
      .type(userData.password, { parseSpecialCharSequences: false });
  }

  if (userData.email) {
    cy.get('input[formcontrolname="email"]')
      .clear()
      .type(userData.email);
  }

  // Country (ng-select dropdown)
  if (userData.countryName) {
    cy.get('[formcontrolname="country"]').first().click();
    cy.contains(userData.countryName).click();
  }

  if (userData.extension) {
    cy.get('input[formcontrolname="extension"]')
      .clear()
      .type(userData.extension);
  }

  if (userData.ipAddress) {
    cy.get('input[formcontrolname="ipAddress"]')
      .clear()
      .type(userData.ipAddress);
  }

  // UTC Timezone (dropdown)
  if (userData.timezone) {
    cy.get('[formcontrolname="timezone"], [formcontrolname="timeZone"]')
      .first()
      .click();
    cy.get('.ng-option, [role="option"]').first().click();
  }

  // Role (dropdown)
  if (userData.roleName) {
    cy.get('[formcontrolname="role"], [formcontrolname="idRol"]')
      .first()
      .click();
    cy.contains(userData.roleName).click();
  }
});
