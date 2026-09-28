# ParaBank Automation Testing (Cypress)

<!-- CI Badge: isi setelah repository dibuat -->
<!-- [![Cypress E2E Tests](https://github.com/<user>/<repo>/actions/workflows/cypress.yml/badge.svg)](https://github.com/<user>/<repo>/actions/workflows/cypress.yml) -->
<!-- Live report: https://<user>.github.io/<repo>/ -->


Automation testing untuk **ParaBank**, aplikasi demo online banking milik Parasoft.
Project ini dibangun sebagai portfolio QA Engineer dengan penekanan pada struktur
yang rapi, data uji yang aman dijalankan berulang kali, dan test yang jujur
melaporkan bug aplikasi apa adanya.

**Target aplikasi:** <https://parabank.parasoft.com/parabank/index.htm>

---

## Tech Stack

| Komponen | Versi / Tools |
|---|---|
| Test runner | Cypress 15 (JavaScript, CommonJS) |
| Design pattern | Page Object Model |
| Reporter | cypress-mochawesome-reporter (HTML + charts) |
| CI | GitHub Actions (Node 22, browser Chrome) |
| Runtime | Node.js 22+ |

---

## Coverage

Total: **9 spec, 43 test case**: 39 pass, 4 fail. Seluruh kegagalan berasal dari
bug aplikasi ParaBank, bukan dari script. Detail di bagian [Known Issue](#known-issue).

| No | Modul | Spec | Jumlah Test | Hasil |
|---|---|---|---|---|
| 1 | Login | `cypress/e2e/login.cy.js` | 7 | 6 pass, 1 fail (BUG-01) |
| 2 | Register | `cypress/e2e/register.cy.js` | 4 | 4 pass |
| 3 | Account | `cypress/e2e/account.cy.js` | 4 | 4 pass |
| 4 | Transfer Funds | `cypress/e2e/transfer.cy.js` | 4 | 1 pass, 3 fail (BUG-02, BUG-03, BUG-04) |
| 5 | Bill Pay | `cypress/e2e/billpay.cy.js` | 4 | 4 pass |
| 6 | Find Transactions | `cypress/e2e/find-transactions.cy.js` | 6 | 6 pass |
| 7 | Request Loan | `cypress/e2e/loan.cy.js` | 4 | 4 pass |
| 8 | Update Profile | `cypress/e2e/update-profile.cy.js` | 3 | 3 pass |
| 9 | API (REST) | `cypress/e2e/api/parabank-api.cy.js` | 7 | 7 pass |

### Rincian test case

**Login (TS-LOGIN001 s/d TS-LOGIN003)**

| ID | Deskripsi |
|---|---|
| TC-LOGIN001 | Login berhasil dengan kredensial valid |
| TC-LOGIN002 | Logout mengakhiri sesi dan kembali ke halaman login |
| TC-LOGIN003 | Login ditolak ketika username tidak terdaftar |
| TC-LOGIN004 | Login ditolak ketika password salah |
| TC-LOGIN005 | Login ditolak ketika username dan password kosong |
| TC-LOGIN006 | Field password ditampilkan ter-masking |
| TC-LOGIN007 | Akses halaman internal tanpa login diarahkan ke halaman login. **Fail (BUG-01)** |

**Register (TS-REG001, TS-REG002)**

| ID | Deskripsi |
|---|---|
| TC-REG001 | Pendaftaran akun baru berhasil dengan data lengkap |
| TC-REG002 | Pendaftaran ditolak ketika username sudah terdaftar |
| TC-REG003 | Pendaftaran ditolak ketika seluruh field wajib kosong |
| TC-REG004 | Pendaftaran ditolak ketika konfirmasi password tidak cocok |

**Account (TS-ACC001, TS-ACC002)**

| ID | Deskripsi |
|---|---|
| TC-ACC001 | Berhasil membuka akun baru bertipe CHECKING |
| TC-ACC002 | Berhasil membuka akun baru bertipe SAVINGS dan muncul di Accounts Overview |
| TC-ACC003 | Accounts Overview menampilkan daftar akun beserta saldo |
| TC-ACC004 | Klik nomor akun membuka detail akun dan daftar transaksi |

**Transfer Funds (TS-TRF001, TS-TRF002)**

| ID | Deskripsi |
|---|---|
| TC-TRF001 | Transfer antar akun sendiri berhasil dan saldo terupdate |
| TC-TRF002 | Transfer dengan nominal 0 ditolak. **Fail (BUG-02)** |
| TC-TRF003 | Transfer dengan nominal negatif ditolak. **Fail (BUG-03)** |
| TC-TRF004 | Transfer melebihi saldo akun sumber ditolak. **Fail (BUG-04)** |

**Bill Pay (TS-BP001, TS-BP002)**

| ID | Deskripsi |
|---|---|
| TC-BP001 | Pembayaran tagihan berhasil dengan data payee lengkap |
| TC-BP002 | Saldo akun sumber berkurang sesuai nominal pembayaran |
| TC-BP003 | Pembayaran ditolak ketika seluruh field wajib kosong |
| TC-BP004 | Pembayaran ditolak ketika nomor rekening konfirmasi tidak cocok |

**Find Transactions (TS-FT001, TS-FT002)**

| ID | Deskripsi |
|---|---|
| TC-FT001 | Pencarian berdasarkan transaction ID |
| TC-FT002 | Pencarian berdasarkan tanggal |
| TC-FT003 | Pencarian berdasarkan rentang tanggal |
| TC-FT004 | Pencarian berdasarkan nominal |
| TC-FT005 | Pencarian dengan nominal yang tidak ada menampilkan hasil kosong |
| TC-FT006 | Format tanggal tidak valid ditolak tanpa mengirim request |

**Request Loan (TS-LOAN001, TS-LOAN002)**

| ID | Deskripsi |
|---|---|
| TC-LOAN001 | Pengajuan pinjaman disetujui ketika nominal dan uang muka wajar |
| TC-LOAN002 | Akun pinjaman baru terbentuk dan terdaftar di Accounts Overview |
| TC-LOAN003 | Pengajuan ditolak ketika nominal melebihi kemampuan dana |
| TC-LOAN004 | Pengajuan ditolak ketika uang muka melebihi saldo akun |

**Update Profile (TS-UP001, TS-UP002)**

| ID | Deskripsi |
|---|---|
| TC-UP001 | Pembaruan data kontak berhasil disimpan |
| TC-UP002 | Data tersimpan tetap muncul setelah halaman dimuat ulang (cross-check via API) |
| TC-UP003 | Pembaruan ditolak ketika field wajib dikosongkan tanpa mengirim request |

**API REST (TS-API001 s/d TS-API004)**

| ID | Deskripsi |
|---|---|
| TC-API001 | `GET /login/{username}/{password}` mengembalikan data customer untuk kredensial valid |
| TC-API002 | `GET /login/{username}/{password}` menolak kredensial salah (400) |
| TC-API003 | `GET /customers/{id}/accounts` mengembalikan seluruh akun customer |
| TC-API004 | `GET /accounts/{id}` mengembalikan detail satu akun |
| TC-API005 | `POST /transfer` memindahkan dana, saldo diverifikasi ulang lewat GET |
| TC-API006 | `GET /accounts/{id}/transactions/amount/{amount}` |
| TC-API007 | `GET /accounts/{id}` dengan ID tidak ada mengembalikan 400 dan pesan error |

---

## Test Strategy

Beberapa keputusan desain yang diambil dan alasannya.

### 1. Selector dibaca langsung dari DOM, bukan ditebak

Seluruh selector di Page Object diambil setelah membaca markup asli tiap halaman
ParaBank. Prioritas yang dipakai: `id` lalu `name` lalu atribut stabil (`href`,
`value`) lalu teks. `nth-child` dan class hasil generate dihindari.

Kasus khusus: form Register dan Update Profile memakai `id` yang mengandung titik
(`customer.firstName`). Alih-alih meng-escape titiknya di dalam selector CSS,
dipakai attribute selector `[id="customer.firstName"]` supaya lebih mudah dibaca
dan tidak rawan salah escape.

Catatan lain: beberapa halaman punya elemen `h1.title` ganda: judul asli plus
judul panel error yang tersembunyi. Karena itu selector judul di-scope ke
container-nya, misalnya `#showOverview h1.title`, bukan `h1.title` global.

### 2. Data rerun-safe: reset DB dan user unik per spec

Dua lapis strategi supaya suite bisa dijalankan berkali-kali tanpa data bentrok:

- **Reset database.** ParaBank menyediakan endpoint
  `POST /parabank/services/bank/initializeDB` (sudah diverifikasi aktif, membalas
  HTTP 204). Reset dipanggil dari `before()` global di `cypress/support/e2e.js`
  melalui `cy.task('resetDatabase')`. Task-nya di-memoize di level Node
  (`cypress.config.js`) sehingga **hanya benar-benar dieksekusi sekali per
  `cypress run`**, bukan sekali per spec.
- **User unik.** Setiap spec mendaftarkan customer baru dengan username
  `qa` + timestamp lewat `cy.registerUniqueUser()`, lalu kredensial dan
  `customerId`-nya disimpan di `Cypress.env('testUser')`. Akun bawaan `john/demo`
  **tidak dipakai** karena datanya dipakai bersama banyak orang dan saldonya
  berubah terus. Saat pengembangan, `john/demo` bahkan sempat tidak ada sama
  sekali sebelum database di-reset.

### 3. Session caching

Login diulang di banyak test, sementara `testIsolation` Cypress membersihkan
cookie antar test. `cy.loginSession()` membungkus alur login UI dengan
`cy.session()` beserta `validate()`, sehingga alur login hanya dijalankan sekali
per spec dan sisanya memulihkan cookie dari cache.

### 4. Setup data lewat API, pengujian tetap di UI

Modul Transfer, Bill Pay, dan Find Transactions butuh akun kedua atau transaksi
yang sudah ada. Prasyarat ini dibuat lewat REST API (`cy.apiCreateAccount`,
`cy.apiTransfer`) karena lebih cepat dan tidak ikut gagal kalau UI-nya bermasalah.
Yang diuji tetap alur UI-nya. Verifikasi saldo juga dilakukan silang lewat API
supaya assertion-nya tidak hanya bergantung pada teks di layar.

### 5. `cy.intercept()` untuk memverifikasi request yang benar-benar terkirim

Halaman internal ParaBank versi sekarang berbasis AJAX ke
`/parabank/services_proxy/bank/...`, jadi request-nya bisa diperiksa langsung:
URL, query param, body, status, dan struktur response.

Penting: pola intercept ditulis sebagai **regex**, bukan glob. ParaBank
menyisipkan `;jsessionid=...` ke dalam URL form (contoh:
`login.htm;jsessionid=ABC123`), sehingga glob `**/parabank/login.htm` tidak pernah
cocok. Ini sempat membuat `cy.wait()` timeout dengan pesan "No request ever
occurred" sebelum polanya diganti ke regex.

Untuk kasus validasi field kosong, ekspektasinya dibedakan sesuai perilaku asli
aplikasi:

- **Validasi client-side** (Bill Pay, Update Profile, Find Transactions): request
  memang tidak boleh terkirim, diverifikasi dengan
  `cy.get('@alias.all').should('have.length', 0)`.
- **Validasi server-side** (Login, Register): request tetap terkirim, yang
  diverifikasi adalah payload benar-benar kosong dan server membalas pesan
  validasi yang tepat.

### 6. Menghindari false pass pada test negatif

Pada iterasi awal, test transfer negatif (nominal 0, minus, dan melebihi saldo)
sempat **lolos padahal seharusnya gagal**: assertion "panel hasil tidak terlihat"
dievaluasi sebelum response AJAX sempat diproses. Test-nya kemudian diperbaiki
menjadi: tunggu request selesai dengan `cy.wait()`, assert status response, baru
periksa state DOM. Assertion tambahan berupa perbandingan saldo sebelum dan
sesudah lewat API dipakai karena sifatnya deterministik dan tidak terpengaruh
timing render.

### 7. `uncaught:exception` difilter, bukan dimatikan

ParaBank punya beberapa bug JavaScript di halamannya sendiri. Handler di
`support/e2e.js` hanya mengabaikan error yang cocok dengan daftar keyword
tertentu, dan tetap menggagalkan test untuk error lain, supaya bug asli tidak
ikut tersembunyi.

### 8. Bug aplikasi tidak diakali agar hijau

Empat test sengaja dibiarkan merah karena mencerminkan expected behavior yang
benar, sementara ParaBank berperilaku salah. Setiap test yang merah diberi
komentar `KNOWN ISSUE (BUG-xx)` di spec-nya.

---

## Struktur Project

```
project-parabank/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js
│   │   ├── register.cy.js
│   │   ├── account.cy.js
│   │   ├── transfer.cy.js
│   │   ├── billpay.cy.js
│   │   ├── find-transactions.cy.js
│   │   ├── loan.cy.js
│   │   ├── update-profile.cy.js
│   │   └── api/
│   │       └── parabank-api.cy.js
│   ├── PageObjects/
│   │   ├── LoginPage.js
│   │   ├── RegisterPage.js
│   │   ├── AccountPage.js
│   │   ├── TransferPage.js
│   │   ├── BillPayPage.js
│   │   ├── FindTransactionsPage.js
│   │   ├── LoanPage.js
│   │   └── ProfilePage.js
│   ├── fixtures/
│   │   └── users.json
│   └── support/
│       ├── commands.js
│       └── e2e.js
├── .github/
│   └── workflows/
│       └── cypress.yml
├── cypress.config.js
├── package.json
└── README.md
```

### Konvensi Page Object

- Satu file satu class, diekspor dengan `export default`.
- Selector dikumpulkan dalam satu objek `elements` di atas class, isinya arrow
  function, contoh: `usernameInput: () => cy.get('input[name="username"]')`.
- Method aksi mengembalikan `this` agar bisa di-chain.
- Method assertion dipisah dari aksi dengan prefix `assert`, contoh
  `assertOnAccountOverview()`.
- Tidak ada URL absolut di Page Object, semua memakai path relatif terhadap
  `baseUrl` di `cypress.config.js`.

### Konvensi Spec

- Nama test memakai ID, contoh:
  `it('TC-LOGIN001 : login berhasil dengan kredensial valid', ...)`.
- Grup test diberi komentar test-suite di atasnya, contoh:
  `// TS-LOGIN001 : Autentikasi berhasil`.
- Judul dan deskripsi memakai Bahasa Indonesia.
- Data uji diambil dari `cypress/fixtures/users.json`. Pengecualian: data unik
  per-run (username register) di-generate dengan `Date.now()`.

---

## Cara Install & Run

### Prasyarat

- Node.js 22 atau lebih baru
- Koneksi internet (aplikasi yang diuji berjalan di server publik Parasoft)

### Install

```bash
npm install
```

### Menjalankan test

```bash
# Seluruh test (headless)
npm test

# Mode interaktif (Cypress Test Runner)
npm run test:open

# Hanya modul UI
npm run test:ui

# Hanya modul API
npm run test:api

# Satu spec tertentu
npx cypress run --spec cypress/e2e/login.cy.js
```

### Laporan

Setelah `npm test` selesai, laporan HTML tersedia di:

```
cypress/reports/index.html
```

Screenshot kegagalan tersimpan di `cypress/screenshots/`, video di
`cypress/videos/`.

### Live report (GitHub Pages)

Setiap push ke `main`, workflow CI mem-publish laporan HTML ke GitHub Pages
sehingga bisa dibuka tanpa perlu clone repo.

Langkah aktivasi (sekali saja, setelah repository dibuat):

1. Push project ini ke GitHub. Repository sebaiknya **public**, karena GitHub Pages
   untuk repo private hanya tersedia di paket berbayar.
2. Buka **Settings → Pages**.
3. Pada **Build and deployment → Source**, pilih **GitHub Actions**
   (bukan "Deploy from a branch").
4. Jalankan workflow sekali dengan push ke `main`. Setelah job
   `Deploy Report to GitHub Pages` selesai, URL-nya muncul di ringkasan run.

URL laporan mengikuti format `https://<user>.github.io/<repo>/`.

Catatan: step publish memakai `if: always()` karena suite ini memang punya 4 test
yang sengaja merah (lihat [Known Issue](#known-issue)). Tanpa itu, job dianggap
gagal dan laporan tidak akan pernah ter-publish. Konsekuensinya badge CI akan
tetap merah selama bug ParaBank tersebut belum diperbaiki. Ini disengaja, bukan
kegagalan script.

---

## Catatan Environment

- **Aplikasi publik dan dipakai bersama.** ParaBank adalah demo publik. Data bisa
  berubah kapan saja karena dipakai orang lain, dan aplikasinya sesekali
  di-restart oleh Parasoft.
- **`before()` global melakukan reset database.** `cy.task('resetDatabase')`
  memanggil `POST /parabank/services/bank/initializeDB`, yang mengembalikan
  database ke kondisi seed bawaan. Karena servernya publik, reset ini juga
  menghapus data yang mungkin sedang dipakai orang lain di server yang sama.
  Reset hanya dieksekusi sekali per `cypress run`.
- **Tanggal server ParaBank tidak selalu sama dengan tanggal lokal runner.**
  Karena itu test Find Transactions tidak memakai `new Date()` lokal, melainkan
  mengambil tanggal dari record transaksi yang dibuat sendiri via API, lalu
  memformatnya sebagai `MM-DD-YYYY` dalam UTC.
- **Retry.** `retries.runMode` diset `1`. Test yang gagal karena bug ParaBank
  otomatis dicoba dua kali, jadi durasi run untuk spec Login dan Transfer terlihat
  lebih lama dibanding spec lain.
- **Durasi.** Satu run penuh memakan waktu sekitar 4 sampai 5 menit.

---

## Known Issue

Bug ParaBank yang ditemukan selama pembuatan suite ini. Empat bug pertama
tercermin sebagai test yang gagal dan sengaja tidak diakali supaya hijau.

| ID | Ringkasan | Expected | Actual | Test terkait |
|---|---|---|---|---|
| **BUG-01** | Tidak ada guard autentikasi pada halaman internal | Akses `overview.htm` tanpa login diarahkan (redirect) ke halaman login | Halaman tetap dilayani di URL yang sama dan server membalas HTTP 500 dengan pesan generik "An internal error has occurred and has been logged." | TC-LOGIN007 |
| **BUG-02** | Transfer dengan nominal `0` diterima | Request ditolak dengan pesan validasi | HTTP 200, transaksi bernilai `$0.00` tetap tercatat di kedua akun | TC-TRF002 |
| **BUG-03** | Transfer dengan nominal negatif diterima | Request ditolak dengan pesan validasi | HTTP 200 dengan pesan `Successfully transferred $-50`. Efeknya arah transfer terbalik, dana mengalir dari akun tujuan ke akun sumber tanpa otorisasi | TC-TRF003 |
| **BUG-04** | Tidak ada pengecekan kecukupan saldo pada transfer | Transfer melebihi saldo ditolak | HTTP 200, saldo akun sumber dibiarkan menjadi negatif. Data seed ParaBank sendiri memuat akun bersaldo negatif, mis. `-$2300.00` | TC-TRF004 |
| **BUG-05** | Form Transfer Funds tidak punya validasi client-side sama sekali | Nominal kosong atau tidak valid ditolak di sisi client | Markup `transfer.htm` menyediakan dua elemen pesan error yang keduanya memakai `id="amount.errors"` (`id` duplikat, melanggar HTML spec) tapi tidak ada satu pun kode yang menampilkannya. Nominal kosong tetap dikirim ke server dan berujung ke halaman "Error!" generik | Tidak ada (observasi; konsekuensinya terlihat di BUG-02, BUG-03, BUG-04) |
| **BUG-06** | Kredensial user tertulis dalam plaintext di source halaman | Kredensial tidak diekspos di sisi client | `updateprofile.htm` menyusun URL request update dengan menyisipkan `username` dan `password` user apa adanya ke dalam JavaScript inline halaman, lalu mengirim keduanya sebagai query string | Tidak ada (observasi keamanan) |
| **BUG-07** | `ReferenceError` pada penanganan error di `openaccount.htm` | Ketika pembukaan akun gagal, pesan error ditampilkan dengan benar | Fungsi `showError()` mereferensikan variabel `error` yang tidak pernah dideklarasikan di scope-nya, sehingga penanganan error justru melempar `ReferenceError` | Tidak ada (di-filter di handler `uncaught:exception`) |
| **BUG-08** | Akun demo `john/demo` tidak dapat diandalkan | Akun demo selalu tersedia | Saat pengembangan, `GET /services/bank/login/john/demo` sempat membalas `400 Invalid username and/or password` sampai database di-reset | Tidak ada (mitigasi: suite memakai user unik per run) |

---

## Author

**Fajar Ardiansyah**, QA Engineer
