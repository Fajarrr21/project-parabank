const elements = {
  form: () => cy.get('#updateProfileForm'),
  firstNameInput: () => cy.get('[id="customer.firstName"]'),
  lastNameInput: () => cy.get('[id="customer.lastName"]'),
  streetInput: () => cy.get('[id="customer.address.street"]'),
  cityInput: () => cy.get('[id="customer.address.city"]'),
  stateInput: () => cy.get('[id="customer.address.state"]'),
  zipCodeInput: () => cy.get('[id="customer.address.zipCode"]'),
  phoneNumberInput: () => cy.get('[id="customer.phoneNumber"]'),
  updateButton: () => cy.get('input[value="Update Profile"]'),

  result: () => cy.get('#updateProfileResult'),
  error: () => cy.get('#updateProfileError'),
  fieldError: (field) => cy.get(`#${field}-error`),
};

const REQUIRED_FIELD_ERRORS = {
  firstName: 'First name is required.',
  lastName: 'Last name is required.',
  street: 'Address is required.',
  city: 'City is required.',
  state: 'State is required.',
  zipCode: 'Zip Code is required.',
};

class ProfilePage {
  visit() {
    cy.visit('/parabank/updateprofile.htm');
    // Form diisi lewat AJAX, tunggu sampai data customer termuat.
    elements.firstNameInput().should('not.have.value', '');
    return this;
  }

  fillProfile(profile) {
    elements.firstNameInput().clear().type(profile.firstName);
    elements.lastNameInput().clear().type(profile.lastName);
    elements.streetInput().clear().type(profile.street);
    elements.cityInput().clear().type(profile.city);
    elements.stateInput().clear().type(profile.state);
    elements.zipCodeInput().clear().type(profile.zipCode);
    elements.phoneNumberInput().clear().type(profile.phoneNumber);
    return this;
  }

  clearRequiredFields() {
    elements.firstNameInput().clear();
    elements.lastNameInput().clear();
    elements.streetInput().clear();
    elements.cityInput().clear();
    elements.stateInput().clear();
    elements.zipCodeInput().clear();
    return this;
  }

  submit() {
    elements.updateButton().click();
    return this;
  }

  updateProfile(profile) {
    return this.fillProfile(profile).submit();
  }

  assertOnProfilePage() {
    cy.url().should('include', '/parabank/updateprofile.htm');
    cy.contains('h1.title', 'Update Profile').should('be.visible');
    return this;
  }

  assertProfileUpdated() {
    elements.result().should('be.visible');
    cy.contains('h1.title', 'Profile Updated').should('be.visible');
    elements.form().should('not.be.visible');
    elements.error().should('not.be.visible');
    return this;
  }

  assertProfileValues(profile) {
    elements.firstNameInput().should('have.value', profile.firstName);
    elements.lastNameInput().should('have.value', profile.lastName);
    elements.streetInput().should('have.value', profile.street);
    elements.cityInput().should('have.value', profile.city);
    elements.stateInput().should('have.value', profile.state);
    elements.zipCodeInput().should('have.value', profile.zipCode);
    elements.phoneNumberInput().should('have.value', profile.phoneNumber);
    return this;
  }

  assertAllRequiredFieldErrors() {
    Object.entries(REQUIRED_FIELD_ERRORS).forEach(([field, message]) => {
      elements.fieldError(field).should('be.visible').and('have.text', message);
    });
    return this;
  }

  assertUpdateNotSubmitted() {
    elements.form().should('be.visible');
    elements.result().should('not.be.visible');
    return this;
  }
}

export default ProfilePage;
