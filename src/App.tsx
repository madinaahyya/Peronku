import React, { useState, useEffect } from 'react';
import { Train, Clock, MapPin, Grid, RefreshCw, Volume2, ShieldAlert, ArrowLeft, Layers } from 'lucide-react';
import StandbyScreen from './components/StandbyScreen';
import LiveTimetable from './components/LiveTimetable';
import AiAssistant from './components/AiAssistant';
import TicketScannerHub from './components/TicketScannerHub';
import FoodRecommendations from './components/FoodRecommendations';
import ServiceComplaints from './components/ServiceComplaints';
import { TrainSchedule } from './types';
import WaterRippleCanvas from './components/WaterRippleCanvas';
import StationMapModal from './components/StationMapModal';
import WeatherWidget from './components/WeatherWidget';
import { triggerVibration, playClickSound, playRippleSound } from './utils';
import { useLanguage } from './LanguageContext';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [isDashboardActive, setIsDashboardActive] = useState<boolean>(false);
  const [rippleTrigger, setRippleTrigger] = useState<{ x: number; y: number; timestamp: number } | null>(null);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  
  // Terminal System Synchronization states
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Track currently arriving trains that user subscribed to
  const [arrivingSubscribedTrains, setArrivingSubscribedTrains] = useState<string[]>([]);

  // Scroll to absolute top immediately upon route / screen transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [isDashboardActive]);

  // Watch clocks for transit updates
  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Water droplet transition logic
  const handleTransitionTrigger = (x: number, y: number) => {
    triggerVibration([25, 15, 25]); // Dual tactile pulse on transit start
    playRippleSound();
    setRippleTrigger({ x, y, timestamp: Date.now() });
  };

  // Allow resetting kiosk manually back to screensaver
  const handleReturnToStandby = () => {
    triggerVibration([30, 15, 15]); // Pattern pulse for return
    playClickSound();
    setIsDashboardActive(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#4F252E] text-[#FFF7C5] font-sans antialiased overflow-x-hidden bg-[radial-gradient(#FFF7C5_1px,transparent_1px)] [background-size:24px_24px]">
      
      {/* ----------------------------------------------------
          WATER DROPLET TRANSITION FLOATING CANVAS
         ---------------------------------------------------- */}
      <WaterRippleCanvas
        rippleTrigger={rippleTrigger}
        onHalfway={() => setIsDashboardActive(true)}
        onComplete={() => setRippleTrigger(null)}
      />

      {/* ----------------------------------------------------
          ACTIVE PHASE SWITCHER
         ---------------------------------------------------- */}
      {!isDashboardActive ? (
        /* 1. Standby Screen screensaver mode */
        <StandbyScreen onTap={handleTransitionTrigger} />
      ) : (
        /* 2. Main High-End Station Kiosk Dashboard */
        <div 
          className={`min-h-screen w-full flex flex-col justify-between p-4 md:p-8 space-y-6 scroll-smooth select-text transition-all duration-500 ${
            arrivingSubscribedTrains.length > 0 ? 'ring-8 ring-rose-500 ring-inset outline-none animate-brutalistFlash z-50' : ''
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          
          {/* Main Editorial Header Board */}
          <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center pb-4 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[9px] sm:text-xs font-black bg-[#4F252E] text-[#FFF7C5] px-3 py-1 rounded-sm uppercase tracking-widest leading-none border-2 border-[#FFF7C5] shadow-[2px_2px_0px_#FFF7C5]">
                  {t('kioskPartner')}
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#FFF7C5] tracking-tight mt-2 uppercase leading-none">
                {t('dashboardTitle')} <span className="text-[#F4AE52]">{t('dashboardSubtitle')}</span>
              </h1>
              <p className="font-mono text-[9px] sm:text-xs text-[#FFF7C5]/70 uppercase tracking-widest leading-none mt-2 font-black">
                {t('directorySubtitle')}
              </p>
            </div>

            {/* Global parameters (clocks, actions, language toggle) */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs font-bold shrink-0">
              {/* Language Switcher Toggle */}
              <div 
                id="language-switcher-wrapper"
                className="flex items-center border-2 border-black bg-[#FFF7C5] p-0.5 shadow-[3px_3px_0px_0px_#F4AE52] shrink-0"
              >
                <button
                  id="lang-btn-id"
                  onClick={() => {
                    if (language !== 'id') {
                      triggerVibration(12);
                      playClickSound();
                      setLanguage('id');
                    }
                  }}
                  className={`px-3 py-1.5 font-mono text-xs font-black transition-all cursor-pointer ${
                    language === 'id' 
                      ? 'bg-[#4F252E] text-[#FFF7C5]' 
                      : 'text-[#4F252E] hover:bg-[#F4AE52]/40'
                  }`}
                >
                  ID
                </button>
                <div className="w-[2px] h-4 bg-black/40" />
                <button
                  id="lang-btn-en"
                  onClick={() => {
                    if (language !== 'en') {
                      triggerVibration(12);
                      playClickSound();
                      setLanguage('en');
                    }
                  }}
                  className={`px-3 py-1.5 font-mono text-xs font-black transition-all cursor-pointer ${
                    language === 'en' 
                      ? 'bg-[#4F252E] text-[#FFF7C5]' 
                      : 'text-[#4F252E] hover:bg-[#F4AE52]/40'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Real-time weather widget */}
              <WeatherWidget />

              {/* Dynamic physical clock */}
              <div className="flex items-center space-x-2 bg-[#FFF7C5] text-[#4F252E] border-2 border-black px-4 py-2.5 rounded-none shadow-[3px_3px_0px_0px_#F4AE52]">
                <Clock className="w-4 h-4 text-[#F4AE52] animate-pulse" />
                <span>
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Show Station Map trigger button */}
              <button
                id="view-station-map-btn"
                onClick={() => {
                  triggerVibration(20);
                  playClickSound();
                  setIsMapOpen(true);
                }}
                onMouseEnter={() => triggerVibration(8)}
                className="flex items-center space-x-1.5 bg-[#FFF7C5] border-2 border-black text-[#4F252E] font-black px-4 py-2.5 rounded-none hover:bg-[#F4AE52] focus:outline-none focus:ring-2 focus:ring-[#F4AE52] transition-all shadow-[3px_3px_0px_0px_#F4AE52] cursor-pointer group"
              >
                <MapPin className="w-4 h-4 text-[#F4AE52] transition-transform duration-300 group-hover:scale-110" />
                <span>{t('viewMap')}</span>
              </button>

              {/* Reset to screensaver button with cute casual terminology */}
              <button
                id="back-to-home-btn"
                onClick={handleReturnToStandby}
                onMouseEnter={() => triggerVibration(10)}
                className="flex items-center space-x-1.5 bg-[#F4AE52] border-2 border-black text-[#4F252E] font-black px-5 py-2.5 rounded-none hover:bg-[#FFF7C5] hover:text-[#4F252E] transition-all shadow-[3px_3px_0px_0px_#FFF7C5] cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-[#4F252E]" />
                <span>{t('backHome')}</span>
              </button>
            </div>
          </header>

          {/* Elegant Horizontal Scrolling Marquee Banner introducing the application features */}
          <div className="relative w-full overflow-hidden bg-[#FFF7C5] text-[#4F252E] border-2 border-black py-2.5 shadow-[4px_4px_0px_0px_#F4AE52] flex items-center select-none">
            <style>{`
              @keyframes marquee {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              .animate-marquee-text {
                display: flex;
                white-space: nowrap;
                width: max-content;
                animation: marquee 38s linear infinite;
              }
              .animate-marquee-text:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="animate-marquee-text font-mono font-black text-[10px] md:text-xs tracking-wider uppercase flex items-center space-x-8">
              {[1, 2].map((i) => (
                <span key={i} className="flex items-center space-x-8 shrink-0">
                  {language === 'id' ? (
                    <>
                      <span>✨ SELAMAT DATANG DI PERONKU DASHBOARD! KIO TRANSIT MANDIRI ANDA •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">JADWAL KEBERANGKATAN</span>
                      <span>⏱️ JADWAL REAL-TIME: PANTAU JADWAL & ESTIMASI KEDATANGAN TERUPDATE •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">DIREKTORI TIKET</span>
                      <span>🎫 PEMINDAI TIKET: CEK VALIDASI GERBONG & KURSI SECARA OTOMATIS •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">ASISTEN AI CHATBOT</span>
                      <span>🤖 CHATBOT AI PERONKU: TANYA APAPUN TENTANG OPERASIONAL STASIUN •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">KULINER ANTAR KURSI</span>
                      <span>🍱 MENU KULINER: PESAN MAKANAN RINGAN & BERAT DIANTAR LANGSUNG •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">PETA PERON 3D</span>
                      <span>🗺️ PETA INTERAKTIF: LOKASI FASILITAS, JALUR TRANSIT & PLATFORM •</span>
                    </>
                  ) : (
                    <>
                      <span>✨ RECOGNIZED WELCOME BACK TO PERONKU DASHBOARD! COZY PORTAL •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">DEPARTURE SCHEDULES</span>
                      <span>⏱️ REAL-TIME UPDATES: TRACK THE LATEST BOARDING ESTIMATIONS •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">TICKET SCANNER</span>
                      <span>🎫 QUICK BARCODE: INSTANT PLATFORM GATE & ENTRANCE ROUTING •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">KIO AI ASSISTANT</span>
                      <span>🤖 POCKET CHATBOT: ENQUIRE METROPOLIS OPERATIONAL INQUIRIES •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">SEAT CULINARY</span>
                      <span>🍱 EXQUISITE MEALS: ORDER FLAVORS CARRIED STRAIGHT TO SEATS •</span>
                      <span className="bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 text-[9px]">3D MAP GUIDE</span>
                      <span>🗺️ DIRECTORY GRAPH: DETAILED SECTOR PLOTTING & FACILITY PIN •</span>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------
              RESTRUCTURED PANEL ARRANGEMENT
              ---------------------------------------------------- */}
          <main className="flex flex-col gap-6 flex-1 my-4 w-full">
            
            {/* Arriving Subscribed Trains Alert Banner */}
            {arrivingSubscribedTrains.length > 0 && (
              <div id="arriving-alert-marquee-banner" className="w-full bg-[#FF6B6B] border-4 border-black p-4 text-[#4F252E] shadow-[4px_4px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4 animate-bounce shrink-0 select-none z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFF7C5] border-2 border-black p-2 shadow-[1.5px_1.5px_0px_#000] text-[#FF6B6B] shrink-0 animate-pulse">
                    <Volume2 className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base uppercase tracking-tight text-[#4F252E]">
                      {language === 'id' ? '🚨 PEMBERITAHUAN KERETA TIBA!' : '🚨 TRAIN ARRIVAL NOTIFICATION!'}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-[#4F252E] mt-0.5 leading-tight uppercase">
                      {language === 'id' 
                        ? `Kereta pilihan Anda: "${arrivingSubscribedTrains.map(x => x.replace('KA ', '').replace('KRL ', '')).join(', ')}" sedang MASUK PERON! Segera bersiap!`
                        : `Your subscribed train: "${arrivingSubscribedTrains.map(x => x.replace('KA ', '').replace('KRL ', '')).join(', ')}" is now ARRIVING! Prepare to board immediately!`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 text-right">
                  <button
                    onClick={() => {
                      triggerVibration([15, 10, 15]);
                      playClickSound();
                      const scheduleTab = document.getElementById('view-station-map-btn');
                      if (scheduleTab) {
                        scheduleTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="bg-[#FFF7C5] hover:bg-[#FFFBE5] text-[#4F252E] border-2 border-black font-black text-xs px-4 py-2 uppercase shadow-[2px_2px_0px_#000] cursor-pointer text-center leading-none"
                  >
                    {language === 'id' ? '🔍 LIHAT JADWAL PERON' : '🔍 CHECK TIMETABLE'}
                  </button>
                </div>
              </div>
            )}
            
            {/* 1. Atas: Fitur Jadwal Keberangkatan Full 1 Halaman Kesamping */}
            <div className="w-full">
              <LiveTimetable
                onSelectTrain={setSelectedTrain}
                selectedTrainId={selectedTrain?.id}
                onArrivingSubscribedTrainsChange={setArrivingSubscribedTrains}
              />
            </div>
            
            {/* 2. Tengah: Layout Pemindai Tiket & AI Chatbot Side-by-Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <TicketScannerHub currentTrain={selectedTrain} />
              <AiAssistant />
            </div>

            {/* 3. Paling Bawah: Full Kuliner Menyamping */}
            <div className="w-full">
              <FoodRecommendations />
            </div>

            {/* 4. Pengaduan & Layanan Fitur */}
            <div className="w-full">
              <ServiceComplaints />
            </div>

          </main>

          {/* Clean system margin warnings footer translated to Indonesian / English */}
          <footer className="border-t-2 border-[#FFF7C5]/30 pt-5 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 font-mono text-[9px] sm:text-[10px] text-[#FFF7C5]/70 uppercase font-black">
            <div className="flex items-center gap-1.5 leading-none">
              <ShieldAlert className="w-4 h-4 text-[#F4AE52]" />
              <span className="text-[#FFF7C5]/90 font-black">{t('alarmStasiun')}</span>
            </div>
            <div>
              <span>{t('standardAksesibilitas')}</span>
            </div>
          </footer>

        </div>
      )}

      {/* ----------------------------------------------------
          STATION MAP FULLSCREEN INTERACTIVE MODAL
         ---------------------------------------------------- */}
      <StationMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />

    </div>
  );
}
