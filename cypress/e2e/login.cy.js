import LoginPage from '../PageObjects/LoginPage';

describe('Modul Login ParaBank', () => {
  const loginPage = new LoginPage();
  let users;
  let testUser;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    testUser = Cypress.env('testUser');
    loginPage.visit();
  });

  // TS-LOGIN001 : Autentikasi berhasil
  describe('TS-LOGIN001 : Autentikasi berhasil', () => {
    it('TC-LOGIN001 : login berhasil dengan kredensial valid', () => {
      cy.intercept('POST', /\/parabank\/login\.htm/).as('loginRequest');

      loginPage.login(testUser.username, testUser.password);

      cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 302]);
      loginPage.assertLoggedIn(`${testUser.firstName} ${testUser.lastName}`);
    });

    it('TC-LOGIN002 : logout mengakhiri sesi dan kembali ke halaman login', () => {
      loginPage.login(testUser.username, testUser.password);
      loginPage.assertLoggedIn(`${testUser.firstName} ${testUser.lastName}`);

      loginPage.logout();

      loginPage.assertLoggedOut();
    });
  });

  // TS-LOGIN002 : Autentikasi gagal
  describe('TS-LOGIN002 : Autentikasi gagal', () => {
    it('TC-LOGIN003 : login ditolak ketika username tidak terdaftar', () => {
      const invalid = users.invalidCredentials.wrongUsername;

      loginPage.login(invalid.username, invalid.password);

      loginPage.assertErrorMessage(users.expectedMessages.loginFailed);
    });

    it('TC-LOGIN004 : login ditolak ketika password salah', () => {
      loginPage.login(testUser.username, users.invalidCredentials.wrongPassword.password);

      loginPage.assertErrorMessage(users.expectedMessages.loginFailed);
    });

    it('TC-LOGIN005 : login ditolak ketika username dan password kosong', () => {
      cy.intercept('POST', /\/parabank\/login\.htm/).as('loginRequest');

      loginPage.login(users.invalidCredentials.empty.username, users.invalidCredentials.empty.password);

      // ParaBank memvalidasi di sisi server, jadi request tetap terkirim
      // dengan kedua field kosong. Yang diverifikasi: payload benar-benar kosong
      // dan server membalas pesan validasi, bukan pesan kredensial salah.
      cy.wait('@loginRequest').then(({ request }) => {
        expect(request.body).to.include('username=');
        expect(request.body).to.include('password=');
        expect(request.body).to.not.match(/username=[^&]+/);
      });

      loginPage.assertErrorMessage(users.expectedMessages.loginEmpty);
    });
  });

  // TS-LOGIN003 : Keamanan form login
  describe('TS-LOGIN003 : Keamanan form login', () => {
    it('TC-LOGIN006 : field password ditampilkan ter-masking', () => {
      loginPage.fillPassword(testUser.password);

      loginPage.assertPasswordMasked();
    });

    // KNOWN ISSUE (BUG-01): ParaBank tidak punya guard autentikasi. Halaman
    // internal tetap dilayani (dengan HTTP 500 "An internal error has occurred")
    // alih-alih redirect ke halaman login. Test sengaja dibiarkan merah supaya
    // mencerminkan expected behavior yang benar.
    it('TC-LOGIN007 : akses halaman internal tanpa login diarahkan ke halaman login', () => {
      loginPage.visitProtectedPage('/parabank/overview.htm');

      loginPage.assertRedirectedToLogin();
    });
  });
});
