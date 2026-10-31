# Konteks repo (untuk asisten AI)

- Video **"Gaya yang Menyatukan Atom" — Listrik Statis & Dinamis** (Fisika Umum, S1 Kimia UNESA, RPS minggu 12–13) milik **Yayan** (Septian Anugrah Dwi Putra), seri Fisika Umum #8. Seri #1 `video-fisika-energi`, #2 `video-fisika-fluida-statis`, #3 `video-fisika-fluida-dinamis`, #4 `video-fisika-momentum`, #5 `video-fisika-osilasi`, #6 `video-fisika-gelombang`, #7 `video-fisika-termofisika` (mesin, komponen, dan alur kerja disalin dari #7). Arah seri: fondasi fisika untuk kimia kuantum (Osilasi → Gelombang → Termofisika → Listrik → Magnet → Fisika Atom); setiap video punya bagian "di dunia kimia" yang menjembatani ke kuantum. Aturan umum & pelajaran teknis: repo `septiananugrah-ship-it/science-intro` → `CLAUDE.md`.
- Angka yang dipakai dicek di `naskah/AUDIT.md`.
- Branding: **tanpa intro SCIENTIAN terpisah** — judul menampilkan kapsul logo S + "Explore Science with Yayan"; outro SCIENTIAN + "Disusun oleh Septian Anugrah Dwi Putra" + "Berikutnya: Magnet".
- Gaya seri **"Lab"** (malam biru tinta + kisi cetak biru, Space Grotesk/Inter/JetBrains Mono/Source Serif 4) dengan nuansa **muatan**: partikel bermuatan yang tarik-menarik/tolak-menolak sesuai Coulomb, garis medan yang hidup, elektron yang mengalir di kawat, ion dalam kisi.
- **Kode warna**: muatan + = merah `C.heat`, − / elektron = biru `C.pot`, medan E = kuning `C.force`, potensial V = ungu `C.spr`, arus I = toska `C.cyan` (konvensional + → −), energi = jingga `C.kin`, hambatan/panas = merah muda `C.press`, ion = hijau `C.work`.
- Komponen: `physics.tsx` (Crate, Ball, Car, Person, Spring, EnergyBars, Plot…), `flow.tsx`, `fluid.tsx`, `primitives.tsx` (Arrow berdenyut, Spark trail, Ripple, Card, Formula…).
- **Semua adegan harus terus bergerak** — panduan lengkap `naskah/POLISH.md`.
- **Claude tidak menjalankan workflow GitHub Actions.** Setelah merge ke `main`, berhenti dan minta pengguna menekan *Run workflow* sendiri; beri link & isian.
- Narasi: menyusul (ElevenLabs suara klon, atau Edge TTS gratis lewat input `mesin`). Selalu sediakan versi tanpa narasi.

## Aturan konten & tata letak

- Rumus utama ≥ 56 px (`Formula`), satu kartu per momen; zona subtitle (bawah 180 px) selalu bebas; margin ≥ 80 px. Komponen HTML di luar `<Stage>`.
- k ≈ 9×10⁹ N·m²/C², e = 1,6×10⁻¹⁹ C. "≈" untuk perkiraan. Koma desimal.
- Fisika harus benar: sejenis tolak, berlawanan tarik; F ∝ 1/r²; garis medan dari + ke −; arus konvensional + → −, elektron sebaliknya; seri: I sama; paralel: V sama.
- Teks TTS terpisah dari subtitle (`src/tts.ts`; huruf tunggal & nama tokoh dieja otomatis).
- Kemulusan: `EASE` lembut, fade keluar `EASE_IN_OUT`; tanpa ganti berdasarkan ambang (silang-pudar); tanpa CSS blur; tanpa filter pada garis lurus.

## QA

- `CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/qa-moments.mjs out/x adegan:baris:offset ...` lalu `python3 scripts/contact.py out/x out/x-sheets 6` (offset positif = detik setelah baris mulai).
- `scripts/qa-lines.mjs` = still di akhir setiap baris narasi (audit menyeluruh); `scripts/qa-audit.mjs` = awal/tengah/akhir + transisi.
- Uji kemulusan: `node scripts/qa-film.mjs out/a.mp4 <frameAwal> <frameAkhir> 0.25` lalu `python3 scripts/qa-glitch.py out/a.mp4 <frameAwal>`.
