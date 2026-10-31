// Naskah narasi "Gaya yang Menyatukan Atom" — Fisika Umum: Listrik.
// Setiap adegan berisi baris narasi. Durasi baris dihitung otomatis dari jumlah
// suku kata (lihat timeline.ts) atau dari rekaman suara bila sudah ada,
// jadi cukup ubah teks di sini: visual, subtitle, dan musik ikut menyesuaikan.
//
// Aturan menulis teks narasi (dibaca mesin TTS):
//  - angka & simbol ditulis sebagai kata ("dua puluh meter per detik"),
//  - rumus ditulis sebagai kalimat; rumus rapi tampil di layar (komponen Formula).
// Angka sudah dicek di naskah/AUDIT.md (g = 10 m/s², ρ air = 1000 kg/m³, p_atm = 100 kPa, kecuali disebut lain).
//
// hl     : kata/frasa yang disorot pada subtitle
// pause  : jeda (detik) SETELAH baris dibacakan
// lead   : jeda (detik) sebelum baris pertama adegan
// tail   : jeda (detik) setelah baris terakhir adegan
// fixed  : durasi tetap (detik) untuk adegan tanpa narasi

export type Line = {
  text: string;
  /** Teks khusus TTS (opsional). Bila kosong, dibuat otomatis oleh src/tts.ts. */
  tts?: string;
  hl?: string[];
  pause?: number;
};

export type SceneScript = {
  id: string;
  chapter: string; // nomor bab di heading, "" untuk tanpa heading
  part?: 1 | 2 | 3; // 1 konsep, 2 listrik di dunia kimia & jembatan kuantum, 3 penerapan
  title: string;
  lines: Line[];
  lead?: number;
  tail?: number;
  fixed?: number;
  mood: 'mystery' | 'title' | 'wonder' | 'build' | 'tension' | 'bright' | 'resolve' | 'outro';
};

