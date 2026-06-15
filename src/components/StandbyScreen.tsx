import React, { useEffect, useState, useRef } from 'react';
import { 
  Train, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Smile, 
  Coffee, 
  Utensils, 
  Flame, 
  Sparkles, 
  MessageSquare, 
  Heart, 
  Accessibility, 
  ChevronDown, 
  AlertCircle 
} from 'lucide-react';
import { TrainSchedule } from '../types';
import { useLanguage } from '../LanguageContext';

interface StandbyScreenProps {
  onTap: (x: number, y: number) => void;
}

const SAMPLE_SCHEDULES: TrainSchedule[] = [
  { id: '1', trainNo: 'WHOOSH G1102', destination: 'Bandung - Tegalluar', time: '12:45', platform: '05', status: 'Arriving', type: 'Shinkansen', lineColor: '#F4AE52' },
  { id: '2', trainNo: 'KA ARGO PARAHYANGAN', destination: 'Bandung - Hall', time: '13:00', platform: '03', status: 'On Time', type: 'Rapid', lineColor: '#4F252E' },
  { id: '3', trainNo: 'KRL COMMUTER LINE', destination: 'Depok - Bogor', time: '13:05', platform: '01', status: 'On Time', type: 'Commuter', lineColor: '#C1EBE9' },
  { id: '4', trainNo: 'KA ARGO BROMO ANGGREK', destination: 'Surabaya Pasar Turi', time: '13:15', platform: '04', status: 'On Time', type: 'Shinkansen', lineColor: '#4F252E' },
  { id: '5', trainNo: 'KA TAKSAKA', destination: 'Yogyakarta Tugu', time: '13:30', platform: '02', status: 'Delayed 5m', type: 'Rapid', lineColor: '#F4AE52' },
  { id: '6', trainNo: 'KRL COMMUTER LINE', destination: 'Bekasi - Cikarang', time: '13:35', platform: '02', status: 'On Time', type: 'Commuter', lineColor: '#C1EBE9' },
];

