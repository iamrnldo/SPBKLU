# SPBKLU Backend API (ExpressJS Boilerplate)

Backend ini dirancang khusus untuk mendukung sistem **SPBKLU** (*Stasiun Penukaran Baterai Kendaraan Listrik Umum*). Proyek ini menggunakan **ExpressJS** dengan struktur folder modular, bersih, dan siap dihubungkan dengan frontend Admin Web (`spbklu/admin`) maupun Mobile APK (`spbklu/user`).

## 📁 Struktur Folder & File Backend

```text
spbklu/backend/
├── src/
│   ├── server.js               # Entry point untuk menjalankan server
│   ├── app.js                  # Inisialisasi Express & pendaftaran middleware
│   ├── config/
│   │   ├── config.js           # Loading & manajemen environment variables
│   │   └── db.js               # Pengaturan koneksi database (MySQL/Postgres/Mongo)
│   ├── controllers/            # Logika bisnis endpoint (Handler request & response)
│   │   ├── auth.controller.js          # Autentikasi (Register & Login)
│   │   ├── user.controller.js          # Pengaturan profil & dompet/saldo user
│   │   ├── admin.controller.js         # Statistik, manajemen user & laporan
│   │   ├── station.controller.js       # Manajemen data stasiun SPBKLU & slot baterai
│   │   ├── battery.controller.js       # Monitoring baterai (SOC, SOH, status)
│   │   └── transaction.controller.js   # Proses transaksi tukar baterai & pembayaran
│   ├── models/                 # Model/Skema database (SQL / NoSQL)
│   │   ├── user.model.js
│   │   ├── station.model.js
│   │   ├── battery.model.js
│   │   └── transaction.model.js
│   ├── middlewares/            # Middleware custom untuk Express
│   │   ├── auth.middleware.js          # Verifikasi JWT token & autorisasi role (Admin/User)
│   │   └── error.middleware.js         # Penanganan error global terpusat
│   ├── routes/                 # Routing modular API
│   │   ├── index.js            # Penggabung seluruh rute
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── admin.routes.js
│   │   ├── station.routes.js
│   │   ├── battery.routes.js
│   │   └── transaction.routes.js
│   └── utils/                  # Utility helper reusable
│       └── response.js         # Format response JSON seragam (Success & Error)
├── .env.example                # Template konfigurasi environment variables
├── .gitignore                  # Berkas yang diabaikan oleh Git
├── package.json                # Dependensi & script project
└── README.md                   # Panduan dokumentasi proyek
```

---

## 🐘 Integrasi PostgreSQL (PostgreSQL v18.4)

Karena Anda sudah menginstall **PostgreSQL 18.4** secara lokal, backend ini sudah diubah sepenuhnya menggunakan **Sequelize ORM** yang tersambung langsung ke database PostgreSQL!

### Langkah-langkah Setup Database:

1.  **Nyalakan PostgreSQL Service** di sistem Anda (misal di Arch/CachyOS):
    ```bash
    sudo systemctl start postgresql
    # Atau jika menggunakan Fish Shell:
    sudo systemctl start postgresql.service
    ```

2.  **Buat Database Baru** bernama `spbklu_db` di PostgreSQL Anda:
    ```bash
    # Masuk ke terminal PostgreSQL
    psql -U postgres
    
    # Jalankan query SQL:
    CREATE DATABASE spbklu_db;
    ```

3.  **Sesuaikan Berkas `.env`** Anda dengan kredensial PostgreSQL lokal Anda:
    ```ini
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=masukkan_password_postgresql_anda
    DB_NAME=spbklu_db
    ```

4.  **Auto-Synchronization & Seeding:**
    Saat pertama kali Anda menjalankan `npm run dev`, Sequelize akan otomatis:
    *   Mendeteksi tabel yang belum ada di PostgreSQL.
    *   Membuat tabel-tabel relational (`users`, `stations`, `batteries`, `transactions`) secara otomatis di database `spbklu_db` (menggunakan sinkronisasi `{ alter: true }` yang aman).
    *   Mengisi database secara otomatis (*Auto-Seeding*) dengan data uji coba default (seperti akun Admin `admin@spbklu.com`, user `budi@gmail.com`, 3 stasiun SPBKLU, 9 buah baterai, serta riwayat swap awal).

---

## 🚀 Fitur Utama & Pembagian Akses API

Aplikasi backend ini membagi API endpoints menjadi rute khusus untuk **Web Admin** dan **Mobile APK (User)** menggunakan verifikasi **JWT (JSON Web Token)** dan **Role-Based Access Control (RBAC)**:

### 1. 🔐 Autentikasi (`/api/auth`)
*   `POST /api/auth/register` : Mendaftarkan akun User baru (Mobile APK).
*   `POST /api/auth/login` : Login untuk mendapatkan JWT token (berlaku untuk Admin & User).

### 2. 📱 Khusus Mobile APK (`/api/users` & `/api/transactions`)
*   `GET /api/users/profile` : Mengambil informasi profil login & sisa saldo.
*   `POST /api/users/topup` : Top up / tambah saldo dompet pengguna.
*   `POST /api/transactions/swap` : Transaksi melakukan swap (penukaran) baterai kosong dengan baterai penuh di slot stasiun tertentu.
*   `GET /api/transactions/my-history` : Melihat daftar riwayat penukaran baterai pribadi.

### 3. 💻 Khusus Web Admin (`/api/admin` & `/api/batteries`)
*   `GET /api/admin/dashboard-stats` : Laporan statistik, grafik bulanan, jumlah pengguna, rasio operasional, dan pendapatan bulanan.
*   `GET /api/admin/users` : Manajemen daftar seluruh akun pengguna sistem.
*   `GET /api/batteries` : Melihat database seluruh baterai di ekosistem SPBKLU.
*   `POST /api/batteries` : Mendaftarkan baterai baru ke dalam sistem.
*   `GET /api/transactions/all` : Mengambil laporan riwayat transaksi seluruh sistem.

### 4. 🔋 Publik / Bersama (`/api/stations`)
*   `GET /api/stations` : Menampilkan seluruh daftar stasiun SPBKLU beserta koordinat GPS (untuk pencarian lokasi stasiun terdekat pada APK / Web Admin).
*   `GET /api/stations/:id` : Melihat status slot pengisi daya baterai secara real-time pada stasiun tertentu.
*   `POST /api/stations` : Menambah stasiun SPBKLU baru (Khusus Admin).

---

## 🛠️ Cara Menjalankan Project

### 1. Instalasi Dependensi
Jalankan perintah berikut di folder `spbklu/backend`:
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env` dan sesuaikan nilainya:
```bash
cp .env.example .env
```

### 3. Menjalankan Server
*   **Mode Development (dengan auto-reload Nodemon):**
    ```bash
    npm run dev
    ```
*   **Mode Production:**
    ```bash
    npm start
    ```

---

## 🔒 Akun Uji Coba Default (Mock Data)
Saat server dijalankan pertama kali, backend ini dilengkapi data simulasi bawaan sehingga dapat langsung digunakan untuk testing:

1.  **Akun Web Admin:**
    *   **Email:** `admin@spbklu.com`
    *   **Password:** `adminpassword`
    *   **Role:** `admin`

2.  **Akun Mobile APK:**
    *   **Email:** `budi@gmail.com`
    *   **Password:** `userpassword`
    *   **Role:** `user`
    *   **Saldo Awal:** `IDR 50.000`
