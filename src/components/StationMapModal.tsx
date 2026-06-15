import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, MapPin, Navigation, Info, 
  Layers, Compass, ArrowUpRight, Check, Heart, ShieldAlert,
  Search, Train, Map, Smartphone
} from 'lucide-react';
import { triggerVibration, playClickSound } from '../utils';

interface StationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FloorLevel = 'L1' | 'L2' | 'L3';

interface LocationInfo {
  id: string;
  name: string;
  category: 'platform' | 'facility' | 'food';
  floor: FloorLevel;
  description: string;
  details: string;
  x: number; // Target x coordinate on map (0-100)
  y: number; // Target y coordinate on map (0-100)
}

const LOCATIONS: LocationInfo[] = [
  // Lantai 1 Locations
  {
    id: 'p12',
    name: 'Peron 1 & 2 (KRL Commuter Line)',
    category: 'platform',
    floor: 'L1',
    description: 'Jalur transit lokal Jabodetabek ke arah Tanah Abang, Sudirman, Manggarai, Bogor, & Bekasi.',
    details: 'Beroperasi setiap 5-10 menit. Silakan tap kartu multi-trip atau QR-Link pada gerbang tiket masuk.',
    x: 35,
    y: 75
  },
  {
    id: 'p34',
    name: 'Peron 3 & 4 (Argo Intercity & Parahyangan)',
    category: 'platform',
    floor: 'L1',
    description: 'Jalur keberangkatan kereta jarak jauh PT KAI ke Bandung, Yogyakarta, Solo, & Surabaya.',
    details: 'Boarding dibuka 30 menit sebelum keberangkatan kereta. Harap siapkan e-tiket & KTP fisik Anda.',
    x: 65,
    y: 75
  },
  {
    id: 'toilet-l1',
    name: 'Toilet Kelas Utama & Loker Penitipan',
    category: 'facility',
    floor: 'L1',
    description: 'Toilet higienis, ramah disabilitas, serta loker penitipan barang mandiri berpintu sandi elektronik.',
    details: 'Berada di pojok kanan pintu masuk utama peron 3. Loker penitipan mendukung pembayaran nontunai (QRIS).',
    x: 88,
    y: 35
  },
  {
    id: 'tiket-manual',
    name: 'Loket Tiket Manual & Kundungan Pelanggan',
    category: 'facility',
    floor: 'L1',
    description: 'Pembelian tiket fisik cadangan, pembatalan jadwal, refund, serta pusat bantuan porter stasiun.',
    details: 'Tersedia 4 loket aktif & 2 mesin cetak tiket mandiri (CIM) untuk kemudahan penukaran kode booking.',
    x: 15,
    y: 40
  },
  {
    id: 'pintu-masuk',
    name: 'Pintu Gerbang Pemeriksaan Main Entrance',
    category: 'facility',
    floor: 'L1',
    description: 'Pusat gerbang tapping KRL & pintu pemindaian QR tiket Argo jarak jauh.',
    details: 'Gunakan antrean sebelah kiri untuk akses khusus kursi roda, lansia, dan ibu hamil berpembantu ranger.',
    x: 50,
    y: 35
  },

  // Lantai 2 Locations (Mezzanine)
  {
    id: 'foodcourt-l2',
    name: 'Pusat Kuliner Mezzanine Area',
    category: 'food',
    floor: 'L2',
    description: 'Menu andalan Nasi Goreng KAI Premium, Bakso Arema, es teh manis jumbo, & aneka cemilan hangat stasiun.',
    details: 'Tersedia tempat duduk komunal yang nyaman dengan colokan listrik charger laptop lengkap di setiap meja.',
    x: 30,
    y: 45
  },
  {
    id: 'kopi-roti',
    name: 'Kopi Kenangan & Roti O Corner',
    category: 'food',
    floor: 'L2',
    description: 'Kopi susu gula aren andalan & Roti mentega renyah wangi moka khas stasiun.',
    details: 'Sajian kilat siap bawa (takeaway) yang pas untuk dinikmati sebelum naik eskalator peron.',
    x: 75,
    y: 45
  },
  {
    id: 'mushola-l2',
    name: 'Mushola Agung & Fasilitas Wudhu',
    category: 'facility',
    floor: 'L2',
    description: 'Ruang ibadah luas ber-AC sejuk, terpisah untuk jamaah pria & wanita.',
    details: 'Dilengkapi mukena, sarung, sajadah bersih wangi, serta sendal wudhu anti-selip.',
    x: 12,
    y: 25
  },
  {
    id: 'laktasi-medis',
    name: 'Ruang Laktasi & Klinik Medis Darurat',
    category: 'facility',
    floor: 'L2',
    description: 'Kamar privasi ibu menyusui yang tenang, sofa nyaman, serta klinik pertolongan pertama (P3K).',
    details: 'Didampingi 1 perawat medis siaga stasiun. Akses gratis dan beroperasi penuh selama jam dinas kereta.',
    x: 88,
    y: 25
  },

  // Lantai 3 Locations
  {
    id: 'p56-whoosh',
    name: 'Peron 5 & 6 (Kereta Cepat WHOOSH)',
    category: 'platform',
    floor: 'L3',
    description: 'Jalur layang super cepat rute Stasiun Jakarta Halim ke Bandung (Padalarang / Tegalluar).',
    details: 'Kecepatan hingga 350 km/jam. Kereta super tenang. Silakan tunggu di ruang tunggu boarding utama.',
    x: 50,
    y: 80
  },
  {
    id: 'boarding-gate-whoosh',
    name: 'Gerbang Boarding Verifikasi WHOOSH',
    category: 'facility',
    floor: 'L3',
    description: 'Gerbang otomatis pengenalan tiket elektronik WHOOSH terintegrasi QR barcode reader.',
    details: 'Pintu boarding ditutup otomatis secara sistem 5 menit tepat sebelum waktu keberangkatan.',
    x: 50,
    y: 45
  },
  {
    id: 'vip-lounge',
    name: 'VIP Executive Lounge WHOOSH',
    category: 'facility',
    floor: 'L3',
    description: 'Ruang tunggu eksklusif untuk penumpang kelas bisnis & first class.',
    details: 'Sajian minuman seduhan gratis, kudapan manis, Wi-Fi ultra cepat, koran harian, & toilet private.',
    x: 15,
    y: 35
  },
  {
    id: 'tenant-eksklusif',
    name: 'Tenant Kafe Premium & Toko Souvenir',
    category: 'food',
    floor: 'L3',
    description: 'Butik oleh-oleh modern khas nusantara, souvenir miniatur kereta cepat, & kedai teh aroma premium.',
    details: 'Berbelanja cinderamata eksklusif stasiun sembari menunggu aba-aba boarding.',
    x: 82,
    y: 35
  }
];

interface GuideRoute {
  distance: string;
  time: string;
  instructions: string[];
  svgPath: string; // Floor-specific path
}

