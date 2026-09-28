const elements = {
  form: () => cy.get('#billpayForm'),
  payeeNameInput: () => cy.get('input[name="payee.name"]'),
  streetInput: () => cy.get('input[name="payee.address.street"]'),
  cityInput: () => cy.get('input[name="payee.address.city"]'),
  stateInput: () => cy.get('input[name="payee.address.state"]'),
  zipCodeInput: () => cy.get('input[name="payee.address.zipCode"]'),
  phoneNumberInput: () => cy.get('input[name="payee.phoneNumber"]'),
  accountNumberInput: () => cy.get('input[name="payee.accountNumber"]'),
  verifyAccountInput: () => cy.get('input[name="verifyAccount"]'),
  amountInput: () => cy.get('input[name="amount"]'),
  fromAccountSelect: () => cy.get('select[name="fromAccountId"]'),
  sendPaymentButton: () => cy.get('input[value="Send Payment"]'),

  result: () => cy.get('#billpayResult'),
  resultPayeeName: () => cy.get('#billpayResult #payeeName'),
  resultAmount: () => cy.get('#billpayResult #amount'),
  resultFromAccount: () => cy.get('#billpayResult #fromAccountId'),
  error: () => cy.get('#billpayError'),

  validationMessage: (key) => cy.get(`#validationModel-${key}`),
};

const REQUIRED_FIELD_MESSAGES = {
  name: 'Payee name is required.',
  address: 'Address is required.',
  city: 'City is required.',
  state: 'State is required.',
  zipCode: 'Zip Code is required.',
  phoneNumber: 'Phone number is required.',
  'account-empty': 'Account number is required.',
  'verifyAccount-empty': 'Account number is required.',
  'amount-empty': 'The amount cannot be empty.',
};

class BillPayPage {
  visit() {
    cy.visit('/parabank/billpay.htm');
    elements.fromAccountSelect().find('option').should('have.length.greaterThan', 0);
    return this;
  }

  fillPayee(payee) {
    elements.payeeNameInput().clear().type(payee.name);
    elements.streetInput().clear().type(payee.street);
    elements.cityInput().clear().type(payee.city);
    elements.stateInput().clear().type(payee.state);
    elements.zipCodeInput().clear().type(payee.zipCode);
    elements.phoneNumberInput().clear().type(payee.phoneNumber);
    return this;
  }

  fillAccountNumber(accountNumber, verifyAccountNumber = accountNumber) {
    elements.accountNumberInput().clear().type(accountNumber);
    elements.verifyAccountInput().clear().type(verifyAccountNumber);
    return this;
  }

  fillAmount(amount) {
    elements.amountInput().clear().type(String(amount));
    return this;
  }

  selectFromAccount(accountId) {
    elements.fromAccountSelect().select(String(accountId));
    return this;
  }

  submit() {
    elements.sendPaymentButton().click();
    return this;
  }

  payBill(payee, fromAccountId, verifyAccountNumber = payee.accountNumber) {
    return this.fillPayee(payee)
      .fillAccountNumber(payee.accountNumber, verifyAccountNumber)
      .fillAmount(payee.amount)
      .selectFromAccount(fromAccountId)
      .submit();
  }

  assertOnBillPayPage() {
    cy.url().should('include', '/parabank/billpay.htm');
    cy.contains('h1.title', 'Bill Payment Service').should('be.visible');
    return this;
  }

  assertPaymentSuccess(payee, amount, fromAccountId) {
    elements.result().should('be.visible');
    cy.contains('h1.title', 'Bill Payment Complete').should('be.visible');
    elements.resultPayeeName().should('have.text', payee.name);
    elements.resultAmount().should('have.text', `$${Number(amount).toFixed(2)}`);
    elements.resultFromAccount().should('have.text', String(fromAccountId));
    return this;
  }

  assertAllRequiredFieldErrors() {
    Object.entries(REQUIRED_FIELD_MESSAGES).forEach(([key, message]) => {
      elements.validationMessage(key).should('be.visible').and('contain.text', message);
    });
    return this;
  }

  assertVerifyAccountMismatchError() {
    elements
      .validationMessage('verifyAccount-mismatch')
      .should('be.visible')
      .and('have.text', 'The account numbers do not match.');
    return this;
  }

  assertPaymentNotSubmitted() {
    elements.form().should('be.visible');
    elements.result().should('not.be.visible');
    return this;
  }
}

export default BillPayPage;
