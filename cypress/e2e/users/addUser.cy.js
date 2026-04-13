/// <reference types="cypress" />

describe('Modulo Users - Creacion de nuevo usuario', () => {
  beforeEach(() => {
    // Req 8: Login implementado como custom command, utilizado desde el spec
    cy.login();
  });

  context('Caso positivo: Crear usuario exitosamente', () => {
    it('Debe crear un nuevo usuario y verificar que aparece en la tabla', () => {
      cy.fixture('userData').then((data) => {
        const user = data.validUser;
        // Generar username y email unicos para evitar duplicados
        const timestamp = Date.now();
        const uniqueUsername = `${user.username}.${timestamp}`;
        const uniqueEmail = `test.auto.${timestamp}@yopmail.com`;

        // Req 1: Iniciar la prueba desde el listado de usuarios
        cy.navigateToUsers();

        // Req 2: Realizar clic en "+ Add user"
        cy.clickAddUser();

        // Req 4: Interceptar la peticion de creacion usando cy.intercept()
        // Endpoint real: POST /ms-users/create
        cy.intercept('POST', '**/ms-users/create').as('createUser');

        // Req 3: Completar el formulario con datos de userData.json
        cy.fillUserForm({
          ...user,
          username: uniqueUsername,
          email: uniqueEmail,
        });

        // Enviar formulario (boton Save)
        cy.contains('button', /save/i).should('be.visible').click();

        // Req 5: Verificar respuesta exitosa del backend (status 200 o 201)
        cy.wait('@createUser', { timeout: 20000 }).then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([200, 201]);
          // Verificar mensaje de exito real del backend
          expect(interception.response.body.message).to.eq('User added successfully');
        });

        // Req 6: Validar que el nuevo usuario creado aparece en la tabla
        cy.navigateToUsers();
        cy.get('table tbody', { timeout: 15000 })
          .should('be.visible')
          .and('contain.text', user.firstName);
      });
    });
  });

  context('Caso negativo: Email invalido', () => {
    it('Req 7: No debe crear usuario con email invalido - backend retorna 400', () => {
      cy.fixture('userData').then((data) => {
        const user = data.invalidUser;

        cy.navigateToUsers();
        cy.clickAddUser();

        // Interceptar peticion
        cy.intercept('POST', '**/ms-users/create').as('createUserFail');

        // Completar formulario con email invalido: "correo-invalido@.com"
        cy.fillUserForm(user);

        cy.contains('button', /save/i).should('be.visible').click();

        // Verificar que el backend rechaza con 400 y mensaje "Invalid data"
        cy.wait('@createUserFail', { timeout: 20000 }).then((interception) => {
          expect(interception.response.statusCode).to.eq(400);
          expect(interception.response.body.message).to.eq('Invalid data');
        });
      });
    });
  });

  context('Caso negativo: Campos vacios', () => {
    it('No debe enviar el formulario con campos obligatorios vacios', () => {
      cy.navigateToUsers();
      cy.clickAddUser();

      // Interceptar posible peticion (no deberia ejecutarse)
      cy.intercept('POST', '**/ms-users/create').as('createUserEmpty');

      // Click en Save sin llenar ningun campo
      cy.contains('button', /save/i).should('be.visible').click();

      // Verificar validaciones del frontend (clases Angular ng-invalid)
      cy.get('.ng-invalid.ng-touched, .is-invalid, .text-danger, [class*="error"]', {
        timeout: 5000,
      }).should('exist');

      // Verificar que NO se envio la peticion al backend
      cy.get('@createUserEmpty.all').should('have.length', 0);
    });
  });
});
