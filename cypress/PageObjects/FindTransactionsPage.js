const elements = {
  formContainer: () => cy.get('#formContainer'),
  accountSelect: () => cy.get('#accountId'),

  transactionIdInput: () => cy.get('#transactionId'),
  findByIdButton: () => cy.get('#findById'),
  transactionIdError: () => cy.get('#transactionIdError'),

  transactionDateInput: () => cy.get('#transactionDate'),
  findByDateButton: () => cy.get('#findByDate'),
  transactionDateError: () => cy.get('#transactionDateError'),

  fromDateInput: () => cy.get('#fromDate'),
  toDateInput: () => cy.get('#toDate'),
  findByDateRangeButton: () => cy.get('#findByDateRange'),
  dateRangeError: () => cy.get('#dateRangeError'),

  amountInput: () => cy.get('#amount'),
  findByAmountButton: () => cy.get('#findByAmount'),
  amountError: () => cy.get('#amountError'),

  resultContainer: () => cy.get('#resultContainer'),
  resultRows: () => cy.get('#transactionBody tr'),
  errorContainer: () => cy.get('#errorContainer'),
};

class FindTransactionsPage {
  visit() {
    cy.visit('/parabank/findtrans.htm');
    elements.accountSelect().find('option').should('have.length.greaterThan', 0);
    return this;
  }

  selectAccount(accountId) {
    elements.accountSelect().select(String(accountId));
    return this;
  }

  findByTransactionId(transactionId) {
    elements.transactionIdInput().clear().type(String(transactionId));
    elements.findByIdButton().click();
    return this;
  }

  findByDate(date) {
    elements.transactionDateInput().clear().type(date);
    elements.findByDateButton().click();
    return this;
  }

  findByDateRange(fromDate, toDate) {
    elements.fromDateInput().clear().type(fromDate);
    elements.toDateInput().clear().type(toDate);
    elements.findByDateRangeButton().click();
    return this;
  }

  findByAmount(amount) {
    elements.amountInput().clear().type(String(amount));
    elements.findByAmountButton().click();
    return this;
  }

  assertOnFindTransactionsPage() {
    cy.url().should('include', '/parabank/findtrans.htm');
    cy.contains('h1.title', 'Find Transactions').should('be.visible');
    return this;
  }

  assertResultCount(expectedCount) {
    elements.resultContainer().should('be.visible');
    elements.resultRows().should('have.length', expectedCount);
    return this;
  }

  assertResultContains(text) {
    elements.resultContainer().should('be.visible').and('contain.text', text);
    return this;
  }

  assertEmptyResult() {
    elements.resultContainer().should('be.visible');
    elements.resultRows().should('have.length', 0);
    elements.errorContainer().should('not.be.visible');
    return this;
  }

  assertAmountValidationError(message) {
    elements.amountError().should('be.visible').and('have.text', message);
    return this;
  }

  assertDateValidationError(message) {
    elements.transactionDateError().should('be.visible').and('have.text', message);
    return this;
  }

  assertSearchFormStillVisible() {
    elements.formContainer().should('be.visible');
    elements.resultContainer().should('not.be.visible');
    return this;
  }
}

export default FindTransactionsPage;
