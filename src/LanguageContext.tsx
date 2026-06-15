import React, { createContext, useContext, useState } from 'react';

export type Language = 'id' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('preferred_language') as Language) || 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred_language', lang);
  };

  const translations: Record<Language, Record<string, string>> = {
    id: {
      // General Common
      loading: "MEMUAT...",
      sync: "SINGKRONISASI",
      onTime: "Sesuai Jadwal",
      arriving: "Tiba",
      boarding: "Boarding",
      delayed: "Telat",
      departed: "Berangkat",
      transitOnline: "AKTIF",
      transitOffline: "SISTEM",

      // App.tsx
      kioskPartner: "KIOS MITRA RESMI KAI",
      systemOnline: "Kio System Online ✨",
      dashboardTitle: "PERONKU",
      dashboardSubtitle: "DASHBOARD",
      directorySubtitle: "DIREKTORI TRANSIT METROPOLIS • LANTAI UTAMA KEBERANGKATAN",
      viewMap: "LIHAT PETA STASIUN",
      backHome: "KEMBALI KE BERANDA",
      alarmStasiun: "ALARM STASIUN: Eskalator Lantai 2 sedang dalam perawatan berkala. Jalur lift di Peron 1-6 beroperasi aman sepenuhnya.",
      standardAksesibilitas: "VERSI METROPOLIS-ID-04A • 2026 STANDAR AKSESIBILITAS RAMAH DISABILITAS",

      // LiveTimetable.tsx
      timetableTitle: "JADWAL KEBERANGKATAN",
      activeStation: "LOKASI STASIUN AKTIF:",
      allTrains: "SEMUA KERETA",
      whooshExpress: "WHOOSH & EXPRESS",
      argoIntercity: "ARGO & INTERCITY",
      krlCommuter: "KRL COMMUTER",
      noTrainsMsg: "Tidak ada jadwal kereta terdeteksi untuk kategori filter terpilih ya Kak.",
      clickRow: "👉 KETUK BARIS UNTUK MEMPREDIKSI GERBONG & SCAN TIKET",
      trainNo: "No. Kereta",
      destination: "Tujuan",
      time: "Waktu",
      platform: "Peron",
      status: "Status",
      action: "Aksi",
      scanQuick: "PILIH",
      selected: "TERPILIH",

      // TicketScannerHub.tsx
      ticketHubTitle: "PEMINDAI TIKET & RUTE",
      ticketHubDesc: "Scan Tiket & Cari Gerbong Kereta dengan Nyantai. Pilih stasiun di tabel atas terlebih dulu, lalu pindai tiket boarding Anda di sini untuk navigasi visual yang akurat terkait posisi gerbong & nomor kursi di peron sesungguhnya.",
      predictiveNav: "SISTEM PREDIKSI NAVIGASI GERBONG",
      noTrainSelectedWarning: "Silakan ketuk/pilih jadwal kereta di tabel atas untuk memulai visualisasi gerbong dan kursi.",
      selectedTrainInfo: "INFORMASI KERETA TERPILIH:",
      train: "Kereta",
      dest: "Tujuan",
      plat: "Peron",
      schedTime: "Jam Berangkat",
      enterTicketNo: "INPUT KODE BATANG ATAU NOMOR TIKET:",
      placeholderTicket: "CONTOH: KAI-7821B9, WH-1102A, etc.",
      startValidation: "SIMULASIKAN PEMBACA TIKET",
      validating: "SEDANG MEMVALIDASI TIKET...",
      reScan: "PINDAI ULANG TIKET BARU",
      seatLayout: "TATA LETAK KURSI INTERAKTIF - GERBONG",
      seatSelectionSuccess: "VALIDASI SUKSES: Kursi Anda dikonfirmasi pada Gerbong {car}, Kursi {seat}. Ikuti tanda panah kuning berkedip di peron {plat}!",
      tapToChooseSeat: "Ketuk kursi kosong berwarna hijau muda di bawah jika Anda ingin mensimulasikan pemindahan kursi lain secara dinamis:",
      carLeft: "◄ Kiri (Depan)",
      carRight: "Kanan (Belakang) ►",
      yourSeat: "KURSI ANDA",
      occupied: "TERISI",
      available: "KOSONG",
      kioTipsTitle: "Kio AI Tips Berangkat:",
      kioTipsBody: "Berdasarkan tiket Anda, Anda disarankan untuk masuk melalui Pintu Peron bagian TENANG atau TENGAH agar langsung sejajar dengan Gerbong {car} Anda saat kereta berhenti nanti.",
      scanOpA: "OPSI A: PINDAI DIGITAL",
      scanOpB: "OPSI B: INPUT MANUAL",
      scanDirection: "ARAHKAN QR KODE",
      simScan: "SIMULASI SCAN OTOMATIS",

      // AiAssistant.tsx
      aiTitle: "ASISTEN CHAT KIO AI",
      aiSubtitle: "KONTROL INFORMASI STASIUN INTEGRATIF",
      aiWelcome: "Halo Kak! Aku Kio, bot asisten stasiun ramahmu! Ada yang bisa kubantu? Tanyakan soal jadwal, posisi toilet, eskalator, atau rute KRL dan Whoosh ya! 😊",
      askSomething: "Tanya rute, kuliner, eskalator atau peron...",
      send: "KIRIM",
      botThinking: "Kio sedang berpikir...",

      // FoodRecommendations.tsx
      culinaryTitle: "REKOMENDASI KULINER TERLEZAT",
      allMornEv: "Semua Jam",
      morningMenu: "Pagi Gurih",
      afternoonMenu: "Siang Mantap",
      eveningMenu: "Malam Hangat",
      orderNow: "PESAN SEKARANG",
      deliveryEst: "Estimasi Antar: {time} mnt • Pelayan Kereta",
      prep: "Waktu Siaga: {time} mnt",
      orderSuccessTitle: "🍱 PESANAN BERHASIL DIPESAN!",
      orderSuccessDesc: "Terima kasih banyak Kak! Hidangan hangat Anda sedang dipersiapkan dan segera diantarkan oleh pramusaji andal kami langsung ke kursi Anda di {train} (Gerbong {car}, Kursi {seat}) dalam estimasi {prep} menit. Selamat menikmati!",
      okay: "SIAP, TERIMA KASIH!",
      rate: "Rating",

      // StandbyScreen.tsx
      partnershipKiosk: "SISTEM KIOSK KEMITRAAN KERETA INDONESIA",
      tapToStart: "Sentuh Layar Buat Mulai",
      waterRippleSlogan: "Efek Riak Air Interaktif Realistik Menyertai",
      relaxingJourneyHeader: "PERJALANAN LEBIH NYANTAI",
      relaxingJourneyDesc: "Ketuk layar ini buat cek rute Kereta Cepat WHOOSH / KRL Commuter Line, pesan cemilan stasiun ramah kantong, scan tiket boarding, atau ngobrol seru bareng asisten AI kita, Kio.",
      easyNavigation: "Navigasi Gampang & Bersahabat",
      accurateLayouts: "Peta Gerbong & Kursi Akurat",
      scrollDownCulinary: "GULIR KE BAWAH UNTUK KULINER STASIUN",
      scrollDownChat: "GULIR KE BAWAH UNTUK ASISTEN CHAT KIO AI",
      scrollDownAccessibility: "GULIR KE BAWAH UNTUK LAYANAN AKSESIBILITAS STASIUN",
      liveSchedules: "JADWAL LIVE",
      scrollingStationMap: "GULIR KE BAWAH UNTUK PETA STASIUN",
      legendTitle: "LAYANAN KULINER NYANTAI",
      culinaryHeader: "KULINER LEGENDARIS TERLEZAT DI PERON KITA",
      culinaryDesc: "Pesan hidangan otentik langsung dari layar kiosk atau ponsel-mu, dan biarkan pelayan andal kami mengantarkannya tepat ke nomor kursi-mu di kereta!",
      accessibilityHeader: "KEMUDAHAN PERJALANAN BAGI SEMUA PENUMPANG",
      accessibilityDesc: "Stasiun Metropolis sangat menjunjung tinggi kenyamanan seluruh kalangan penumpang. Layanan penunjang fisik, medis, dan kenyamanan keluarga siap diakses gratis tanpa biaya sepeser pun.",
      freeWheelchair: "Pendampingan & Kursi Roda Gratis",
      freeWheelchairDesc: "Butuh bantuan navigasi kursi roda, penumpangan disabilitas, atau bantuan membawa barang berat? Hubungi petugas stasiun di lobi utama atau peron, pelayanan ramah siap hadir 24 jam penuh mendampingi hingga pintu gerbong Anda aman.",
      emergencyMedical: "Pos Medis Darurat Siaga (SOS)",
      emergencyMedicalDesc: "Merasa pusing, mual, atau mengalami gangguan kesehatan mendadak saat di area stasiun? Tim medis berpengalaman beserta ambulans darurat standby penuh di ruang PPPK sayap utara stasiun peron 2. Silakan akses secara gratis dan komprehensif.",
      breastfeedingRoom: "Kamar Laktasi Higienis & Anak",
      breastfeedingRoomDesc: "Tersedia ruang menyusui/laktasi ber-AC dengan sofa empuk, kulkas penyimpan ASI, wastafel steril, dan tempat bermain mini ramah anak tepat di sebelah Gate Boarding utama peron 1. Menjaga privasi bunda dan ketenangan putra-putri tercinta.",
      sloganBottom: "🤝 KETUK DI MANA BUMI ANDA PIJAK UNTUK MEMULAI AKTIVITAS PINTAR DASBOR KAMI!",
      touchAnywhereAlert: "SENTUH DI MANA SAJA UNTUK SCAN TIKET / LIHAT DASBOR",
      marqueeText1: "KERETA CEPAT WHOOSH BERIKUTNYA KE TEGALLUAR SEGERA TIBA DI PERON 5 • SELURUH NOTIFIKASI CUACA BANDUNG & JAKARTA TERPANTAU CERAH BERAWAN",
      marqueeText2: "• POS MEDIS & KOORDINAT AMAN DARURAT LAYANAN RAMAH DISABILITAS SIAGA SEPENUHNYA DI SAYAP UTARA PERON LOBBY UTAMA",
      marqueeText3: "KA ARGO PARAHYANGAN SIAP BOARDING DI JALUR 3 UNTUK PERJALANAN NYANTAI • SCAN BARCODE TIKET-MU DI SISI KANAN SEKARANG JUGA",
      interactiveGuide: "PANDUAN INTERAKTIF",
      assistantHeading: "ASISTEN PERJALANAN PINTAR KIO AI",
      assistantDesc1: "Bingung letak pintu gerbong kereta mu? Butuh rekomendasi tempat beli oleh-oleh khas dekat stasiun tujuan, atau ingin tahu di mana letak mushola terdekat stasiun?",
      assistantDesc2: "Tanyakan apa saja kepada Kio AI. Menggunakan tutur bahasa santai, kasual, ramah, dan sangat lokal, Kio siap menuntun perjalananmu tanpa tegang!",
      modernTenants: "MODERN TENANTS",
      modernTenantsDesc: "Oleh-oleh & Kafe Premium",
      executiveLounge: "EXECUTIVE LOUNGE",
      executiveLoungeDesc: "Ruang Tunggu Bisnis",
      downToMezzanine: "▼ TURUN KE MEZZANINE",
      whooshG1102: "🇮🇩 KERETA CEPAT WHOOSH G1102",
      whooshBoardingCheck: "GERBANG PENGECEKAN BANDING SCANNER",
      musholaTitle: "🕌 MUSHOLA AGUNG",
      musholaDesc: "Tempat Beribadah & Wudhu",
      lactationTitle: "🍼 LAKTASI & MEDIS",
      lactationDesc: "Ruang Menyusui & P3K",
      cafeTakeout: "KAFE & TAKEOUT",

      // StationMapModal.tsx
      mapTitle: "PETA 3D INTERAKTIF LAYOUT STASIUN",
      floorSelect: "PILIH LANTAI MODEL:",
      floorL3: "LAYANAN PERON UTAMA (L3)",
      floorL2: "LANTAI MEZZANINE / TOKO (L2)",
      floorL1: "LOBI UTAMA / TIKETAN (L1)",
      floorKRL: "JALUR REPLIKA KRL COMMUTER LINE",
      facilityLegend: "LEGENDA FASILITAS INTERAKTIF:",
      closeMap: "TUTUP PETA STASIUN",
      zoomIn: "PERBESAR",
      zoomOut: "PERKECIL",
      resetView: "RESET",
      interactiveInstruction: "💡 Geser peta dengan mouse / sentuhan lalu klik titik untuk detail lengkap pin stasiun atau fasilitas.",
      vibrationOn: "GETAR: AKTIF",
      vibrationOff: "GETAR: NONAKTIF",
      foodAndBeverage: "KULINER & MAKANAN",
      serviceAndOffice: "KANTOR & LAYANAN",
      boardingArea: "AREA BOARDING",
      whooshPlatformTitle: "PERON 5-6 KERETA CEPAT WHOOSH (DEPARTURE LAYER)",
      whooshPeron: "PERON 5-6",
      l3_guideDesk: "MEJA INFORMASI UTAMA",
      l3_wheelchair: "KORIDOR KURSI RODA RAMAH",
      l3_restroom: "TOILET DIFABEL AC STERIL",
      l3_vipAccess: "LIFT PRIORITAS PLATFORM",
      l2_rotiO: "ROTI O - SEGAR HANGAT",
      l2_kenangan: "KOPI KENANGAN PERON",
      l2_souvenir: "SOUVENIR METROPOLIS INDAH",
      l1_ticketA: "LOKET TIKET MANDIRI A",
      l1_escUp: "ESKALATOR NAIK MEZZANINE",
      l1_mushola: "MUSHOLA AGUNG MANDIRI",
      l1_medical: "RUANG PERAWATAN MEDIS SOS",
      platformWhoosh: "PERON WHOOSH GEGER JALUR 5",
      platformCommuter: "PLATFORM METRO REPLIKA"
    },
    en: {
      // General Common
      loading: "LOADING...",
      sync: "SYNCHRONIZE",
      onTime: "On Time",
      arriving: "Arriving",
      boarding: "Boarding",
      delayed: "Delayed",
      departed: "Departed",
      transitOnline: "LIVE",
      transitOffline: "OFFLINE",

      // App.tsx
      kioskPartner: "OFFICIAL KAI KIOSK PARTNER",
      systemOnline: "Kio System Online ✨",
      dashboardTitle: "PERONKU",
      dashboardSubtitle: "DASHBOARD",
      directorySubtitle: "METROPOLIS TRANSIT DIRECTORY • DEPARTURE MAIN LEVEL",
      viewMap: "VIEW STATION MAP",
      backHome: "BACK TO HOME",
      alarmStasiun: "STATION BROADCAST: Level 2 escalator is undergoing routine maintenance. Elevators at Platforms 1-6 are fully operational.",
      standardAksesibilitas: "VERSION METROPOLIS-EN-04A • 2026 ACCESSIBILITY SYSTEM STANDARDS",

      // LiveTimetable.tsx
      timetableTitle: "DEPARTURE SCHEDULE",
      activeStation: "ACTIVE STATION LOCATION:",
      allTrains: "ALL TRAINS",
      whooshExpress: "WHOOSH & EXPRESS",
      argoIntercity: "ARGO & INTERCITY",
      krlCommuter: "KRL COMMUTER",
      noTrainsMsg: "No train schedules detected for the selected filters.",
      clickRow: "👉 TAP ON A ROW TO PREDICT CARRIAGE & SCAN BOARDING TICKET",
      trainNo: "Train No",
      destination: "Destination",
      time: "Time",
      platform: "Plat",
      status: "Status",
      action: "Action",
      scanQuick: "SELECT",
      selected: "SELECTED",

      // TicketScannerHub.tsx
      ticketHubTitle: "TICKET SCANNER & COACHES",
      ticketHubDesc: "Scan Tickets & Look for Carriages Cozily. Select a station in the table above first, then scan your boarding ticket here for accurate visual navigation regarding real platform coach & seat layout.",
      predictiveNav: "PREDICTIVE CARRIAGE ROUTING SYSTEM",
      noTrainSelectedWarning: "Please click on or select a train schedule from the timetable above to visualize carriages and seat layout.",
      selectedTrainInfo: "SELECTED TRAIN INFO:",
      train: "Train",
      dest: "Destination",
      plat: "Platform",
      schedTime: "Departure Time",
      enterTicketNo: "INPUT TICKET BARCODE OR NUMBER:",
      placeholderTicket: "EXAMPLE: KAI-7821B9, WH-1102A, etc.",
      startValidation: "SIMULATE TICKET SCANNER",
      validating: "VALIDATING TICKET SPECIFICATIONS...",
      reScan: "SCAN A NEW BOARDING TICKET",
      seatLayout: "INTERACTIVE SEAT VIEW - CARRIAGE",
      seatSelectionSuccess: "VALIDATION SUCCESSFUL: Your seat is confirmed in Carriage {car}, Seat {seat}. Follow the flashing yellow arrows on platform {plat}!",
      tapToChooseSeat: "Tap any empty bright green seat below to dynamically simulate switching seats:",
      carLeft: "◄ Left (Front)",
      carRight: "Right (Rear) ►",
      yourSeat: "YOUR SEAT",
      occupied: "OCCUPIED",
      available: "VACANT",
      kioTipsTitle: "Kio AI Assistant Departure Tips:",
      kioTipsBody: "Based on your ticket, you are recommended to enter the platform boarding gate from the SILENT or CENTRAL section to map directly with Carriage {car} when the train arrives.",
      scanOpA: "OPTION A: DIGITAL SCAN",
      scanOpB: "OPTION B: MANUAL INPUT",
      scanDirection: "POINT TICKET BARCODE HERE",
      simScan: "SIMULATE AUTO SCAN",

      // AiAssistant.tsx
      aiTitle: "KIO AI CHAT ASSISTANT",
      aiSubtitle: "INTEGRATED STATION MULTIPLE INFO HUB",
      aiWelcome: "Hi there! I'm Kio, your friendly local helper bot! How can I assist you with your travels today? Ask me about train routes, schedules, facilities, food, or restrooms! 😊",
      askSomething: "Ask about routes, local food, platform location...",
      send: "SEND",
      botThinking: "Kio is thinking...",

      // FoodRecommendations.tsx
      culinaryTitle: "BEST LOCAL STATION FLAVORS",
      allMornEv: "All Day",
      morningMenu: "Morning Savory",
      afternoonMenu: "Noon Special",
      eveningMenu: "Night Warmth",
      orderNow: "ORDER NOW",
      deliveryEst: "Delivery Est: {time} mins • Train Crew",
      prep: "Prep Time: {time} mins",
      orderSuccessTitle: "🍱 FOOD ORDER CONFIRMED!",
      orderSuccessDesc: "Thank you so much! Your meal is being freshly prepared and will be served to you directly by our train crew at {train} (Carriage {car}, Seat {seat}) in approximately {prep} minutes. Enjoy your culinary trip!",
      okay: "GOT IT, THANKS!",
      rate: "Rating",

      // StandbyScreen.tsx
      partnershipKiosk: "INDONESIAN RAILWAYS PARTNER SYSTEM KIOSK",
      tapToStart: "Touch Anywhere on the Screen to Begin",
      waterRippleSlogan: "Accompanied by realistic interactive water ripple effect",
      relaxingJourneyHeader: "A COZIER JOURNEY",
      relaxingJourneyDesc: "Tap here to check WHOOSH High-Speed Train & Commuter Line routes, order local wallet-friendly snacks, scan ticket barcodes, or play with Kio, our high-performance AI assistant.",
      easyNavigation: "Simple & Friendly Navigation Layout",
      accurateLayouts: "Accurate Coach & Seats Spatial Mapping",
      scrollDownCulinary: "SCROLL DOWN FOR STATION CULINARY DELIGHTS",
      scrollDownChat: "SCROLL DOWN TO MEET KIO AI CHAT ASSISTANT",
      scrollDownAccessibility: "SCROLL DOWN FOR ACCESSIBILITY SERVICES",
      liveSchedules: "LIVE BOARD",
      scrollingStationMap: "SCROLL DOWN FOR DETAILED STATION DIRECTORY",
      legendTitle: "EASY IN-TRAIN SERVICE CULINARY",
      culinaryHeader: "LEGENDARY LOCAL DELICACIES AT OUR TERMINAL",
      culinaryDesc: "Order delicious iconic foods directly from this terminal screen or your smartphone, and have our dedicated crew deliver them directly to your seat inside your coach!",
      accessibilityHeader: "SEAMLESS TRAVEL COMFORT INTEGRATION FOR ALL",
      accessibilityDesc: "Our Metropolis Station holds accessibility to the highest standard. Physical assistance, medical, and family support modules are completely free to utilize.",
      freeWheelchair: "Wheelchair Assistance & Escort Service",
      freeWheelchairDesc: "Need help with wheelchair boarding, disability routing assistance, or heavy baggage handling? Contact our crew at the lobby main desks or platforms for dedicated friendly round-the-clock service directly to your carriage.",
      emergencyMedical: "SOS First-Aid Emergency Rooms",
      emergencyMedicalDesc: "Feeling unwell, dizzy, or having a sudden healthcare concern around our terminal? Licensed doctors, medics, and ambulances standby at our medical room located in the North Wing of Platform 2 completely free of charge.",
      breastfeedingRoom: "Sterile Nursing Rooms & Daycare",
      breastfeedingRoomDesc: "Enjoy our clean air-conditioned breastfeeding facilities featuring cozy sofas, chilled baby milk storage, sterile washing counters, and mini children playgrounds right next to main Boarding Gate 1 in total privacy.",
      sloganBottom: "🤝 TOUCH ANYWHERE TO LAUNCH THE INTERACTIVE DASHBOARD SYSTEM!",
      touchAnywhereAlert: "TOUCH ANYWHERE TO SCAN TICKET / VIEW DASHBOARD",
      marqueeText1: "UPCOMING WHOOSH HIGH SPEED TRAIN TO TEGALLUAR IMMINENT ON PLATFORM 5 • LOCAL WEATHER CONDITIONS FROM JAKARTA INTO BANDUNG CALM & CLOUDY",
      marqueeText2: "• EMERGENCY MEDICAL SERVICES & COMPREHENSIVE SPECIAL ACCESS SIAGA ON NORTH PLATFORM OF THE DEPARTURE AREA LOBBY",
      marqueeText3: "KA ARGO PARAHYANGAN NOW PREPARING TO BOARD ON TRACK 3 FOR A PREMIUM JOURNEY • SCAN TICKETS AT THE PANEL TERMINAL NOW",
      interactiveGuide: "INTERACTIVE GUIDE",
      assistantHeading: "SMART STATION ASSISTANT KIO AI",
      assistantDesc1: "Puzzled about where your train carriage will stop? Looking for souvenirs from your target city, or need to locate the nearest restroom?",
      assistantDesc2: "Just ask Kio AI everything. Showing cozy, casual, local and highly conversational language, Kio is here to assist and ensure a stress-free journey!",
      modernTenants: "MODERN TENANTS",
      modernTenantsDesc: "Exclusive Souvenirs & Cafe",
      executiveLounge: "EXECUTIVE LOUNGE",
      executiveLoungeDesc: "Business Waiting Quarters",
      downToMezzanine: "▼ DOWN TO MEZZANINE",
      whooshG1102: "🇮🇩 WHOOSH G1102 BULLET TRAIN",
      whooshBoardingCheck: "GERBANG PENGECEKAN BANDING SCANNER",
      musholaTitle: "🕌 GRAND MUSHOLA",
      musholaDesc: "Prayer Hall & Ablution Area",
      lactationTitle: "🍼 NURSERY & CLINIC",
      lactationDesc: "Nursing Room & First-Aid Station",
      cafeTakeout: "CAFE & TAKEOUT",

      // StationMapModal.tsx
      mapTitle: "3D STATION VECTOR MAP DIRECTORY",
      floorSelect: "MODEL FLOOR SELECTOR:",
      floorL3: "MAIN BOARDING DEPARTURE LEVEL (L3)",
      floorL2: "MEZZANINE SHOPPING LEVEL (L2)",
      floorL1: "GROUND LOBBY & TICKETING (L1)",
      floorKRL: "KRL COMMUTER REPLICA MAP JALUR L4",
      facilityLegend: "INTERACTIVE FACILITY SYSTEM LEGEND:",
      closeMap: "CLOSE DIRECTORY MAP",
      zoomIn: "ZOOM IN",
      zoomOut: "ZOOM OUT",
      resetView: "RESET",
      interactiveInstruction: "💡 Pan the directory via mouse or touchpad. Click any pin node or target destination to trigger details popups.",
      vibrationOn: "VIBRATE: ON",
      vibrationOff: "VIBRATE: OFF",
      foodAndBeverage: "DINING & FOOD",
      serviceAndOffice: "MANAGEMENT & SERVICES",
      boardingArea: "BOARDING SECTORS",
      whooshPlatformTitle: "PLATFORM 5-6 WHOOSH HIGH-SPEED PLATFORM (OVERHEAD LAYER)",
      whooshPeron: "PLATFORM 5-6",
      l3_guideDesk: "MAIN INFO DESK",
      l3_wheelchair: "WHEELCHAIR ACCESSIBLE CORIDOR",
      l3_restroom: "ACCESSIBLE AC RESTROOM",
      l3_vipAccess: "PLATFORM LIFTS DESERT",
      l2_rotiO: "ROTI O - HOT FRESH",
      l2_kenangan: "KOPI KENANGAN CORNER",
      l2_souvenir: "METROPOLIS SOUVENIRS",
      l1_ticketA: "SELF-TICKETING DESK A",
      l1_escUp: "ESCALATOR L2 TO L3 UP",
      l1_mushola: "GRAND CLEAN PRAYER HOUSE",
      l1_medical: "SOS FIRST AID MEDICAL DESK",
      platformWhoosh: "WHOOSH FAST TRACK 5 SECTORS",
      platformCommuter: "COMMUTER METROPOLIS ROAD REPLICA"
    }
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] || translations['id']?.[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
