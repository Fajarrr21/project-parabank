import FindTransactionsPage from '../PageObjects/FindTransactionsPage';

/**
 * Format epoch (UTC) menjadi MM-DD-YYYY sesuai format yang diminta ParaBank.
 * Sengaja memakai UTC karena ParaBank menyimpan tanggal transaksi pada
 * tengah malam UTC, sehingga hasilnya tidak bergeser oleh timezone runner.
 */
const toParabankDate = (epochMillis) => {
  const date = new Date(epochMillis);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${month}-${day}-${date.getUTCFullYear()}`;
};

describe('Modul Find Transactions ParaBank', () => {
  const findTransactionsPage = new FindTransactionsPage();
  let users;
  let testUser;
  let targetAccountId;
  let seedTransaction;
  let seedDate;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });

    // Setup data lewat API: buat akun kedua lalu kirim transfer dengan nominal
    // unik supaya hasil pencarian bisa diprediksi.
    testUser = Cypress.env('testUser');
    cy.fixture('users').then((data) => {
      cy.apiGetAccounts(testUser.customerId).then((accounts) => {
        const sourceAccountId = accounts[0].id;

        cy.apiCreateAccount(testUser.customerId, 0, sourceAccountId).then((newAccount) => {
          targetAccountId = newAccount.id;

          cy.apiTransfer(sourceAccountId, targetAccountId, data.findTransactions.seedAmount).then(
            () => {
              cy.request({
                url: `/parabank/services/bank/accounts/${targetAccountId}/transactions/amount/${data.findTransactions.seedAmount}`,
                headers: { Accept: 'application/json' },
              })
                .its('body')
                .then((transactions) => {
                  expect(transactions, 'transaksi seed terbentuk').to.have.length.greaterThan(0);
                  seedTransaction = transactions[0];
                  seedDate = toParabankDate(seedTransaction.date);
                });
            }
          );
        });
      });
    });
  });

  beforeEach(() => {
    cy.loginSession(testUser);
    findTransactionsPage.visit().selectAccount(targetAccountId);
  });

  // TS-FT001 : Pencarian transaksi ditemukan
  describe('TS-FT001 : Pencarian transaksi ditemukan', () => {
    it('TC-FT001 : pencarian berdasarkan transaction ID menampilkan transaksi yang sesuai', () => {
      cy.intercept('GET', /\/services_proxy\/bank\/transactions\/\d+/).as('findById');

      findTransactionsPage.findByTransactionId(seedTransaction.id);

      cy.wait('@findById').then(({ response }) => {
        expect(response.statusCode).to.eq(200);
        expect(response.body).to.have.property('id', seedTransaction.id);
      });
      findTransactionsPage.assertResultCount(1).assertResultContains('Funds Transfer Received');
    });

    it('TC-FT002 : pencarian berdasarkan tanggal menampilkan transaksi pada tanggal tersebut', () => {
      cy.intercept('GET', /\/transactions\/onDate\//).as('findByDate');

      findTransactionsPage.findByDate(seedDate);

      cy.wait('@findByDate').then(({ request, response }) => {
        expect(request.url).to.include(`onDate/${seedDate}`);
        expect(response.body).to.be.an('array').and.have.length.greaterThan(0);
      });
      findTransactionsPage.assertResultContains(seedDate);
    });

    it('TC-FT003 : pencarian berdasarkan rentang tanggal menampilkan transaksi di dalam rentang', () => {
      cy.intercept('GET', /\/transactions\/fromDate\//).as('findByDateRange');

      findTransactionsPage.findByDateRange(seedDate, seedDate);

      cy.wait('@findByDateRange').then(({ response }) => {
        expect(response.body).to.be.an('array').and.have.length.greaterThan(0);
        response.body.forEach((transaction) => {
          expect(toParabankDate(transaction.date)).to.eq(seedDate);
        });
      });
      findTransactionsPage.assertResultContains(seedDate);
    });

    it('TC-FT004 : pencarian berdasarkan nominal menampilkan transaksi dengan nominal tersebut', () => {
      cy.intercept('GET', /\/transactions\/amount\//).as('findByAmount');
      const amount = users.findTransactions.seedAmount;

      findTransactionsPage.findByAmount(amount);

      cy.wait('@findByAmount').then(({ response }) => {
        expect(response.body).to.be.an('array').and.have.length(1);
        expect(Number(response.body[0].amount)).to.eq(Number(amount));
      });
      findTransactionsPage
        .assertResultCount(1)
        .assertResultContains(`$${Number(amount).toFixed(2)}`);
    });
  });

  // TS-FT002 : Pencarian tanpa hasil dan validasi input
  describe('TS-FT002 : Pencarian tanpa hasil dan validasi input', () => {
    it('TC-FT005 : pencarian dengan nominal yang tidak ada menampilkan hasil kosong', () => {
      cy.intercept('GET', /\/transactions\/amount\//).as('findByAmount');

      findTransactionsPage.findByAmount(users.findTransactions.nonExistentAmount);

      cy.wait('@findByAmount').its('response.body').should('have.length', 0);
      findTransactionsPage.assertEmptyResult();
    });

    it('TC-FT006 : pencarian dengan format tanggal tidak valid ditolak tanpa mengirim request', () => {
      cy.intercept('GET', /\/transactions\/onDate\//).as('findByDate');

      findTransactionsPage.findByDate(users.findTransactions.invalidDate);

      findTransactionsPage.assertDateValidationError('Invalid date format');
      findTransactionsPage.assertSearchFormStillVisible();
      cy.get('@findByDate.all').should('have.length', 0);
    });
  });
});
