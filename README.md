# UrbanCare - Pelaporan Fasilitas Umum

## Tugas Besar - Pemrograman III
**Yonaldi Ernanda Putro** - 714240028

## Deskripsi Proyek
UrbanCare adalah aplikasi berbasis web untuk melaporkan kerusakan fasilitas umum dan infrastruktur kota. Aplikasi ini dibuat untuk memudahkan masyarakat melaporkan masalah seperti jalan berlubang, lampu jalan mati, pohon tumbang, atau sampah yang menumpuk.

Warga bisa mengirimkan laporan dan memberikan dukungan (upvote) pada laporan warga lain. Petugas atau Admin kemudian bisa menindaklanjuti laporan tersebut dan mengubah statusnya secara langsung.

## Fitur
1. **Landing Page:** Halaman depan yang menjelaskan fungsi aplikasi.
2. **Sistem Login:** Mendukung role Warga dan Petugas/Admin.
3. **Laporan Publik:** Daftar semua laporan yang masuk dari masyarakat.
4. **Upvote:** Warga bisa memberi dukungan pada laporan yang dianggap penting.
5. **Update Status:** Petugas bisa mengubah status laporan (Pending, Proses, Selesai, Ditolak).
6. **Dashboard:** Halaman khusus untuk memantau laporan yang sudah dibuat.

## Teknologi yang Digunakan
- **Frontend:**
  - React JS: Library utama untuk antarmuka.
  - TypeScript: Untuk penulisan kode yang lebih aman.
  - Vite: Sebagai build tool dan development server.
  - React Router: Untuk manajemen navigasi halaman.
- **Backend:**
  - Node.js: Runtime environment.
  - Express.js: Framework untuk membangun REST API.
  - MySQL: Database relasional untuk menyimpan data.
  - JSON Web Token (JWT): Untuk keamanan dan autentikasi user.
  - Bcrypt: Untuk enkripsi password user.

## Daftar API (Endpoints)
Aplikasi ini berjalan sebagai Web Service dengan endpoint berikut:

| Method | Endpoint | Fungsi | Akses |
|--------|----------|--------|-------|
| POST | `/api/auth/register` | Pendaftaran akun baru | Publik |
| POST | `/api/auth/login` | Autentikasi/Login user | Publik |
| GET | `/api/reports` | Mengambil semua laporan publik | Semua User |
| POST | `/api/reports` | Membuat laporan baru | Warga |
| GET | `/api/reports/my-reports` | Melihat laporan milik sendiri | Warga |
| POST | `/api/reports/:id/upvote` | Memberikan dukungan pada laporan | Warga |
| PUT | `/api/reports/:id/status` | Mengubah status laporan | Petugas/Admin |

## Cara Menjalankan

### 1. Database
- Buat database baru di phpMyAdmin dengan nama `UrbanCare`.
- Import file `database.sql` ke dalam database tersebut.

### 2. Backend
- Masuk ke folder `Backend`.
- Jalankan `npm install`.
- Buat file `.env` (atau sesuaikan yang sudah ada) dengan konfigurasi berikut:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=UrbanCare
JWT_SECRET=rahasia_urbancare_123
```
- Jalankan dengan perintah: `npm run dev`.

### 3. Frontend
- Masuk ke folder `Frontend`.
- Jalankan `npm install`.
- Jalankan dengan perintah: `npm run dev`.
- Akses aplikasi di: `http://localhost:5173`.

## Penggunaan
1. Buka aplikasi, lalu daftar akun sebagai **Warga**.
2. Login dan pilih menu **Buat Laporan** untuk mengirim keluhan.
3. Anda bisa melihat laporan warga lain di halaman utama dan klik tombol **Dukungan**.
4. Untuk mencoba sebagai petugas, daftar akun baru dengan role **Petugas**.
5. Petugas bisa masuk ke **Panel Petugas** untuk memperbarui status pengerjaan laporan.


