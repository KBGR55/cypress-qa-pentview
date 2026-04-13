const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: '',  // Ingresar URL de la plataforma CRM
    experimentalModifyObstructiveThirdPartyCode: true,
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    chromeWebSecurity: false,
    env: {
      username: '',  // Ingresar usuario proporcionado
      password: '',  // Ingresar password proporcionada
    },
    setupNodeEvents(on, config) {},
  },
});
