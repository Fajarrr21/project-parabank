const elements = {
  form: () => cy.get('#showForm'),
  formTitle: () => cy.get('#showForm h1.title'),
  amountInput: () => cy.get('#amount'),
  fromAccountSelect: () => cy.get('#fromAccountId'),
  toAccountSelect: () => cy.get('#toAccountId'),
  transferButton: () => cy.get('input[value="Transfer"]'),
  result: () => cy.get('#showResult'),
  resultTitle: () => cy.get('#showResult h1.title'),
  resultAmount: () => cy.get('#amountResult'),
  resultFromAccount: () => cy.get('#fromAccountIdResult'),
  resultToAccount: () => cy.get('#toAccountIdResult'),
  error: () => cy.get('#transferApp #showError'),
  errorMessage: () => cy.get('#transferApp #showError p.error'),
};

class TransferPage {
  visit() {
    cy.visit('/parabank/transfer.htm');
    // Dropdown akun diisi lewat AJAX.
    elements.fromAccountSelect().find('option').should('have.length.greaterThan', 0);
    return this;
  }

  fillAmount(amount) {
    if (String(amount).length > 0) {
      elements.amountInput().clear().type(String(amount));
    } else {
      elements.amountInput().clear();
    }
    return this;
  }

  selectFromAccount(accountId) {
    elements.fromAccountSelect().select(String(accountId));
    return this;
  }

  selectToAccount(accountId) {
    elements.toAccountSelect().select(String(accountId));
    return this;
  }

  submit() {
    elements.transferButton().click();
    return this;
  }

  transfer(amount, fromAccountId, toAccountId) {
    return this.fillAmount(amount)
      .selectFromAccount(fromAccountId)
      .selectToAccount(toAccountId)
      .submit();
  }

  assertOnTransferPage() {
    cy.url().should('include', '/parabank/transfer.htm');
    elements.formTitle().should('contain.text', 'Transfer Funds');
    return this;
  }

  assertTransferSuccess(amount, fromAccountId, toAccountId) {
    elements.result().should('be.visible');
    elements.resultTitle().should('contain.text', 'Transfer Complete!');
    elements.resultAmount().should('have.text', `$${Number(amount).toFixed(2)}`);
    elements.resultFromAccount().should('have.text', String(fromAccountId));
    elements.resultToAccount().should('have.text', String(toAccountId));
    return this;
  }

  /** Transfer seharusnya ditolak: form tetap tampil dan hasil sukses tidak muncul. */
  assertTransferRejected() {
    elements.result().should('not.be.visible');
    elements.form().should('be.visible');
    return this;
  }

  assertErrorDisplayed() {
    elements.error().should('be.visible');
    return this;
  }
}

export default TransferPage;
