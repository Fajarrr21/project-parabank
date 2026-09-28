import ProfilePage from '../PageObjects/ProfilePage';

describe('Modul Update Profile ParaBank', () => {
  const profilePage = new ProfilePage();
  let users;
  let testUser;

  before(() => {
    cy.fixture('users').then((data) => {
      users = data;
    });
    testUser = Cypress.env('testUser');
  });

  beforeEach(() => {
    cy.loginSession(testUser);
    profilePage.visit();
  });

  // TS-UP001 : Pembaruan data kontak berhasil
  describe('TS-UP001 : Pembaruan data kontak berhasil', () => {
    it('TC-UP001 : pembaruan data kontak berhasil disimpan', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/customers\/update\/\d+/).as('updateProfile');
      const updated = users.updatedProfile;

      profilePage.updateProfile(updated);

      cy.wait('@updateProfile').then(({ request, response }) => {
        expect(request.url).to.include(`customers/update/${testUser.customerId}`);
        expect(decodeURIComponent(request.url)).to.include(`firstName=${updated.firstName}`);
        expect(decodeURIComponent(request.url)).to.include(`city=${updated.city}`);
        expect(response.statusCode).to.eq(200);
      });

      profilePage.assertProfileUpdated();
    });

    it('TC-UP002 : data kontak yang tersimpan tetap muncul setelah halaman dimuat ulang', () => {
      const updated = users.updatedProfile;

      profilePage.updateProfile(updated);
      profilePage.assertProfileUpdated();

      // Muat ulang halaman: data harus diambil kembali dari server, bukan dari form.
      profilePage.visit();
      profilePage.assertProfileValues(updated);

      // Verifikasi silang lewat API supaya yakin datanya benar-benar tersimpan.
      cy.request({
        url: `/parabank/services/bank/customers/${testUser.customerId}`,
        headers: { Accept: 'application/json' },
      })
        .its('body')
        .then((customer) => {
          expect(customer.firstName).to.eq(updated.firstName);
          expect(customer.lastName).to.eq(updated.lastName);
          expect(customer.address.street).to.eq(updated.street);
          expect(customer.address.city).to.eq(updated.city);
          expect(customer.phoneNumber).to.eq(updated.phoneNumber);
        });
    });
  });

  // TS-UP002 : Validasi form profil
  describe('TS-UP002 : Validasi form profil', () => {
    it('TC-UP003 : pembaruan ditolak ketika field wajib dikosongkan tanpa mengirim request', () => {
      cy.intercept('POST', /\/services_proxy\/bank\/customers\/update\/\d+/).as('updateProfile');

      profilePage.clearRequiredFields().submit();

      profilePage.assertAllRequiredFieldErrors().assertUpdateNotSubmitted();
      // Validasi ParaBank berjalan di sisi client, request tidak boleh terkirim.
      cy.get('@updateProfile.all').should('have.length', 0);
    });
  });
});