export default function StandbyScreen({ onTap }: StandbyScreenProps) {
  const { language, t } = useLanguage();
  const [systemTime, setSystemTime] = useState(new Date());
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize clocks
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Soft Auto-Scrolling core logic disabled as requested
  useEffect(() => {
    // No-op to prevent autoscroll
  }, []);

  // Pause scrolling on manual interaction or wheel events, then resume
  const handleManualInteraction = () => {
    // No-op
  };

  const handleScroll = () => {
    // No-op
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onTap(e.clientX, e.clientY);
  };

  const renderSections = (groupSuffix: string) => {
    return (
      <React.Fragment key={groupSuffix}>
        {/* ====================================================
            SECTION 1: HERO BOARD & LIVE TRANSIT TIMETABLE
            ==================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-between p-6 md:p-12 pb-28 md:pb-28">
          
          {/* Top Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-3 border-[#4F252E] pb-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#4F252E] flex items-center justify-center text-[#FFF7C5] border-2 border-[#4F252E] shadow-[2px_2px_0px_0px_#FFF7C5]">
                <Train className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-black text-[#4F252E]/80 tracking-widest block uppercase">
                  {language === 'id' ? 'Sistem Kiosk Kemitraan Kereta Indonesia' : 'KAI Official Authorized Partner Kiosk System'}
                </span>
                <h1 className="font-display font-black text-xl md:text-2xl text-[#4F252E] tracking-tight">
                  PERONKU <span className="text-[#F4AE52]">GATEWAY</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-3 md:mt-0 font-mono text-xs text-[#4F252E]">
              <div className="flex items-center space-x-2 bg-[#FFF7C5] px-4 py-2.5 border-2 border-[#4F252E] rounded-none font-black shadow-[3px_3px_0px_0px_#4F252E]">
                <Clock className="w-4 h-4 text-[#F4AE52] animate-pulse" />
                <span>
                  {systemTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className="hidden lg:flex items-center space-x-1.5 font-extrabold bg-[#FFF7C5] px-3 py-2.5 border-2 border-[#4F252E] rounded-none shadow-[3px_3px_0px_0px_#4F252E]">
                <MapPin className="w-3.5 h-3.5 text-[#4F252E]" />
                <span>{language === 'id' ? 'LANTAI UTAMA (L3)' : 'MAIN DEPARTURE LEVEL (L3)'}</span>
              </div>
            </div>
          </div>

          {/* Main Hero Panel Grid */}
          <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 pb-4">
            
            {/* Left side info banner */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="relative bg-[#FFF7C5] p-6 sm:p-10 border-3 border-[#4F252E] rounded-none shadow-[8px_8px_0px_0px_#4F252E] hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute -top-4 right-4 bg-[#F4AE52] text-[#4F252E] text-[10px] sm:text-xs font-display font-black px-4 py-1.5 border border-black rounded-none rotate-3 shadow-[2.5px_2.5px_0px_0px_#FFF7C5]">
                  {language === 'id' ? '✨ TINGGAL TAP DI MANA SAJA!' : '✨ JUST TAP ANYWHERE!'}
                </div>

                <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#4F252E] leading-none tracking-tight">
                  {language === 'id' ? (
                    <>
                      PERJALANAN<br />
                      <span className="text-[#F4AE52] select-none" style={{ textShadow: '2.5px 2.5px 0px #4F252E' }}>
                        LEBIH NYANTAI
                      </span>
                    </>
                  ) : (
                    <>
                      YOUR COSIER<br />
                      <span className="text-[#F4AE52] select-none" style={{ textShadow: '2.5px 2.5px 0px #4F252E' }}>
                        TRAIN PORTAL
                      </span>
                    </>
                  )}
                </h2>

                <p className="mt-4 font-sans text-sm md:text-base text-[#4F252E]/90 leading-relaxed max-w-xl font-bold">
                  {language === 'id' 
                    ? 'Ketuk layar ini buat cek rute Kereta Cepat WHOOSH / KRL Commuter Line, pesan cemilan stasiun ramah kantong, scan tiket boarding, atau ngobrol seru bareng asisten AI kita, Kio.'
                    : 'Tap this board to explore WHOOSH High Speed Rail & Commuter Line paths, checkout seat-side meals, auto-validate ticket carriages, or interact with our helpful station AI assistant, Kio.'
                  }
                </p>

                <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs">
                  <div className="flex items-center space-x-2 text-[#4F252E] bg-[#FFF7C5]/50 px-3.5 py-2 rounded-none border border-[#4F252E] font-bold">
                    <Smile className="w-4 h-4 text-[#F4AE52]" />
                    <span>{language === 'id' ? 'Navigasi Gampang & Bersahabat' : 'Friendly & Accessible UI'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#4F252E] bg-[#FFF7C5]/50 px-3.5 py-2 rounded-none border border-[#4F252E] font-bold">
                    <Compass className="w-4 h-4 text-[#F4AE52]" />
                    <span>{language === 'id' ? 'Peta Gerbong & Kursi Akurat' : 'Detailed Plat & Coach Plots'}</span>
                  </div>
                </div>
              </div>

              {/* Call to action tap effect trigger instructions */}
              <div className="flex items-center space-x-4 animate-bounce mt-4 pl-2">
                <div className="w-12 h-12 border-3 border-[#4F252E] bg-[#F4AE52] flex items-center justify-center shadow-[4px_4px_0px_0px_#4F252E] rounded-none">
                  <ArrowRight className="w-6 h-6 text-[#4F252E]" />
                </div>
                <div>
                  <span className="block font-display font-black text-lg md:text-xl text-[#4F252E] tracking-tight uppercase leading-none">
                    {language === 'id' ? 'Sentuh Layar Buat Mulai' : 'TAP SCREEN TO START'}
                  </span>

                </div>
              </div>
            </div>

            {/* Right side live timelines scroll inside */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative bg-[#FFF7C5] border-3 border-[#4F252E] rounded-none p-5 shadow-[8px_8px_0px_0px_#4F252E] h-[350px] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center bg-[#4F252E] text-[#FFF7C5] py-2.5 px-4 rounded-none border border-[#4F252E] font-mono text-[10px] font-black mb-4">
                  <span>{language === 'id' ? 'JADWAL LIVE' : 'LIVE TIMETABLE'}</span>
                  <span className="text-[#F4AE52] animate-pulse">{language === 'id' ? 'MULTI-ROUTE MUTAR' : 'LOOP ROTATION'}</span>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#FFF7C5] to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FFF7C5] to-transparent z-10 pointer-events-none" />
                  
                  <div className="autoscroll-timelines-y flex flex-col space-y-2.5">
                    {[...SAMPLE_SCHEDULES, ...SAMPLE_SCHEDULES, ...SAMPLE_SCHEDULES].map((sch, index) => (
                      <div
                        key={`${sch.id}-${index}-${groupSuffix}`}
                        className="flex justify-between items-center p-3 rounded-none border-2 border-[#4F252E]/10 bg-[#FFF7C5] hover:bg-[#C1EBE9]/30 transition-colors font-bold text-[#4F252E]"
                      >
                        <div className="flex items-center space-x-3 font-bold">
                          <div
                            className="w-2.5 h-8 bg-[#4F252E]"
                            style={{ backgroundColor: sch.lineColor }}
                          />
                          <div>
                            <span className="font-mono text-[9px] text-[#4F252E]/70 block leading-none font-bold">
                              {sch.trainNo}
                            </span>
                            <span className="font-display font-extrabold text-xs text-[#4F252E]">
                              {sch.destination}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="font-mono font-black text-xs text-[#4F252E] block leading-none">
                              {sch.time}
                            </span>
                            <span className="font-mono text-[9px] text-[#F4AE52] font-bold block mt-0.5">
                              {language === 'id' ? `PERON ${sch.platform}` : `PLATFORM ${sch.platform}`}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[9px] font-extrabold uppercase px-2 py-1 rounded-lg border ${
                              sch.status.includes('Delay')
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : sch.status === 'Arriving'
                                ? 'bg-amber-100 text-[#4F252E] border-amber-300 animate-pulse'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {sch.status === 'Arriving' 
                              ? (language === 'id' ? 'Tiba' : 'Arriving') 
                              : sch.status === 'On Time' 
                              ? (language === 'id' ? 'Sesuai' : 'On Time') 
                              : (language === 'id' ? 'Telat' : 'Delayed')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section Transition Indicator */}
          <div className="flex flex-col items-center justify-center space-y-1 text-[#4F252E] opacity-90 font-bold">
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#4F252E]">
              {language === 'id' ? 'GULIR KE BAWAH UNTUK KULINER STASIUN' : 'SCROLL DOWN FOR STATION CULINARY RECS'}
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce text-[#F4AE52]" />
          </div>

        </section>

        {/* ====================================================
            SECTION 2: LUNCH BOX & Railway Culinary Showcase
            ==================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-between p-6 md:p-12 pb-24 relative bg-[#FFF7C5]/40">
          
          <div className="my-auto space-y-8 py-8 w-full max-w-6xl mx-auto">
            {/* Title Badge Block */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#4F252E] text-[#FFF7C5] px-4 py-1.5 border border-[#4F252E] rounded-none uppercase font-mono text-[10px] font-black tracking-widest leading-none shadow-[2px_2px_0px_0px_#F4AE52]">
                <Utensils className="w-3.5 h-3.5 text-[#FFF7C5]" />
                <span>{language === 'id' ? 'LAYANAN KULINER NYANTAI' : 'LEISURE CULINARY SERVICE'}</span>
              </div>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#4F252E] tracking-tight">
                {language === 'id' ? 'KULINER LEGENDARIS TERLEZAT DI PERON KITA' : 'DELICIOUS LEGENDARY BITES AT OUR PLATFORM'}
              </h2>
              <p className="font-sans text-sm md:text-base text-[#4F252E]/90 max-w-2xl mx-auto font-bold leading-normal">
                {language === 'id' 
                  ? 'Pesan hidangan otentik langsung dari layar kiosk atau ponsel-mu, dan biarkan pelayan andal kami mengantarkannya tepat ke nomor kursi-mu di kereta!'
                  : 'Order authentic regional dishes directly from the kiosk screen, and let our dedicated crew deliver them straight to your designated coach seat!'
                }
              </p>
            </div>

            {/* Delicacy Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* Culinary Item 1 */}
              <div className="bg-[#FFF7C5] border-3 border-[#4F252E] p-6 rounded-none shadow-[5px_5px_0px_0px_#4F252E] flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 rounded-none bg-[#FFF7C5] border-2 border-[#4F252E]/40 text-[#4F252E]">
                      <Coffee className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-xs font-black bg-[#4F252E] text-[#FFF7C5] px-2.5 py-1 rounded-sm border border-black shadow-[1.5px_1.5px_0px_#F4AE52]">
                      BEST SELLER
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-[#4F252E]">
                      {language === 'id' ? 'Kopi Susu Aren Meluncur' : 'Palm Sugar Milk Coffee'}
                    </h3>
                    <div className="flex items-center space-x-1 font-mono text-[10px] text-[#F4AE52] font-bold mt-1">
                      <span>★ 4.9</span>
                      <span>•</span>
                      <span>{language === 'id' ? '1.2K+ Terjual' : '1.2K+ Sold'}</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#4F252E]/90 leading-relaxed font-bold">
                    {language === 'id'
                      ? 'Racikan kopi espresso robusta super creamy dengan gula aren murni pekat, dikocok dingin segar. Sempurna menemani pemandangan sawah di jendela!'
                      : 'Robust creamy Robusta espresso blend infused with concentrated deep Palm sugar, shaken ice-cold. Perfect companion for window scenery!'
                    }
                  </p>
                </div>
                <div className="border-t border-[#4F252E]/20 pt-4 flex justify-between items-center font-bold">
                  <span className="font-mono text-sm font-black text-[#4F252E] underline">Rp 15.000</span>
                  <span className="font-mono text-[9px] bg-[#C1EBE9] text-[#4F252E] px-2 py-1 rounded border border-[#4F252E] font-extrabold uppercase">
                    {language === 'id' ? 'ANTAR KILAT' : 'EXPRESS'}
                  </span>
                </div>
              </div>

              {/* Culinary Item 2 */}
              <div className="bg-[#FFF7C5] border-3 border-[#4F252E] p-6 rounded-none shadow-[5px_5px_0px_0px_#4F252E] flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 rounded-none bg-[#FFF7C5] border-2 border-[#4F252E]/40 text-[#4F252E]">
                      <Utensils className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-xs font-black bg-[#FFF7C5] text-[#4F252E] px-2.5 py-1 rounded-sm border border-black shadow-[1.5px_1.5px_0px_#F4AE52]">
                      {language === 'id' ? 'HANGAT GURIH' : 'SOUP STYLE'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-[#4F252E]">
                      {language === 'id' ? 'Bakso Sapi Urat Jeger' : 'Tex Beef Meatball Bowl'}
                    </h3>
                    <div className="flex items-center space-x-1 font-mono text-[10px] text-[#F4AE52] font-bold mt-1">
                      <span>★ 4.8</span>
                      <span>•</span>
                      <span>{language === 'id' ? '890 Piring' : '890 Bowls'}</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#4F252E]/90 leading-relaxed font-bold">
                    {language === 'id'
                      ? 'Urat sapi pilihan bertekstur kasar kenyal dalam mangkok kaldu sumsum bening gurih melimpah. Disajikan lengkap dengan bihun kemiri, seledri segar & sambal lombok ijo.'
                      : 'Hefty, fibrous beef tendon meatball in a clear, nutrient-rich bone marrow broth. Finished with rice noodles, green celery paths, and home chili crush.'
                    }
                  </p>
                </div>
                <div className="border-t border-[#4F252E]/20 pt-4 flex justify-between items-center font-bold">
                  <span className="font-mono text-sm font-black text-[#4F252E] underline">Rp 28.000</span>
                  <span className="font-mono text-[9px] bg-[#C1EBE9] text-[#4F252E] px-2 py-1 rounded border border-[#4F252E] font-extrabold uppercase">
                    {language === 'id' ? 'SIAP SAJI' : 'HEAT & SERVE'}
                  </span>
                </div>
              </div>

              {/* Culinary Item 3 */}
              <div className="bg-[#FFF7C5] border-3 border-[#4F252E] p-6 rounded-none shadow-[5px_5px_0px_0px_#4F252E] flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="p-2.5 rounded-none bg-[#FFF7C5] border-2 border-[#4F252E]/40 text-[#4F252E]">
                      <Flame className="w-5 h-5" />
                    </span>
                    <span className="font-mono text-xs font-black bg-[#F4AE52] text-[#4F252E] px-2.5 py-1 rounded-sm border border-[#4F252E] shadow-[1.5px_1.5px_0px_#FFF7C5]">
                      {language === 'id' ? 'KHAS LOKAL' : 'LOCAL ESSENCE'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xl text-[#4F252E]">
                      {language === 'id' ? 'Lumpia Basah Peron' : 'Sautéed Jicama Rolled Crepe'}
                    </h3>
                    <div className="flex items-center space-x-1 font-mono text-[10px] text-[#F4AE52] font-bold mt-1">
                      <span>★ 4.9</span>
                      <span>•</span>
                      <span>{language === 'id' ? '600+ Porsi' : '600+ Plates'}</span>
                    </div>
                  </div>
                  <p className="font-sans text-xs text-[#4F252E]/90 leading-relaxed font-bold">
                    {language === 'id'
                      ? 'Camilan manis khas pinggiran peron. Tumisan wortel bengkoang dibalut orak-arik telur gurih manis dan lumatan tauco kental manis di kulit lumpia basah super lembut.'
                      : 'Platform snack memory. Soft crepe layered with sweet bean paste and overflowing with dynamically wok-fried seasoned sweet jicama egg crumble.'
                    }
                  </p>
                </div>
                <div className="border-t border-[#4F252E]/20 pt-4 flex justify-between items-center font-bold">
                  <span className="font-mono text-sm font-black text-[#4F252E] underline">Rp 12.000</span>
                  <span className="font-mono text-[9px] bg-[#C1EBE9] text-[#4F252E] px-2 py-1 rounded border border-[#4F252E] font-extrabold uppercase font-black">
                    {language === 'id' ? 'TERLALU ENAK' : 'SAVORY'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section Transition Indicator */}
          <div className="flex flex-col items-center justify-center space-y-1 text-[#4F252E] opacity-90 font-bold">
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#4F252E]">
              {language === 'id' ? 'GULIR KE BAWAH UNTUK ASISTEN CHAT KIO AI' : 'SCROLL DOWN FOR KIO AI ASSISTANT'}
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce text-[#F4AE52]" />
          </div>

        </section>

        {/* ====================================================
            SECTION 3: MEET KIO AI TRAVEL ASSISTANT SHOWCASE
            ==================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-between p-6 md:p-12 pb-24 relative bg-[#FFF7C5]/20">
          
          <div className="my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full max-w-6xl mx-auto py-8">
            
            {/* Left promo box text */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 bg-[#4F252E] text-[#FFF7C5] px-4 py-1.5 border border-[#4F252E] rounded-none uppercase font-mono text-[10px] font-black tracking-widest leading-none shadow-[2px_2px_0px_0px_#F4AE52]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>PANDUAN INTERAKTIF</span>
              </div>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#4F252E] leading-tight tracking-tight">
                ASISTEN PERJALANAN PINTAR KIO AI
              </h2>
              <p className="font-sans text-sm md:text-base text-[#4F252E]/90 font-bold leading-relaxed">
                Bingung letak pintu gerbong kereta mu? Buduh rekomendasi tempat beli oleh-oleh khas dekat stasiun tujuan, atau ingin tahu di mana letak mushola terdekat stasiun?
              </p>
              <p className="font-sans text-sm md:text-base text-[#4F252E]/70 font-medium leading-relaxed">
                Tanyakan apa saja kepada <b>Kio AI</b>. Menggunakan tutur bahasa santai, kasual, ramah, dan sangat lokal, Kio siap menuntun perjalananmu tanpa tegang!
              </p>
              
              <div className="flex items-center gap-4 bg-[#FFF7C5] p-4 rounded-none border-2 border-[#4F252E] shadow-[4px_4px_0px_0px_#4F252E] max-w-md">
                <Sparkles className="w-8 h-8 text-[#F4AE52] shrink-0" />
                <p className="font-mono text-xs text-[#4F252E] leading-normal font-black">
                  DIDUKUNG MODEL GEMINI TERBARU UNTUK JAWABAN AKURAT JADWAL DAN GERBONG SECARA INSTAN!
                </p>
              </div>
            </div>

            {/* Right mock smartphone chat panel */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-[380px] bg-[#FFF7C5] border-4 border-[#4F252E] rounded-none shadow-[8px_8px_0px_0px_#4F252E] overflow-hidden flex flex-col h-[460px]">
                
                {/* Simulated Phone Ear Notch & Header */}
                <div className="bg-[#4F252E] text-[#FFF7C5] p-3 text-center flex flex-col items-center relative border-b-2 border-[#4F252E]">
                  <div className="w-20 h-4 bg-[#4F252E] absolute top-0 border-x border-b border-[#4F252E] rounded-none" />
                  <span className="font-display font-black text-sm uppercase tracking-wider mt-1 flex items-center gap-1.5 justify-center">
                    🤖 CHATBOT NYANTAI
                  </span>
                  <span className="font-mono text-[8px] text-[#F4AE52] tracking-widest font-bold">KIO SYSTEM IN ACTION</span>
                </div>

                {/* Styled Conversation Streams */}
                <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-[#FFF7C5]/40 no-scrollbar flex flex-col justify-end">
                  
                  {/* User bubble */}
                  <div className="self-end max-w-[85%] space-y-0.5">
                    <span className="font-mono text-[8px] text-[#4F252E]/60 block text-right font-black">PENUMPANG • LIVE</span>
                    <div className="bg-[#C1EBE9] text-[#4F252E] border border-[#4F252E] px-3.5 py-2.5 rounded-none shadow-[2.5px_2.5px_0px_0px_#4F252E]/30">
                      <p className="text-xs font-sans font-bold leading-normal">
                        Kio, kereta cepat saya berangkat jam 12:45. Di mana gate boardingnya ya dan posisi toilet terdekat dari situ?
                      </p>
                    </div>
                  </div>

                  {/* Kio AI reply */}
                  <div className="self-start max-w-[85%] space-y-0.5">
                    <span className="font-mono text-[8px] text-[#4F252E]/70 block font-black">🤖 ASISTEN_KIO</span>
                    <div className="bg-[#FFF7C5] text-[#4F252E] border-2 border-[#4F252E] px-3.5 py-2.5 rounded-none shadow-[2.5px_2.5px_0px_0px_#F4AE52]">
                      <p className="text-xs font-sans font-bold leading-relaxed text-[#4F252E]/90">
                        Halo Kak! Kereta WHOOSH keberangkatan 12:45 bakal buka boarding di <b>Gate 5</b> tepat di lantai 3 sebelah timur. Nah, persis di pojok kanan Gate 5 itu ada toilet stasiun yang bersih ber-AC dan adem banget. Kakak tinggal jalan santai 1-2 menit aja dari posisi Kios ini ya! 😊 Train no. kakak WHOOSH G1102.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Simulated Chat Input bar */}
                <div className="p-3 bg-[#4F252E] flex items-center gap-2 border-t border-[#4F252E]">
                  <div className="flex-1 bg-[#FFF7C5] border border-[#4F252E]/40 rounded-none px-3 py-1.5 font-sans text-[10px] text-[#4F252E]/60 font-bold">
                    Tanya rute, kuliner, peron...
                  </div>
                  <div className="w-7 h-7 rounded-sm bg-[#F4AE52] border border-[#4F252E] flex items-center justify-center font-display font-black text-xs text-[#4F252E] cursor-pointer shadow-[1px_1px_0px_#FFF7C5]">
                    ➔
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Section Transition Indicator */}
          <div className="flex flex-col items-center justify-center space-y-1 text-[#4F252E] opacity-90 font-bold">
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#4F252E]">
              GULIR KE BAWAH UNTUK LAYANAN AKSESIBILITAS STASIUN
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce text-[#F4AE52]" />
          </div>

        </section>

        {/* ====================================================
            SECTION 4: ACCESSIBILITY & STASIUN SECURITY SERVICES
            ==================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-between p-6 md:p-12 pb-32 relative bg-[#FFF7C5]/10">
          
          <div className="my-auto space-y-8 py-8 w-full max-w-6xl mx-auto">
            
            {/* Title Section */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#4F252E] text-[#FFF7C5] px-4 py-1.5 border border-[#4F252E] rounded-none uppercase font-mono text-[10px] font-black tracking-widest leading-none shadow-[2px_2px_0px_0px_#F4AE52]">
                <Accessibility className="w-3.5 h-3.5 text-[#FFF7C5]" />
                <span>AKSESIBILITAS RAMAH DISABILITAS</span>
              </div>
              <h2 className="font-display font-black text-3xl md:text-5xl text-[#4F252E] tracking-tight">
                KEMUDAHAN PERJALANAN BAGI SEMUA PENUMPANG
              </h2>
              <p className="font-sans text-sm md:text-base text-[#4F252E]/90 max-w-2xl mx-auto font-bold leading-normal">
                Stasiun Metropolis sangat menjunjung tinggi kenyamanan seluruh kalangan penumpang. Layanan penunjang fisik, medis, dan kenyamanan keluarga siap diakses gratis tanpa biaya sepeser pun.
              </p>
            </div>

            {/* Accessibility Grid lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              
              {/* Assistance Card 1 */}
              <div className="bg-[#FFF7C5] border-3 border-[#4F252E] p-6 rounded-none shadow-[5px_5px_0px_0px_#4F252E] space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-10 h-10 rounded-none bg-[#FFF7C5] border-2 border-[#4F252E]/20 flex items-center justify-center text-[#4F252E] shadow-[2px_2px_0px_0px_#F4AE52]">
                  <Accessibility className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-lg text-[#4F252E]">Pendampingan & Kursi Roda Gratis</h3>
                <p className="font-sans text-xs text-[#4F252E]/90 leading-relaxed font-bold">
                  Butuh bantuan navigasi kursi roda, penumpangan disabilitas, atau bantuan membawa barang berat? Hubungi petugas stasiun di lobi utama atau peron, pelayanan ramah siap hadir 24 jam penuh mendampingi hingga pintu gerbong Anda aman.
                </p>
              </div>

              {/* Assistance Card 2 */}
              <div className="bg-[#FFF7C5] border-3 border-[#4F252E] p-6 rounded-none shadow-[5px_5px_0px_0px_#4F252E] space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-10 h-10 rounded-none bg-[#FFF7C5] border-2 border-[#4F252E]/20 flex items-center justify-center text-rose-500 shadow-[2px_2px_0px_0px_#F4AE52]">
                  <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
                <h3 className="font-display font-black text-lg text-[#4F252E]">Pos Medis Darurat Siaga (SOS)</h3>
                <p className="font-sans text-xs text-[#4F252E]/90 leading-relaxed font-bold">
                  Merasa pusing, mual, atau mengalami gangguan kesehatan mendadak saat di area stasiun? Tim medis berpengalaman beserta ambulans darurat standby penuh di ruang PPPK sayap utara stasiun peron 2. Silakan akses secara gratis dan komprehensif.
                </p>
              </div>

              {/* Assistance Card 3 */}
              <div className="bg-[#FFF7C5] border-3 border-[#4F252E] p-6 rounded-none shadow-[5px_5px_0px_0px_#4F252E] space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-10 h-10 rounded-none bg-[#FFF7C5] border-2 border-[#4F252E]/20 flex items-center justify-center text-pink-500 shadow-[2px_2px_0px_0px_#F4AE52]">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <h3 className="font-display font-black text-lg text-[#4F252E]">Kamar Laktasi Higienis & Anak</h3>
                <p className="font-sans text-xs text-[#4F252E]/90 leading-relaxed font-bold">
                  Tersedia ruang menyusui/laktasi ber-AC dengan sofa empuk, kulkas penyimpan ASI, wastafel steril, dan tempat bermain mini ramah anak tepat di sebelah Gate Boarding utama peron 1. Menjaga privasi bunda dan ketenangan putra-putri tercinta.
                </p>
              </div>

            </div>

            {/* Ending welcome slogan */}
            <div className="bg-[#FFF7C5] p-5 rounded-none border-3 border-[#4F252E]/30 text-center max-w-2xl mx-auto shadow-[4px_4px_0px_0px_#4F252E] hover:scale-[1.01] transition-all duration-300">
              <span className="font-display font-black text-lg text-[#4F252E] uppercase">
                🤝 KETUK DI MANA BUMI ANDA PIJAK UNTUK MEMULAI AKTIVITAS PINTAR DASBOR KAMI!
              </span>
            </div>

          </div>

          <div className="h-6" /> {/* Spacer */}

        </section>
      </React.Fragment>
    );
  };

  return (
    <div
      id="standby-outer-wrapper"
      onClick={handleScreenClick}
      className="relative w-full h-screen bg-[#C1EBE9] overflow-hidden select-none cursor-pointer flex flex-col transition-all duration-300"
    >
      {/* Background Ambient Ornamen Geometris */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-0">
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-[#F4AE52]" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full bg-[#4F252E] blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[350px] h-[350px] rounded-3xl bg-[#F4AE52] rotate-45" />
      </div>

      {/* FIXED HELPER FLATING OVERLAY BADGE */}
      <div className="absolute bottom-20 right-6 z-40 bg-[#4F252E] text-[#FFF7C5] font-display font-black text-xs md:text-sm px-6 py-3 border-2 border-[#4F252E] rounded-none shadow-[4px_4px_0px_0px_#FFF7C5] animate-bounce flex items-center gap-2.5">
        <Smile className="w-5 h-5 text-[#FFF7C5]" />
        <span>{t('touchAnywhereAlert')}</span>
      </div>

      {/* ----------------------------------------------------
          MAIN AUTO-SCROLLING VERTICAL SECTIONS CANVAS (ENDLESS LOOP)
          ---------------------------------------------------- */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onWheel={handleManualInteraction}
        onTouchStart={handleManualInteraction}
        className="flex-1 w-full overflow-y-auto no-scrollbar scroll-smooth relative z-10"
      >
        {renderSections("group1")}
      </div>

      {/* ====================================================
          PINNED BOTTOM MARQUEE STATUS METROPOLIS BANNER
          ==================================================== */}
      <div className="absolute bottom-0 inset-x-0 bg-[#4F252E] py-4 overflow-hidden border-t-2 border-[#4F252E] z-20">
        <div className="whitespace-nowrap flex autoscroll-banner-x font-display text-base md:text-lg font-black tracking-wider text-[#FFF7C5]">
          <span className="mx-6 flex items-center gap-2">
            <Train className="w-5 h-5 text-[#F4AE52]" />
            KERETA CEPAT WHOOSH BERIKUTNYA KE TEGALLUAR SEGERA TIBA DI PERON 5 • SELURUH NOTIFIKASI CUACA BANDUNG & JAKARTA TERPANTAU CERAH BERAWAN
          </span>
          <span className="mx-6 flex items-center gap-2">
            • POS MEDIS & KOORDINAT AMAN DARURAT LAYANAN RAMAH DISABILITAS SIAGA SEPENUHNYA DI SAYAP UTARA PERON LOBBY UTAMA
          </span>
          <span className="mx-6 flex items-center gap-2">
            <Train className="w-5 h-5 text-[#F4AE52]" />
            KA ARGO PARAHYANGAN SIAP BOARDING DI JALUR 3 UNTUK PERJALANAN NYANTAI • SCAN BARCODE TIKET-MU DI SISI KANAN SEKARANG JUGA
          </span>
          
          {/* Infinite loop copy */}
          <span className="mx-6 flex items-center gap-2">
            <Train className="w-5 h-5 text-[#F4AE52]" />
            KERETA CEPAT WHOOSH BERIKUTNYA KE TEGALLUAR SEGERA TIBA DI PERON 5 • SELURUH NOTIFIKASI CUACA BANDUNG & JAKARTA TERPANTAU CERAH BERAWAN
          </span>
          <span className="mx-6 flex items-center gap-2">
            • POS MEDIS & KOORDINAT AMAN DARURAT LAYANAN RAMAH DISABILITAS SIAGA SEPENUHNYA DI SAYAP UTARA PERON LOBBY UTAMA
          </span>
        </div>
      </div>

    </div>
  );
}
