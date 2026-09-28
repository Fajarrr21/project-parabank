const API_BASE = '/parabank/services/bank';
const JSON_HEADERS = { Accept: 'application/json' };

describe('Modul API ParaBank (REST /services/bank)', () => {
  let users;
  let testUser;
  let accounts;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });

    testUser = Cypress.env('testUser');
    cy.apiGetAccounts(testUser.customerId).then((data) => {
      accounts = data;
    });
  });

  // TS-API001 : Autentikasi customer
  describe('TS-API001 : Autentikasi customer', () => {
    it('TC-API001 : GET login mengembalikan data customer untuk kredensial valid', () => {
      cy.request({
        url: `${API_BASE}/login/${testUser.username}/${testUser.password}`,
        headers: JSON_HEADERS,
      }).then(({ status, headers, body }) => {
        expect(status).to.eq(200);
        expect(headers['content-type']).to.include('application/json');

        expect(body).to.be.an('object');
        expect(body.id).to.be.a('number').and.to.eq(testUser.customerId);
        expect(body.firstName).to.be.a('string').and.to.eq(testUser.firstName);
        expect(body.lastName).to.be.a('string').and.to.eq(testUser.lastName);
        expect(body).to.have.property('address').that.is.an('object');
        expect(body.address).to.include.all.keys('street', 'city', 'state', 'zipCode');
        expect(body.phoneNumber).to.be.a('string');
      });
    });

    it('TC-API002 : GET login menolak kredensial yang salah', () => {
      cy.request({
        url: `${API_BASE}/login/${testUser.username}/PasswordSalah999`,
        headers: JSON_HEADERS,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.eq(400);
        expect(body).to.be.a('string').and.to.contain('Invalid username and/or password');
      });
    });
  });

  // TS-API002 : Data akun customer
  describe('TS-API002 : Data akun customer', () => {
    it('TC-API003 : GET accounts mengembalikan seluruh akun milik customer', () => {
      cy.request({
        url: `${API_BASE}/customers/${testUser.customerId}/accounts`,
        headers: JSON_HEADERS,
      }).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.be.an('array').and.to.have.length.greaterThan(0);

        body.forEach((account) => {
          expect(account.id).to.be.a('number');
          expect(account.customerId).to.be.a('number').and.to.eq(testUser.customerId);
          expect(account.type).to.be.a('string').and.to.be.oneOf(['CHECKING', 'SAVINGS', 'LOAN']);
          expect(account.balance).to.be.a('number');
        });
      });
    });

    it('TC-API004 : GET account mengembalikan detail satu akun', () => {
      const expectedAccount = accounts[0];

      cy.request({
        url: `${API_BASE}/accounts/${expectedAccount.id}`,
        headers: JSON_HEADERS,
      }).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.be.an('object');
        expect(body).to.have.all.keys('id', 'customerId', 'type', 'balance');
        expect(body.id).to.eq(expectedAccount.id);
        expect(body.customerId).to.eq(testUser.customerId);
      });
    });
  });

  // TS-API003 : Transaksi transfer dana
  describe('TS-API003 : Transaksi transfer dana', () => {
    it('TC-API005 : POST transfer memindahkan dana dan saldo terverifikasi lewat GET', () => {
      const amount = Number(users.transfer.validAmount);

      cy.apiCreateAccount(testUser.customerId, 1, accounts[0].id).then((targetAccount) => {
        cy.apiGetAccount(accounts[0].id).then((sourceBefore) => {
          cy.apiGetAccount(targetAccount.id).then((targetBefore) => {
            cy.request({
              method: 'POST',
              url: `${API_BASE}/transfer`,
              qs: { fromAccountId: accounts[0].id, toAccountId: targetAccount.id, amount },
              headers: JSON_HEADERS,
            }).then(({ status, body }) => {
              expect(status).to.eq(200);
              expect(body).to.be.a('string');
              expect(body).to.contain(`Successfully transferred $${amount}`);
              expect(body).to.contain(`from account #${accounts[0].id}`);
              expect(body).to.contain(`to account #${targetAccount.id}`);
            });

            cy.apiGetAccount(accounts[0].id).then((sourceAfter) => {
              expect(sourceAfter.balance).to.eq(
                Number((sourceBefore.balance - amount).toFixed(2))
              );
            });

            cy.apiGetAccount(targetAccount.id).then((targetAfter) => {
              expect(targetAfter.balance).to.eq(
                Number((targetBefore.balance + amount).toFixed(2))
              );
            });
          });
        });
      });
    });

    it('TC-API006 : GET transactions by amount mengembalikan transaksi dengan nominal yang sesuai', () => {
      const amount = Number(users.findTransactions.seedAmount);

      cy.apiCreateAccount(testUser.customerId, 0, accounts[0].id).then((targetAccount) => {
        cy.apiTransfer(accounts[0].id, targetAccount.id, amount);

        cy.request({
          url: `${API_BASE}/accounts/${targetAccount.id}/transactions/amount/${amount}`,
          headers: JSON_HEADERS,
        }).then(({ status, body }) => {
          expect(status).to.eq(200);
          expect(body).to.be.an('array').and.to.have.length(1);

          const transaction = body[0];
          expect(transaction.id).to.be.a('number');
          expect(transaction.accountId).to.be.a('number').and.to.eq(targetAccount.id);
          expect(transaction.type).to.be.a('string').and.to.eq('Credit');
          expect(transaction.date).to.be.a('number');
          expect(transaction.amount).to.be.a('number').and.to.eq(amount);
          expect(transaction.description).to.be.a('string').and.to.eq('Funds Transfer Received');
        });
      });
    });
  });

  // TS-API004 : Penanganan request tidak valid
  describe('TS-API004 : Penanganan request tidak valid', () => {
    it('TC-API007 : GET account dengan ID yang tidak ada mengembalikan 400 beserta pesan error', () => {
      const missingAccountId = 99999999;

      cy.request({
        url: `${API_BASE}/accounts/${missingAccountId}`,
        headers: JSON_HEADERS,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        expect(status).to.eq(400);
        expect(body).to.be.a('string');
        expect(body).to.contain(`Could not find account #${missingAccountId}`);
      });
    });
  });
});
