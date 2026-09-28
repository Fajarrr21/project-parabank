import RegisterPage from '../PageObjects/RegisterPage';

describe('Modul Register ParaBank', () => {
  const registerPage = new RegisterPage();
  let users;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    registerPage.visit();
  });

  // TS-REG001 : Registrasi berhasil
  describe('TS-REG001 : Registrasi berhasil', () => {
    it('TC-REG001 : pendaftaran akun baru berhasil dengan data lengkap', () => {
      cy.intercept('POST', /\/parabank\/register\.htm/).as('registerRequest');
      const newUsername = `qa${Date.now()}`;

      registerPage.register(users.profile, newUsername, users.defaultPassword);

      cy.wait('@registerRequest').its('response.statusCode').should('eq', 200);
      registerPage.assertRegistrationSuccess(newUsername, users.expectedMessages.registerSuccess);
    });
  });

  // TS-REG002 : Validasi registrasi
  describe('TS-REG002 : Validasi registrasi', () => {
    it('TC-REG002 : pendaftaran ditolak ketika username sudah terdaftar', () => {
      const existingUsername = Cypress.env('testUser').username;

      registerPage.register(users.profile, existingUsername, users.defaultPassword);

      registerPage.assertFieldError('customer.username', users.expectedMessages.usernameExists);
      registerPage.assertStillOnRegisterForm();
    });

    it('TC-REG003 : pendaftaran ditolak ketika seluruh field wajib kosong', () => {
      registerPage.submit();

      registerPage.assertAllRequiredFieldErrors();
      registerPage.assertStillOnRegisterForm();
    });

    it('TC-REG004 : pendaftaran ditolak ketika konfirmasi password tidak cocok', () => {
      const newUsername = `qa${Date.now()}`;

      registerPage.register(users.profile, newUsername, users.defaultPassword, 'PasswordBeda456');

      registerPage.assertFieldError('repeatedPassword', users.expectedMessages.passwordMismatch);
      registerPage.assertStillOnRegisterForm();
    });
  });
});
