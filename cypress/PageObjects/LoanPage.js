const elements = {
  form: () => cy.get('#requestLoanForm'),
  amountInput: () => cy.get('#amount'),
  downPaymentInput: () => cy.get('#downPayment'),
  fromAccountSelect: () => cy.get('#fromAccountId'),
  applyButton: () => cy.get('input[value="Apply Now"]'),

  result: () => cy.get('#requestLoanResult'),
  loanProviderName: () => cy.get('#loanProviderName'),
  responseDate: () => cy.get('#responseDate'),
  loanStatus: () => cy.get('#loanStatus'),
  approvedPanel: () => cy.get('#loanRequestApproved'),
  deniedPanel: () => cy.get('#loanRequestDenied'),
  deniedMessage: () => cy.get('#loanRequestDenied p.error'),
  newAccountId: () => cy.get('#newAccountId'),
  error: () => cy.get('#requestLoanError'),
};

class LoanPage {
  visit() {
    cy.visit('/parabank/requestloan.htm');
    elements.fromAccountSelect().find('option').should('have.length.greaterThan', 0);
    return this;
  }

  fillAmount(amount) {
    elements.amountInput().clear().type(String(amount));
    return this;
  }

  fillDownPayment(downPayment) {
    elements.downPaymentInput().clear().type(String(downPayment));
    return this;
  }

  selectFromAccount(accountId) {
    elements.fromAccountSelect().select(String(accountId));
    return this;
  }

  submit() {
    elements.applyButton().click();
    return this;
  }

  applyForLoan(amount, downPayment, fromAccountId) {
    return this.fillAmount(amount)
      .fillDownPayment(downPayment)
      .selectFromAccount(fromAccountId)
      .submit();
  }

  assertOnLoanPage() {
    cy.url().should('include', '/parabank/requestloan.htm');
    cy.contains('h1.title', 'Apply for a Loan').should('be.visible');
    return this;
  }

  assertLoanApproved() {
    elements.result().should('be.visible');
    cy.contains('h1.title', 'Loan Request Processed').should('be.visible');
    elements.loanStatus().should('have.text', 'Approved');
    elements.approvedPanel().should('be.visible');
    elements.deniedPanel().should('not.be.visible');
    elements.loanProviderName().should('not.be.empty');
    elements.responseDate().invoke('text').should('match', /^\d{2}-\d{1,2}-\d{4}$/);
    return this;
  }

  assertLoanDenied(expectedMessage) {
    elements.result().should('be.visible');
    elements.loanStatus().should('have.text', 'Denied');
    elements.deniedPanel().should('be.visible');
    elements.approvedPanel().should('not.be.visible');
    if (expectedMessage) {
      elements.deniedMessage().should('have.text', expectedMessage);
    }
    return this;
  }

  assertNewAccountCreated() {
    elements.newAccountId().should('be.visible').invoke('text').should('match', /^\d+$/);
    return this;
  }

  /** Mengembalikan nomor akun pinjaman yang baru dibuat sebagai Number. */
  getNewAccountId() {
    return elements.newAccountId().invoke('text').then((text) => Number(text.trim()));
  }
}

export default LoanPage;