const getRouteDetails = (targetId: string, activeFloor: FloorLevel): GuideRoute => {
  switch(targetId) {
    case 'p12':
      return {
        distance: '95 m',
        time: '1.5 menit',
        instructions: [
          'Melangkah keluar dari loket pemeriksaan utama di koridor fasa L1.',
          'Lakukan pengetapan kartu tiket mandiri pada gerbang Gate KRL.',
          'Turun menggunakan tangga sebelah kiri menuju peron bawah tanah Jalur 1 & 2.'
        ],
        svgPath: activeFloor === 'L1' ? 'M 250,133 L 250,230 L 175,230 L 175,285' : ''
      };
    
    case 'p34':
      return {
        distance: '110 m',
        time: '2 menit',
        instructions: [
          'Jalan menyusuri sisi timur area hall utama melewati loker bagasi.',
          'Tunjukkan manifest QR tiket kereta jarak jauh Anda ke scanner boarding.',
          'Masuk melalui jembatan masuk steril ke platform peron bawah tanah Jalur 3 & 4.'
        ],
        svgPath: activeFloor === 'L1' ? 'M 250,133 L 250,230 L 325,230 L 325,285' : ''
      };
      
    case 'p56-whoosh':
      return {
        distance: '240 m',
        time: '4.5 menit',
        instructions: [
          'Dari pintu masuk L1, arahkan langkah ke eskalator / lift naik utama L2.',
          'Berjalan melintasi koridor Mezzanine L2 ke arah eskalator layang L3 WHOOSH.',
          'Tunjukkan tiket premium Anda ke gerbang verifikasi boarding otomatis L3.',
          'Naik eskalator terakhir menuju platform rel layang Peron 5 & 6.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : activeFloor === 'L2' 
            ? 'M 300,50 L 300,240 L 250,240' 
            : 'M 230,105 L 250,105 L 250,160 L 250,285'
      };

    case 'toilet-l1':
      return {
        distance: '65 m',
        time: '1 menit',
        instructions: [
          'Berjalan ke arah kanan (timur) langsung setelah gerbang utama.',
          'Lewati jajaran unit loker penitipan barang elektronik otomatis.',
          'Toilet higienis dan wastafel berada tepat di ujung sayap kanan.'
        ],
        svgPath: activeFloor === 'L1' ? 'M 250,133 L 415,133 L 415,100' : ''
      };

    case 'tiket-manual':
      return {
        distance: '45 m',
        time: '45 detik',
        instructions: [
          'Melangkah langsung ke sayap kiri barat ruangan lobby L1.',
          'Temukan loket fisik bertanda papan nama merah KAI.',
          'Antre dengan tertib di depan loket pelayanan tiket harian.'
        ],
        svgPath: activeFloor === 'L1' ? 'M 250,133 L 130,133 L 130,105' : ''
      };

    case 'foodcourt-l2':
      return {
        distance: '150 m',
        time: '3 menit',
        instructions: [
          'Gunakan eskalator timur L1 untuk naik ke area Mezzanine L2.',
          'Di area L2, belok kiri menyusuri pinggir pagar balkon kaca.',
          'Bilik warung makan komunal ada di ujung barat lantai Mezzanine.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : 'M 300,50 L 150,50 L 150,171'
      };

    case 'kopi-roti':
      return {
        distance: '135 m',
        time: '2.5 menit',
        instructions: [
          'Naik eskalator utama L1 menuju area lantai Mezzanine L2.',
          'Berjalan lurus melintasi jembatan balkon atas void stasiun.',
          'Gerai Kopi Kenangan & Roti O berada berdampingan dengan eskalator L3.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : 'M 300,50 L 375,50 L 375,171'
      };

    case 'mushola-l2':
      return {
        distance: '185 m',
        time: '3.5 menit',
        instructions: [
          'Gunakan lift penumpang atau eskalator L1 ke Lantai Mezzanine L2.',
          'Berjalan berkeliling menyusuri balkon luar sisi barat.',
          'Mushola Agung terletak di ruangan sejuk bersebelahan dengan wudhu.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : 'M 300,50 L 110,50 L 110,275'
      };

    case 'laktasi-medis':
      return {
        distance: '170 m',
        time: '3 menit',
        instructions: [
          'Naik eskalator timur lobby L1 menuju area Mezzanine L2.',
          'Belok kanan menuju sayap timur dekat klinik P3K stasiun.',
          'Kamar laktasi yang tenang berada di bagian terdalam sayap klinik.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : 'M 300,50 L 390,50 L 390,275'
      };

    case 'vip-lounge':
      return {
        distance: '210 m',
        time: '4 menit',
        instructions: [
          'Gunakan lift utama untuk naik langsung ke lantai keberangkatan L3.',
          'Keluar dari pintu lift, belok kiri menyusuri kaca pembatas.',
          'Ruang VIP lounge berdesain khusus ada di sebelah barat lorong.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : activeFloor === 'L2' 
            ? 'M 300,50 L 300,240 L 250,240' 
            : 'M 230,105 L 100,105 L 100,120'
      };

    case 'tenant-eksklusif':
      return {
        distance: '220 m',
        time: '4.5 menit',
        instructions: [
          'Gunakan eskalator atau lift stasiun ke area boarding WHOOSH L3.',
          'Berjalan ke arah timur luar deretan security gate.',
          'Tenant penjual souvenir resmi WHOOSH siap melayani di ujung lorong.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : activeFloor === 'L2' 
            ? 'M 300,50 L 300,240 L 250,240' 
            : 'M 230,105 L 400,105 L 400,120'
      };

    case 'boarding-gate-whoosh':
      return {
        distance: '200 m',
        time: '3.8 menit',
        instructions: [
          'Gunakan akses escalator ke Lantai 3 area tunggu WHOOSH.',
          'Cari papan petunjuk gate boarding utama di sisi tengah ruangan.',
          'Siapkan tiket fisik atau tiket digital untuk dipindai pada sensor gate.'
        ],
        svgPath: activeFloor === 'L1' 
          ? 'M 250,133 L 300,133 L 300,50' 
          : activeFloor === 'L2' 
            ? 'M 300,50 L 300,240 L 250,240' 
            : 'M 230,105 L 250,105 L 250,140'
      };

    default:
      return {
        distance: '100 m',
        time: '2 menit',
        instructions: [
          'Berjalan melangkah menyusuri papan rambu wayfinding stasiun.',
          'Selalu waspada dan perhatikan marka kuning garis aman platform.'
        ],
        svgPath: ''
      };
  }
};

export interface KRLStation {
  id: string;
  name: string;
  line: string; // "Bogor Line", "Cikarang Line", "Rangkasbitung Line", "Tangerang Line", "Tanjung Priok Line", "KA Lokal Merak"
  color: string;
  coord: { x: number; y: number };
  connections: string[]; // ['MRT', 'LRT', 'KA-Bandara', 'KA-Lokal', 'Ferry']
  description: string;
}

export const KRL_LINES = [
  { name: 'Bogor Line (Jakarta Kota - Bogor/Nambo)', color: '#EF4444', label: 'Merah' },
  { name: 'Cikarang Loop Line (Jatinegara - Cikarang)', color: '#0EA5E9', label: 'Biru' },
  { name: 'Rangkasbitung Line (Tanah Abang - Rangkasbitung)', color: '#22C55E', label: 'Hijau' },
  { name: 'Tangerang Line (Duri - Tangerang)', color: '#B45309', label: 'Cokelat' },
  { name: 'Tanjung Priok Line (Jakarta Kota - Tanjung Priok)', color: '#EC4899', label: 'Pink' },
  { name: 'KA Lokal Merak (Rangkasbitung - Merak)', color: '#15803D', label: 'Hijau Tua' }
];

export const KRL_STATIONS: KRLStation[] = [
  // Bogor Line (Red)
  { id: 'kr-jkak', name: 'Jakarta Kota', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 50 }, connections: ['MRT', 'KA-Lokal'], description: 'Stasiun hub paling vital di utara Jakarta. Pusat transit rute Bogor dan Tanjung Priok.' },
  { id: 'kr-jua', name: 'Juanda', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 100 }, connections: ['TransJakarta'], description: 'Stasiun layang dekat Masjid Istiqlal, Gereja Katedral, dan halte utama TransJakarta.' },
  { id: 'kr-gon', name: 'Gondangdia', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 145 }, connections: [], description: 'Pusat stasiun layang strategis dekat Jalan Jaksa, Monas, dan kuliner sate.' },
  { id: 'kr-mri', name: 'Manggarai', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 200 }, connections: ['LRT', 'KA-Bandara'], description: 'Stasiun transit tersibuk se-Indonesia Raya. Titik temu Bogor Line, Cikarang Line, dan Kereta Bandara.' },
  { id: 'kr-psm', name: 'Pasar Minggu', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 265 }, connections: [], description: 'Terminal stasiun komuter sibuk wilayah selatan Jakarta, dengan mobilitas sangat padat.' },
  { id: 'kr-dpk', name: 'Depok Baru', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 325 }, connections: [], description: 'Stasiun komuter andalan warga Depok, diapit langsung pusat perbelanjaan dan terminal bus.' },
  { id: 'kr-cty', name: 'Citayam', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 375 }, connections: [], description: 'Gerbang transisi utama pecahan jalur kereta Bogor (lurus) atau ke peron tumpukan luar Nambo (kanan).' },
  { id: 'kr-bgr', name: 'Bogor', line: 'Bogor Line', color: '#EF4444', coord: { x: 250, y: 440 }, connections: ['KA-Lokal'], description: 'Terminus sejuk tersibuk di dataran tinggi selatan, persis di sebelah Istana Kepresidenan Bogor.' },
  { id: 'kr-nmb', name: 'Nambo', line: 'Bogor Line', color: '#EF4444', coord: { x: 335, y: 375 }, connections: [], description: 'Stasiun terminus sayap timur Kabupaten Bogor, dikelilingi kawasan industri pabrik terpadu.' },

  // Cikarang Loop Line (Blue)
  { id: 'kr-kpb', name: 'Kampung Bandan', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 190, y: 80 }, connections: [], description: 'Stasiun transit berbentuk segitiga rel layang di Jakarta Utara yang menghubungkan loop line.' },
  { id: 'kr-dur', name: 'Duri', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 130, y: 130 }, connections: ['KA-Bandara'], description: 'Stasiun transit wajib ke arah bandara Soekarno-Hatta atau transit jalur komuter Tangerang.' },
  { id: 'kr-tha', name: 'Tanah Abang', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 130, y: 200 }, connections: [], description: 'Pusat perlintasan dagang terpadat barat Jakarta. Titik transit andalan Rangkasbitung Line.' },
  { id: 'kr-sud', name: 'Sudirman', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 190, y: 200 }, connections: ['MRT', 'LRT'], description: 'Koridor integrasi emas Sudirman-Dukuh Atas. Penghubung MRT Jakarta dan LRT Jabodebek.' },
  { id: 'kr-jtng', name: 'Jatinegara', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 370, y: 200 }, connections: [], description: 'Hub penataan kereta api wilayah timur DKI, mempertemukan jalur komuter Bekasi dengan KA jarak jauh.' },
  { id: 'kr-bks', name: 'Bekasi', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 425, y: 200 }, connections: [], description: 'Gerbang utama mobilisasi warga Kota Bekasi menuju pusat Jakarta. Sangat sibuk pada jam kerja.' },
  { id: 'kr-ckr', name: 'Cikarang', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 480, y: 200 }, connections: ['KA-Lokal'], description: 'Ujung terminus timur ganda, sekaligus transit menuju Kereta Api Lokal Purwakarta.' },
  { id: 'kr-pse', name: 'Pasar Senen', line: 'Cikarang Line', color: '#0EA5E9', coord: { x: 370, y: 125 }, connections: [], description: 'Stasiun legendaris rute ekonomi, andalan para pemudik dan komuter komersial DKI.' },

  // Rangkasbitung Line (Green)
  { id: 'kr-plm', name: 'Palmerah', line: 'Rangkasbitung Line', color: '#22C55E', coord: { x: 95, y: 247 }, connections: [], description: 'Stasiun modern depan area gedung parlemen DPR RI, melayani mobilitas perkantoran.' },
  { id: 'kr-kby', name: 'Kebayoran', line: 'Rangkasbitung Line', color: '#22C55E', coord: { x: 67, y: 295 }, connections: ['TransJakarta'], description: 'Terhubung skywalk panjang langsung ke jalur TransJakarta koridor 8 ramah koridor luar.' },
  { id: 'kr-srp', name: 'Serpong', line: 'Rangkasbitung Line', color: '#22C55E', coord: { x: 38, y: 345 }, connections: [], description: 'Stasiun penyangga vital kota mandiri BSD Tangerang Selatan, melayani ribuan warga suburban.' },
  { id: 'kr-ppj', name: 'Parung Panjang', line: 'Rangkasbitung Line', color: '#22C55E', coord: { x: 15, y: 395 }, connections: [], description: 'Depot masif pemeliharaan rangkaian kereta andalan banten.' },
  { id: 'kr-rkb', name: 'Rangkasbitung', line: 'Rangkasbitung Line', color: '#22C55E', coord: { x: 15, y: 450 }, connections: ['KA-Lokal'], description: 'Stasiun terminus barat Rangkas Line. Transit langsung Kereta Api Lokal Merak.' },

  // Tangerang Line (Brown)
  { id: 'kr-btc', name: 'Batu Ceper', line: 'Tangerang Line', color: '#B45309', coord: { x: 70, y: 110 }, connections: ['KA-Bandara'], description: 'Akses vital di kota Tangerang, menghubungkan KRL reguler dengan rel eksekutif Basoetta.' },
  { id: 'kr-tng', name: 'Tangerang', line: 'Tangerang Line', color: '#B45309', coord: { x: 15, y: 100 }, connections: [], description: 'Ujung terminus barat laut stasiun, berdekatan dengan heritages kuliner Pasar Lama.' },

  // Tanjung Priok Line (Pink)
  { id: 'kr-tpk', name: 'Tanjung Priok', line: 'Tanjung Priok Line', color: '#EC4899', coord: { x: 370, y: 55 }, connections: [], description: 'Stasiun megah cagar budaya bergaya megah Klasik Belanda, dekat wilayah pelabuhan peti kemas.' },

  // KA Lokal Merak (Dark Green)
  { id: 'kr-srg', name: 'Serang', line: 'KA Lokal Merak', color: '#15803D', coord: { x: 15, y: 505 }, connections: [], description: 'Gerbang pusat kereta api kota gubernur Banten, melayani rute lokal pelaju pesisir.' },
  { id: 'kr-mrk', name: 'Merak', line: 'KA Lokal Merak', color: '#15803D', coord: { x: 75, y: 505 }, connections: ['Ferry'], description: 'Ujung perlintasan kereta paling ujung barat Jawa, nempel loket boarding kapal ferry penyeberangan Selat Sunda.' }
];

