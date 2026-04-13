# Automatizacion E2E - CRM Pentview
## Evaluacion QA - Creacion de usuario

Proyecto de automatizacion con Cypress para validar el flujo de creacion de un nuevo usuario
dentro del modulo Users de la plataforma CRM Pentview.

---

## Requisitos previos

- **Node.js** version 18 o superior (verificar con `node -v`)
- **npm** version 8 o superior (verificar con `npm -v`)
- **Google Chrome** instalado (Cypress lo usa como navegador)

---

## Instalacion

```bash
cd cypress-qa-pentview
npm install
```

---

## Configuracion

Antes de ejecutar los tests, es necesario configurar la **URL de la plataforma** y las
**credenciales de acceso** en el archivo `cypress.config.js`:

```js
// cypress.config.js - Lineas a modificar:

baseUrl: '<URL_DE_LA_PLATAFORMA>',     // <-- Cambiar por la URL del CRM
env: {
  username: '<USUARIO>',               // <-- Cambiar por el usuario proporcionado
  password: '<PASSWORD>',              // <-- Cambiar por la password proporcionada
},
```

Las credenciales seran proporcionadas por el administrador de la plataforma.

---

## Ejecucion

```bash
# Modo interactivo (abre la interfaz grafica de Cypress)
npx cypress open

# Modo headless con Chrome (ejecucion en terminal)
npx cypress run --browser chrome

# Modo headless con Chrome visible (para ver el navegador)
npx cypress run --browser chrome --headed
```

---

## Estructura del proyecto

```
cypress-qa-pentview/
|-- cypress.config.js                     Configuracion de Cypress (URL, credenciales, timeouts)
|-- package.json                          Dependencias del proyecto
|-- cypress/
    |-- e2e/
    |   |-- users/
    |       |-- addUser.cy.js             Tests E2E: creacion de usuario (3 tests)
    |-- fixtures/
    |   |-- userData.json                 Datos de prueba (usuario valido e invalido)
    |-- support/
        |-- commands.js                   Comandos personalizados (login, fillUserForm, etc.)
        |-- e2e.js                        Configuracion global de soporte
```

---

## Tests implementados

### addUser.cy.js

| Test | Descripcion | Validacion |
|------|-------------|------------|
| Caso positivo | Crea un usuario con datos validos desde userData.json | Verifica status 201 y mensaje "User added successfully". Valida que el usuario aparece en la tabla. |
| Caso negativo (email) | Envia formulario con email invalido (correo-invalido@.com) | Verifica que el backend rechaza con status 400 y mensaje "Invalid data". |
| Caso negativo (vacios) | Intenta enviar el formulario sin completar ningun campo | Verifica que el frontend muestra validaciones y que NO se envia peticion al backend. |

---

## Comandos personalizados (commands.js)

| Comando | Descripcion |
|---------|-------------|
| `cy.login()` | Realiza el login en la plataforma. Usa credenciales de cypress.config.js o recibe parametros. Intercepta POST /ms-authentication/login-crm y verifica status 200. |
| `cy.navigateToUsers()` | Navega al listado de usuarios (/main-screen/users/list). Espera la carga de la tabla antes de continuar. |
| `cy.clickAddUser()` | Hace clic en "+ Add user". Espera la carga de datos del formulario (GET /ms-roles/user-data). |
| `cy.fillUserForm(data)` | Completa el formulario de creacion con los datos proporcionados (firstName, lastName, phone, username, password, email, country, extension, ipAddress, timezone, role). |

---

## Datos de prueba (userData.json)

El archivo contiene dos objetos:

- **validUser**: Datos completos para crear un usuario exitosamente.
- **invalidUser**: Datos con email invalido para probar el caso negativo.

Los campos estan basados en el payload real que el frontend envia a
`POST /ms-users/create`, capturado durante el analisis del modulo.

---

## Notas tecnicas

- Las passwords que contienen el caracter `@` se escriben con la opcion
  `{ parseSpecialCharSequences: false }` para evitar que Cypress las
  interprete como comandos especiales.
- El test de caso positivo genera un username y email unicos usando
  `Date.now()` para evitar errores por duplicados.
- Se utiliza `cy.intercept()` para interceptar y validar las peticiones
  HTTP al backend (POST /ms-users/create).
- El endpoint de login real es `POST /ms-authentication/login-crm`
  con Content-Type `application/x-www-form-urlencoded`.
