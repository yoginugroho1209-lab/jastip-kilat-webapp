# Pembuatan Dashboard Driver (Sisi Pengemudi)

Sesuai dengan `prd.md`, fase selanjutnya adalah membangun Dashboard interaktif khusus untuk Driver. Halaman ini berfungsi sebagai pusat kendali operasional driver di lapangan.

## User Review Required

> [!IMPORTANT]
> **Rencana Rute & Aksesibilitas**
> Halaman ini akan dibuat terpisah pada rute `/driver`. Apakah Anda setuju jika untuk MVP ini (tanpa sistem login/Autentikasi rumit terlebih dahulu), halaman ini bisa langsung diakses secara publik untuk keperluan demo/simulasi?

## Open Questions

> [!WARNING]
> **Alur Pengantaran (Batching)**
> Menurut PRD, driver mengantar pesanan berurutan (Titik 1 sampai 5). Apakah di *dashboard* nanti driver wajib menekan tombol "Selesai Diantar" secara berurutan (tidak bisa loncat ke Titik 3 jika Titik 1 belum selesai), atau dibebaskan sesuai kondisi lapangan?

## Proposed Changes

### Dashboard Driver Component

#### [NEW] `src/app/driver/page.tsx`
Membuat halaman utama yang mencakup fitur-fitur berikut:
1. **Status & Dompet (Header):**
   - Toggle "Siap Menerima Pesanan" vs "Sibuk / Antar".
   - Ringkasan pendapatan harian (Dompet / Payout).
2. **Manajemen Batch Order (Tugas Saat Ini):**
   - Menampilkan list maksimal 5 titik antaran.
   - Detail per titik: Nama Pemesan, Daftar Menu (dan catatannya), serta tombol "Navigasi Maps" yang akan mensimulasikan rute pengantaran.
   - Tombol *Update Status* ("Pesanan Diantar").
3. **Tombol Kendala (Emergency):**
   - Tombol merah "Laporkan Kendala" yang mensimulasikan pembuatan Kode Refund Unik jika menu habis atau terjadi insiden.

#### [MODIFY] `src/app/landing.css`
- Menambahkan kelas-kelas CSS spesifik untuk komponen Driver (seperti Toggle Button besar, kartu list pesanan, dan modal kendala darurat) yang tetap menjaga estetika *Glassmorphism* dan kesan premium.

## Verification Plan

### Manual Verification
1. Mengakses `localhost:3000/driver`
2. Menekan tombol Toggle Status (Siap vs Sibuk) dan memastikan UI merespons.
3. Mensimulasikan proses pengantaran dengan mengeklik "Selesai" pada salah satu daftar pesanan dan melihat pesanan tersebut menghilang/tercoret dari daftar.
4. Menekan "Laporkan Kendala" untuk melihat *pop-up* pembuatan kode refund.
