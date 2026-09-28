import AccountPage, { ACCOUNT_TYPE } from '../PageObjects/AccountPage';

describe('Modul Account ParaBank', () => {
  const accountPage = new AccountPage();
  let testUser;

  beforeEach(() => {
    testUser = Cypress.env('testUser');
    cy.loginSession(testUser);
  });

  // TS-ACC001 : Pembukaan akun baru
  describe('TS-ACC001 : Pembukaan akun baru', () => {
    it('TC-ACC001 : berhasil membuka akun baru bertipe CHECKING', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/createAccount/).as('createAccount');

      accountPage.visitOpenAccount().openNewAccount(ACCOUNT_TYPE.CHECKING);

      cy.wait('@createAccount').then(({ request, response }) => {
        expect(request.url).to.include('newAccountType=0');
        expect(response.statusCode).to.eq(200);
        expect(response.body).to.have.property('type', ACCOUNT_TYPE.CHECKING);
      });
      accountPage.assertAccountOpened();
    });

    it('TC-ACC002 : berhasil membuka akun baru bertipe SAVINGS', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/createAccount/).as('createAccount');

      accountPage.visitOpenAccount().openNewAccount(ACCOUNT_TYPE.SAVINGS);

      cy.wait('@createAccount').then(({ request, response }) => {
        expect(request.url).to.include('newAccountType=1');
        expect(response.body).to.have.property('type', ACCOUNT_TYPE.SAVINGS);
      });
      accountPage.assertAccountOpened();

      // Akun baru harus langsung muncul di Accounts Overview.
      accountPage.getNewAccountId().then((newAccountId) => {
        accountPage.visitOverview().assertAccountListedInOverview(newAccountId);
      });
    });
  });

  // TS-ACC002 : Accounts Overview
  describe('TS-ACC002 : Accounts Overview', () => {
    it('TC-ACC003 : Accounts Overview menampilkan daftar akun beserta saldo', () => {
      cy.intercept('GET', /\/services_proxy\/bank\/customers\/\d+\/accounts/).as('getAccounts');

      accountPage.visitOverview();

      cy.wait('@getAccounts').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body).to.be.an('array').and.have.length.greaterThan(0);
        expect(response.body[0]).to.include.all.keys('id', 'customerId', 'type', 'balance');
      });
      accountPage.assertOnAccountOverview().assertOverviewShowsBalances();
    });

    it('TC-ACC004 : klik nomor akun membuka detail akun dan daftar transaksi', () => {
      cy.apiGetAccounts(testUser.customerId).then((accounts) => {
        const account = accounts[0];

        accountPage.visitOverview().openFirstAccountFromOverview();

        accountPage
          .assertOnAccountDetails(account.id, account.type)
          .assertTransactionListVisible();
      });
    });
  });
});
