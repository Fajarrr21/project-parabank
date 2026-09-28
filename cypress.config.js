const { defineConfig } = require('cypress');

const PARABANK_API = 'https://parabank.parasoft.com/parabank/services/bank';

/**
 * Reset database ParaBank hanya sekali per proses `cypress run`.
 * Cypress menjalankan root-level before() di setiap spec, sementara reset DB
 * cukup dilakukan satu kali di awal eksekusi. Memoisasi dilakukan di level Node
 * karena state di sini persist lintas spec.
 */
let databaseResetPromise = null;

function resetDatabaseOnce() {
  if (!databaseResetPromise) {
    databaseResetPromise = fetch(`${PARABANK_API}/initializeDB`, { method: 'POST' })
      .then((response) => ({
        performed: true,
        status: response.status,
        ok: response.ok,
      }))
      .catch((error) => ({
        performed: false,
        status: 0,
        ok: false,
        error: error.message,
      }));
  }
  return databaseResetPromise;
}

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    reportPageTitle: 'ParaBank Automation Report',
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: false,
  },
  video: true,
  screenshotOnRunFailure: true,
  viewportWidth: 1366,
  viewportHeight: 768,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'https://parabank.parasoft.com',
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      on('task', {
        resetDatabase: () => resetDatabaseOnce(),
      });

      return config;
    },
  },
});
