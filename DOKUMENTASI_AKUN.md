# Dokumentasi Akun Uji Coba (Test Accounts)
Dokumen ini berisi daftar akun fiktif untuk uji coba aplikasi **RUMAH KARIR (React Standalone)**. Akun-akun ini telah terdaftar di database dan siap digunakan untuk proses login.

---

## 1. Akun Administrator (Admin)
Digunakan untuk masuk ke panel admin (mengelola perusahaan, menyetujui pendaftaran, mengelola lowongan, mitra, dll.).
- **URL Login**: `/login` (pilih role atau biarkan otomatis mengarah ke dashboard admin setelah login)
- **Email**: `admin@admin.com`
- **Password**: `admin123`

---

## 2. Akun Pelamar Kerja (User)
Digunakan untuk melihat lowongan, mengunggah CV, mencocokkan CV secara otomatis, serta membuat CV/Surat Lamaran standar internasional.
- **URL Login**: `/login`
- **Email**: `user@example.com`
- **Password**: `user123`
- **Nama Lengkap**: Budi Santoso

---

## 3. Akun Perusahaan (Company)
Digunakan untuk memasang lowongan pekerjaan baru dan memantau status lowongan yang diposting.
- **URL Login**: `/login`
- **Email**: `company@example.com`
- **Password**: `company123`
- **Nama Perusahaan**: PT Solusi Teknologi

---

## Petunjuk Penggunaan Standalone
1. Jalankan backend server Flask Anda (port default: `5000`).
2. Jalankan frontend React di folder ini dengan perintah:
   ```bash
   npm run dev
   ```
3. Buka halaman di browser (misalnya: `http://localhost:5176/` atau port yang tampil di terminal).
4. Gunakan email dan password di atas pada form Login.
