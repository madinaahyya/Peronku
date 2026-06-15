import React, { useState, useEffect } from 'react';
import { Camera, QrCode, ScanFace, Compass, Info, CheckCircle, ArrowRight, RefreshCw, MapPin } from 'lucide-react';
import { TrainSchedule } from '../types';
import { triggerVibration, playClickSound } from '../utils';
import { useLanguage } from '../LanguageContext';

const PASSENGER_NAMES = [
  'Aris Setiawan',
  'Dewi Lestari',
  'Budi Santoso',
  'Siti Aminah',
  'Rian Hidayat',
  'Putu Wijaya',
  'Amanda Putri',
  'Kak M. Hedy',
  'Andi Pratama',
  'Sania Rahma',
  'Aditya Nugraha',
  'Yusuf Maulana'
];

interface TicketScannerHubProps {
  currentTrain?: TrainSchedule;
}

export default function TicketScannerHub({ currentTrain }: TicketScannerHubProps) {
  const { language, t } = useLanguage();
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'scanned'>('idle');
  const [activeCarriage, setActiveCarriage] = useState<number>(3); // Default carriage 3
  const [seatCode, setSeatCode] = useState<string>('EKSEKUTIF / GERBONG 3 - KURSI 12A');
  const [passengerName, setPassengerName] = useState<string>('Kak M. Hedy');
  const [animatePath, setAnimatePath] = useState(false);
  const [ticketInput, setTicketInput] = useState<string>('');
  const [scannedTicketNumber, setScannedTicketNumber] = useState<string>('');

  const [scannedTrainNo, setScannedTrainNo] = useState<string>('WHOOSH G1102');
  const [scannedDestName, setScannedDestName] = useState<string>('Bandung - Tegalluar');
  const [scannedPlatformNo, setScannedPlatformNo] = useState<string>('05');
  const [scannedType, setScannedType] = useState<"Express" | "Rapid" | "Commuter" | "Shinkansen">('Shinkansen');

  // Sync when currentTrain updates
  useEffect(() => {
    if (currentTrain) {
      setScannedTrainNo(currentTrain.trainNo);
      setScannedDestName(currentTrain.destination);
      setScannedPlatformNo(currentTrain.platform);
      setScannedType(currentTrain.type);
    }
  }, [currentTrain]);

  // Automatic path animation on successfully scanning
  useEffect(() => {
    if (scanState === 'scanned') {
      setAnimatePath(false);
      const timer = setTimeout(() => {
        setAnimatePath(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [scanState, activeCarriage]);

  // Generate deterministic dummy GPS coordinates depending on train type / destination
  const getDummyCoords = () => {
    let lat = -6.2088;
    let lon = 106.8456;
    
    const trainNoUpper = scannedTrainNo.toUpperCase();
    if (trainNoUpper.includes('WHOOSH') || scannedType === 'Shinkansen') {
      lat = -6.24153;
      lon = 106.87951;
    } else if (trainNoUpper.includes('ARGO') || scannedType === 'Rapid' || scannedType === 'Express') {
      lat = -6.17643;
      lon = 106.83062;
    } else if (trainNoUpper.includes('BANDARA')) {
      lat = -6.12651;
      lon = 106.65423;
    } else if (trainNoUpper.includes('MRT')) {
      lat = -6.22014;
      lon = 106.83025;
    } else if (trainNoUpper.includes('LRT')) {
      lat = -6.25841;
      lon = 106.82012;
    }
    
    // Slight offset based on activeCarriage
    const offset = (activeCarriage - 2) * 0.00021;
    lat = parseFloat((lat + offset).toFixed(5));
    lon = parseFloat((lon - offset).toFixed(5));
    
    return { lat, lon };
  };

  const { lat: gpsLat, lon: gpsLon } = getDummyCoords();

  const handleScanSimulation = (manualCode?: string) => {
    triggerVibration([15, 10, 15]);
    playClickSound();
    setScanState('scanning');

    let selectedName = '';
    let codeToShow = '';

    if (manualCode) {
      const trimmed = manualCode.trim();
      // If the input is purely letters, spaces, and dots (and at least 3 chars), treat it as a passenger name input!
      if (/^[a-zA-Z\s\.]+$/.test(trimmed) && trimmed.length >= 3 && !trimmed.toUpperCase().startsWith('KAI') && !trimmed.toUpperCase().startsWith('KRL')) {
        selectedName = trimmed;
        codeToShow = 'KAI-' + Math.floor(100000 + Math.random() * 900000);
      } else {
        // It's a ticket code
        codeToShow = trimmed.toUpperCase();
        // Deterministically select name from list based on ticket code, so same ticket yields same name
        let hash = 0;
        for (let i = 0; i < codeToShow.length; i++) {
          hash += codeToShow.charCodeAt(i);
        }
        selectedName = PASSENGER_NAMES[hash % PASSENGER_NAMES.length];
      }
    } else {
      // Simulate auto-scan: select a random name
      selectedName = PASSENGER_NAMES[Math.floor(Math.random() * PASSENGER_NAMES.length)];
      codeToShow = 'KAI-' + Math.floor(100000 + Math.random() * 900000);
    }

    setScannedTicketNumber(codeToShow);
    setPassengerName(selectedName);

    let matchedTrainNo = 'WHOOSH G1102';
    let matchedDest = 'Bandung - Tegalluar';
    let matchedPlat = '05';
    let matchedType: "Express" | "Rapid" | "Commuter" | "Shinkansen" = 'Shinkansen';

    if (currentTrain) {
      matchedTrainNo = currentTrain.trainNo;
      matchedDest = currentTrain.destination;
      matchedPlat = currentTrain.platform;
      matchedType = currentTrain.type;
    } else {
      const codeUpper = codeToShow.toUpperCase();
      if (codeUpper.startsWith('KRL') || codeUpper.includes('COMMUTER')) {
        matchedTrainNo = 'KRL Commuter Line Bekasi';
        matchedDest = 'Cikarang - Bekasi';
        matchedPlat = '04';
        matchedType = 'Commuter';
      } else if (codeUpper.startsWith('WH') || codeUpper.startsWith('WHOOSH')) {
        matchedTrainNo = 'WHOOSH Bullet Train G1115';
        matchedDest = 'Tegalluar - Bandung';
        matchedPlat = '05';
        matchedType = 'Shinkansen';
      } else if (codeUpper.startsWith('ARGO') || codeUpper.startsWith('KAI') || codeUpper.startsWith('KA')) {
        matchedTrainNo = 'KA Argo Parahyangan';
        matchedDest = 'Bandung - Hall';
        matchedPlat = '03';
        matchedType = 'Rapid';
      } else if (codeUpper.startsWith('MRT')) {
        matchedTrainNo = 'MRT Jakarta Premium';
        matchedDest = 'Lebak Bulus Grab';
        matchedPlat = '10';
        matchedType = 'Commuter';
      } else if (codeUpper.startsWith('LRT')) {
        matchedTrainNo = 'LRT Jabodebek';
        matchedDest = 'Dukuh Atas';
        matchedPlat = '07';
        matchedType = 'Commuter';
      } else {
        // Random selection off a list of ALL train types
        const typesList = [
          { trainNo: 'WHOOSH G1102', destination: 'Bandung - Tegalluar', platform: '05', type: 'Shinkansen' },
          { trainNo: 'KRL Commuter Line Bogor', destination: 'Bogor (KRL Transit)', platform: '01', type: 'Commuter' },
          { trainNo: 'KA Argo Parahyangan', destination: 'Bandung - Hall', platform: '03', type: 'Rapid' },
          { trainNo: 'KA Bandara Express', destination: 'Bandara Soekarno-Hatta (SHIA)', platform: '08', type: 'Express' },
          { trainNo: 'MRT Jakarta', destination: 'Lebak Bulus Grab', platform: '10', type: 'Commuter' },
          { trainNo: 'LRT Jabodebek', destination: 'Harjamukti (Cibubur)', platform: '06', type: 'Commuter' }
        ];
        // Pick deterministically based on hash so same code generates same train!
        let hash = 0;
        for (let i = 0; i < codeToShow.length; i++) {
          hash += codeToShow.charCodeAt(i);
        }
        const selected = typesList[hash % typesList.length];
        matchedTrainNo = selected.trainNo;
        matchedDest = selected.destination;
        matchedPlat = selected.platform;
        matchedType = selected.type as any;
      }
    }

    setScannedTrainNo(matchedTrainNo);
    setScannedDestName(matchedDest);
    setScannedPlatformNo(matchedPlat);
    setScannedType(matchedType);
    
    // Pick a random carriage and seat code for rich simulation variation
    setTimeout(() => {
      const randomCarriage = Math.floor(Math.random() * 4) + 1; // Gerbong 1 to 4
      const seatLetter = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
      const seatNum = Math.floor(Math.random() * 32) + 1;
      
      let classType = 'EKSEKUTIF UTAMA';
      if (matchedType === 'Shinkansen') {
        classType = randomCarriage === 1 ? 'WHOOSH FIRST CLASS' : 'WHOOSH PREMIUM ECONOMY';
      } else if (matchedType === 'Express' || matchedType === 'Rapid') {
        classType = randomCarriage === 1 ? 'LUXURY SLEEPER' : 'EKSEKUTIF PREMIUM';
      } else if (matchedType === 'Commuter') {
        classType = 'COMMUTER CLASS (FREE SEATING)';
      } else {
        classType = 'EKSEKUTIF BANDARA';
      }
      
      setActiveCarriage(randomCarriage);
      setSeatCode(`${classType} / GERBONG ${randomCarriage} - KURSI ${seatNum}${seatLetter}`);
      
      triggerVibration([40, 20, 25, 10, 15]);
      playClickSound();
      setScanState('scanned');
    }, 1800);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) {
      triggerVibration([50, 40, 50]);
      return;
    }
    handleScanSimulation(ticketInput);
  };

  const handleReset = () => {
    triggerVibration(10);
    playClickSound();
    setScanState('idle');
    setTicketInput('');
    setAnimatePath(false);
  };

  // Get current active train destination (using scanned info when scanned, or selected currentTrain)
  const destName = scannedDestName;
  const platformNo = scannedPlatformNo;
  const trainNo = scannedTrainNo;

  return (
    <div 
      id="ticket-scanner-hub"
      onMouseEnter={() => triggerVibration(5)}
      className="bg-[#C1EBE9] border-3 border-[#4F252E] rounded-none p-6 md:p-8 shadow-[6px_6px_0px_0px_#FFF7C5] flex flex-col h-auto text-[#4F252E] transition-all duration-300 hover:scale-[1.01] hover:-translate-y-2 hover:shadow-[14px_14px_0px_0px_#FFF7C5] hover:bg-[#D5F5F3] hover:z-10"
    >
      
      {/* Section Header */}
      <div className="border-b-2 border-[#4F252E]/20 pb-5 mb-5 shrink-0 flex justify-between items-center">
        <div>
          <h3 className="font-display font-black text-2xl md:text-3xl text-[#4F252E] tracking-tight flex items-center gap-2.5">
            <QrCode className="w-8 h-8 text-[#F4AE52]" />
            {t('ticketHubTitle')}
          </h3>
          <p className="font-mono text-xs text-[#4F252E]/75 uppercase tracking-widest leading-none font-bold mt-1">
            {t('ticketHubDesc').substring(0, 100)}...
          </p>
        </div>
        
        {scanState === 'scanned' && (
          <button
            onClick={handleReset}
            onMouseEnter={() => triggerVibration(6)}
            className="px-5 py-2.5 rounded-none border-2 border-[#4F252E] bg-[#F4AE52] hover:bg-[#FFF7C5] text-[#4F252E] font-mono text-xs font-black shadow-[2.5px_2.5px_0px_0px_#4F252E] transition-all cursor-pointer"
          >
            {t('reScan')}
          </button>
        )}
      </div>

      {scanState === 'idle' && (
        <div className="flex-1 flex flex-col justify-center items-center py-4 px-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl items-stretch">
            
            {/* OPSI 1: Scan / Simulasi QR */}
            <div className="bg-white/45 border-2 border-[#4F252E]/30 rounded-none p-5 flex flex-col items-center space-y-4 text-center h-full justify-between">
              <span className="font-mono text-[9px] bg-[#4F252E] text-[#FFF7C5] px-2.5 py-1 rounded-none uppercase font-black tracking-wider">
                {t('scanOpA')}
              </span>
              <div className="relative w-32 h-32 border-4 border-dashed border-[#4F252E]/35 rounded-none flex flex-col items-center justify-center bg-white/60 overflow-hidden my-1">
                <Camera className="w-10 h-10 text-[#4F252E]/50 animate-pulse" />
                <span className="font-mono text-[8px] text-[#4F252E]/80 mt-2 font-bold uppercase tracking-wider text-center">
                  {t('scanDirection')}
                </span>
                <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-3 border-l-3 border-[#4F252E] rounded-tl-sm" />
                <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-3 border-r-3 border-[#4F252E] rounded-tr-sm" />
                <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-3 border-l-3 border-[#4F252E] rounded-bl-sm" />
                <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-3 border-r-3 border-[#4F252E] rounded-br-sm" />
              </div>
              <button
                onClick={() => handleScanSimulation()}
                onMouseEnter={() => triggerVibration(6)}
                className="w-full py-3 font-display font-black text-xs bg-[#FFF7C5] text-[#4F252E] border-2 border-[#4F252E] rounded-none hover:bg-[#F4AE52] hover:scale-101 transition-all shadow-[2.5px_2.5px_0px_0px_#4F252E] cursor-pointer"
              >
                {t('simScan')}
              </button>
            </div>

            {/* OPSI 2: Input Manual */}
            <form onSubmit={handleManualSubmit} className="bg-white/45 border-2 border-[#4F252E]/30 rounded-none p-5 flex flex-col items-center space-y-4 text-center h-full justify-between">
              <span className="font-mono text-[9px] bg-[#4F252E] text-[#FFF7C5] px-2.5 py-1 rounded-none uppercase font-black tracking-wider">
                {t('scanOpB')}
              </span>
              
              <div className="w-full space-y-2 py-3">
                <label className="block font-mono text-[10px] text-[#4F252E] font-black uppercase tracking-wider">
                  {t('enterTicketNo')}
                </label>
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder={language === 'id' ? 'CONTOH: KAI-7821B9' : 'EXAMPLE: KAI-7821B9'}
                  className="w-full bg-white border-2 border-[#4F252E] px-4 py-2.5 rounded-none font-mono text-xs font-black shadow-[2.5px_2.5px_0px_0px_#4F252E] uppercase placeholder-[#4F252E]/35 focus:outline-none focus:ring-1 focus:ring-[#F4AE52] text-center text-[#4F252E]"
                />
              </div>

              <button
                type="submit"
                onMouseEnter={() => triggerVibration(6)}
                className="w-full py-3 font-display font-black text-xs bg-[#F4AE52] text-[#4F252E] border-2 border-[#4F252E] rounded-none hover:bg-[#FFF7C5] hover:scale-101 transition-all shadow-[2.5px_2.5px_0px_0px_#4F252E] cursor-pointer disabled:opacity-50"
                disabled={!ticketInput.trim()}
              >
                {language === 'id' ? 'VERIFIKASI & CARI TIKET' : 'VERIFY & PREDICT TICKET'}
              </button>
            </form>

          </div>

          <div className="text-center max-w-sm px-2 pt-2">
            <h4 className="font-display font-black text-[#4F252E] text-xs uppercase">
              {language === 'id' ? 'DEKATKAN E-TIKET ATAU KETIK NOMOR-NYA' : 'SCAN BARCODE OR ENTER DETAILS'}
            </h4>
            <p className="text-[11px] font-sans text-[#4F252E]/80 mt-1 leading-relaxed font-bold">
              {language === 'id' 
                ? 'Pilih rute-mu dulu di sebelah kiri, lalu isi nomor tiket Anda secara manual di atas atau klik tombol digital scan untuk status gerbong instan.'
                : 'Pilih rute-mu dulu di tabel atas, lalu isi nomor tiket Anda secara manual atau klik simulasi digital scan untuk status gerbong instan.'
              }
            </p>
          </div>
        </div>
      )}

      {scanState === 'scanning' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 space-y-8">
          {/* Active Camera Scan View */}
          <div className="relative w-48 h-48 border-4 border-[#4F252E] rounded-none flex flex-col items-center justify-center bg-white/60 overflow-hidden shadow-[0_0_15px_rgba(79,37,46,0.15)]">
            {/* Sweeping laser light */}
            <div className="absolute inset-x-0 h-1.5 bg-[#F4AE52] shadow-[0_0_12px_#F4AE52] animate-[bounce_1.5s_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4F252E]/10 to-transparent animate-pulse" />
            <ScanFace className="w-14 h-14 text-[#4F252E]" />
            <span className="font-mono text-[10px] text-[#4F252E] font-black mt-4 tracking-widest uppercase animate-pulse">
              {t('validating').substring(0, 20)}...
            </span>
          </div>

          <div className="text-center">
            <h4 className="font-mono text-sm font-black text-[#4F252E] uppercase tracking-wider flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#F4AE52]" />
              {language === 'id' ? 'MENCARI DATABASE KAI' : 'QUERYING RAILWAY DATABASE'}
            </h4>
            <p className="text-sm font-sans text-[#4F252E]/80 mt-2 font-bold">
              {language === 'id'
                ? 'Menyeimbangkan data gerbong, info peron, dan peta aman kursi penumpang...'
                : 'Mapping safe carriage logs, real platform directions, and seat vacancies...'
              }
            </p>
          </div>
        </div>
      )}

      {scanState === 'scanned' && (
        <div className="flex-1 flex flex-col justify-between space-y-6">
          
          {/* Ticket Information Card with super comfy relaxed vibe */}
          <div className="bg-[#FFF7C5] border-2 border-[#4F252E] rounded-none p-4 md:p-5 shadow-[3.5px_3.5px_0px_0px_#4F252E] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
            <div className="space-y-1.5 animate-fade-in font-bold">
              <div className="flex flex-wrap items-center gap-1.5">
                <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="font-mono text-[9px] sm:text-[10px] bg-emerald-700 text-white px-2.5 py-1 rounded-none uppercase font-black tracking-wider border border-[#4F252E]/10 shadow-[1.5px_1.5px_0px_#4F252E]">
                  {language === 'id' ? 'TIKET TERVERIFIKASI' : 'TICKET VERIFIED'}
                </span>
                
                {/* Train Type Accent Badge */}
                <span className="font-mono text-[9px] sm:text-[10px] bg-[#4F252E] text-[#FFF7C5] px-2.5 py-1 rounded-none uppercase font-black tracking-wider border border-[#4F252E]">
                  {scannedType === 'Shinkansen' && 'BULLET TRAIN'}
                  {scannedType === 'Rapid' && 'RAPID INTERCITY'}
                  {scannedType === 'Commuter' && 'KRL COMMUTER'}
                  {scannedType === 'Express' && 'AIRPORT EXPRESS'}
                </span>
              </div>
              
              <p className="font-display font-black text-sm text-[#4F252E] uppercase leading-tight pt-1">
                {language === 'id' ? 'PENUMPANG' : 'PASSENGER'}: <span className="underline text-[#F4AE52] font-black">{passengerName}</span>
              </p>
              <p className="font-mono text-xs text-[#4F252E] font-black leading-tight">
                {language === 'id' ? 'NO TIKET' : 'TICKET NO'}: <span className="text-[#FFF7C5] bg-[#4F252E] px-2 py-0.5 rounded text-[10px] font-black">{scannedTicketNumber}</span>
              </p>
              <p className="font-mono text-xs text-[#4F252E]/80 font-bold leading-tight">
                {trainNo} • {destName}
              </p>
            </div>
            
            <div className="text-left sm:text-right border-t-2 sm:border-t-0 sm:border-l-2 border-[#4F252E]/20 pt-3 sm:pt-0 pl-0 sm:pl-6 w-full sm:w-auto font-bold flex flex-col items-start sm:items-end justify-center">
              <span className="font-mono text-[9px] text-[#4F252E]/70 block uppercase font-bold">{language === 'id' ? 'ALOKASI KURSI' : 'SEAT ALLOCATION'}</span>
              <span className="font-mono font-black text-xs sm:text-sm text-[#4F252E] block truncate max-w-[200px]">{seatCode.split(' / ')[1] || seatCode}</span>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="font-mono text-[9px] sm:text-[10px] bg-[#F4AE52] text-[#4F252E] font-black px-2.5 py-0.5 rounded-sm border border-[#4F252E]">
                  {language === 'id' ? 'PERON' : 'PLATFORM'} {platformNo}
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] bg-[#4F252E] text-[#FFF7C5] font-black px-2.5 py-0.5 rounded-sm border border-[#4F252E]">
                  {language === 'id' ? 'JALUR / TRACK' : 'TRACK'} {parseInt(platformNo) || platformNo}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Carriage Layout Map */}
          <div className="space-y-2.5 py-1">
            <span className="font-mono text-[10px] font-black text-[#4F252E]/80 uppercase block tracking-wider font-bold">
              {language === 'id' ? 'PILIH GERBONG UNTUK LIHAT JALUR JALAN:' : 'SELECT CARRIAGE TO VIEW PATHWAY:'}
            </span>
            <div className="grid grid-cols-5 gap-2 items-stretch text-center">
              {/* Locomotive engine */}
              <div className="border-2 border-[#4F252E] bg-[#4F252E] rounded-none p-3 text-[#FFF7C5] flex flex-col items-center justify-center shrink-0">
                <span className="font-mono text-[8px] block opacity-80 uppercase leading-none font-bold text-[#FFF7C5]/60 animate-pulse">{language === 'id' ? 'DEPAN' : 'FRONT'}</span>
                <span className="font-display font-black text-xs block leading-none mt-1 text-[#F4AE52]">LOCO</span>
              </div>

              {/* Passenger coaches 1-4 */}
              {[1, 2, 3, 4].map(num => {
                const isUserCarriage = num === activeCarriage;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      triggerVibration(15);
                      playClickSound();
                      setActiveCarriage(num);
                    }}
                    onMouseEnter={() => triggerVibration(5)}
                    className={`border-2 rounded-none p-3 flex flex-col justify-between items-center transition-all duration-300 cursor-pointer hover:border-[#4F252E] hover:scale-[1.04] active:translate-y-[1.5px] active:shadow-none ${
                      isUserCarriage
                        ? 'bg-[#F4AE52] border-[#4F252E] scale-[1.04] text-[#4F252E] shadow-[2.5px_2.5px_0px_0px_#4F252E] font-black'
                        : 'bg-white/50 border-[#4F252E]/25 text-[#4F252E]/85 shadow-[1.5px_1.5px_0px_0px_rgba(79,37,46,0.1)] hover:shadow-[3px_3px_0px_0px_#4F252E]'
                    }`}
                  >
                    <span className={`font-mono text-[8px] font-black block leading-none ${isUserCarriage ? 'text-[#4F252E]' : 'text-[#4F252E]/60'}`}>
                      {language === 'id' ? 'GERBONG' : 'COACH'}
                    </span>
                    <span className={`font-display font-black text-base my-1 leading-none ${isUserCarriage ? 'text-[#4F252E]' : 'text-[#4F252E]'}`}>
                      {num}
                    </span>
                    {isUserCarriage ? (
                      <span className="font-mono text-[7px] sm:text-[8px] bg-[#4F252E] text-[#FFF7C5] px-1.5 py-0.5 rounded uppercase font-black leading-none shrink-0 scale-90">
                        {language === 'id' ? 'KAMU' : 'YOU'}
                      </span>
                    ) : (
                      <span className="font-mono text-[8px] text-[#4F252E]/60 leading-none">
                        {num === 1 ? (language === 'id' ? 'RESTO' : 'RESTO') : (language === 'id' ? 'REGULER' : 'REGULAR')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Boarding Door Visual Path Finder (custom dynamic SVG map) */}
          <div className="bg-[#FFF7C5] border-2 border-[#4F252E] rounded-none p-3.5 flex flex-col space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-[#F4AE52] animate-spin" />
                <div className="font-mono text-[10px] text-[#4F252E] font-black">
                  {language === 'id' ? 'PETA KOORDINAT PERON • ' : 'PLATFORM COORDINATE VECTOR • '}<span className="text-[#4F252E] underline font-black uppercase">{language === 'id' ? `PINTU GERBONG ${activeCarriage}` : `COACH DOOR ${activeCarriage}`}</span>
                </div>
              </div>
              
              {/* Dynamic GPS Coordinate badge */}
              <div className="font-mono text-[9px] bg-[#4F252E] text-[#FFF7C5] px-2.5 py-1 rounded-none border border-[#4F252E] leading-none shrink-0 font-bold self-start sm:self-auto">
                📍 {language === 'id' ? 'KOORDINAT' : 'GO-COORD'}: <span className="text-[#F4AE52]">{gpsLat}° S, {gpsLon}° E</span>
              </div>
            </div>

            {/* Simulated Live Drawing of Walking Map */}
            <div className="relative h-24 bg-white/50 border border-[#4F252E]/20 rounded-none overflow-hidden font-bold">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 90" preserveAspectRatio="none">
                <defs>
                  <pattern id="gridLargeNew" width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#4F252E" strokeWidth="0.5" strokeOpacity="0.08" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gridLargeNew)" />

                <path
                  d="M 20 45 L 120 45 L 160 25 L 260 25 L 300 65 L 375 65"
                  fill="none"
                  stroke="#4F252E"
                  strokeWidth="3.5"
                  strokeDasharray="6 4"
                  strokeOpacity="0.12"
                  strokeLinecap="round"
                />

                {animatePath && (
                  <path
                    d="M 20 45 L 120 45 L 160 25 L 260 25 L 300 65 L 375 65"
                    fill="none"
                    stroke="#F4AE52"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="140"
                    strokeDashoffset={animatePath ? "0" : "140"}
                    className="transition-all duration-[3000ms] ease-out"
                    style={{
                      animation: 'dash 3.5s infinite linear',
                    }}
                  />
                )}

                <circle cx="20" cy="45" r="4" fill="#F4AE52" />
                <circle cx="20" cy="45" r="7" fill="none" stroke="#F4AE52" strokeWidth="1" className="animate-ping" />
                <text x="14" y="32" fontSize="9" fontFamily="monospace" fontWeight="bold" fill="#4F252E">{language === 'id' ? 'KAMU (DI SINI)' : 'YOU (HERE)'}</text>

                <circle cx="160" cy="25" r="4.5" fill="#4F252E" />
                <text x="156" y="38" fontSize="8" fontFamily="monospace" fill="#4F252E">{language === 'id' ? 'ESKALATOR L3' : 'ESCALATOR L3'}</text>

                <circle cx="375" cy="65" r="5" fill="#F4AE52" stroke="#4F252E" strokeWidth="1.5" />
                <text x="270" y="81" fontSize="9" fontFamily="monospace" fontWeight="extrabold" fill="#4F252E">{language === 'id' ? `PINTU GERBONG ${activeCarriage}` : `COACH DOOR ${activeCarriage}`}</text>
              </svg>

              {/* Text direction banner updated */}
              <div className="absolute right-3 bottom-2 bg-[#4F252E] border border-[#4F252E] text-[#FFF7C5] px-2.5 py-1 rounded-sm font-mono text-[8px] uppercase font-bold tracking-widest leading-none shadow-[1px_1px_0px_#F4AE52]">
                {language === 'id' ? 'EST. JALAN KAKI: 1-2 MENIT' : 'EST. WALK: 1-2 MINUTES'}
              </div>
            </div>
          </div>

          {/* Quick Info text lines */}
          <div className="font-sans text-xs text-[#4F252E]/90 flex items-start space-x-2 border-t border-[#4F252E]/10 pt-3 shrink-0 leading-relaxed font-bold">
            <Info className="w-4 h-4 text-[#F4AE52] shrink-0 mt-0.5" />
            <span>
              {language === 'id' 
                ? `Ikuti garis kuning penunjuk arah LINTASAN NYANTAI C di lantai stasiun untuk langsung menuju pintu masuk gerbong ${activeCarriage}. Lift ramah disabilitas tersedia tepat di sisi sebelah timur eskalator peron ${platformNo} (Jalur ${parseInt(platformNo) || platformNo}).`
                : `Follow the yellow guided route indicator PATWAY NYANTAI C on the station floors to align directly with coach door ${activeCarriage}. Disability lifts are accessible right east of the departure platform escalators ${platformNo} (Track ${parseInt(platformNo) || platformNo}).`
              }
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