export const SCRIPT: SceneScript[] = [
  {
    "id": "hook",
    "chapter": "",
    "title": "Balon, petir, dan baterai",
    "mood": "mystery",
    "lead": 1.6,
    "tail": 1.2,
    "lines": [
      {
        "text": "Gosokkan balon ke rambut, lalu dekatkan ke dinding. Balon itu menempel, seolah ada lem yang tidak terlihat.",
        "hl": [
          "lem yang tidak terlihat"
        ],
        "pause": 0.7
      },
      {
        "text": "Di langit, awan badai melepaskan petir yang lebih panas dari permukaan matahari.",
        "hl": [
          "petir"
        ],
        "pause": 0.7
      },
      {
        "text": "Dan di saku kita, sebuah baterai kecil mendorong elektron untuk menyalakan ponsel seharian.",
        "hl": [
          "mendorong elektron"
        ],
        "pause": 0.8
      },
      {
        "text": "Ketiganya digerakkan oleh satu gaya:",
        "pause": 0.4
      },
      {
        "text": "gaya listrik.",
        "hl": [
          "gaya listrik"
        ],
        "pause": 0.9
      },
      {
        "text": "Gaya yang sama inilah yang mengikat elektron pada inti atom dan menyatukan atom menjadi molekul. Seluruh kimia pada dasarnya adalah listrik.",
        "hl": [
          "Seluruh kimia"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "title",
    "chapter": "",
    "title": "Gaya yang Menyatukan Atom",
    "mood": "title",
    "fixed": 8,
    "lines": []
  },
  {
    "id": "roadmap",
    "chapter": "",
    "title": "Peta video",
    "mood": "wonder",
    "lead": 0.8,
    "tail": 1.4,
    "lines": [
      {
        "text": "Video ini membahas listrik dalam tiga bagian.",
        "hl": [
          "listrik"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian pertama, konsep: muatan, hukum Coulomb, medan listrik, potensial, kapasitor, arus dan hambatan, serta rangkaian.",
        "hl": [
          "konsep"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian kedua, listrik di dunia kimia: ikatan ion, atom hidrogen, elektronvolt, dan elektrolisis.",
        "hl": [
          "dunia kimia"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian ketiga, penerapan: petir, baterai, dan elektroforesis.",
        "hl": [
          "penerapan"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "charge",
    "chapter": "01",
    "title": "Muatan listrik",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Ada dua jenis muatan listrik: positif dan negatif. Muatan sejenis tolak-menolak, muatan berlawanan tarik-menarik.",
        "hl": [
          "tolak-menolak",
          "tarik-menarik"
        ],
        "pause": 0.7
      },
      {
        "text": "Muatan itu dibawa oleh partikel: proton bermuatan positif, elektron bermuatan negatif dengan besar yang persis sama.",
        "hl": [
          "persis sama"
        ],
        "pause": 0.7
      },
      {
        "text": "Muatan terkecil ini, muatan elementer e, besarnya satu koma enam kali sepuluh pangkat minus sembilan belas coulomb. Semua muatan adalah kelipatan bulatnya.",
        "hl": [
          "muatan elementer"
        ],
        "pause": 0.7
      },
      {
        "text": "Saat balon digosok, elektron berpindah dari rambut ke balon. Muatan tidak diciptakan, hanya dipindahkan: muatan total selalu kekal.",
        "hl": [
          "muatan total selalu kekal"
        ],
        "pause": 0.7
      },
      {
        "text": "Balon yang bermuatan negatif mendorong elektron di permukaan dinding menjauh, sehingga dinding yang dekat menjadi sedikit positif, dan balon pun menempel.",
        "hl": [
          "menempel"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "coulomb",
    "chapter": "02",
    "title": "Hukum Coulomb",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Seberapa kuat gaya antara dua muatan? Charles-Augustin de Coulomb mengukurnya dengan neraca puntir.",
        "hl": [
          "neraca puntir"
        ],
        "pause": 0.7
      },
      {
        "text": "Gayanya sebanding dengan hasil kali kedua muatan, dan berbanding terbalik dengan kuadrat jaraknya: F sama dengan k q satu q dua per r kuadrat.",
        "hl": [
          "per r kuadrat"
        ],
        "pause": 0.7
      },
      {
        "text": "Tetapan k sekitar sembilan kali sepuluh pangkat sembilan newton meter kuadrat per coulomb kuadrat. Angka yang sangat besar.",
        "hl": [
          "sembilan kali sepuluh pangkat sembilan"
        ],
        "pause": 0.7
      },
      {
        "text": "Jaraknya dijadikan dua kali, gayanya menjadi seperempat. Jaraknya setengah, gayanya empat kali.",
        "hl": [
          "seperempat"
        ],
        "pause": 0.7
      },
      {
        "text": "Di dalam atom hidrogen, gaya listrik antara proton dan elektron sekitar sepuluh pangkat tiga puluh sembilan kali lebih kuat daripada gaya gravitasinya.",
        "hl": [
          "sepuluh pangkat tiga puluh sembilan"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "field",
    "chapter": "03",
    "title": "Medan listrik",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bagaimana sebuah muatan tahu ada muatan lain di kejauhan? Faraday membayangkan setiap muatan dikelilingi medan listrik.",
        "hl": [
          "medan listrik"
        ],
        "pause": 0.7
      },
      {
        "text": "Medan listrik adalah gaya per satuan muatan: E sama dengan F per q. Muatan uji kecil di sebuah titik merasakan gaya ke arah medan.",
        "hl": [
          "E sama dengan F per q"
        ],
        "pause": 0.7
      },
      {
        "text": "Garis medan keluar dari muatan positif dan masuk ke muatan negatif. Makin rapat garisnya, makin kuat medannya.",
        "hl": [
          "Garis medan"
        ],
        "pause": 0.7
      },
      {
        "text": "Di antara dua pelat sejajar bermuatan berlawanan, garis medan lurus dan sama rapat: medannya seragam.",
        "hl": [
          "medannya seragam"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "potential",
    "chapter": "04",
    "title": "Potensial dan energi listrik",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Memindahkan muatan melawan medan membutuhkan usaha, dan usaha itu tersimpan sebagai energi potensial listrik.",
        "hl": [
          "energi potensial listrik"
        ],
        "pause": 0.7
      },
      {
        "text": "Energi potensial per satuan muatan disebut potensial listrik, V, dengan satuan volt. Satu volt sama dengan satu joule per coulomb.",
        "hl": [
          "satu joule per coulomb"
        ],
        "pause": 0.7
      },
      {
        "text": "Muatan positif mengalir dari potensial tinggi ke potensial rendah, seperti bola yang menggelinding turun bukit.",
        "hl": [
          "menggelinding turun bukit"
        ],
        "pause": 0.7
      },
      {
        "text": "Yang penting bukan potensialnya sendiri, melainkan beda potensial, atau tegangan, antara dua titik.",
        "hl": [
          "beda potensial"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "capacitor",
    "chapter": "05",
    "title": "Kapasitor",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Dua pelat logam yang dipisahkan sedikit celah dapat menyimpan muatan. Inilah kapasitor.",
        "hl": [
          "kapasitor"
        ],
        "pause": 0.7
      },
      {
        "text": "Muatan yang tersimpan sebanding dengan tegangannya: Q sama dengan C V. C adalah kapasitansi, dalam satuan farad.",
        "hl": [
          "Q sama dengan C V"
        ],
        "pause": 0.7
      },
      {
        "text": "Pelat yang lebih luas dan celah yang lebih sempit menyimpan lebih banyak muatan.",
        "hl": [
          "lebih banyak muatan"
        ],
        "pause": 0.7
      },
      {
        "text": "Energi tersimpan di dalam medan listrik di antara pelat, dan dapat dilepaskan dalam sekejap, seperti pada lampu kilat kamera.",
        "hl": [
          "dalam sekejap"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "current",
    "chapter": "06",
    "title": "Arus, hambatan, dan hukum Ohm",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Hubungkan dua titik yang berbeda potensial dengan kawat, dan muatan mulai mengalir. Aliran muatan per satuan waktu disebut arus listrik, I, dalam ampere.",
        "hl": [
          "arus listrik"
        ],
        "pause": 0.7
      },
      {
        "text": "Di dalam kawat logam, elektron bebas melaju zig-zag, menabrak ion-ion logam. Tabrakan inilah yang menghambat aliran.",
        "hl": [
          "menabrak ion-ion"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk banyak bahan, arus sebanding dengan tegangan: V sama dengan I R. Inilah hukum Ohm, dengan R hambatan dalam ohm.",
        "hl": [
          "hukum Ohm"
        ],
        "pause": 0.7
      },
      {
        "text": "Tabrakan elektron mengubah energi listrik menjadi panas. Daya yang dipakai sama dengan tegangan kali arus: P sama dengan V I.",
        "hl": [
          "P sama dengan V I"
        ],
        "pause": 0.7
      },
      {
        "text": "Yang mengejutkan, elektron sendiri merayap sangat lambat, hanya sepersekian milimeter per detik. Yang merambat cepat adalah medannya.",
        "hl": [
          "merayap sangat lambat"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "circuits",
    "chapter": "07",
    "title": "Rangkaian seri dan paralel",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Hambatan bisa dirangkai berderet atau bercabang.",
        "hl": [
          "berderet atau bercabang"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada rangkaian seri, arusnya sama di semua hambatan, dan hambatan totalnya dijumlahkan.",
        "hl": [
          "rangkaian seri"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada rangkaian paralel, tegangannya sama di setiap cabang, dan arus total terbagi ke cabang-cabang.",
        "hl": [
          "rangkaian paralel"
        ],
        "pause": 0.7
      },
      {
        "text": "Lampu di rumah dirangkai paralel, sehingga setiap lampu mendapat tegangan penuh dan tetap menyala walau lampu lain padam.",
        "hl": [
          "tetap menyala"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "ionic",
    "chapter": "08",
    "title": "Ikatan ion",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Sekarang lihat garam dapur dengan kacamata hukum Coulomb.",
        "hl": [
          "hukum Coulomb"
        ],
        "pause": 0.7
      },
      {
        "text": "Atom natrium menyerahkan satu elektron kepada atom klor. Hasilnya ion natrium positif dan ion klorida negatif yang saling menarik.",
        "hl": [
          "saling menarik"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada jarak nol koma dua delapan nanometer, energi tarik-menarik sepasang ion itu sekitar lima elektronvolt.",
        "hl": [
          "lima elektronvolt"
        ],
        "pause": 0.7
      },
      {
        "text": "Di dalam kristal, setiap ion dikelilingi enam ion berlawanan, dan gaya Coulomb dari seluruh kisi mengunci ion-ion itu dengan kuat.",
        "hl": [
          "mengunci"
        ],
        "pause": 0.7
      },
      {
        "text": "Itulah sebabnya garam keras, getas, dan titik lelehnya tinggi, sekitar delapan ratus satu derajat Celsius.",
        "hl": [
          "delapan ratus satu"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "hydrogen",
    "chapter": "09",
    "title": "Listrik di dalam atom hidrogen",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Atom paling sederhana, hidrogen, adalah satu elektron yang ditarik satu proton.",
        "hl": [
          "satu proton"
        ],
        "pause": 0.7
      },
      {
        "text": "Gaya Coulomb inilah yang menahan elektron di dekat inti.",
        "hl": [
          "menahan elektron"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada jarak sekitar nol koma nol lima tiga nanometer, energi potensial listriknya minus dua puluh tujuh koma dua elektronvolt.",
        "hl": [
          "minus dua puluh tujuh koma dua"
        ],
        "pause": 0.7
      },
      {
        "text": "Ditambah energi kinetik elektron, energi totalnya minus tiga belas koma enam elektronvolt, tepat energi yang dibutuhkan untuk mengionkan atom hidrogen.",
        "hl": [
          "minus tiga belas koma enam"
        ],
        "pause": 0.7
      },
      {
        "text": "Mengapa elektron tidak jatuh ke inti? Fisika klasik tidak bisa menjawabnya. Jawabannya baru datang dari mekanika kuantum.",
        "hl": [
          "mekanika kuantum"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "ev",
    "chapter": "10",
    "title": "Elektronvolt: satuan energi kimia",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Joule terlalu besar untuk mengukur energi satu atom. Kimiawan dan fisikawan memakai elektronvolt.",
        "hl": [
          "elektronvolt"
        ],
        "pause": 0.7
      },
      {
        "text": "Satu elektronvolt adalah energi yang diperoleh satu elektron saat dipercepat beda potensial satu volt: satu koma enam kali sepuluh pangkat minus sembilan belas joule.",
        "hl": [
          "satu volt"
        ],
        "pause": 0.7
      },
      {
        "text": "Dikali bilangan Avogadro, satu elektronvolt per partikel sama dengan sekitar sembilan puluh enam kilojoule per mol.",
        "hl": [
          "sembilan puluh enam kilojoule per mol"
        ],
        "pause": 0.7
      },
      {
        "text": "Energi ikatan kimia berkisar beberapa elektronvolt, foton cahaya tampak dua sampai tiga elektronvolt, dan energi termal suhu kamar hanya nol koma nol dua enam.",
        "hl": [
          "beberapa elektronvolt"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "electrolysis",
    "chapter": "11",
    "title": "Elektrolisis dan hukum Faraday",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Listrik juga dapat memaksa reaksi kimia terjadi. Inilah elektrolisis.",
        "hl": [
          "elektrolisis"
        ],
        "pause": 0.7
      },
      {
        "text": "Celupkan dua elektroda ke dalam air yang diberi elektrolit, lalu sambungkan ke baterai. Gelembung hidrogen muncul di katoda, oksigen di anoda.",
        "hl": [
          "hidrogen",
          "oksigen"
        ],
        "pause": 0.7
      },
      {
        "text": "Michael Faraday menemukan bahwa banyaknya zat yang terbentuk sebanding dengan muatan yang mengalir.",
        "hl": [
          "sebanding dengan muatan"
        ],
        "pause": 0.7
      },
      {
        "text": "Satu mol elektron membawa muatan sekitar sembilan puluh enam ribu lima ratus coulomb, yang disebut tetapan Faraday.",
        "hl": [
          "sembilan puluh enam ribu lima ratus"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk menghasilkan satu mol gas hidrogen dibutuhkan dua mol elektron, sekitar seratus sembilan puluh tiga ribu coulomb.",
        "hl": [
          "dua mol elektron"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "lightning",
    "chapter": "12",
    "title": "Petir",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Di dalam awan badai, tumbukan butir es memisahkan muatan: bagian atas menjadi positif, bagian bawah negatif.",
        "hl": [
          "memisahkan muatan"
        ],
        "pause": 0.7
      },
      {
        "text": "Beda potensial antara awan dan tanah dapat mencapai ratusan juta volt.",
        "hl": [
          "ratusan juta volt"
        ],
        "pause": 0.7
      },
      {
        "text": "Ketika medan listrik cukup kuat, udara terionisasi dan menjadi penghantar. Arus puluhan ribu ampere melesat dalam sepersekian detik.",
        "hl": [
          "puluhan ribu ampere"
        ],
        "pause": 0.7
      },
      {
        "text": "Kanal petir memanas hingga sekitar tiga puluh ribu kelvin, lima kali lebih panas dari permukaan matahari, dan udara yang memuai mendadak menghasilkan guntur.",
        "hl": [
          "tiga puluh ribu kelvin"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "battery",
    "chapter": "13",
    "title": "Baterai: kimia menjadi listrik",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Baterai membalik elektrolisis: reaksi kimia yang berlangsung spontan mendorong elektron melalui rangkaian.",
        "hl": [
          "reaksi kimia"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada sel Daniell, seng melepaskan elektron dan larut, sementara ion tembaga menangkap elektron dan mengendap.",
        "hl": [
          "sel Daniell"
        ],
        "pause": 0.7
      },
      {
        "text": "Elektron mengalir dari seng ke tembaga lewat kawat luar, dan jembatan garam menjaga muatan larutan tetap seimbang.",
        "hl": [
          "jembatan garam"
        ],
        "pause": 0.7
      },
      {
        "text": "Beda potensialnya sekitar satu koma satu volt, ditentukan oleh perbedaan kecenderungan kedua logam melepas elektron.",
        "hl": [
          "satu koma satu volt"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "electrophoresis",
    "chapter": "14",
    "title": "Elektroforesis",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Di laboratorium biokimia, medan listrik dipakai untuk memisahkan molekul.",
        "hl": [
          "memisahkan molekul"
        ],
        "pause": 0.7
      },
      {
        "text": "DNA bermuatan negatif, jadi dalam gel yang diberi tegangan, DNA bergerak menuju kutub positif.",
        "hl": [
          "kutub positif"
        ],
        "pause": 0.7
      },
      {
        "text": "Potongan yang pendek menyelinap lebih cepat di antara pori-pori gel, potongan yang panjang tertinggal.",
        "hl": [
          "lebih cepat"
        ],
        "pause": 0.7
      },
      {
        "text": "Hasilnya pita-pita yang tersusun menurut ukuran, dipakai dalam uji forensik dan penelitian genetika.",
        "hl": [
          "pita-pita"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "recap",
    "chapter": "15",
    "title": "Rangkuman",
    "mood": "resolve",
    "lead": 1.0,
    "tail": 1.6,
    "lines": [
      {
        "text": "Mari rangkum.",
        "pause": 0.5
      },
      {
        "text": "Muatan ada dua jenis, terkuantisasi dalam kelipatan e, dan selalu kekal. Gaya antarmuatan mengikuti hukum Coulomb, berbanding terbalik dengan kuadrat jarak.",
        "hl": [
          "hukum Coulomb"
        ],
        "pause": 0.7
      },
      {
        "text": "Medan listrik adalah gaya per muatan, potensial adalah energi per muatan, dan beda potensial mendorong arus melalui hambatan: V sama dengan I R.",
        "hl": [
          "V sama dengan I R"
        ],
        "pause": 0.7
      },
      {
        "text": "Kapasitor menyimpan muatan, rangkaian seri dan paralel membagi arus dan tegangan.",
        "hl": [
          "menyimpan muatan"
        ],
        "pause": 0.7
      },
      {
        "text": "Di dunia kimia, gaya Coulomb mengikat ion dalam kristal dan elektron dalam atom, diukur dalam elektronvolt, dan menggerakkan elektrolisis serta baterai.",
        "hl": [
          "mengikat ion"
        ],
        "pause": 0.7
      },
      {
        "text": "Jadi, setiap kali melihat atom berikatan atau lampu menyala, tanyakan: di mana muatannya, dan ke mana ia ingin bergerak?",
        "hl": [
          "ke mana ia ingin bergerak"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "outro",
    "chapter": "",
    "title": "Penutup",
    "mood": "outro",
    "fixed": 16,
    "lines": []
  }
];
