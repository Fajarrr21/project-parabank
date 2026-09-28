const elements = {
  usernameInput: () => cy.get('input[name="username"]'),
  passwordInput: () => cy.get('input[name="password"]'),
  loginButton: () => cy.get('input[value="Log In"]'),
  registerLink: () => cy.get('a[href*="register.htm"]'),
  forgotLoginLink: () => cy.get('a[href*="lookup.htm"]'),
  logoutLink: () => cy.get('a[href*="logout.htm"]'),
  accountServicesTitle: () => cy.contains('h2', 'Account Services'),
  welcomeText: () => cy.get('p.smallText'),
  pageTitle: () => cy.get('h1.title'),
  errorMessage: () => cy.get('p.error'),
};

class LoginPage {
  visit() {
    cy.visit('/parabank/index.htm');
    return this;
  }

  /**
   * Halaman internal ParaBank mengembalikan HTTP 500 saat diakses tanpa sesi,
   * jadi status code sengaja tidak difilter supaya respon aslinya bisa diuji.
   */
  visitProtectedPage(path) {
    cy.clearCookies();
    cy.visit(path, { failOnStatusCode: false });
    return this;
  }

  fillUsername(username) {
    if (username) {
      elements.usernameInput().clear().type(username);
    } else {
      elements.usernameInput().clear();
    }
    return this;
  }

  fillPassword(password) {
    if (password) {
      elements.passwordInput().clear().type(password, { log: false });
    } else {
      elements.passwordInput().clear();
    }
    return this;
  }

  submit() {
    elements.loginButton().click();
    return this;
  }

  login(username, password) {
    return this.fillUsername(username).fillPassword(password).submit();
  }

  logout() {
    elements.logoutLink().click();
    return this;
  }

  assertLoginFormVisible() {
    elements.usernameInput().should('be.visible');
    elements.passwordInput().should('be.visible');
    elements.loginButton().should('be.visible');
    return this;
  }

  assertLoggedIn(fullName) {
    cy.url().should('include', '/parabank/overview.htm');
    elements.accountServicesTitle().should('be.visible');
    elements.welcomeText().should('contain.text', fullName);
    elements.logoutLink().should('be.visible');
    return this;
  }

  assertLoggedOut() {
    cy.url().should('include', '/parabank/index.htm');
    this.assertLoginFormVisible();
    elements.logoutLink().should('not.exist');
    return this;
  }

  assertErrorMessage(message) {
    elements.pageTitle().should('have.text', 'Error!');
    elements.errorMessage().should('be.visible').and('have.text', message);
    return this;
  }

  assertPasswordMasked() {
    elements.passwordInput().should('have.attr', 'type', 'password');
    return this;
  }

  assertRedirectedToLogin() {
    cy.url().should('match', /\/parabank\/(index\.htm)?$/);
    this.assertLoginFormVisible();
    return this;
  }
}

export default LoginPage;
