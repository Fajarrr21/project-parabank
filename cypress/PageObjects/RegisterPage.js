const elements = {
  firstNameInput: () => cy.get('[id="customer.firstName"]'),
  lastNameInput: () => cy.get('[id="customer.lastName"]'),
  streetInput: () => cy.get('[id="customer.address.street"]'),
  cityInput: () => cy.get('[id="customer.address.city"]'),
  stateInput: () => cy.get('[id="customer.address.state"]'),
  zipCodeInput: () => cy.get('[id="customer.address.zipCode"]'),
  phoneNumberInput: () => cy.get('[id="customer.phoneNumber"]'),
  ssnInput: () => cy.get('[id="customer.ssn"]'),
  usernameInput: () => cy.get('[id="customer.username"]'),
  passwordInput: () => cy.get('[id="customer.password"]'),
  confirmPasswordInput: () => cy.get('[id="repeatedPassword"]'),
  registerButton: () => cy.get('input[value="Register"]'),
  pageTitle: () => cy.get('h1.title'),
  successMessage: () => cy.get('#rightPanel p'),
  fieldError: (fieldId) => cy.get(`[id="${fieldId}.errors"]`),
};

const REQUIRED_FIELD_ERRORS = {
  'customer.firstName': 'First name is required.',
  'customer.lastName': 'Last name is required.',
  'customer.address.street': 'Address is required.',
  'customer.address.city': 'City is required.',
  'customer.address.state': 'State is required.',
  'customer.address.zipCode': 'Zip Code is required.',
  'customer.ssn': 'Social Security Number is required.',
  'customer.username': 'Username is required.',
  'customer.password': 'Password is required.',
  repeatedPassword: 'Password confirmation is required.',
};

class RegisterPage {
  visit() {
    cy.visit('/parabank/register.htm');
    return this;
  }

  fillPersonalData(profile) {
    elements.firstNameInput().clear().type(profile.firstName);
    elements.lastNameInput().clear().type(profile.lastName);
    elements.streetInput().clear().type(profile.street);
    elements.cityInput().clear().type(profile.city);
    elements.stateInput().clear().type(profile.state);
    elements.zipCodeInput().clear().type(profile.zipCode);
    elements.phoneNumberInput().clear().type(profile.phoneNumber);
    elements.ssnInput().clear().type(profile.ssn);
    return this;
  }

  fillCredentials(username, password, confirmPassword) {
    elements.usernameInput().clear().type(username);
    elements.passwordInput().clear().type(password, { log: false });
    elements.confirmPasswordInput().clear().type(confirmPassword, { log: false });
    return this;
  }

  submit() {
    elements.registerButton().click();
    return this;
  }

  register(profile, username, password, confirmPassword = password) {
    return this.fillPersonalData(profile)
      .fillCredentials(username, password, confirmPassword)
      .submit();
  }

  assertRegistrationSuccess(username, message) {
    elements.pageTitle().should('have.text', `Welcome ${username}`);
    elements.successMessage().should('contain.text', message);
    return this;
  }

  assertFieldError(fieldId, message) {
    elements.fieldError(fieldId).should('be.visible').and('have.text', message);
    return this;
  }

  assertAllRequiredFieldErrors() {
    Object.entries(REQUIRED_FIELD_ERRORS).forEach(([fieldId, message]) => {
      this.assertFieldError(fieldId, message);
    });
    return this;
  }

  assertStillOnRegisterForm() {
    cy.url().should('include', '/parabank/register.htm');
    elements.registerButton().should('be.visible');
    return this;
  }
}

export default RegisterPage;
