import LoanPage from '../PageObjects/LoanPage';

describe('Modul Request Loan ParaBank', () => {
  const loanPage = new LoanPage();
  let users;
  let testUser;
  let sourceAccountId;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });

    testUser = Cypress.env('testUser');
    cy.apiGetAccounts(testUser.customerId).then((accounts) => {
      sourceAccountId = accounts[0].id;
    });
  });

  beforeEach(() => {
    cy.loginSession(testUser);
    loanPage.visit();
  });

  // TS-LOAN001 : Pengajuan pinjaman disetujui
  describe('TS-LOAN001 : Pengajuan pinjaman disetujui', () => {
    it('TC-LOAN001 : pengajuan pinjaman disetujui ketika nominal dan uang muka wajar', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/requestLoan/).as('requestLoan');
      const loan = users.loan.approved;

      loanPage.applyForLoan(loan.amount, loan.downPayment, sourceAccountId);

      cy.wait('@requestLoan').then(({ request, response }) => {
        expect(request.url).to.include(`amount=${loan.amount}`);
        expect(request.url).to.include(`downPayment=${loan.downPayment}`);
        expect(response.statusCode).to.eq(200);
        expect(response.body).to.have.property('approved', true);
        expect(response.body.accountId).to.be.a('number');
      });

      loanPage.assertLoanApproved();
    });

    it('TC-LOAN002 : akun pinjaman baru terbentuk dan terdaftar di Accounts Overview', () => {
      const loan = users.loan.approved;

      loanPage.applyForLoan(loan.amount, loan.downPayment, sourceAccountId);
      loanPage.assertLoanApproved().assertNewAccountCreated();

      loanPage.getNewAccountId().then((newAccountId) => {
        // Akun pinjaman harus benar-benar ada dan saldonya sebesar nominal pinjaman.
        cy.apiGetAccount(newAccountId).then((account) => {
          expect(account.customerId).to.eq(testUser.customerId);
          expect(account.balance).to.eq(Number(loan.amount));
        });

        cy.apiGetAccounts(testUser.customerId).then((accounts) => {
          const accountIds = accounts.map((account) => account.id);
          expect(accountIds, 'akun pinjaman terdaftar pada customer').to.include(newAccountId);
        });
      });
    });
  });

  // TS-LOAN002 : Pengajuan pinjaman ditolak
  describe('TS-LOAN002 : Pengajuan pinjaman ditolak', () => {
    it('TC-LOAN003 : pengajuan pinjaman ditolak ketika nominal melebihi kemampuan dana', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/requestLoan/).as('requestLoan');
      const loan = users.loan.denied;

      loanPage.applyForLoan(loan.amount, loan.downPayment, sourceAccountId);

      cy.wait('@requestLoan').then(({ response }) => {
        expect(response.body).to.have.property('approved', false);
        expect(response.body).to.have.property('message', 'error.insufficient.funds');
        expect(response.body.accountId).to.be.null;
      });

      loanPage.assertLoanDenied(
        'We cannot grant a loan in that amount with your available funds.'
      );
    });

    it('TC-LOAN004 : pengajuan pinjaman ditolak ketika uang muka melebihi saldo akun', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/requestLoan/).as('requestLoan');

      cy.apiGetAccount(sourceAccountId).then((account) => {
        const downPayment = Math.round(account.balance) + 100000;

        loanPage.applyForLoan('1000', downPayment, sourceAccountId);

        cy.wait('@requestLoan')
          .its('response.body.message')
          .should('eq', 'error.insufficient.funds.for.down.payment');

        loanPage.assertLoanDenied('You do not have sufficient funds for the given down payment.');
      });
    });
  });
});
