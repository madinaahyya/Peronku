import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Volume2, VolumeX, Bot, ShieldCheck, MapPin, 
  Keyboard, Coffee, Lock, Train, Info, HelpCircle, MessageSquareText, Ticket
} from 'lucide-react';
import { ChatMessage } from '../types';
import { triggerVibration, playClickSound } from '../utils';
import { useLanguage } from '../LanguageContext';

interface FaqItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortLabel: string;
  colorClass: string;
  query: string;
  answer: string;
}

export default function AiAssistant() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      text: "👋 Halo Kak! Selamat datang di Layanan Mandiri Stasiun Metropolis. Saya Kio, asisten robot ramah-mu di sini.\n\nSilakan sentuh langsung tombol FAQ di bawah untuk mendapatkan panduan cepat secara instan! Kakak juga tetap bisa mengetik pertanyaan khusus di kolom bawah.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isAiPowered, setIsAiPowered] = useState<boolean | null>(null);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === 'welcome') {
        return {
          ...msg,
          text: t('aiWelcome')
        };
      }
      return msg;
    }));
  }, [language]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.aiActive === 'boolean') {
          setIsAiPowered(data.aiActive);
        } else {
          setIsAiPowered(false);
        }
      })
      .catch(() => {
        setIsAiPowered(false);
      });
  }, []);

  // Set-up FAQ options requested by passenger intent
  const FAQ_LIST: FaqItem[] = [
    {
      id: 'toilet',
      icon: <Info className="w-5 h-5 text-[#F4AE52]" />,
      label: language === 'id' ? "🚽 Lokasi Toilet Bersih" : "🚽 Clean Restrooms List",
      shortLabel: language === 'id' ? "Lokasi Toilet" : "Restrooms Locations",
      colorClass: "bg-[#FFF7C5]/90 border-[#4F252E] hover:bg-[#F4AE52]",
      query: language === 'id' ? "Di mana letak toilet bersih dan ramah disabilitas di stasiun ini?" : "Where is an accessible clean toilet on Metro grounds?",
      answer: language === 'id'
        ? "📍 **INFORMASI LOKASI TOILET STASIUN:**\n\n• **Lantai 1:** Berada di pojok kanan dekat pintu masuk boarding peron 3 & 4. Tersedia bilik khusus disabilitas dan wastafel otomatis.\n• **Lantai 2 (Mezzanine):** Berlokasi tepat di sebelah Klinik Medis & Ruang Laktasi Menyusui.\n• **Lantai 3 (WHOOSH):** Berada di dalam area eksklusif VIP Executive Lounge."
        : "📍 **STATION RESTROOM LOCATION LIST:**\n\n• **Ground Level (L1):** Located in the right corner next to Boarding Platform 3 & 4. Features automatic accessibility cabins.\n• **Mezzanine level (L2):** Positioned next to the Emergency Clinic and Nursing Lactation Room.\n• **Platform Level (L3):** Accessible inside the VIP Executive Lounge area."
    },
    {
      id: 'loker',
      icon: <Lock className="w-5 h-5 text-[#F4AE52]" />,
      label: language === 'id' ? "🧳 Tempat Penitipan Barang & Loker" : "🧳 Luggage Storage & Locker System",
      shortLabel: language === 'id' ? "Penitipan Loker" : "Luggage Lockers",
      colorClass: "bg-[#FFF7C5]/90 border-[#4F252E] hover:bg-[#F4AE52]",
      query: language === 'id' ? "Di mana lokasi penitipan barang/koper, dan bagaimana sistem loker mandiri?" : "Where is the luggage deposit and how do self electronic lockers operate?",
      answer: language === 'id'
        ? "🧳 **Mekanisme & Lokasi Loker Penjagaan:**\n\n• **Tenggelam Posisi:** Terletak di Lantai 1 sisi kanan stasiun, bersebelahan persis dengan Toilet Utama.\n• **Sistem Loker:** Mandiri dengan enkripsi PIN 6-digit elektronik.\n• **Pembayaran:** Mendukung scan QRIS nontunai (GoPay, OVO, Dana) & Kartu Multi-Trip.\n• **Keamanan:** Dilengkapi pengawasan CCTV 24 jam di bawah penjagaan Ranger stasiun."
        : "🧳 **LOCKER STORAGE PROCEDURES & LOCATIONS:**\n\n• **Location:** Ground Level 1 (right wing), immediately next to the primary clean restrooms.\n• **System style:** Self-service security boxes utilizing customized 6-digit PIN identifiers.\n• **Payment:** Compatible with cash-free dynamic QRIS processing (GoPay, OVO, Dana) and Multi-Trip cards.\n• **Security:** Full 24-hour video logs under station marshal supervision."
    },
    {
      id: 'whoosh',
      icon: <Train className="w-5 h-5 text-[#E0533C]" />,
      label: language === 'id' ? "🚄 Akses Peron Kereta Cepat WHOOSH" : "🚄 WHOOSH Bullet Train Platform",
      shortLabel: language === 'id' ? "Peron WHOOSH" : "WHOOSH Platforms",
      colorClass: "bg-[#FFEBE5] border-[#E0533C] hover:bg-[#E0533C] hover:text-white",
      query: language === 'id' ? "Berapa nomor peron Kereta WHOOSH, dan di mana gerbang boardingnya?" : "What platform number is WHOOSH fast transit, and where is boarding?",
      answer: language === 'id'
        ? "🚄 **AKSES LAYANAN KERETA CEPAT WHOOSH:**\n\n• **Lantai 3 (Overhead Layer):** Jalur khusus peron layang 5 & 6 untuk keberangkatan arah Bandung (Halim/Padalarang).\n• **Boarding Gate:** Menggunakan pemindaian wajah otomatis (Face Recognition) atau scan QR e-ticket.\n• **Waktu Penting:** Gerbang ditutup otomatis oleh sistem tepat **5 menit** sebelum waktu keberangkatan. Harap bersiap di ruang tunggu Lantai 3."
        : "🚄 **ACCESS TO WHOOSH FAST TRANSIT BULLET TRAIN:**\n\n• **Platform Overhead Level (L3):** Platforms 5 & 6 for Bandung bound departures (Halim, Padalarang, Tegalluar).\n• **Boarding Gate:** Biometric face recognition check-in kiosks or quick scan electronic QR readers.\n• **Departure Alert:** Boarding gates seal automatically exactly **5 minutes** prior to train dispatch."
    },
    {
      id: 'info',
      icon: <Info className="w-5 h-5 text-[#1e40af]" />,
      label: language === 'id' ? "📢 Informasi Terkini (Status Jalur)" : "📢 Realtime Travel Status & Platform",
      shortLabel: language === 'id' ? "Informasi Terkini" : "Operational Status",
      colorClass: "bg-[#EFF6FF] border-[#1e40af] hover:bg-[#1e40af] hover:text-white",
      query: language === 'id' ? "Bagaimana status operasional kereta api hari ini secara real-time?" : "What is the live operational dispatch log today?",
      answer: language === 'id'
        ? "📢 **STATUS OPERASIONAL REALTIME HARI INI:**\n\n• **KRL Commuter Line:** Jalur peron 1 & 2 beroperasi penuh, keberangkatan lancar tiap 5-10 menit.\n• **KA Antar Kota:** Kereta Jarak Jauh (Argo Parahyangan, Argo Bromo) tercatat **Tepat Waktu (On-Time)**.\n• **WHOOSH:** Semua jadwal berjalan normal berselang keberangkatan setiap 45 menit sekali."
        : "📢 **TRAVEL DISPATCH OPERATIONAL BULLETIN:**\n\n• **KRL Commuter Metro:** Platform 1 & 2 fully operational, trains departure smoothly every 5 to 10 minutes.\n• **Express Intercity:** Long-haul trains (Argo Parahyangan, Argo Bromo) are currently logging **On-Time**.\n• **WHOOSH Bullet:** Uninterrupted service run, trains dispatching normally every 45 minutes."
    },
    {
      id: 'kuliner',
      icon: <Coffee className="w-5 h-5 text-[#854d0e]" />,
      label: language === 'id' ? "🍿 Kuliner Lantai 2 Mezzanine" : "🍿 Food Court Mezzanine level 2",
      shortLabel: language === 'id' ? "Kuliner Lantai 2" : "F&B Mezzanine",
      colorClass: "bg-[#FEF9C3] border-[#854d0e] hover:bg-[#854d0e] hover:text-white",
      query: language === 'id' ? "Ada tenant makanan dan tempat santai apa saja di lantai mezzanine?" : "What cafes and snack booths are up on mezzanine level 2?",
      answer: language === 'id'
        ? "🍿 **PUSAT KULINER MEZZANINE (LANTAI 2):**\n\n• **Makanan Berat:** Tersedia Nasi Goreng KAI Premium hangat, Bakso Arema Malang pedas gurih, dan Soto Ayam Madura.\n• **Cemilan Cepat:** Kios legendaris Roti 'O (roti mentega wangi kopi yang hangat), Kopi Kenangan, dan Lawson Convenience Store.\n• **Fasilitas:** Meja makan bersih dilengkapi stop kontak colokan listrik untuk pengisian baterai gawai Anda."
        : "🍿 **MEZZANINE FOOD COURT SECTORS (L2):**\n\n• **Heavy Food:** Cooked KAI Premium fried rice, spicy savory meatball bowl, and Soto Ayam Madura.\n• **Bites & Cafe:** Legendary Roti 'O (warm buttery coffee-scented buns), Kopi Kenangan coffee cup, and Lawson.\n• **Amenity:** Hygienic tables with open electric power sockets to recharge smart electronics."
    },
    {
      id: 'krl',
      icon: <Train className="w-5 h-5 text-[#15803d]" />,
      label: language === 'id' ? "🚇 Jalur Peron KRL Transit" : "🚇 KRL Commuter Metro Platform",
      shortLabel: language === 'id' ? "Peron KRL" : "KRL Commuter Platforms",
      colorClass: "bg-[#F0FDF4] border-[#15803d] hover:bg-[#15803d] hover:text-white",
      query: language === 'id' ? "Penunjuk arah peron transit untuk KRL Commuter Line lokal ke mana saja?" : "Can you direct me to local KRL Commuter Line tracks?",
      answer: language === 'id'
        ? "🚇 **PANDUAN TRANSIT JALUR PERON 1 & 2:**\n\n• **Peron 1 (Lantai 1 Sisi Kiri):** Khusus ke arah Manggarai, Sudirman, Tanah Abang hingga Angke/Kampung Bandan.\n• **Peron 2 (Lantai 1 Sisi Kanan):** Keberangkatan arah Bekasi, Tambun, hingga Cikarang.\n• **Tapping Gate:** Pastikan saldo Kartu Multi-Trip (KMT) atau e-money Anda minimal Rp 5.000,-."
        : "🚇 **COMMUTER ACCESS CHANNELS (PLATFORMS 1 & 2):**\n\n• **Platform 1 (L1 Left):** Metro routes connecting towards Manggarai, Sudirman, Tanah Abang, and Kampung Bandan.\n• **Platform 2 (L1 Right):** Metro routes connecting towards Bekasi, Tambun, and Cikarang.\n• **Gate Tapping:** Confirm stored travel fare cards holds at least Rp 5,000 credit before tapping."
    },
    {
      id: 'loket',
      icon: <Ticket className="w-5 h-5 text-[#b45309]" />,
      label: language === 'id' ? "🎟️ Loket Tiket & Boarding Manual" : "🎟️ Physical Ticket Desk & Manual Gates",
      shortLabel: language === 'id' ? "Loket Tiket" : "Ticket Counters",
      colorClass: "bg-[#FFFBEB] border-[#b45309] hover:bg-[#b45309] hover:text-white",
      query: language === 'id' ? "Di mana lokasi loket tiket fisik dan bagaimana cara boarding manual?" : "Where can I purchase physical tickets or access manual boarding?",
      answer: language === 'id'
        ? "🎟️ **PANDUAN TIKET & LAYANAN BOARDING:**\n\n• **Loket Fisik (Lantai 1 Kiri):** Melayani pembelian go-show, pembatalan jadwal, serta pusat informasi porter stasiun.\n• **Mesin Cetak Tiket (CIM):** Tersedia 4 unit mesin cetak tiket mandiri di depan pintu masuk. Cukup masukkan kode booking Anda.\n• **Boarding Manual:** Pengunjung KTI jarak jauh tanpa e-KTP dapat menunjukkan e-ticket beserta kartu tanda pengenal fisik ke petugas pintu pemeriksaan."
        : "🎟️ **TICKET COUNTER & BOARDING DETAILS:**\n\n• **Physical Counter (L1 Left):** Handles go-show tickets, rescheduling, refunds, and porter guidance information.\n• **Ticket Printing Machines (CIM):** 4 self-service printing kiosks stand at ground level. Pin in booking codes to print.\n• **Manual Boarding:** Passengers traveling without electronic state IDs can present digital boarding passes with physical ID cards."
    }
  ];

  // Helper to parse double asterisks into bold React elements
  const formatMessageText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <strong key={index} className="font-extrabold text-[#4F252E] bg-[#F4AE52]/10 px-0.5">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Speech output helper
  const speakOutput = (text: string) => {
    if (!isVoiceEnabled) return;
    
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}

    // Strip markdown elements for clear voicing
    const cleanText = text
      .replace(/[\*\#\-\•]/g, '')
      .replace(/\s+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    try {
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
    } catch (e) {}

    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceMode = () => {
    triggerVibration([20, 10, 25]);
    playClickSound();
    setIsVoiceEnabled(prev => {
      const next = !prev;
      if (!next) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      } else {
        const confirmSpeech = new SpeechSynthesisUtterance("Panduan suara Kio diaktifkan.");
        try {
          const voices = window.speechSynthesis.getVoices();
          const idVoice = voices.find(v => v.lang.startsWith('id'));
          if (idVoice) confirmSpeech.voice = idVoice;
        } catch (e) {}
        window.speechSynthesis.speak(confirmSpeech);
      }
      return next;
    });
  };

  // Instant response generator for FAQ (eliminates network lag/503 errors and gives premium UX)
  const handleFaqClick = (faq: FaqItem) => {
    triggerVibration([25, 10, 20]);
    playClickSound();
    setActiveFaqId(faq.id);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: faq.query,
      timestamp: new Date()
    };

    const botMessage: ChatMessage = {
      id: `bot-${Date.now()}`,
      role: 'model',
      text: faq.answer,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    
    if (isVoiceEnabled) {
      speakOutput(faq.answer);
    }
  };

  const handleSendMessage = async (customQuery: string) => {
    if (!customQuery.trim() || loading) return;

    triggerVibration([15, 10, 15]);
    playClickSound();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: customQuery,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: customQuery,
          history: historyPayload
        })
      });

      const data = await response.json();
      const botResponseText = data.text || "Halo kak, saya sedang mengalami kendala jaringan. Silakan tekan tombol informasi cepat di sebelah atas untuk panduan langsung!";
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: botResponseText,
        timestamp: new Date(),
        isFallback: !!data.isFallback
      };

      triggerVibration([20, 10, 20]);
      playClickSound();
      setMessages(prev => [...prev, botMsg]);
      
      if (isVoiceEnabled) {
        speakOutput(botResponseText);
      }
    } catch (error) {
      console.error("AI Assistant network error:", error);
      triggerVibration([40, 40, 40]);
      
      // Let's search inside our FAQ list keyword map to offer helpful localized answer instead of generic error where possible!
      const lowerQuery = customQuery.toLowerCase();
      let matchedFaq = FAQ_LIST.find(faq => 
        lowerQuery.includes(faq.shortLabel.toLowerCase()) || 
        lowerQuery.includes('toilet') && faq.id === 'toilet' ||
        lowerQuery.includes('loker') && faq.id === 'loker' ||
        lowerQuery.includes('penitipan') && faq.id === 'loker' ||
        lowerQuery.includes('whoosh') && faq.id === 'whoosh' ||
        lowerQuery.includes('cepat') && faq.id === 'whoosh' ||
        lowerQuery.includes('makan') && faq.id === 'kuliner' ||
        lowerQuery.includes('krl') && faq.id === 'krl' ||
        lowerQuery.includes('tiket') && faq.id === 'loket'
      );

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: matchedFaq 
          ? `⚠️ Koneksi online agak terputus, namun saya punya informasi pintar lokal untuk Anda:\n\n${matchedFaq.answer}`
          : "⚠️ Koneksi Kios sedang offline. Namun semua tombol FAQ di bagian atas tetap berfungsi penuh untuk menunjukkan lokasi toilet, loker, boarding WHOOSH, dan panduan stasiun secara instan!",
        timestamp: new Date(),
        isFallback: true
      };
      setMessages(prev => [...prev, errorMsg]);
      
      if (isVoiceEnabled) {
        speakOutput(errorMsg.text);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    triggerVibration(20);
    playClickSound();
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: "🧼 Riwayat dialog telah dibersihkan. Ada hal lain yang bisa saya bantu, Kak? Sentuh langsung tombol FAQ di bawah ini!",
        timestamp: new Date()
      }
    ]);
    setActiveFaqId(null);
  };

  return (
    <div 
      onMouseEnter={() => triggerVibration(5)}
      className="bg-[#C1EBE9] border-3 border-[#4F252E] rounded-none flex flex-col h-[580px] shadow-[6px_6px_0px_0px_#FFF7C5] overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:-translate-y-2 hover:shadow-[14px_14px_0px_0px_#FFF7C5] hover:bg-[#D5F5F3] hover:z-10"
    >
      {/* Assistant Header */}
      <div className="bg-white/45 text-[#4F252E] p-4 flex justify-between items-center sm:px-5 shrink-0 border-b-2 border-[#4F252E]/15">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3.5 w-3.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${loading ? 'bg-[#F4AE52]' : 'bg-emerald-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${loading ? 'bg-[#F4AE52]' : 'bg-emerald-500'}`}></span>
          </div>
          <div>
            <h3 className="font-display font-black text-sm sm:text-base md:text-lg tracking-tight flex items-center gap-2 uppercase text-[#4F252E]">
              <Bot className="w-5 h-5 md:w-6 md:h-6 text-[#F4AE52]" />
              {language === 'id' ? 'PUSAT INFORMASI MANDIRI KIO' : 'KIO SELF-SERVICE INFORMATION CENTER'}
            </h3>
            <span className="font-mono text-[8px] md:text-[10px] block leading-none font-bold mt-1.5 select-none text-[#4F252E]/80">
              {language === 'id' ? '⚡ LAYANAN CEPAT • PILIH FAQ UNTUK DETIL INSTAN' : '⚡ INSTANT SERVICES • SELECT FAQ FOR DETAILED ANSWERS'}
            </span>
          </div>
        </div>

        {/* Voice control and clear button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVoiceMode}
            onMouseEnter={() => triggerVibration(6)}
            title={isVoiceEnabled ? "Nonaktifkan Panduan Suara" : "Aktifkan Panduan Suara"}
            className={`p-2 rounded-none border transition-all flex items-center justify-center cursor-pointer ${
              isVoiceEnabled 
                ? 'bg-[#F4AE52] text-[#4F252E] border-2 border-[#4F252E]' 
                : 'bg-[#4F252E]/10 text-[#4F252E] border-[#4F252E]/20 hover:bg-[#4F252E]/20'
            }`}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-[#4F252E]" /> : <VolumeX className="w-4 h-4 text-[#4F252E]" />}
          </button>
          
          <button
            onClick={clearChat}
            className="font-mono text-[9px] font-black border-2 border-[#4F252E] bg-white text-[#4F252E] px-2.5 py-1.5 shadow-[2px_2px_0px_#4F252E] hover:bg-[#F4AE52] transition-colors cursor-pointer"
            title={language === 'id' ? "Bersihkan Riwayat" : "Clear History"}
          >
            RESET
          </button>
        </div>
      </div>

      {/* Two-Column Responsive Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: FAQ List Stack */}
        <div className="w-full md:w-[240px] bg-[#aee2e0] border-b-2 md:border-b-0 md:border-r-2 border-[#4F252E]/20 flex flex-col overflow-hidden shrink-0">
          <div className="p-3 bg-[#4F252E]/5 border-b-2 border-[#4F252E]/15 flex items-center gap-1.5 shrink-0">
            <HelpCircle className="w-4 h-4 text-[#F4AE52]" />
            <span className="font-mono text-[10px] font-black uppercase text-[#4F252E] tracking-tight">
              {language === 'id' ? 'PILIH PERTANYAAN (FAQ)' : 'SELECT QUESTION (FAQ)'}
            </span>
          </div>

          {/* List of FAQ queries stacked vertically */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
            {FAQ_LIST.map((faq) => {
              const isSelected = activeFaqId === faq.id;
              return (
                <button
                  key={faq.id}
                  onClick={() => handleFaqClick(faq)}
                  className={`w-full text-left font-mono rounded-none p-2 border-2 transition-all flex items-center gap-2.5 shadow-[2px_2px_0px_0px_#4F252E] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#4F252E] cursor-pointer ${
                    isSelected 
                      ? 'bg-[#4F252E] text-[#FFF7C5] border-black shadow-[1.5px_1.5px_0px_#FFF7C5]' 
                      : `${faq.colorClass} text-[#4F252E] border-black/40`
                  }`}
                >
                  <span className="shrink-0 text-base">{faq.label.split(' ')[0]}</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] sm:text-xs font-black uppercase tracking-tight truncate leading-tight">
                      {faq.shortLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-[#4F252E]/10 border-t border-[#4F252E]/15 text-center shrink-0">
            <span className="font-mono text-[8px] font-bold text-[#4F252E]/70 block">
              {language === 'id' ? '💡 SENTUH UNTUK JAWABAN CEPAT' : '💡 TAP FOR INSTANT RESPONSE'}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Dialogue Screen & Input */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/75 relative">
          
          {/* Chat Messages Logs */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white/50 no-scrollbar min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-none p-3.5 border-2 ${
                    msg.role === 'user'
                      ? 'bg-[#F4AE52] text-[#4F252E] border-[#4F252E] shadow-[2.5px_2.5px_0px_0px_#4F252E]'
                      : 'bg-white text-[#4F252E] border-[#4F252E] shadow-[2.5px_2.5px_0px_0px_#4F252E]'
                  }`}
                >
                  <div className="flex items-center flex-wrap gap-1.5 mb-1.5 font-mono text-[10px] opacity-70 bg-black/5 px-1 py-0.5">
                    <span className="font-bold underline">
                      {msg.role === 'user' ? (language === 'id' ? 'PENUMPANG' : 'PASSENGER') : 'ROBOT_KIO_OFFICIAL'}
                    </span>
                    {msg.role === 'model' && msg.isFallback && (
                      <span className="bg-[#4F252E]/10 text-[#4F252E] text-[8px] font-black px-1.5 py-0.5 rounded border border-[#4F252E]/25 uppercase tracking-wide">
                        {language === 'id' ? '📦 LOKAL' : '📦 LOCAL'}
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {msg.timestamp.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed font-semibold">
                    {formatMessageText(msg.text)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-[#4F252E] border-2 border-[#4F252E] rounded-none p-3 shadow-[2.5px_2.5px_0px_0px_#4F252E] max-w-[85%] animate-pulse">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#F4AE52]" />
                    <span className="font-mono text-xs font-bold">
                      {language === 'id' ? 'Kio sedang menimbang rute...' : 'Kio is analyzing pathway logs...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat user manual message input bottom */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 bg-[#4F252E] border-t-2 border-[#4F252E] flex items-center space-x-2 shrink-0 rounded-none relative z-10"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'id' ? "Ketik topik khusus lainnya disini..." : "Type custom request or other topic here..."}
                className="w-full bg-white border-2 border-[#4F252E] text-[#4F252E] placeholder-[#4F252E]/55 rounded-none py-2.5 pl-3 pr-10 text-xs font-sans font-bold focus:outline-none focus:ring-2 focus:ring-[#F4AE52]"
              />
              <Keyboard className="absolute right-3 top-3 w-4 h-4 text-[#4F252E]/60 pointer-events-none" />
            </div>
            
            <button
              type="submit"
              onMouseEnter={() => {
                if (input.trim() && !loading) {
                  triggerVibration(6);
                }
              }}
              disabled={!input.trim() || loading}
              className="bg-[#F4AE52] text-[#4F252E] border-2 border-[#4F252E] hover:bg-[#FFF7C5] hover:text-[#4F252E] transition-all p-2.5 rounded-none flex items-center justify-center shadow-[2px_2px_0px_0px_#4F252E] disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
        
      </div>

    </div>
  );
}
