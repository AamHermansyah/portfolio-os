/* =================================================================
         Bahasa Indonesia — wizard Hire_Me.exe
         ================================================================= */
      /* Yang diterjemahkan hanya tampilannya. Nilai pilihan yang disimpan ke
         database tetap teks Inggris asli, supaya Mailbox dan terminal membaca
         kata yang sama apa pun bahasa wizard-nya. */
      Object.assign(ID_STRINGS, {
        'Hire Me — PortfolioOS Setup Wizard': 'Rekrut Saya — Wizard Pengaturan PortfolioOS',
        'Start over': 'Mulai ulang',
        'Prefer plain e-mail…': 'Lebih suka email biasa…',
        '< Back': '< Kembali',
        'Next >': 'Lanjut >',
        'Finish': 'Selesai',
        'Checking the delivery route…': 'Memeriksa jalur pengiriman…',
        'Press <b>Finish</b> and this goes straight to my inbox.': 'Tekan <b>Selesai</b> dan ini langsung masuk ke kotak masuk saya.',
        'This deployment has no delivery route configured, so <b>Finish</b> will hand the summary to your e-mail application instead.': 'Deployment ini belum memiliki jalur pengiriman, jadi <b>Selesai</b> akan menyerahkan ringkasan ke aplikasi email Anda.',

        /* Hasil */
        'All done': 'Selesai',
        'Not sent': 'Belum terkirim',
        '<b>Handed to your e-mail application</b>, with the summary already written out. Press Send there and it is on its way.': '<b>Diserahkan ke aplikasi email Anda</b>, dengan ringkasan yang sudah tertulis. Tekan Kirim di sana dan pesan akan meluncur.',
        '<b>Your inquiry is on its way.</b> It landed in my inbox with everything you picked, so the reply can be about the work rather than about scheduling a call to ask what the work is.<br><br><span class="dim">Expect an answer within a couple of working days.</span>': '<b>Inquiry Anda sedang dalam perjalanan.</b> Isinya masuk ke kotak masuk saya lengkap dengan semua pilihan Anda, jadi balasan bisa membahas pekerjaannya, bukan menjadwalkan telepon untuk menanyakan apa pekerjaannya.<br><br><span class="dim">Harap tunggu balasan dalam beberapa hari kerja.</span>',
        'Nothing was lost — <b>Open e-mail app</b> below hands the same summary to your mail client, or step <b>Back</b> to try again.': 'Tidak ada yang hilang — <b>Buka aplikasi email</b> di bawah akan menyerahkan ringkasan yang sama ke aplikasi email Anda, atau tekan <b>Kembali</b> untuk mencoba lagi.',

        /* Ringkasan */
        'Engagement': 'Jenis kerja sama',
        'Focus': 'Fokus',
        'Budget': 'Budget',
        'Timeline': 'Timeline',
        'Name': 'Nama',
        'E-mail': 'Email',
        'Company': 'Perusahaan',
        'Notes': 'Catatan',

        /* Langkah 1 — jenis kerja sama */
        'How would you like to work together?': 'Bagaimana kita akan bekerja sama?',
        'Everything after this follows from your answer.': 'Langkah berikutnya mengikuti jawaban Anda.',
        'Full-time role': 'Posisi full-time',
        'Employment on your team, for the long run.': 'Bergabung di tim Anda, untuk jangka panjang.',
        'Freelance / contract project': 'Proyek freelance / kontrak',
        'A defined scope, with a start and an end.': 'Lingkup yang jelas, dengan awal dan akhir.',

        /* Langkah 2 — fokus */
        'Where would I sit on the team?': 'Saya akan berada di posisi mana dalam tim?',
        'What are we building?': 'Apa yang akan kita bangun?',
        'The closest match is enough — details come later.': 'Pilihan yang paling mendekati sudah cukup — detailnya nanti.',
        'Frontend': 'Frontend',
        'Interfaces, design systems, browser performance.': 'Antarmuka, design system, performa browser.',
        'Backend': 'Backend',
        'APIs, data models, services, background work.': 'API, model data, layanan, pekerjaan latar belakang.',
        'Fullstack': 'Fullstack',
        'Both ends, feature by feature.': 'Kedua sisi, fitur demi fitur.',
        'Still shaping the role': 'Peran masih dirumuskan',
        'You know you need someone, not yet exactly what.': 'Anda tahu butuh seseorang, tapi belum persis untuk apa.',
        'Web application': 'Aplikasi web',
        'Dashboards, SaaS, internal tools.': 'Dashboard, SaaS, tools internal.',
        'E-commerce / storefront': 'E-commerce / toko online',
        'Catalogue, checkout, payments.': 'Katalog, checkout, pembayaran.',
        'API / backend service': 'API / layanan backend',
        'Data, integrations, automation.': 'Data, integrasi, otomasi.',
        'Design to code': 'Desain ke kode',
        'A finished design that needs building properly.': 'Desain yang sudah jadi dan perlu dibangun dengan benar.',
        'Something else': 'Lainnya',
        'Tell me about it on the contact step.': 'Ceritakan di langkah kontak.',

        /* Langkah 3 — budget */
        'What is the salary range?': 'Berapa kisaran gajinya?',
        'What is the budget?': 'Berapa budget-nya?',
        'A range is plenty. It shapes the scope, not the welcome.': 'Kisaran saja sudah cukup. Ini membentuk lingkup pekerjaan, bukan sambutannya.',
        'Under $60k / year': 'Di bawah $60 ribu / tahun',
        '$60k – $90k / year': '$60 ribu – $90 ribu / tahun',
        '$90k – $130k / year': '$90 ribu – $130 ribu / tahun',
        'Above $130k / year': 'Di atas $130 ribu / tahun',
        'Rather discuss it first': 'Lebih baik dibahas dulu',
        'Happy to talk before anyone names a number.': 'Senang berdiskusi sebelum menyebut angka.',
        'Under $2,000': 'Di bawah $2.000',
        'Small and tightly scoped.': 'Kecil dan lingkupnya ketat.',
        '$2,000 – $5,000': '$2.000 – $5.000',
        '$5,000 – $15,000': '$5.000 – $15.000',
        'Above $15,000': 'Di atas $15.000',
        'Not decided yet': 'Belum diputuskan',
        'Scope first, price afterwards.': 'Lingkup dulu, harga kemudian.',

        /* Langkah 4 — waktu mulai */
        'When would this start?': 'Kapan ini akan dimulai?',
        'As soon as possible': 'Secepatnya',
        'Within a month': 'Dalam satu bulan',
        'In one to three months': 'Dalam satu sampai tiga bulan',
        'Just exploring for now': 'Baru menjajaki',
        'No date yet is a perfectly good answer.': 'Belum ada tanggal juga jawaban yang baik.',

        /* Langkah 5 — kontak dan tinjau */
        'How do I reach you?': 'Bagaimana saya menghubungi Anda?',
        'Name and e-mail are required. The rest just helps me reply usefully.': 'Nama dan email wajib diisi. Sisanya membantu saya membalas dengan tepat.',
        'Your name': 'Nama Anda',
        'Optional': 'Opsional',
        'Anything else': 'Hal lain',
        'Context, links, deadlines — optional': 'Konteks, tautan, tenggat — opsional',
        'Ready to send': 'Siap dikirim',
        'Check the summary, then press Finish.': 'Periksa ringkasannya, lalu tekan Selesai.'
      });
