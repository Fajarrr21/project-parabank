/// <reference types="cypress" />

const API_BASE = '/parabank/services/bank';
const JSON_HEADERS = { Accept: 'application/json' };

/**
 * Registrasi customer baru dengan username unik lalu simpan kredensialnya
 * di Cypress.env('testUser'). Dipakai di root before() (support/e2e.js) supaya
 * setiap spec punya data sendiri dan test bisa dijalankan berulang kali.
 */
Cypress.Commands.add('registerUniqueUser', () => {
  const username = `qa${Date.now()}`;

  return cy.fixture('users').then((users) => {
    const profile = users.profile;
    const password = users.defaultPassword;

    // ParaBank butuh JSESSIONID aktif sebelum form register diproses.
    cy.request('/parabank/register.htm');

    cy.request({
      method: 'POST',
      url: '/parabank/register.htm',
      form: true,
      body: {
        'customer.firstName': profile.firstName,
        'customer.lastName': profile.lastName,
        'customer.address.street': profile.street,
        'customer.address.city': profile.city,
        'customer.address.state': profile.state,
        'customer.address.zipCode': profile.zipCode,
        'customer.phoneNumber': profile.phoneNumber,
        'customer.ssn': profile.ssn,
        'customer.username': username,
        'customer.password': password,
        repeatedPassword: password,
      },
    })
      .its('body')
      .should('include', 'created successfully');

    return cy
      .request({ url: `${API_BASE}/login/${username}/${password}`, headers: JSON_HEADERS })
      .then(({ body }) => {
        const testUser = {
          username,
          password,
          customerId: body.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
        };
        Cypress.env('testUser', testUser);
        return testUser;
      });
  });
});

/**
 * Login lewat UI tapi di-cache dengan cy.session() supaya spec dengan banyak
 * test tidak perlu mengulang alur login dari awal.
 */
Cypress.Commands.add('loginSession', (user) => {
  const account = user || Cypress.env('testUser');

  cy.session(
    ['parabank', account.username],
    () => {
      cy.visit('/parabank/index.htm');
      cy.get('input[name="username"]').type(account.username);
      cy.get('input[name="password"]').type(account.password, { log: false });
      cy.get('input[value="Log In"]').click();
      cy.contains('h2', 'Account Services').should('be.visible');
    },
    {
      validate() {
        cy.request('/parabank/overview.htm').its('status').should('eq', 200);
      },
    }
  );
});

/** GET daftar akun milik customer. */
Cypress.Commands.add('apiGetAccounts', (customerId) =>
  cy
    .request({ url: `${API_BASE}/customers/${customerId}/accounts`, headers: JSON_HEADERS })
    .its('body')
);

/** GET detail satu akun. */
Cypress.Commands.add('apiGetAccount', (accountId) =>
  cy.request({ url: `${API_BASE}/accounts/${accountId}`, headers: JSON_HEADERS }).its('body')
);

/**
 * Buat akun baru lewat API (setup data), bukan lewat UI.
 * newAccountType: 0 = CHECKING, 1 = SAVINGS.
 */
Cypress.Commands.add('apiCreateAccount', (customerId, newAccountType, fromAccountId) =>
  cy
    .request({
      method: 'POST',
      url: `${API_BASE}/createAccount`,
      qs: { customerId, newAccountType, fromAccountId },
      headers: JSON_HEADERS,
    })
    .its('body')
);

/** Transfer dana lewat API (setup data). */
Cypress.Commands.add('apiTransfer', (fromAccountId, toAccountId, amount) =>
  cy.request({
    method: 'POST',
    url: `${API_BASE}/transfer`,
    qs: { fromAccountId, toAccountId, amount },
    headers: JSON_HEADERS,
  })
);

/** Ubah string mata uang ParaBank ("$1,234.56" / "-$10.00") menjadi Number. */
Cypress.Commands.add('parseCurrency', (text) =>
  cy.wrap(Number(String(text).replace(/[$,\s]/g, '')), { log: false })
);
