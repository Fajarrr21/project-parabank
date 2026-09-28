import TransferPage from '../PageObjects/TransferPage';

describe('Modul Transfer Funds ParaBank', () => {
  const transferPage = new TransferPage();
  let users;
  let testUser;
  let sourceAccountId;
  let targetAccountId;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });

    // Setup data lewat API: customer baru hanya punya 1 akun, sementara
    // transfer butuh 2 akun. Dibuat lewat API supaya lebih cepat dan stabil.
    testUser = Cypress.env('testUser');
    cy.apiGetAccounts(testUser.customerId).then((accounts) => {
      sourceAccountId = accounts[0].id;
      cy.apiCreateAccount(testUser.customerId, 0, sourceAccountId).then((newAccount) => {
        targetAccountId = newAccount.id;
      });
    });
  });

  beforeEach(() => {
    cy.loginSession(testUser);
    transferPage.visit();
  });

  // TS-TRF001 : Transfer dana berhasil
  describe('TS-TRF001 : Transfer dana berhasil', () => {
    it('TC-TRF001 : transfer antar akun sendiri berhasil dan saldo terupdate', () => {
      const amount = Number(users.transfer.validAmount);
      cy.intercept('POST', /\/services_proxy\/bank\/transfer/).as('transferRequest');

      cy.apiGetAccount(sourceAccountId).then((sourceBefore) => {
        cy.apiGetAccount(targetAccountId).then((targetBefore) => {
          transferPage.transfer(amount, sourceAccountId, targetAccountId);

          cy.wait('@transferRequest').then(({ request, response }) => {
            expect(request.url).to.include(`fromAccountId=${sourceAccountId}`);
            expect(request.url).to.include(`toAccountId=${targetAccountId}`);
            expect(request.url).to.include(`amount=${amount}`);
            expect(response.statusCode).to.eq(200);
          });

          transferPage.assertTransferSuccess(amount, sourceAccountId, targetAccountId);

          cy.apiGetAccount(sourceAccountId).then((sourceAfter) => {
            expect(sourceAfter.balance, 'saldo akun sumber berkurang').to.eq(
              Number((sourceBefore.balance - amount).toFixed(2))
            );
          });
          cy.apiGetAccount(targetAccountId).then((targetAfter) => {
            expect(targetAfter.balance, 'saldo akun tujuan bertambah').to.eq(
              Number((targetBefore.balance + amount).toFixed(2))
            );
          });
        });
      });
    });
  });

  // TS-TRF002 : Validasi nominal transfer
  describe('TS-TRF002 : Validasi nominal transfer', () => {
    // KNOWN ISSUE (BUG-02): ParaBank menerima transfer dengan nominal 0 dan
    // tetap mencatatnya sebagai transaksi. Seharusnya ditolak sebagai input
    // tidak valid. Assertion memakai status response agar deterministik --
    // memeriksa DOM saja bisa lolos palsu sebelum AJAX selesai diproses.
    it('TC-TRF002 : transfer dengan nominal 0 ditolak', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/transfer/).as('transferRequest');

      transferPage.transfer(users.transfer.zeroAmount, sourceAccountId, targetAccountId);

      cy.wait('@transferRequest')
        .its('response.statusCode')
        .should('be.gte', 400);
      transferPage.assertTransferRejected();
    });

    // KNOWN ISSUE (BUG-03): ParaBank menerima transfer dengan nominal negatif.
    // Efeknya arah transfer terbalik tanpa validasi apa pun.
    it('TC-TRF003 : transfer dengan nominal negatif ditolak', () => {
      const amount = Number(users.transfer.negativeAmount);
      cy.intercept('POST', /\/services_proxy\/bank\/transfer/).as('transferRequest');

      cy.apiGetAccount(sourceAccountId).then((sourceBefore) => {
        transferPage.transfer(amount, sourceAccountId, targetAccountId);

        cy.wait('@transferRequest')
          .its('response.statusCode')
          .should('be.gte', 400);

        cy.apiGetAccount(sourceAccountId).then((sourceAfter) => {
          expect(sourceAfter.balance, 'saldo akun sumber tidak berubah').to.eq(
            sourceBefore.balance
          );
        });
        transferPage.assertTransferRejected();
      });
    });

    // KNOWN ISSUE (BUG-04): ParaBank tidak memeriksa kecukupan saldo, akun
    // sumber dibiarkan menjadi saldo negatif setelah transfer.
    it('TC-TRF004 : transfer melebihi saldo akun sumber ditolak', () => {
      const amount = Number(users.transfer.overBalanceAmount);
      cy.intercept('POST', /\/services_proxy\/bank\/transfer/).as('transferRequest');

      cy.apiGetAccount(sourceAccountId).then((sourceBefore) => {
        expect(sourceBefore.balance, 'nominal uji harus melebihi saldo').to.be.lessThan(amount);

        transferPage.transfer(amount, sourceAccountId, targetAccountId);

        cy.wait('@transferRequest')
          .its('response.statusCode')
          .should('be.gte', 400);

        cy.apiGetAccount(sourceAccountId).then((sourceAfter) => {
          expect(sourceAfter.balance, 'saldo akun sumber tidak berubah').to.eq(
            sourceBefore.balance
          );
        });
        transferPage.assertTransferRejected();
      });
    });
  });
});
