const elements = {
  // Open New Account
  accountTypeSelect: () => cy.get('#type'),
  fromAccountSelect: () => cy.get('#fromAccountId'),
  openAccountButton: () => cy.get('input[value="Open New Account"]'),
  openAccountForm: () => cy.get('#openAccountForm'),
  openAccountResult: () => cy.get('#openAccountResult'),
  newAccountId: () => cy.get('#newAccountId'),

  // Accounts Overview
  overviewPanel: () => cy.get('#showOverview'),
  overviewTitle: () => cy.get('#showOverview h1.title'),
  overviewError: () => cy.get('#overviewAccountsApp #showError'),
  accountTable: () => cy.get('#accountTable'),
  accountRows: () => cy.get('#accountTable tbody tr'),
  accountLinks: () => cy.get('#accountTable tbody a[href*="activity.htm?id="]'),
  accountLinkById: (accountId) => cy.get(`#accountTable tbody a[href*="activity.htm?id=${accountId}"]`),

  // Account Activity / Details
  accountDetails: () => cy.get('#accountDetails'),
  detailAccountId: () => cy.get('#accountDetails #accountId'),
  detailAccountType: () => cy.get('#accountType'),
  detailBalance: () => cy.get('#balance'),
  detailAvailableBalance: () => cy.get('#availableBalance'),
  accountActivity: () => cy.get('#accountActivity'),
  transactionRows: () => cy.get('#transactionTable tbody tr'),
  noTransactionsMessage: () => cy.get('#noTransactions'),
  pageTitle: () => cy.get('h1.title'),
};

const ACCOUNT_TYPE = {
  CHECKING: 'CHECKING',
  SAVINGS: 'SAVINGS',
};

class AccountPage {
  visitOpenAccount() {
    cy.visit('/parabank/openaccount.htm');
    // Dropdown akun sumber diisi lewat AJAX, tunggu sampai ada option.
    elements.fromAccountSelect().find('option').should('have.length.greaterThan', 0);
    return this;
  }

  visitOverview() {
    cy.visit('/parabank/overview.htm');
    elements.accountRows().should('have.length.greaterThan', 0);
    return this;
  }

  visitActivity(accountId) {
    cy.visit(`/parabank/activity.htm?id=${accountId}`);
    return this;
  }

  selectAccountType(type) {
    elements.accountTypeSelect().select(type);
    return this;
  }

  selectSourceAccount(accountId) {
    elements.fromAccountSelect().select(String(accountId));
    return this;
  }

  submitOpenAccount() {
    elements.openAccountButton().click();
    return this;
  }

  openNewAccount(type, sourceAccountId) {
    this.selectAccountType(type);
    if (sourceAccountId) {
      this.selectSourceAccount(sourceAccountId);
    }
    return this.submitOpenAccount();
  }

  openFirstAccountFromOverview() {
    elements.accountLinks().first().click();
    return this;
  }

  assertOnAccountOverview() {
    cy.url().should('include', '/parabank/overview.htm');
    elements.overviewTitle().should('contain.text', 'Accounts Overview');
    elements.overviewError().should('not.be.visible');
    elements.accountTable().should('be.visible');
    return this;
  }

  assertAccountOpened() {
    elements.openAccountResult().should('be.visible');
    elements.openAccountForm().should('not.be.visible');
    cy.contains('h1.title', 'Account Opened!').should('be.visible');
    elements.newAccountId().should('be.visible').invoke('text').should('match', /^\d+$/);
    return this;
  }

  /** Mengembalikan nomor akun baru hasil Open New Account sebagai Number. */
  getNewAccountId() {
    return elements.newAccountId().invoke('text').then((text) => Number(text.trim()));
  }

  assertOverviewShowsBalances() {
    // Baris terakhir tabel adalah baris Total, jadi minimal ada 1 akun + Total.
    elements.accountRows().should('have.length.greaterThan', 1);
    elements.accountLinks().each(($link) => {
      cy.wrap($link)
        .parent()
        .siblings()
        .first()
        .invoke('text')
        .should('match', /^-?\$\d+(\.\d{2})?$/);
    });
    elements.accountRows().last().should('contain.text', 'Total');
    return this;
  }

  assertAccountListedInOverview(accountId) {
    elements.accountLinkById(accountId).should('be.visible').and('have.text', String(accountId));
    return this;
  }

  assertOnAccountDetails(accountId, expectedType) {
    cy.url().should('include', `/parabank/activity.htm?id=${accountId}`);
    elements.accountDetails().should('be.visible');
    elements.detailAccountId().should('have.text', String(accountId));
    if (expectedType) {
      elements.detailAccountType().should('have.text', expectedType);
    }
    elements.detailBalance().invoke('text').should('match', /^-?\$\d+(\.\d{2})?$/);
    elements.detailAvailableBalance().invoke('text').should('match', /^-?\$\d+(\.\d{2})?$/);
    return this;
  }

  assertTransactionListVisible() {
    elements.accountActivity().should('be.visible');
    cy.contains('h1.title', 'Account Activity').should('be.visible');
    elements.transactionRows().should('have.length.greaterThan', 0);
    return this;
  }
}

export { ACCOUNT_TYPE };
export default AccountPage;
