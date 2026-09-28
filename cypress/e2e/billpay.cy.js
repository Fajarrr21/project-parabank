import BillPayPage from '../PageObjects/BillPayPage';

describe('Modul Bill Pay ParaBank', () => {
  const billPayPage = new BillPayPage();
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
    billPayPage.visit();
  });

  // TS-BP001 : Pembayaran tagihan berhasil
  describe('TS-BP001 : Pembayaran tagihan berhasil', () => {
    it('TC-BP001 : pembayaran tagihan berhasil dengan data payee lengkap', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/billpay/).as('billpayRequest');
      const payee = users.payee;

      billPayPage.payBill(payee, sourceAccountId);

      cy.wait('@billpayRequest').then(({ request, response }) => {
        expect(request.url).to.include(`accountId=${sourceAccountId}`);
        expect(request.url).to.include(`amount=${payee.amount}`);
        expect(request.body).to.have.property('name', payee.name);
        expect(response.statusCode).to.eq(200);
        expect(response.body).to.include.all.keys('payeeName', 'amount', 'accountId');
      });

      billPayPage.assertPaymentSuccess(payee, payee.amount, sourceAccountId);
    });

    it('TC-BP002 : saldo akun sumber berkurang sesuai nominal pembayaran', () => {
      const payee = users.payee;

      cy.apiGetAccount(sourceAccountId).then((before) => {
        billPayPage.payBill(payee, sourceAccountId);
        billPayPage.assertPaymentSuccess(payee, payee.amount, sourceAccountId);

        cy.apiGetAccount(sourceAccountId).then((after) => {
          expect(after.balance, 'saldo berkurang sesuai nominal tagihan').to.eq(
            Number((before.balance - Number(payee.amount)).toFixed(2))
          );
        });
      });
    });
  });

  // TS-BP002 : Validasi form pembayaran
  describe('TS-BP002 : Validasi form pembayaran', () => {
    it('TC-BP003 : pembayaran ditolak ketika seluruh field wajib kosong', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/billpay/).as('billpayRequest');

      billPayPage.submit();

      billPayPage.assertAllRequiredFieldErrors().assertPaymentNotSubmitted();
      // Validasi ParaBank berjalan di sisi client, jadi request tidak boleh terkirim.
      cy.get('@billpayRequest.all').should('have.length', 0);
    });

    it('TC-BP004 : pembayaran ditolak ketika nomor rekening konfirmasi tidak cocok', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/billpay/).as('billpayRequest');
      const payee = users.payee;

      billPayPage.payBill(payee, sourceAccountId, '99999');

      billPayPage.assertVerifyAccountMismatchError().assertPaymentNotSubmitted();
      cy.get('@billpayRequest.all').should('have.length', 0);
    });
  });
});