export default function StationMapModal({ isOpen, onClose }: StationMapModalProps) {
  const [activeFloor, setActiveFloor] = useState<FloorLevel>('L1');
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  
  // Custom states for tab switches and KRL Search Route maps
  const [activeTab, setActiveTab] = useState<'station' | 'krl_route'>('station');
  const [krlSearchQuery, setKrlSearchQuery] = useState<string>('');
  const [selectedKrlStation, setSelectedKrlStation] = useState<KRLStation | null>(null);

  // Expanded directory state for mobile devices - false by default so map opens immediately in full screen
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  // Soft vibration toggle (disabled by default to prevent buggy iframe/browser-specific buzzes)
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(false);

  // Helper to trigger safe tactical haptic vibration if enabled
  const localVibrate = (pattern: number | number[]) => {
    if (vibrationEnabled) {
      triggerVibration(pattern);
    }
  };

  // Auto focus KRL station coordinates when selected
  const handleKrlStationSelect = (station: KRLStation) => {
    localVibrate(18);
    playClickSound();
    setSelectedKrlStation(station);
  };
  
  // Custom interactive viewport pan and zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Auto focus location coordinates when selected
  const handleLocationSelect = (loc: LocationInfo) => {
    localVibrate(18);
    playClickSound();
    
    // Switch the floor level if different
    if (loc.floor !== activeFloor) {
      setActiveFloor(loc.floor);
    }
    
    setSelectedLocation(loc);
  };

  const handleFloorChange = (floor: FloorLevel) => {
    localVibrate([20, 10]);
    playClickSound();
    setActiveFloor(floor);
    // Reset selection and zoom state to give a fresh view
    setSelectedLocation(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom manipulation
  const triggerZoomIn = () => {
    localVibrate(10);
    playClickSound();
    setZoom(prev => Math.min(prev + 0.3, 3.5));
  };

  const triggerZoomOut = () => {
    localVibrate(10);
    playClickSound();
    setZoom(prev => {
      const next = Math.max(prev - 0.3, 0.8);
      if (next <= 1) {
        setPan({ x: 0, y: 0 }); // reset center
      }
      return next;
    });
  };

  const triggerReset = () => {
    localVibrate(15);
    playClickSound();
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedLocation(null);
  };

  // Dragging interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return; // Only pan when zoomed in
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Limit panning bounds according to zoom multiplier
    const maxBoundX = (zoom - 1) * 200;
    const maxBoundY = (zoom - 1) * 200;
    
    setPan({
      x: Math.max(-maxBoundX, Math.min(maxBoundX, newX)),
      y: Math.max(-maxBoundY, Math.min(maxBoundY, newY))
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Responsive touch events for high-end kiosk physical interface simulation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1) return;
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.current.x;
    const newY = touch.clientY - dragStart.current.y;
    
    const maxBoundX = (zoom - 1) * 200;
    const maxBoundY = (zoom - 1) * 200;
    
    setPan({
      x: Math.max(-maxBoundX, Math.min(maxBoundX, newX)),
      y: Math.max(-maxBoundY, Math.min(maxBoundY, newY))
    });
  };

  // Automatically focus closest platform if none selected
  useEffect(() => {
    if (isOpen) {
      localVibrate([30, 20, 20]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter locations to match active floor
  const floorLocations = LOCATIONS.filter(loc => loc.floor === activeFloor);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#4F252E] transition-opacity duration-300">
      
      {/* Main Stark, Editorial Styled Block frame */}
      <div 
        id="station-map-container"
        className="relative w-full h-full bg-[#4F252E] flex flex-col overflow-hidden text-[#FFF7C5]"
      >
        {/* Editorial Top bar of Kiosk Dialog */}
        <div className="flex items-center justify-between border-b-4 border-black bg-[#FFF7C5] p-3 text-[#4F252E]">
          <div className="flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-[#F4AE52] animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <p className="font-mono text-[9px] font-black tracking-wider uppercase leading-none opacity-80">INTELLIGENT WAYFINDING TERMINAL</p>
              <h2 className="font-mono text-base font-black uppercase leading-tight tracking-tight mt-0.5">PETA INTERAKTIF STASIUN</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Elegant physical-style Haptic Toggle */}
            <button
              onClick={() => {
                const nextState = !vibrationEnabled;
                setVibrationEnabled(nextState);
                playClickSound();
                if (nextState) {
                  triggerVibration(15);
                }
              }}
              className={`border-2 border-black p-2 transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px] text-[10px] font-mono font-black ${
                vibrationEnabled 
                  ? 'bg-[#EF4444] text-white hover:bg-[#dc2626]' 
                  : 'bg-[#4F252E] text-[#FFF7C5]/60 hover:text-[#FFF7C5]'
              }`}
              title={vibrationEnabled ? 'Nonaktifkan Getar (Vibration ON)' : 'Aktifkan Getar (Vibration OFF)'}
            >
              {vibrationEnabled ? <Smartphone className="w-4 h-4 text-white animate-pulse" /> : <Smartphone className="w-4 h-4 opacity-40" />}
              <span className="hidden sm:inline tracking-wider">{vibrationEnabled ? 'GETAR: ON' : 'GETAR: OFF'}</span>
            </button>

            <span className="hidden lg:inline font-mono text-[10px] font-black border border-black/20 bg-black/5 px-2 py-2 min-h-[40px] flex items-center justify-center">
              PROYEKSI AKTIF: UTARA 0°
            </span>
            <button 
              onClick={() => {
                localVibrate(15);
                playClickSound();
                onClose();
              }}
              className="bg-[#4F252E] hover:bg-[#F4AE52] text-[#FFF7C5] hover:text-black border-2 border-black p-2 transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Tutup Map"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector Mode Banner */}
        <div className="flex border-b-4 border-black bg-[#3E1A22] text-xs sm:text-sm font-mono font-black uppercase shrink-0">
          <button
            onClick={() => {
              localVibrate(15);
              playClickSound();
              setActiveTab('station');
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className={`flex-1 text-center py-3.5 sm:py-4 min-h-[46px] border-r-4 border-black transition-all cursor-pointer flex items-center justify-center ${
              activeTab === 'station'
                ? 'bg-[#F4AE52] text-black font-black'
                : 'text-[#FFF7C5]/70 hover:text-[#FFF7C5] hover:bg-white/5'
            }`}
          >
            🗺️ PETA INTERAKTIF STASIUN (LANTAI 1-3)
          </button>
          <button
            onClick={() => {
              localVibrate(15);
              playClickSound();
              setActiveTab('krl_route');
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className={`flex-1 text-center py-3.5 sm:py-4 min-h-[46px] transition-all cursor-pointer flex items-center justify-center ${
              activeTab === 'krl_route'
                ? 'bg-[#F4AE52] text-black font-black'
                : 'text-[#FFF7C5]/70 hover:text-[#FFF7C5] hover:bg-white/5'
            }`}
          >
            🚊 PETA RUTE COMMUTER KRL JABODETABEK & MERAK
          </button>
        </div>

        {/* Outer Split Pane Layout */}
        {activeTab === 'station' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT PANEL: Directory Search and Highlighting lists */}
          <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-[320px] bg-[#3E1A22] border-b-4 md:border-b-0 md:border-r-4 border-black flex-col overflow-hidden shrink-0 h-[45vh] md:h-auto`}>
            {/* Legend title header */}
            <div className="p-3 border-b-2 border-black bg-[#4a2029] flex justify-between items-center text-xs font-mono font-black uppercase">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#F4AE52]" />
                DIREKTORI FASILITAS & JALUR
              </span>
              <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-[#F4AE52]">{LOCATIONS.length} TITIK</span>
            </div>

            {/* Quick Helper Banner */}
            <div className="p-2.5 bg-black/20 font-mono text-[10px] leading-relaxed border-b border-[#FFF7C5]/10 text-[#FFF7C5]/80">
              💡 <span className="font-bold text-[#FFF7C5]">Kiosk Tip:</span> Tekan nama lokasi di daftar bawah, peta akan otomatis bergeser dan berfokus pada titik koordinat lokasi tersebut.
            </div>

            {/* Scrollable Directories list, partitioned by category */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 scrollbar-thin">
              
              {/* Category 1: Platforms & Tracks */}
              <div>
                <h4 className="font-mono text-[10px] font-black tracking-widest text-[#F4AE52] uppercase mb-1.5 px-1 border-l-2 border-[#F4AE52]">
                  🛤️ JALUR PERON UTAMA (TRACKS)
                </h4>
                <div className="space-y-1">
                  {LOCATIONS.filter(l => l.category === 'platform').map(loc => {
                    const isCurrent = selectedLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleLocationSelect(loc)}
                        className={`w-full text-left p-2 border border-black/30 flex items-start space-x-2 transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-[#FFF7C5] text-black border-2 border-black shadow-[2px_2px_0px_#F4AE52]' 
                            : 'bg-black/15 hover:bg-black/30'
                        }`}
                      >
                        <span className={`p-1 mt-0.5 rounded-sm shrink-0 font-mono text-[9px] font-black uppercase ${
                          loc.floor === 'L3' ? 'bg-[#4F252E] text-[#FFF7C5]' : 'bg-[#F4AE52] text-black'
                        }`}>
                          {loc.floor}
                        </span>
                        <div className="overflow-hidden">
                           <p className="font-mono font-black text-[11px] leading-tight truncate">{loc.name}</p>
                           <p className={`font-sans text-[10px] leading-tight mt-0.5 ${isCurrent ? 'text-black/80' : 'text-[#FFF7C5]/60'} line-clamp-1`}>
                            {loc.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Facility & Support Area */}
              <div>
                <h4 className="font-mono text-[10px] font-black tracking-widest text-[#F4AE52] uppercase mb-1.5 px-1 border-l-2 border-[#F4AE52]">
                  🏢 FASILITAS UTAMA & AKSES
                </h4>
                <div className="space-y-1">
                  {LOCATIONS.filter(l => l.category === 'facility').map(loc => {
                    const isCurrent = selectedLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleLocationSelect(loc)}
                        className={`w-full text-left p-2 border border-black/30 flex items-start space-x-2 transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-[#FFF7C5] text-black border-2 border-black shadow-[2px_2px_0px_#F4AE52]' 
                            : 'bg-black/15 hover:bg-black/30'
                        }`}
                      >
                        <span className="bg-black/30 text-[#FFF7C5] p-1 mt-0.5 rounded-sm font-mono text-[9px] font-black shrink-0">
                          {loc.floor}
                        </span>
                        <div className="overflow-hidden">
                           <p className="font-mono font-black text-[11px] leading-tight truncate">{loc.name}</p>
                           <p className={`font-sans text-[10px] leading-tight mt-0.5 ${isCurrent ? 'text-black/80' : 'text-[#FFF7C5]/60'} line-clamp-1`}>
                            {loc.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 3: Dining & Tenants */}
              <div>
                <h4 className="font-mono text-[10px] font-black tracking-widest text-[#F4AE52] uppercase mb-1.5 px-1 border-l-2 border-[#F4AE52]">
                  🍿 TENANT KULINER & BELANJA
                </h4>
                <div className="space-y-1">
                  {LOCATIONS.filter(l => l.category === 'food').map(loc => {
                    const isCurrent = selectedLocation?.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleLocationSelect(loc)}
                        className={`w-full text-left p-2 border border-black/30 flex items-start space-x-2 transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-[#FFF7C5] text-black border-2 border-black shadow-[2px_2px_0px_#F4AE52]' 
                            : 'bg-black/15 hover:bg-black/30'
                        }`}
                      >
                        <span className="bg-black/30 text-[#FFF7C5] p-1 mt-0.5 rounded-sm font-mono text-[9px] font-black shrink-0">
                          {loc.floor}
                        </span>
                        <div className="overflow-hidden">
                           <p className="font-mono font-black text-[11px] leading-tight truncate">{loc.name}</p>
                           <p className={`font-sans text-[10px] leading-tight mt-0.5 ${isCurrent ? 'text-black/80' : 'text-[#FFF7C5]/60'} line-clamp-1`}>
                            {loc.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick stats footer for Left Panel */}
            <div className="p-3 bg-black/40 border-t border-black text-[#FFF7C5]/75 font-mono text-[9px] uppercase tracking-wide">
              <span>⚠️ Laporkan fasilitas rusak ke petugas terdekat</span>
            </div>
          </div>

          {/* RIGHT VIEW: Map Canvas and Level Selections */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* FLOOR SELECTOR LEVEL TABS & CONTROL ACTIONS */}
            <div className="border-b-2 border-black bg-[#3E1A22] p-2 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 relative z-10">
              {/* Tabs */}
              <div className="flex bg-black/30 border border-black rounded-none p-1 shrink-0 items-center justify-between gap-1.5 flex-1 sm:flex-initial">
                <div className="flex gap-1 flex-1">
                  {(['L1', 'L2', 'L3'] as FloorLevel[]).map((fl) => {
                    const isActive = activeFloor === fl;
                    return (
                      <button
                        key={fl}
                        onClick={() => handleFloorChange(fl)}
                        className={`font-mono text-[10px] sm:text-xs font-black uppercase px-3 py-1.5 transition-all text-center flex-1 cursor-pointer ${
                          isActive 
                            ? 'bg-[#F4AE52] text-black shadow-[1px_1px_0px_#000000] border border-black font-black' 
                            : 'text-[#FFF7C5]/60 hover:text-[#FFF7C5] hover:bg-white/5'
                        }`}
                      >
                        {fl}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Sidebar Directory Toggle Button */}
                <button
                  onClick={() => {
                    localVibrate(15);
                    playClickSound();
                    setShowSidebar(!showSidebar);
                  }}
                  className="md:hidden font-mono text-[9px] font-black uppercase px-2.5 py-1.5 border border-black bg-[#FFF7C5] text-[#4F252E] shadow-[1px_1px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none shrink-0 cursor-pointer"
                >
                  {showSidebar ? '🗺️ PETA' : '🔍 LIST'}
                </button>
              </div>

              {/* Map Zoom Controls */}
              <div className="flex items-center space-x-2 justify-end">
                <button
                  onClick={triggerZoomOut}
                  disabled={zoom <= 0.8}
                  className="bg-[#4F252E] hover:bg-[#FFF7C5] hover:text-black border-2 border-black p-2.5 text-[#FFF7C5] disabled:opacity-35 transition-all shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Perkecil"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <div className="font-mono text-[10px] sm:text-xs font-black border-2 border-black px-3 py-2 bg-black/40 min-w-[60px] min-h-[44px] flex items-center justify-center text-[#FFF7C5]">
                  {(zoom * 100).toFixed(0)}%
                </div>
                <button
                  onClick={triggerZoomIn}
                  className="bg-[#4F252E] hover:bg-[#FFF7C5] hover:text-black border-2 border-black p-2.5 text-[#FFF7C5] transition-all shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Perbesar"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={triggerReset}
                  className="bg-[#4F252E] hover:bg-[#FFF7C5] hover:text-black border-2 border-black p-2.5 text-[#FFF7C5] transition-all shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Kembalikan Awal"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* FLOATING MAP COMPASS GRAPHIC ACCENT (Non intrusive editorial detail) */}
            <div className="absolute top-16 right-4 z-10 w-12 h-12 bg-black/30 rounded-none border border-[#FFF7C5]/20 flex flex-col items-center justify-center pointer-events-none">
              <Compass className="w-6 h-6 text-[#F4AE52]/70" />
              <span className="font-mono text-[7px] text-[#FFF7C5]/50 leading-none mt-0.5">NORTH</span>
            </div>

            {/* MAP VIEWPORT INNER STAGE (Drag zone) */}
            <div
              ref={mapContainerRef}
              className={`flex-1 relative overflow-hidden bg-black/45 select-none ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${
                isDragging ? 'cursor-grabbing' : ''
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
            >
              
              {/* Dynamic Grid Overlay Blueprint style lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(79,37,46,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(79,37,46,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

              {/* STAGE CANVAS FOR MAPS */}
              <div
                className="w-full h-full flex items-center justify-center relative select-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isTransitioning ? 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                  transformOrigin: 'center center'
                }}
              >
                {/* HIGH-CONTRAST VECTOR BLUEPRINT DRAWING - LUX BRIGHT EDITORIAL STYLE */}
                <svg 
                  className="w-full h-full min-h-[460px] md:min-h-[580px] border-4 border-black bg-[#FDFBF7] p-4 shadow-[4px_4px_0px_0px_#000] rounded-none"
                  viewBox="0 0 500 380"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid Lines on blueprint */}
                  <g opacity="0.12">
                    <line x1="50" y1="0" x2="50" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="100" y1="0" x2="100" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="150" y1="0" x2="150" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="200" y1="0" x2="200" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="250" y1="0" x2="250" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="300" y1="0" x2="300" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="350" y1="0" x2="350" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="400" y1="0" x2="400" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="450" y1="0" x2="450" y2="380" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="0" y1="200" x2="500" y2="200" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="0" y1="250" x2="500" y2="250" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="0" y1="300" x2="500" y2="300" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <line x1="0" y1="350" x2="500" y2="350" stroke="#4F252E" strokeWidth="0.5" strokeDasharray="3 3"/>
                  </g>

                  {/* ----------------- LEVEL 1 LAYOUT (Lobby & Peron KRL / Jarak Jauh) ----------------- */}
                  {activeFloor === 'L1' && (
                    <g>
                      {/* Perimeter Wall */}
                      <rect x="20" y="30" width="460" height="320" rx="4" stroke="#4F252E" strokeWidth="3" fill="#FFFDF9" fillOpacity="0.95" />
                      
                      {/* Main station dividers */}
                      <line x1="20" y1="240" x2="480" y2="240" stroke="#4F252E" strokeWidth="2.5" />
                      <line x1="160" y1="30" x2="160" y2="240" stroke="#4F252E" strokeWidth="1.5" />
                      <line x1="340" y1="30" x2="340" y2="240" stroke="#4F252E" strokeWidth="1.5" />
                      
                      {/* Peron 1 & 2 Train Platform (Sisi Kiri) */}
                      <g className="transition-opacity">
                        <rect x="40" y="260" width="180" height="70" rx="3" fill="#F4AE52" fillOpacity="0.12" stroke="#D97706" strokeWidth="2" strokeDasharray="4 2" />
                        <line x1="40" y1="295" x2="220" y2="295" stroke="#D97706" strokeWidth="2" />
                        <text x="50" y="280" fill="#4F252E" fontSize="10" fontWeight="bold" fontFamily="monospace">JALUR TRANSIT PERON 1 & 2</text>
                        <text x="50" y="315" fill="#C2410C" fontSize="8" fontFamily="monospace" fontWeight="bold">★ COMMUTER LINE KRL</text>
                        
                        {/* Little Cute Train Icon Placeholder */}
                        <rect x="180" y="285" width="30" height="15" rx="1" fill="#F4AE52" />
                        <circle cx="187" cy="303" r="1.5" fill="black" />
                        <circle cx="203" cy="303" r="1.5" fill="black" />
                      </g>

                      {/* Peron 3 & 4 Train Platform (Sisi Kanan) */}
                      <g>
                        <rect x="280" y="260" width="180" height="70" rx="3" fill="#EF4444" fillOpacity="0.08" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" />
                        <line x1="280" y1="295" x2="460" y2="295" stroke="#EF4444" strokeWidth="2" />
                        <text x="290" y="280" fill="#4F252E" fontSize="10" fontWeight="bold" fontFamily="monospace">JALUR EKSPRES PERON 3 & 4</text>
                        <text x="290" y="315" fill="#B91C1C" fontSize="8" fontFamily="monospace" fontWeight="bold">★ ARGO BROMO / PARAHYANGAN</text>
                      </g>

                      {/* Main Entry Lobby area (Tengah) */}
                      <rect x="180" y="70" width="140" height="110" rx="3" fill="#F0FDF4" fillOpacity="0.8" stroke="#10B981" strokeWidth="2" strokeDasharray="2 2" />
                      <text x="250" textAnchor="middle" y="110" fill="#111827" fontSize="11" fontWeight="heavy" fontFamily="monospace">MAIN FOYER LOBBY</text>
                      <text x="250" textAnchor="middle" y="130" fill="#047857" fontSize="8" fontFamily="monospace" fontWeight="bold">GELANGGANG TIKETING</text>

                      {/* Ticketing Counter Booths (Kiri) */}
                      <g>
                        <rect x="35" y="60" width="110" height="130" rx="3" fill="#F8FAFC" stroke="#4F252E" strokeWidth="1.5" />
                        <text x="90" textAnchor="middle" y="85" fill="#4F252E" fontSize="9" fontWeight="bold" fontFamily="monospace" className="underline">LOKET TIKET MANUAL</text>
                        {/* Small booths */}
                        <rect x="45" y="105" width="25" height="20" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <rect x="77" y="105" width="25" height="20" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <rect x="110" y="105" width="25" height="20" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <circle cx="57" cy="115" r="2" fill="#4F252E" />
                        <circle cx="89" cy="115" r="2" fill="#4F252E" />
                        <circle cx="122" cy="115" r="2" fill="#4F252E" />
                      </g>

                      {/* Support facility area (Kanan - Toilet and lockers) */}
                      <g>
                        <rect x="355" y="60" width="115" height="130" rx="3" fill="#F8FAFC" stroke="#4F252E" strokeWidth="1.5" />
                        <text x="412" textAnchor="middle" y="80" fill="#4F252E" fontSize="9" fontWeight="bold" fontFamily="monospace">FASILITAS UMUM</text>
                        {/* Toilet icons placeholders */}
                        <rect x="365" y="100" width="40" height="40" rx="2" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <text x="385" textAnchor="middle" y="125" fill="#1E293B" fontSize="13" fontWeight="bold">WC</text>
                        {/* Locker cells */}
                        <rect x="415" y="100" width="45" height="80" rx="1" fill="#F1F5F9" stroke="#4F252E" strokeWidth="1" />
                        <line x1="415" y1="120" x2="460" y2="120" stroke="#4F252E" strokeWidth="0.8" />
                        <line x1="415" y1="140" x2="460" y2="140" stroke="#4F252E" strokeWidth="0.8" />
                        <line x1="415" y1="160" x2="460" y2="160" stroke="#4F252E" strokeWidth="0.8" />
                        <text x="437" textAnchor="middle" y="113" fill="#4F252E" fontSize="7" fontFamily="monospace">LOKER BAGASI</text>
                      </g>

                      {/* Main entrance arrows */}
                      <path d="M250,250 L250,210 M250,210 L245,215 M250,210 L255,215" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
                      <text x="250" textAnchor="middle" y="200" fill="#C2410C" fontSize="7" fontWeight="bold" fontFamily="monospace">Arah Gerbang Keberangkatan</text>

                      {/* Vertical Accesses (Eskalator & Lift to Lantai 2 / Lantai 3) */}
                      <g>
                        <rect x="180" y="32" width="40" height="24" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <text x="200" textAnchor="middle" y="47" fill="#4F252E" fontSize="8" fontFamily="monospace" fontWeight="bold">▲ LIFT</text>
                        <rect x="280" y="32" width="40" height="24" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <text x="300" textAnchor="middle" y="47" fill="#4F252E" fontSize="8" fontFamily="monospace" fontWeight="bold">▲ ESKLTR</text>
                      </g>
                    </g>
                  )}

                  {/* ----------------- LEVEL 2 LAYOUT (Mezzanine Foodcourt & Resto) ----------------- */}
                  {activeFloor === 'L2' && (
                    <g>
                      {/* Perimeter Wall */}
                      <rect x="25" y="30" width="450" height="320" rx="3" stroke="#4F252E" strokeWidth="3" fill="#FFFDF9" fillOpacity="0.95" />
                      
                      {/* Mezzanine center bridge balcony lines */}
                      <rect x="120" y="55" width="260" height="190" rx="2" stroke="#4F252E" strokeWidth="1.5" strokeDasharray="4 2" fill="none" />
                      <line x1="25" y1="260" x2="475" y2="260" stroke="#4F252E" strokeWidth="1.5" />
                      <text x="250" textAnchor="middle" y="125" fill="#4F252E" fontSize="10" fontFamily="monospace" opacity="0.6">VOID ATRIUM TENGAH</text>
                      <text x="250" textAnchor="middle" y="137" fill="#4F252E" fontSize="7" fontFamily="monospace" opacity="0.4">(TERBUKA KE LANTAI 1)</text>

                      {/* Foodcourt Stalls (Sisi Kiri) */}
                      <g>
                        <rect x="35" y="40" width="130" height="205" rx="2" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
                        <text x="100" textAnchor="middle" y="57" fill="#B45309" fontSize="11" fontWeight="bold" fontFamily="monospace">FOODCOURT AREA</text>
                        <line x1="35" y1="65" x2="165" y2="65" stroke="#D97706" strokeWidth="1" />
                        
                        {/* Mini Stalls */}
                        <g>
                          <rect x="45" y="80" width="110" height="35" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                          <text x="100" textAnchor="middle" y="100" fill="#4F252E" fontSize="9" fontFamily="monospace">Nasi Goreng KAI</text>
                          
                          <rect x="45" y="125" width="110" height="35" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                          <text x="100" textAnchor="middle" y="145" fill="#4F252E" fontSize="9" fontFamily="monospace">Bakso Malang Soto</text>

                          <rect x="45" y="170" width="110" height="35" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                          <text x="100" textAnchor="middle" y="190" fill="#4F252E" fontSize="9" fontFamily="monospace">Teh Tarik & Aneka Jus</text>
                        </g>
                      </g>

                      {/* Café & Roti O Merchants (Sisi Kanan) */}
                      <g>
                        <rect x="335" y="40" width="130" height="205" rx="2" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
                        <text x="400" textAnchor="middle" y="57" fill="#B45309" fontSize="11" fontWeight="bold" fontFamily="monospace">KAfe & TAKEOUT</text>
                        <line x1="335" y1="65" x2="465" y2="65" stroke="#D97706" strokeWidth="1" />

                        {/* Stalls right */}
                        <rect x="345" y="80" width="110" height="40" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <text x="400" textAnchor="middle" y="105" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="monospace">🍞 Roti O</text>
                        
                        <rect x="345" y="145" width="110" height="40" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <text x="400" textAnchor="middle" y="170" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="monospace">☕ Kopi Kenangan</text>
                      </g>

                      {/* Mushola Ruang Ibadah (Kiri Bawah) */}
                      <g>
                        <rect x="35" y="275" width="150" height="60" rx="2" stroke="#4F252E" strokeWidth="1.5" fill="#F0FDF4" />
                        <text x="110" textAnchor="middle" y="300" fill="#047857" fontSize="10" fontWeight="bold" fontFamily="monospace">🕌 MUSHOLA AGUNG</text>
                        <text x="110" textAnchor="middle" y="315" fill="#4F252E" fontSize="8" fontFamily="monospace" opacity="0.8">Tempat Beribadah & Wudhu</text>
                      </g>

                      {/* Ruang Menyusui / Laktasi & Medis (Kanan Bawah) */}
                      <g>
                        <rect x="315" y="275" width="150" height="60" rx="2" stroke="#4F252E" strokeWidth="1.5" fill="#FFF5F5" />
                        <text x="390" textAnchor="middle" y="300" fill="#E11D48" fontSize="10" fontWeight="bold" fontFamily="monospace">🍼 LAKTASI & MEDIS</text>
                        <text x="390" textAnchor="middle" y="315" fill="#4F252E" fontSize="8" fontFamily="monospace" opacity="0.8">Ruang Menyusui & P3K</text>
                      </g>
                    </g>
                  )}

                  {/* ----------------- LEVEL 3 LAYOUT (WHOOSH Highspeed Platforms & Boarding Gate) ----------------- */}
                  {activeFloor === 'L3' && (
                    <g>
                      {/* Perimeter Wall */}
                      <rect x="20" y="30" width="460" height="320" rx="4" stroke="#4F252E" strokeWidth="3" fill="#FFFDF9" fillOpacity="0.95" />
                      
                      {/* Train tracks for Whoosh - Overhead */}
                      <rect x="20" y="270" width="460" height="60" fill="#F4AE52" fillOpacity="0.12" stroke="#D97706" strokeWidth="2.5" strokeDasharray="6 3" />
                      <line x1="20" y1="300" x2="480" y2="300" stroke="#D97706" strokeWidth="3" />
                      <text x="250" textAnchor="middle" y="290" fill="#C2410C" fontSize="11" fontWeight="black" fontFamily="monospace" letterSpacing="2">PERON 5-6 KERETA CEPAT WHOOSH (DEPARTURE LAYER)</text>
                      
                      {/* High speed bullet train abstract layout */}
                      <g>
                        <path d="M 80,295 L 350,295 L 370,290 L 380,300 L 370,310 L 350,305 L 80,305 Z" fill="#F8FAFC" stroke="black" strokeWidth="1.5" />
                        <rect x="95" y="297" width="30" height="4" rx="0.5" fill="#2563EB" />
                        <rect x="135" y="297" width="30" height="4" rx="0.5" fill="#2563EB" />
                        <rect x="175" y="297" width="30" height="4" rx="0.5" fill="#2563EB" />
                        <rect x="215" y="297" width="30" height="4" rx="0.5" fill="#2563EB" />
                        <rect x="255" y="297" width="30" height="4" rx="0.5" fill="#2563EB" />
                        <rect x="295" y="297" width="30" height="4" rx="0.5" fill="#2563EB" />
                        <polygon points="350,296 360,296 365,300 357,300" fill="red" />
                        <text x="120" y="318" fill="#1E293B" fontSize="8" fontFamily="monospace" fontWeight="black">🇮🇩 WHOOSH G1102 BULLET TRAIN</text>
                      </g>

                      {/* Whoosh Boarding Gates check line */}
                      <g>
                        <rect x="140" y="140" width="220" height="45" rx="3" stroke="#4F252E" strokeWidth="2" fill="#FEF3C7" fillOpacity="0.5" />
                        <text x="250" textAnchor="middle" y="157" fill="#C2410C" fontSize="10" fontWeight="bold" fontFamily="monospace">GERBANG PENGECEKAN BANDING SCANNER</text>
                        <line x1="140" y1="165" x2="360" y2="165" stroke="#4F252E" strokeWidth="1" strokeDasharray="2 2" />
                        
                        {/* Gates */}
                        <circle cx="170" cy="173" r="4" fill="#D97706" />
                        <circle cx="210" cy="173" r="4" fill="#D97706" />
                        <circle cx="250" cy="173" r="4" fill="#D97706" />
                        <circle cx="290" cy="173" r="4" fill="#D97706" />
                        <circle cx="330" cy="173" r="4" fill="#D97706" />
                      </g>

                      {/* VIP Business Lounge (Kiri Tengah) */}
                      <g>
                        <rect x="35" y="55" width="130" height="150" rx="3" fill="#EEF2F6" stroke="#4F252E" strokeWidth="1.5" />
                        <text x="100" textAnchor="middle" y="80" fill="#4F252E" fontSize="10" fontWeight="bold" fontFamily="monospace" className="underline">EXECUTIVE LOUNGE</text>
                        <text x="100" textAnchor="middle" y="100" fill="#4F252E" fontSize="8" fontFamily="monospace" opacity="0.7">Business Waiting Room</text>
                        
                        {/* Chairs symbols */}
                        <circle cx="65" cy="130" r="6" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <circle cx="100" cy="130" r="6" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <circle cx="135" cy="130" r="6" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                      </g>

                      {/* Premium Cafe Souvenirs (Kanan Tengah) */}
                      <g>
                        <rect x="335" y="55" width="130" height="150" rx="3" fill="#EEF2F6" stroke="#4F252E" strokeWidth="1.5" />
                        <text x="400" textAnchor="middle" y="80" fill="#4F252E" fontSize="10" fontWeight="bold" fontFamily="monospace" className="underline">MODERN TENANTS</text>
                        <text x="400" textAnchor="middle" y="100" fill="#4F252E" fontSize="8" fontFamily="monospace" opacity="0.7">Souvenirs & Café Premium</text>

                        {/* Store racks symbols */}
                        <rect x="355" y="125" width="90" height="12" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                        <rect x="355" y="145" width="90" height="12" stroke="#4F252E" strokeWidth="1" fill="#FFFFFF" />
                      </g>

                      {/* Escalator arrows direction down to mezzanine */}
                      <path d="M 230,55 L 230,105 M 230,105 L 225,100 M 230,105 L 235,100" stroke="#4F252E" strokeWidth="1.5" />
                      <text x="230" textAnchor="middle" y="47" fill="#4F252E" fontSize="8" fontFamily="monospace" fontWeight="bold">▼ DOWN TO MEZZANINE</text>
                    </g>
                  )}

                  {/* DEFINISI STYLE ANIMASI LED DENGAN MARQUEE DASH */}
                  <defs>
                    <style>{`
                      @keyframes routeDashAction {
                        to {
                          stroke-dashoffset: -20;
                        }
                      }
                      .animate-route-dash {
                        stroke-dasharray: 6 4;
                        animation: routeDashAction 1s linear infinite;
                      }
                    `}</style>
                  </defs>

                  {/* HIGHLIGHT JALUR TERCEPAT PETUNJUK UTAMA */}
                  {showGuide && selectedLocation && (
                    <g>
                      {(() => {
                        const route = getRouteDetails(selectedLocation.id, activeFloor);
                        if (!route.svgPath) return null;
                        return (
                          <>
                            {/* Glowing back-glow trail line */}
                            <path
                              d={route.svgPath}
                              stroke="#EF4444"
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              opacity="0.25"
                              className="animate-pulse"
                            />
                            {/* Animated marching dash guide line */}
                            <path
                              d={route.svgPath}
                              stroke="#B91C1C"
                              strokeWidth="4.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-route-dash"
                            />
                            
                            {/* Blinking user start dot (KAU DI SINI) on lobby layer L1 */}
                            {activeFloor === 'L1' && (
                              <g>
                                <circle cx="250" cy="133" r="10" fill="#10B981" fillOpacity="0.35" className="animate-ping" />
                                <circle cx="250" cy="133" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                                <rect x="210" y="102" width="80" height="14" rx="2" fill="#4F252E" stroke="#10B981" strokeWidth="1" />
                                <text x="250" y="112" fill="#FFF7C5" fontSize="7px" fontWeight="black" fontFamily="monospace" textAnchor="middle">📍 KAU DI SINI</text>
                              </g>
                            )}

                            {/* End target coordinate flag pin overlay */}
                            <g>
                              <circle cx={selectedLocation.x * 5} cy={selectedLocation.y * 3.8} r="12" fill="#EF4444" fillOpacity="0.3" className="animate-ping" />
                              <circle cx={selectedLocation.x * 5} cy={selectedLocation.y * 3.8} r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                            </g>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* ----------------- INTERACTIVE LIVE COORDINATE DOTS ----------------- */}
                  {floorLocations.map((loc) => {
                    const isSelected = selectedLocation?.id === loc.id;
                    return (
                      <g 
                        key={loc.id}
                        className="cursor-pointer group select-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationSelect(loc);
                        }}
                      >
                        {/* Invisible extra-wide overlay target for effortless finger tapping (44px diameter) */}
                        <circle
                          cx={loc.x * 5}
                          cy={loc.y * 3.8}
                          r="22"
                          fill="transparent"
                          className="cursor-pointer"
                        />

                        {/* Glow halo pulsing on active coordinates */}
                        {isSelected && (
                          <circle 
                            cx={loc.x * 5} 
                            cy={loc.y * 3.8} 
                            r="16" 
                            fill="#F4AE52" 
                            fillOpacity="0.35" 
                            className="animate-ping"
                            style={{ animationDuration: '2s' }}
                          />
                        )}

                        {/* Outer accent ring with thickness depending on highlight state */}
                        <circle 
                          cx={loc.x * 5} 
                          cy={loc.y * 3.8} 
                          r={isSelected ? "9" : "6"} 
                          fill={isSelected ? "#FFF7C5" : "#4F252E"} 
                          stroke={isSelected ? "#4F252E" : "#F4AE52"} 
                          strokeWidth={isSelected ? "2.5" : "1.5"}
                          className="transition-all duration-300 group-hover:scale-125 pointer-events-none"
                        />
                        
                        {/* Pin Core Dot */}
                        <circle 
                          cx={loc.x * 5} 
                          cy={loc.y * 3.8} 
                          r={isSelected ? "3" : "2"} 
                          fill={isSelected ? "#F4AE52" : "#FFF7C5"}
                        />

                        {/* Interactive Speech Bubble Label - appears only when active/clicked */}
                        {isSelected && (
                          <g className="pointer-events-none">
                            {/* Downward triangle pointer */}
                            <polygon
                              points={`${loc.x * 5},${loc.y * 3.8 - 10} ${loc.x * 5 - 4},${loc.y * 3.8 - 14} ${loc.x * 5 + 4},${loc.y * 3.8 - 14}`}
                              fill="#000000"
                            />
                            {(() => {
                              const displayLabel = loc.name;
                              const fontWidth = 6.8;
                              const labelWidth = displayLabel.length * fontWidth + 14;
                              const xPos = loc.x * 5 - labelWidth / 2;
                              const yPos = loc.y * 3.8 - 32;
                              return (
                                <g>
                                  {/* Shadow box */}
                                  <rect
                                    x={xPos + 1.5}
                                    y={yPos + 1.5}
                                    width={labelWidth}
                                    height="18"
                                    rx="2.5"
                                    fill="#000000"
                                  />
                                  {/* Bubble box */}
                                  <rect
                                    x={xPos}
                                    y={yPos}
                                    width={labelWidth}
                                    height="18"
                                    rx="2.5"
                                    fill="#4F252E"
                                    stroke="#000000"
                                    strokeWidth="1.5"
                                  />
                                  <text
                                    x={loc.x * 5}
                                    y={yPos + 12}
                                    textAnchor="middle"
                                    fill="#FFF7C5"
                                    fontSize="8"
                                    fontWeight="black"
                                    fontFamily="monospace"
                                    className="select-none"
                                  >
                                    {displayLabel}
                                  </text>
                                </g>
                              );
                            })()}
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* FLOATING ACTION TIPS */}
              <div className="absolute bottom-3 left-3 bg-black/75 border border-[#FFF7C5]/30 p-2 text-[10px] font-mono text-[#FFF7C5]/85 flex items-center space-x-1.5 backdrop-blur-sm pointer-events-none">
                <div className="w-1.5 h-1.5 bg-[#F4AE52] rounded-full animate-ping"></div>
                <span>🎯 {zoom > 1 ? 'SERET DENGAN JARI/MOUSE UNTUK PAN DAN LIHAT LINGKUNGAN' : 'SENGGOL POSISI PIN UNTUK DIALOG SPESIFIK'}</span>
              </div>
            </div>

            {/* SELECTION DETAIL DRAWER OVERLAY - STARK FOOTER PANEL */}
            {selectedLocation ? (
              <div className="border-t-4 border-black bg-[#FFF7C5] p-3 text-black transition-all animate-bounce-short flex flex-col md:flex-row gap-4 items-stretch">
                
                {/* Left Section: General details card */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 font-mono text-[9px] font-black uppercase rounded-sm shrink-0">
                          {selectedLocation.category === 'platform' ? '🛤️ PERON' : selectedLocation.category === 'food' ? '🍿 KULINER' : '🏢 FASILITAS'}
                        </span>
                        <h3 className="font-mono text-xs sm:text-sm font-black uppercase text-[#4F252E] leading-tight">
                          {selectedLocation.name}
                        </h3>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-black/50 ml-2 shrink-0">LANTAI {selectedLocation.floor}</span>
                    </div>
                    
                    <p className="font-sans text-xs text-black/80 mt-1 leading-relaxed">
                      {selectedLocation.description}
                    </p>
                    
                    {selectedLocation.details && (
                      <div className="mt-2 text-[10px] sm:text-[11px] font-mono border-t border-black/10 pt-1.5 text-[#4F252E]/90 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#F4AE52] shrink-0" />
                        <span><strong>Info:</strong> {selectedLocation.details}</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Platform Guide Controls */}
                  <div className="mt-4 pt-2 border-t border-black/10 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        localVibrate(25);
                        playClickSound();
                        setShowGuide(prev => !prev);
                      }}
                      className={`px-3 py-1.5 font-mono text-[10px] sm:text-xs font-black uppercase border-2 border-black transition-all shadow-[2.5px_2.5px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1.5 ${
                        showGuide 
                          ? 'bg-[#4F252E] text-[#FFF7C5] hover:bg-[#3E1A22]' 
                          : 'bg-[#F4AE52] text-black hover:bg-[#df9c39]'
                      }`}
                      title="Hitung rute terpendek anda"
                    >
                      <Navigation className={`w-3.5 h-3.5 transition-transform duration-300 ${showGuide ? 'rotate-45 text-[#FFF7C5]' : 'text-black'}`} />
                      <span>{showGuide ? '🔴 Nonaktifkan Rute Petunjuk' : '🚶 Interactive Platform Guide'}</span>
                    </button>

                    {showGuide && selectedLocation.floor !== activeFloor && (
                      <button
                        onClick={() => handleFloorChange(selectedLocation.floor)}
                        className="bg-[#C1EBE9] hover:bg-[#a1deda] text-[#4F252E] border-2 border-black px-2.5 py-1.5 font-mono text-[9px] font-black uppercase transition-all shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
                      >
                        Pindah ke Lantai {selectedLocation.floor} untuk cek segmen ➔
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Section: Itinerary Navigator details */}
                {showGuide && (
                  <div className="w-full md:w-[320px] bg-white/75 border-2 border-dashed border-[#4F252E]/30 p-2.5 flex flex-col justify-between shrink-0 animate-fade">
                    <div>
                      {/* Metric Dashboard */}
                      <div className="grid grid-cols-2 gap-2 border-b border-[#4F252E]/25 pb-1.5 mb-2">
                        <div className="bg-[#4F252E]/5 px-2 py-0.5 rounded-none text-center">
                          <p className="font-mono text-[8px] text-[#4F252E]/60 leading-none uppercase">Estimasi Jarak</p>
                          <p className="font-mono text-xs font-black text-[#4F252E] mt-1">{getRouteDetails(selectedLocation.id, activeFloor).distance}</p>
                        </div>
                        <div className="bg-[#F4AE52]/5 px-2 py-0.5 rounded-none text-center">
                          <p className="font-mono text-[8px] text-[#4F252E]/60 leading-none uppercase">Waktu Jalan</p>
                          <p className="font-mono text-xs font-black text-[#4F252E] mt-1">~{getRouteDetails(selectedLocation.id, activeFloor).time}</p>
                        </div>
                      </div>

                      {/* Direction step rows */}
                      <p className="font-mono text-[9px] font-black text-[#4F252E] uppercase mb-1">
                        🧭 LANGKAH NAVIGASI JALUR:
                      </p>
                      <ul className="space-y-1.5 max-h-[105px] overflow-y-auto scrollbar-thin">
                        {getRouteDetails(selectedLocation.id, activeFloor).instructions.map((step, idx) => (
                          <li key={idx} className="flex gap-1.5 items-start text-[9.5px] font-sans text-stone-800 leading-snug">
                            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#4F252E] text-[#FFF7C5] font-mono text-[7px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="font-semibold leading-tight">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-1.5 bg-[#FFF7C5] border border-[#4F252E]/20 p-1 text-[8px] font-mono text-[#4F252E]/75 flex items-center justify-center gap-1 uppercase leading-none rounded-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                      <span>Navigator GPS Lokal Aktif dari Main Gate L1</span>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="border-t-4 border-black bg-[#FFF7C5]/10 p-4 text-center font-mono text-xs text-[#FFF7C5]/60">
                Pilih atau sentuh salah satu lokasi fasilitas di peta stasiun atau di panel kiri untuk membuka infomasi peron terperinci.
              </div>
            )}

          </div>

        </div>
        ) : (
          /* NEW STUNNING KRL ROUTE MAP SPLIT PANEL */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-fade">
            
            {/* LEFT PANEL: KRL Station list & search */}
            <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-[320px] bg-[#3E1A22] border-b-4 md:border-b-0 md:border-r-4 border-black flex-col overflow-hidden shrink-0 h-[45vh] md:h-auto`}>
              
              {/* Header search */}
              <div className="p-3 border-b-2 border-black bg-[#4a2029]">
                <p className="font-mono text-[10px] text-[#F4AE52] font-black uppercase mb-1.5 flex items-center gap-1">
                  <Train className="w-3.5 h-3.5" />
                  Cari Stasiun KRL
                </p>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <Search className="w-3.5 h-3.5 text-[#FFF7C5]/50" />
                  </span>
                  <input
                    type="text"
                    value={krlSearchQuery}
                    onChange={(e) => {
                      setKrlSearchQuery(e.target.value);
                      localVibrate(5);
                    }}
                    placeholder="Mulai ketik (misal: Bogor, Bekasi).."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#2A0E13] border border-black text-[#FFF7C5] font-mono text-xs rounded-none focus:outline-none focus:border-[#F4AE52] placeholder-[#FFF7C5]/30 shadow-inner"
                  />
                  {krlSearchQuery && (
                    <button
                      onClick={() => setKrlSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#FFF7C5]/60 hover:text-[#FFF7C5]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Commuter Lines Legend */}
              <div className="p-2.5 bg-black/25 border-b border-[#FFF7C5]/10 font-mono text-[9px] text-[#FFF7C5]/85 space-y-1 shrink-0">
                <span className="font-black text-[#F4AE52] block mb-0.5">ℹ️ LEGENDA JALUR COMMUTER:</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {KRL_LINES.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: line.color }} />
                      <span className="truncate text-[8.5px] font-semibold leading-none">{line.name.split(' ')[0]} {line.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable list of stations filtered by search */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 scrollbar-thin">
                {(() => {
                  const filtered = KRL_STATIONS.filter(st => 
                    st.name.toLowerCase().includes(krlSearchQuery.toLowerCase()) ||
                    st.line.toLowerCase().includes(krlSearchQuery.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="p-4 text-center text-xs font-mono text-[#FFF7C5]/45">
                        Tidak ada stasiun "{krlSearchQuery}" ditemukan. Coba ketik Manggarai, Bekasi, dll.
                      </div>
                    );
                  }

                  // Group by line for clean presentation
                  const grouped: { [key: string]: KRLStation[] } = {};
                  filtered.forEach(st => {
                    if (!grouped[st.line]) grouped[st.line] = [];
                    grouped[st.line].push(st);
                  });

                  return Object.keys(grouped).map(lineName => {
                    const lineColor = KRL_STATIONS.find(s => s.line === lineName)?.color || '#FFF';
                    return (
                      <div key={lineName} className="space-y-1">
                        <h4 className="font-mono text-[9px] font-black tracking-wider uppercase mb-1.5 px-1 border-l-2" style={{ borderColor: lineColor, color: lineColor }}>
                          {lineName}
                        </h4>
                        <div className="space-y-1">
                          {grouped[lineName].map(st => {
                            const isCurrent = selectedKrlStation?.id === st.id;
                            return (
                              <button
                                key={st.id}
                                onClick={() => handleKrlStationSelect(st)}
                                className={`w-full text-left p-2 border border-black/30 flex items-start justify-between transition-all cursor-pointer ${
                                  isCurrent 
                                    ? 'bg-[#FFF7C5] text-black border-2 border-black shadow-[2px_2px_0px_#F4AE52]' 
                                    : 'bg-black/15 hover:bg-black/30 text-[#FFF7C5]'
                                }`}
                              >
                                <div>
                                  <p className="font-mono font-black text-[11px] leading-tight flex items-center gap-1">
                                    <span>{st.name}</span>
                                    {isCurrent && <span className="text-[8px] px-1 bg-black text-[#FFF7C5] rounded-none uppercase">TERFOKUS</span>}
                                  </p>
                                  <p className={`font-sans text-[10px] leading-tight mt-0.5 ${isCurrent ? 'text-black/80' : 'text-[#FFF7C5]/60'} line-clamp-1`}>
                                    {st.description}
                                  </p>
                                </div>
                                <div className="flex gap-0.5 shrink-0 ml-1">
                                  {st.connections.map(conn => (
                                    <span key={conn} className="text-[7px] font-mono font-black px-1 py-0.5 bg-black/30 border border-black/20 text-[#FFF7C5] scale-90">
                                      {conn}
                                    </span>
                                  ))}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Panel info stats */}
              <div className="p-3 bg-black/40 border-t border-black text-[#FFF7C5]/75 font-mono text-[9px] uppercase tracking-wide flex justify-between shrink-0">
                <span>Total: {KRL_STATIONS.length} Transit Nodes</span>
                <span>Active</span>
              </div>
            </div>

            {/* RIGHT VIEW: Map Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              
              <div className="border-b-2 border-black bg-[#3E1A22] p-2 flex justify-between items-center gap-2 relative z-10 w-full shrink-0">
                <div className="flex items-center space-x-2">
                  <Map className="w-4 h-4 text-[#F4AE52]" />
                  <span className="font-mono text-[10px] sm:text-xs font-black uppercase text-[#FFF7C5]/85 hidden xs:inline">Interactive Transit Diagram</span>
                  
                  {/* Mobile Sidebar Toggle Button */}
                  <button
                    onClick={() => {
                      localVibrate(15);
                      playClickSound();
                      setShowSidebar(!showSidebar);
                    }}
                    className="md:hidden font-mono text-[9px] font-black uppercase px-2 py-1.5 border border-black bg-[#FFF7C5] text-[#4F252E] shadow-[1px_1px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none shrink-0 cursor-pointer"
                  >
                    {showSidebar ? '🗺️ PETA' : '🔍 LIST'}
                  </button>
                </div>

                {/* Map Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={triggerZoomOut}
                    disabled={zoom <= 0.8}
                    className="bg-[#4F252E] hover:bg-[#FFF7C5] hover:text-black border-2 border-black p-2.5 text-[#FFF7C5] disabled:opacity-35 transition-all shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Perkecil"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="font-mono text-[10px] sm:text-xs font-black border-2 border-black px-3 py-2 bg-black/40 min-w-[60px] min-h-[44px] flex items-center justify-center text-[#FFF7C5]">
                    {(zoom * 100).toFixed(0)}%
                  </div>
                  <button
                    onClick={triggerZoomIn}
                    className="bg-[#4F252E] hover:bg-[#FFF7C5] hover:text-black border-2 border-black p-2.5 text-[#FFF7C5] transition-all shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Perbesar"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      triggerReset();
                      setSelectedKrlStation(null);
                    }}
                    className="bg-[#4F252E] hover:bg-[#FFF7C5] hover:text-black border-2 border-black p-2.5 text-[#FFF7C5] transition-all shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Kembalikan Awal"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Map display */}
              <div
                ref={mapContainerRef}
                className={`flex-1 relative overflow-hidden bg-stone-950 select-none ${zoom > 1 ? 'cursor-grab' : 'cursor-default'} ${
                  isDragging ? 'cursor-grabbing' : ''
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUpOrLeave}
              >
                {/* Visual grid lines for blueprint styling */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none"></div>

                {/* SVG Canvas Centering Frame */}
                <div
                  className="w-full h-full flex items-center justify-center relative select-none"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transition: isTransitioning ? 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                    transformOrigin: 'center center'
                  }}
                >
                  <svg 
                    className="w-full h-full min-h-[460px] md:min-h-[580px] border-4 border-black bg-[#FAF9F6] p-4 shadow-[4px_4px_0px_0px_#000]"
                    viewBox="0 0 520 540"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* SVG Filters for glowing paths */}
                    <defs>
                      <filter id="glow-krl" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* KRL NETWORK PATHS */}
                    {/* Bogor Line (Red) */}
                    <path
                      d="M 250,50 L 250,100 L 250,145 L 250,200 L 250,265 L 250,325 L 250,375 L 250,440"
                      stroke="#EF4444"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Nambo Branch */}
                    <path
                      d="M 250,375 L 335,375"
                      stroke="#EF4444"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Rangkasbitung Line (Green) */}
                    <path
                      d="M 130,200 L 95,247 L 67,295 L 38,345 L 15,395 L 15,450"
                      stroke="#22C55E"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Tangerang Line (Brown) */}
                    <path
                      d="M 130,130 L 70,110 L 15,100"
                      stroke="#B45309"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Tanjung Priok Line (Pink) */}
                    <path
                      d="M 250,50 Q 310,50 370,55"
                      stroke="#EC4899"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Merak Lokal Line (Dark Green) */}
                    <path
                      d="M 15,450 L 15,505 L 75,505"
                      stroke="#15803D"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Cikarang loop / extension Line (Blue/Cyan) */}
                    {/* Loop section */}
                    <path
                      d="M 250,200 L 190,200 L 130,200 L 130,130 L 190,80 L 250,50 L 370,55 L 370,125 L 370,200 L 250,200"
                      stroke="#0EA5E9"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="1 1"
                    />
                    {/* Main solid Cikarang track */}
                    <path
                      d="M 370,200 L 425,200 L 480,200"
                      stroke="#0EA5E9"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* STATION NODE CIRCLES */}
                    {KRL_STATIONS.map((station) => {
                      const isSelected = selectedKrlStation?.id === station.id;
                      return (
                        <g
                          key={station.id}
                          className="cursor-pointer group select-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKrlStationSelect(station);
                          }}
                        >
                          {/* Invisible wide overlay target for effortless tapping on mobile (44px diameter) */}
                          <circle
                            cx={station.coord.x}
                            cy={station.coord.y}
                            r="22"
                            fill="transparent"
                            className="cursor-pointer"
                          />

                          {/* Selected pulsing halo */}
                          {isSelected && (
                            <circle
                              cx={station.coord.x}
                              cy={station.coord.y}
                              r="15"
                              fill={station.color}
                              fillOpacity="0.25"
                              className="animate-ping"
                            />
                          )}

                          {/* Outer node border */}
                          <circle
                            cx={station.coord.x}
                            cy={station.coord.y}
                            r={isSelected ? "8" : "6"}
                            fill="#FFFFFF"
                            stroke={station.color}
                            strokeWidth="3.5"
                            className="transition-all duration-300 group-hover:scale-125 pointer-events-none"
                          />

                          {/* Inner pin point */}
                          <circle
                            cx={station.coord.x}
                            cy={station.coord.y}
                            r="2.5"
                            fill={isSelected ? station.color : "black"}
                          />

                          {/* Interactive Station Name Label - appears only when active/clicked */}
                          {isSelected && (
                            <g className="pointer-events-none">
                              {/* Downward triangle indicator arrow */}
                              <polygon
                                points={`${station.coord.x},${station.coord.y - 12} ${station.coord.x - 4.5},${station.coord.y - 17.5} ${station.coord.x + 4.5},${station.coord.y - 17.5}`}
                                fill="#000000"
                              />
                              {(() => {
                                const labelText = station.name;
                                const fontWidth = 7;
                                const labelWidth = labelText.length * fontWidth + 16;
                                const xPos = station.coord.x - labelWidth / 2;
                                const yPos = station.coord.y - 37.5;
                                return (
                                  <g>
                                    {/* Retro drop shadow box */}
                                    <rect
                                      x={xPos + 2}
                                      y={yPos + 2}
                                      width={labelWidth}
                                      height="20"
                                      rx="3"
                                      fill="#000000"
                                    />
                                    {/* Bubble container */}
                                    <rect
                                      x={xPos}
                                      y={yPos}
                                      width={labelWidth}
                                      height="20"
                                      rx="3"
                                      fill="#F4AE52"
                                      stroke="#000000"
                                      strokeWidth="2"
                                    />
                                    <text
                                      x={station.coord.x}
                                      y={yPos + 14}
                                      textAnchor="middle"
                                      fill="#000000"
                                      fontSize="10"
                                      fontWeight="900"
                                      fontFamily="monospace"
                                      className="select-none tracking-tight"
                                    >
                                      {labelText}
                                    </text>
                                  </g>
                                );
                              })()}
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Left Floating Tip */}
                <div className="absolute bottom-3 left-3 bg-black/75 border border-[#FFF7C5]/30 p-2 text-[10px] font-mono text-[#FFF7C5]/85 pointer-events-none backdrop-blur-sm">
                  <span>🎯 Klik titik stasiun atau cari di daftar kiri untuk berfokus.</span>
                </div>
              </div>

              {/* STARK BOTTOM DRAWER INFO FOR KRL */}
              {selectedKrlStation ? (
                <div className="border-t-4 border-black bg-[#FFF7C5] p-3 text-black transition-all animate-bounce-short flex flex-col md:flex-row gap-4 items-stretch shrink-0">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="text-[#FFF7C5] px-2 py-0.5 font-mono text-[9px] font-black uppercase rounded-sm"
                          style={{ backgroundColor: selectedKrlStation.color }}
                        >
                          {selectedKrlStation.line}
                        </span>
                        <h3 className="font-mono text-xs sm:text-sm font-black uppercase text-[#4F252E] leading-tight">
                          STASIUN {selectedKrlStation.name}
                        </h3>
                      </div>
                      
                      <p className="font-sans text-xs text-black/85 mt-2 leading-relaxed">
                        {selectedKrlStation.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-black/10 flex flex-wrap gap-2 items-center">
                      <span className="font-mono text-[9px] font-bold text-black/50">KONEKTIVITAS INTEGRASI:</span>
                      {selectedKrlStation.connections.length > 0 ? (
                        selectedKrlStation.connections.map(conn => (
                          <span key={conn} className="bg-[#4F252E] text-[#FFF7C5] rounded-none px-2 py-0.5 font-mono text-[9px] font-black">
                            ⚡ {conn}
                          </span>
                        ))
                      ) : (
                        <span className="font-mono text-[9px] text-black/50 italic">Hanya Transit Antarlini KRL</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-[280px] bg-white/70 border-2 border-dashed border-[#4F252E]/30 p-2.5 flex flex-col justify-center select-none shrink-0 text-left">
                    <p className="font-mono text-[10px] font-black text-[#4F252E] uppercase">📍 STRATEGIS TERMINUS JABODETABEK:</p>
                    <p className="font-sans text-[10px] text-stone-700 leading-snug mt-1 border-t border-black/10 pt-1">
                      Terbuka secara umum untuk integrasi multi-hub Jabodetabek Commuter. Nikmati perpindahan yang seamless dengan satu kartu multitrip K Commuter.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-t-4 border-black bg-[#FFF7C5]/10 p-4 text-center font-mono text-xs text-[#FFF7C5]/60 shrink-0">
                  Sentuh koordinat stasiun pada peta rute krl untuk info integrasi pelaju lebih mendalam.
                </div>
              )}

            </div>

          </div>
        )}

        {/* BOTTOM METADATA BAR OF KIO SYSTEMS */}
        <div className="bg-black text-[9px] text-[#FFF7C5]/60 font-mono tracking-wide p-2 flex justify-between items-center shrink-0 border-t-2 border-black">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-[#F4AE52]" />
            LIFT RAMAH KURSI RODA BEROPERASI PRIMA PADA SELURUH PLATFORM LANTAI 1 S/D LANTAI 3
          </span>
          <span className="hidden sm:inline">PETA DIGITAL DISIPLIN MODEL V3.5-WHOOSH</span>
        </div>

      </div>
    </div>
  );
}
