import './commands';
import 'cypress-mochawesome-reporter/register';

/**
 * ParaBank punya beberapa bug JavaScript di halamannya sendiri (mis. fungsi
 * showError() di openaccount.htm mereferensikan variabel `error` yang tidak
 * pernah dideklarasikan). Error-error itu tidak boleh menggagalkan test, tapi
 * kita TIDAK mematikan semua uncaught exception -- hanya yang cocok dengan
 * keyword di bawah, supaya bug asli tetap terdeteksi.
 */
const IGNORED_EXCEPTION_KEYWORDS = [
  'error is not defined',
  'visible is not defined',
  'Cannot read properties of undefined',
  'Cannot read properties of null',
];

Cypress.on('uncaught:exception', (err) => {
  const isKnownParabankNoise = IGNORED_EXCEPTION_KEYWORDS.some((keyword) =>
    err.message.includes(keyword)
  );

  if (isKnownParabankNoise) {
    return false;
  }

  return true;
});

before(() => {
  // Reset database ParaBank (idempoten, hanya dieksekusi sekali per run).
  cy.task('resetDatabase').then((result) => {
    expect(result, 'endpoint initializeDB ParaBank dapat diakses').to.have.property('ok', true);
  });

  // Setiap spec memakai customer baru dengan username unik.
  cy.registerUniqueUser();
});
