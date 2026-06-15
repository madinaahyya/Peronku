import React, { useState, useEffect } from 'react';
import { Train, RefreshCw, Filter, Shield, AlertCircle, ArrowRight, Bell, BellRing } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrainSchedule } from '../types';
import { triggerVibration, playClickSound } from '../utils';
import { useLanguage } from '../LanguageContext';

// Stable deterministic carriage occupancy generator for Neo-Brutalist details
function getCarriageData(trainNo: string) {
  let sum = 0;
  for (let i = 0; i < trainNo.length; i++) {
    sum += trainNo.charCodeAt(i);
  }
  
  const coaches = [];
  for (let c = 1; c <= 5; c++) {
    const seedValue = (sum * c + c * 23) % 85; 
    const occupancyPercent = Math.max(12, seedValue + 10);
    
    let statusClass = "bg-[#4ECDC4]"; // Relaxed / Green-Blue
    let statusId = "Sangat Lengang";
    let statusEn = "Relaxed";
    
    if (occupancyPercent > 72) {
      statusClass = "bg-[#FF6B6B]"; // Crowded / Red
      statusId = "Padat";
      statusEn = "Crowded";
    } else if (occupancyPercent > 42) {
      statusClass = "bg-[#F4AE52]"; // Moderate / Orange-Yellow
      statusId = "Sedang";
      statusEn = "Moderate";
    }

    coaches.push({
      num: c,
      occupancy: occupancyPercent,
      statusClass,
      statusId,
      statusEn
    });
  }
  return coaches;
}

interface LiveTimetableProps {
  onSelectTrain: (train: TrainSchedule) => void;
  selectedTrainId?: string;
  onArrivingSubscribedTrainsChange?: (arrivingTrainNames: string[]) => void;
}

interface ComulineStation {
  id: string;
  name: string;
}

// Static fallback stations
const FALLBACK_STATIONS: ComulineStation[] = [
  { id: "MRI", name: "Manggarai (Transit Pusat)" },
  { id: "SUD", name: "Sudirman (Sudirman Jkt)" },
  { id: "THB", name: "Tanah Abang (Transit Barat)" },
  { id: "JAKK", name: "Jakarta Kota" },
  { id: "BOO", name: "Bogor" },
  { id: "DPK", name: "Depok Baru" },
  { id: "BKS", name: "Bekasi" },
  { id: "PSE", name: "Pasar Senen" },
  { id: "HLM", name: "Halim (Stasiun WHOOSH)" }
];

// Offline client-side realistic schedules generator matching back-end
function generateClientSchedules(stationId: string): TrainSchedule[] {
  let currentHour = 12;
  let currentMinute = 30;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const parts = formatter.format(new Date()).split(':');
    currentHour = parseInt(parts[0]) || 0;
    currentMinute = parseInt(parts[1]) || 0;
  } catch (error) {
    const now = new Date();
    currentHour = now.getHours();
    currentMinute = now.getMinutes();
  }

  const generatedList: TrainSchedule[] = [];
  let destinations: { dest: string; trainName: string; line: 'Bogor' | 'Cikarang' | 'Rangkas' | 'TanjungPriok' | 'Whoosh' | 'Argo' }[] = [];

  const normId = stationId.toUpperCase();
  if (normId === "MRI" || normId === "MANGGARAI") {
    destinations = [
      { dest: "Bogor", trainName: "KRL Commuter Line Bogor", line: "Bogor" },
      { dest: "Jakarta Kota", trainName: "KRL Commuter Line Kota", line: "Bogor" },
      { dest: "Bekasi", trainName: "KRL Commuter Line Bekasi", line: "Cikarang" },
      { dest: "Cikarang", trainName: "KRL Commuter Line Cikarang", line: "Cikarang" },
      { dest: "Depok", trainName: "KRL Commuter Line Depok", line: "Bogor" },
      { dest: "Nambo", trainName: "KRL Commuter Line Nambo", line: "Bogor" },
    ];
  } else if (normId === "SUD" || normId === "SUDIRMAN") {
    destinations = [
      { dest: "Manggarai", trainName: "KRL Commuter Line Loop", line: "Cikarang" },
      { dest: "Bogor", trainName: "KRL Commuter Line Bogor", line: "Bogor" },
      { dest: "Cikarang", trainName: "KRL Commuter Line Cikarang", line: "Cikarang" },
      { dest: "Jakarta Kota", trainName: "KRL Commuter Line Kota", line: "Bogor" },
      { dest: "Angke", trainName: "KRL Commuter Line Angke", line: "Cikarang" },
    ];
  } else if (normId === "THB" || normId === "TANAH ABANG" || normId === "TANAHABANG") {
    destinations = [
      { dest: "Rangkasbitung", trainName: "KRL Commuter Line Rangkas", line: "Rangkas" },
      { dest: "Parung Panjang", trainName: "KRL Commuter Serpong", line: "Rangkas" },
      { dest: "Serpong", trainName: "KRL Commuter Serpong", line: "Rangkas" },
      { dest: "Tiga Raksa", trainName: "KRL Commuter Rangkas", line: "Rangkas" },
    ];
  } else if (normId === "HLM" || normId === "HALIM") {
    destinations = [
      { dest: "Bandung Tegalluar", trainName: "WHOOSH Bullet Train G1102", line: "Whoosh" },
      { dest: "Padalarang", trainName: "WHOOSH Express G1120", line: "Whoosh" },
    ];
  } else {
    destinations = [
      { dest: "Jakarta Kota", trainName: "KRL Commuter Line Kota", line: "Bogor" },
      { dest: "Bogor", trainName: "KRL Commuter Line Bogor", line: "Bogor" },
      { dest: "Bekasi", trainName: "KRL Commuter Line Bekasi", line: "Cikarang" },
      { dest: "Cikarang", trainName: "KRL Commuter Line Cikarang", line: "Cikarang" },
      { dest: "Solo Balapan", trainName: "KA Lodaya Eksekutif", line: "Argo" },
      { dest: "Bandung - Hall", trainName: "KA Argo Parahyangan", line: "Argo" }
    ];
  }

  for (let i = 0; i < 8; i++) {
    const totalMinutes = currentHour * 60 + currentMinute + (i * 12) + (i % 3);
    const trainHour = Math.floor(totalMinutes / 60) % 24;
    const trainMinute = totalMinutes % 60;
    const timeStr = `${String(trainHour).padStart(2, '0')}:${String(trainMinute).padStart(2, '0')}`;

    const info = destinations[i % destinations.length];
    
    let platform = "01";
    if (info.line === "Bogor") platform = (i % 2 === 0) ? "01" : "02";
    else if (info.line === "Cikarang") platform = (i % 2 === 0) ? "03" : "04";
    else if (info.line === "Rangkas") platform = (i % 2 === 0) ? "05" : "06";
    else if (info.line === "Whoosh") platform = "05";
    else platform = String((i % 4) + 1).padStart(2, '0');

    let status: TrainSchedule['status'] = "On Time";
    if (i === 0) status = "Arriving";
    else if (i === 1) status = "Boarding";
    else if (i % 5 === 0) status = "Delayed 5m";

    generatedList.push({
      id: `${stationId}-${i}-${timeStr}`,
      trainNo: info.trainName,
      destination: info.dest,
      time: timeStr,
      platform: platform,
      status: status,
      type: info.line === "Whoosh" ? "Shinkansen" : info.line === "Argo" ? "Rapid" : "Commuter",
      lineColor: info.line === "Whoosh" ? "#F4AE52" : info.line === "Bogor" ? "#C1EBE9" : "#4F252E"
    });
  }

  return generatedList;
}

export default function LiveTimetable({ onSelectTrain, selectedTrainId, onArrivingSubscribedTrainsChange }: LiveTimetableProps) {
  const { language, t } = useLanguage();
  const [stations, setStations] = useState<ComulineStation[]>(FALLBACK_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>("MRI");
  const [schedules, setSchedules] = useState<TrainSchedule[]>(() => generateClientSchedules("MRI"));
  const [activeFilter, setActiveFilter] = useState<'All' | 'Shinkansen' | 'Rapid' | 'Commuter'>('All');
  const [isLoading, setIsLoading] = useState(false);

  // Subscribed train registrations states
  const [notifiedTrainNos, setNotifiedTrainNos] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kio_notified_train_nos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track subscription changes & persist selection database
  useEffect(() => {
    localStorage.setItem('kio_notified_train_nos', JSON.stringify(notifiedTrainNos));
  }, [notifiedTrainNos]);

  // Toggle registration handler
  const toggleNotification = (trainNo: string) => {
    if (notifiedTrainNos.includes(trainNo)) {
      setNotifiedTrainNos(prev => prev.filter(x => x !== trainNo));
    } else {
      setNotifiedTrainNos(prev => [...prev, trainNo]);
    }
  };

  // Evaluate currently arriving subscribed trains and bubble them back to the active dashboard parent
  useEffect(() => {
    if (onArrivingSubscribedTrainsChange) {
      const arrivingSubscribed = schedules
        .filter(sch => sch.status === 'Arriving' && notifiedTrainNos.includes(sch.trainNo))
        .map(sch => sch.trainNo);
      onArrivingSubscribedTrainsChange(arrivingSubscribed);
    }
  }, [schedules, notifiedTrainNos, onArrivingSubscribedTrainsChange]);

  // Periodic background refresh for simulated live update transitions
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSchedules(selectedStationId);
    }, 15000); // refresh schedule every 15 seconds
    return () => clearInterval(interval);
  }, [selectedStationId]);

  // Fetch Comuline Station List on mount
  useEffect(() => {
    let active = true;
    async function loadStations() {
      try {
        const res = await fetch("/api/comuline/stations");
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data)) {
            setStations(data);
            if (data.length > 0) {
              const hasMri = data.some((s: any) => s.id === "MRI");
              setSelectedStationId(hasMri ? "MRI" : data[0].id);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load comuline stations from server proxy:", e);
      }
    }
    loadStations();
    return () => {
      active = false;
    };
  }, []);

  // Fetch schedules whenever selectedStationId changes
  const fetchSchedules = async (stationId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comuline/schedule?id=${stationId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setSchedules(data);
        } else {
          setSchedules(generateClientSchedules(stationId));
        }
      } else {
        setSchedules(generateClientSchedules(stationId));
      }
    } catch (e) {
      console.error("Failed to fetch schedules from proxy, falling back to local generated data:", e);
      setSchedules(generateClientSchedules(stationId));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(selectedStationId);
  }, [selectedStationId]);

  const filteredSchedules = schedules.filter(sch => {
    if (activeFilter === 'All') return true;
    return sch.type === activeFilter;
  });

  const currentStationName = stations.find(s => s.id === selectedStationId)?.name || selectedStationId;

  return (
    <div 
      onMouseEnter={() => triggerVibration(5)}
      className="bg-[#FFF7C5] border-3 border-[#4F252E] rounded-none p-6 md:p-8 shadow-[6px_6px_0px_0px_#C1EBE9] flex flex-col h-auto text-[#4F252E] transition-all duration-300 hover:scale-[1.01] hover:-translate-y-2 hover:shadow-[14px_14px_0px_0px_#C1EBE9] hover:bg-[#FFFBE5] hover:z-10"
    >
      
      {/* Table Header Controls with Station Select Menu */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b-2 border-[#4F252E]/20 pb-5 mb-4 gap-4 shrink-0">
        <div>
          <h3 className="font-display font-black text-2xl md:text-3xl text-[#4F252E] tracking-tight flex items-center gap-2.5">
            <Train className="w-8 h-8 text-[#F4AE52]" />
            {t('timetableTitle')}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Station Selection Dropdown */}
          <div className="flex flex-col min-w-[200px] flex-1 sm:flex-initial">
            <span className="font-mono text-[9px] font-black text-[#4F252E]/85 mb-1 uppercase tracking-widest">
              {t('activeStation')}
            </span>
            <select
              value={selectedStationId}
              onChange={(e) => {
                triggerVibration(10);
                playClickSound();
                setSelectedStationId(e.target.value);
              }}
              className="bg-white border-2 border-[#4F252E] px-3 py-1.5 font-mono text-xs font-black text-[#4F252E] rounded-none outline-none focus:ring-2 focus:ring-[#F4AE52] cursor-pointer shadow-[2px_2px_0px_#4F252E] uppercase"
            >
              {stations.length > 0 ? (
                stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.id})
                  </option>
                ))
              ) : (
                <option value="MRI">Manggarai (MRI)</option>
              )}
            </select>
          </div>

          {/* Connection re-sync */}
          <button
            onClick={() => {
              triggerVibration([20, 15, 20]);
              playClickSound();
              fetchSchedules(selectedStationId);
            }}
            onMouseEnter={() => triggerVibration(8)}
            disabled={isLoading}
            className="flex items-center justify-center space-x-1.5 px-4 h-[36px] mt-[16px] font-mono text-xs font-black text-[#4F252E] bg-[#F4AE52] border-2 border-[#4F252E] rounded-none hover:bg-[#C1EBE9] hover:text-[#4F252E] transition-all shadow-[2px_2px_0px_0px_#4F252E] cursor-pointer btn-tap-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#4F252E]' : 'text-[#4F252E]'}`} />
            <span>{isLoading ? t('loading') : t('sync')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs - Casual styled pill tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 shrink-0 no-scrollbar">
        {(['All', 'Shinkansen', 'Rapid', 'Commuter'] as const).map(tab => {
          const labelMap: Record<string, string> = {
            'All': t('allTrains'),
            'Shinkansen': t('whooshExpress'),
            'Rapid': t('argoIntercity'),
            'Commuter': t('krlCommuter')
          };
          return (
            <button
              key={tab}
              onClick={() => {
                triggerVibration(15);
                playClickSound();
                setActiveFilter(tab);
              }}
              onMouseEnter={() => triggerVibration(6)}
              className={`font-mono text-[10px] sm:text-xs font-black px-4 py-2.5 border-2 rounded-none transition-all leading-none cursor-pointer ${
                activeFilter === tab
                  ? 'bg-[#4F252E] text-[#FFF7C5] border-[#4F252E] shadow-[2px_2px_0px_0px_#F4AE52]'
                  : 'bg-white/60 text-[#4F252E]/80 border-[#4F252E]/25 hover:border-[#4F252E]'
              }`}
            >
              {labelMap[tab]}
            </button>
          );
        })}
      </div>

      {/* Table grid headings - simplified and cozy */}
      <div className="grid grid-cols-12 px-4 py-4 bg-[#4F252E] text-white border border-[#4F252E] rounded-none font-mono text-sm sm:text-base font-black tracking-wider shrink-0 uppercase mb-3">
        <div className="col-span-2 sm:col-span-2 text-white">{language === 'id' ? 'JAM' : 'TIME'}</div>
        <div className="col-span-4 sm:col-span-3 text-white">{language === 'id' ? 'KOTA TUJUAN' : 'DESTINATION'}</div>
        <div className="col-span-3 sm:col-span-3 text-white">{language === 'id' ? 'NAMA KERETA' : 'TRAIN NAME'}</div>
        <div className="col-span-1 text-center font-black text-white">{language === 'id' ? 'JALUR' : 'TRACK'}</div>
        <div className="hidden sm:block sm:col-span-1 text-right text-white">{language === 'id' ? 'KELAS' : 'CLASS'}</div>
        <div className="col-span-2 sm:col-span-2 text-right text-white">{language === 'id' ? 'METRIK' : 'STATUS'}</div>
      </div>

      {/* Timetable Rows in cozy rounded style */}
      <div className="rounded-none border-2 border-[#4F252E]/15 bg-white/45 divide-y divide-[#4F252E]/10">
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map(sch => {
            const isSelected = selectedTrainId === sch.id;
            const isDelayed = sch.status.includes('Delay');
            const isActiveState = sch.status === 'Arriving' || sch.status === 'Boarding';

            // Friendly translation values for statuses
            let displayStatus = sch.status;
            if (sch.status === 'On Time') displayStatus = language === 'id' ? 'Sesuai Jadwal' : 'On Time';
            else if (sch.status === 'Arriving') displayStatus = language === 'id' ? 'Masuk Peron' : 'Arriving';
            else if (sch.status === 'Boarding') displayStatus = language === 'id' ? 'Pintu Dibuka' : 'Boarding';
            else if (sch.status === 'Departed') displayStatus = language === 'id' ? 'Berangkat' : 'Departed';
            else if (sch.status.toLowerCase().includes('delay')) {
              displayStatus = language === 'id'
                ? sch.status.replace(/delayed?/i, 'Telat').replace('m', ' Mnt')
                : sch.status;
            }

            let typeLabel = sch.type;
            if (sch.type === 'Shinkansen') typeLabel = language === 'id' ? 'Cepat' : 'Bullet';
            else if (sch.type === 'Rapid') typeLabel = language === 'id' ? 'Intercity' : 'Intercity';

            const coaches = getCarriageData(sch.trainNo);

            return (
              <div key={sch.id} className="relative flex flex-col">
                <div
                  onClick={() => {
                    triggerVibration(15);
                    playClickSound();
                    onSelectTrain(sch);
                  }}
                  onMouseEnter={() => triggerVibration(5)}
                  className={`grid grid-cols-12 items-center px-4 py-5 font-mono text-base cursor-pointer transition-all duration-200 brutalist-row ${
                    isSelected
                      ? 'bg-[#C1EBE9] border-l-8 border-l-[#4F252E] font-black text-[#4F252E] animate-pulseAccent shadow-[4px_4px_0px_0px_#4F252E]'
                      : 'hover:bg-[#C1EBE9]/40 border-l-8 border-l-transparent text-[#4F252E]'
                  }`}
                >
                  {/* Time */}
                  <div className="col-span-2 sm:col-span-2 font-black text-lg sm:text-2xl text-[#4F252E]">
                    {sch.time}
                  </div>

                  {/* Destination */}
                  <div className="col-span-4 sm:col-span-3 font-display font-black text-sm sm:text-lg text-[#4F252E] truncate pr-2">
                    {sch.destination}
                  </div>

                  {/* Train Code / Name */}
                  <div className="col-span-3 sm:col-span-3 text-[#4F252E]/85 overflow-hidden text-ellipsis font-black text-xs sm:text-sm uppercase">
                    {sch.trainNo.replace('KA ', '').replace('KRL ', '')}
                  </div>

                  {/* Platform */}
                  <div className="col-span-1 sm:col-span-1 text-center font-black text-lg sm:text-3xl text-[#4F252E]">
                    {sch.platform}
                  </div>

                  {/* Type */}
                  <div className="hidden sm:block sm:col-span-1 text-right font-mono text-xs sm:text-sm text-[#4F252E]/70 uppercase font-bold">
                    {typeLabel}
                  </div>

                  {/* Status Indicator & Custom Notify Me Toggle */}
                  <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-2 font-black">
                    <span
                      className={`inline-block font-mono text-[10px] sm:text-xs font-black uppercase px-2 py-1.5 rounded-none border leading-none ${
                        isDelayed
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isActiveState
                          ? 'bg-[#F4AE52] text-[#4F252E] border-[#4F252E] animate-pulse shadow-[1px_1px_0px_#4F252E]'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {displayStatus}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid triggering row selection click
                        triggerVibration([15, 10, 15]);
                        playClickSound();
                        toggleNotification(sch.trainNo);
                      }}
                      title={notifiedTrainNos.includes(sch.trainNo) ? (language === 'id' ? 'Matikan Notifikasi' : 'Mute Notification') : (language === 'id' ? 'Kabari Saya saat Tiba' : 'Notify Me on Arrival')}
                      className={`p-1.5 border-2 border-black rounded-none shadow-[1.5px_1.5px_0px_#000] cursor-pointer transition-all active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none ${
                        notifiedTrainNos.includes(sch.trainNo)
                          ? 'bg-[#4F252E] text-[#FFF7C5]'
                          : 'bg-white hover:bg-[#F4AE52]/20 text-[#4F252E]'
                      }`}
                    >
                      {notifiedTrainNos.includes(sch.trainNo) ? (
                        <BellRing className="w-3.5 h-3.5 text-[#F4AE52] animate-bounce" />
                      ) : (
                        <Bell className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
                      )}
                    </button>
                  </div>
                </div>

                {isSelected && (() => {
                  const occupiesChartData = coaches.map((coach) => {
                    const isCrowded = coach.occupancy > 72;
                    const isModerate = coach.occupancy > 42;
                    const color = isCrowded ? '#FF6B6B' : isModerate ? '#F4AE52' : '#4ECDC4';
                    return {
                      name: language === 'id' ? `G ${coach.num}` : `Car ${coach.num}`,
                      occupancy: coach.occupancy,
                      color,
                      status: language === 'id' ? coach.statusId : coach.statusEn
                    };
                  });

                  const CustomTooltip = ({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_#4F252E] font-mono text-[10px]">
                          <p className="font-black text-[#4F252E] uppercase">{language === 'id' ? `Gerbong ${data.name.replace('G ', '')}` : `Car ${data.name.replace('Car ', '')}`}</p>
                          <p className="font-bold text-[#4F252E] mt-0.5">
                            {language === 'id' ? 'Kepadatan' : 'Occupancy'}: <span className="font-black" style={{ color: data.color }}>{data.occupancy}%</span>
                          </p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                            {data.status}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  };

                  return (
                    <div className="bg-[#FFFDF0] px-4 md:px-6 py-4 border-t border-b border-[#4F252E]/15 animate-slideDown overflow-hidden flex flex-col gap-4 font-mono text-sm text-[#4F252E]">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-dashed border-[#4F252E]/15 pb-3">
                        <div>
                          <span className="text-[10px] bg-[#4F252E] text-[#FFF7C5] px-2 py-0.5 font-bold uppercase tracking-wider">
                            {language === 'id' ? '📊 KEPADATAN DIALOKASIKAN' : '📊 CO-ALLOCATED OCCUPANCY ANALYSIS'}
                          </span>
                          <h5 className="font-display font-black text-xs sm:text-sm uppercase tracking-tight mt-1 text-[#4F252E]">
                            {language === 'id' ? `ESTIMASI HUNIAN KERETA ${sch.trainNo}` : `OCCUPANCY DETAILS FOR ${sch.trainNo}`}
                          </h5>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 uppercase">
                          <div>
                            {language === 'id' ? 'FORMASI' : 'FORMATION'}: <strong className="text-[#4F252E]">{coaches.length} {language === 'id' ? 'GERBONG' : 'CARS'}</strong>
                          </div>
                          <div>
                            {language === 'id' ? 'KECEPATAN EST' : 'EST SPEED'}: <strong className="text-emerald-600">~105 KM/H</strong>
                          </div>
                        </div>
                      </div>

                      {/* Side-by-side Layout on Desktop */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                        {/* Left Side: Traditional Carriage compartmental map */}
                        <div className="lg:col-span-6 flex flex-col justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-[#4F252E]/60 uppercase tracking-wide block mb-2">
                              {language === 'id' ? '📍 Tata Letak Rangkaian' : '📍 Trainset Architecture map'}
                            </span>
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                              {coaches.map((coach) => (
                                <div 
                                  key={coach.num} 
                                  className="bg-white border-2 border-black p-2.5 shadow-[1.5px_1.5px_0px_#4F252E] relative flex flex-col gap-1.5 transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#4F252E]"
                                >
                                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#4F252E]/60">
                                    <span>{language === 'id' ? `G ${coach.num}` : `Car ${coach.num}`}</span>
                                    <span className="font-bold">{coach.occupancy}%</span>
                                  </div>
                                  
                                  {/* Percent bar gauge */}
                                  <div className="w-full bg-slate-100 border border-black/40 h-2.5 relative">
                                    <div 
                                      className={`h-full border-r border-black/45 ${coach.statusClass}`} 
                                      style={{ width: `${coach.occupancy}%` }} 
                                    />
                                  </div>

                                  <span className="text-[8px] font-mono font-black uppercase tracking-wider text-[#4F252E] mt-0.5 text-center truncate">
                                    {language === 'id' ? coach.statusId : coach.statusEn}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-[#4F252E]/15 p-2 flex flex-col justify-center">
                            <span className="text-[9px] text-slate-500 uppercase block font-black mb-0.5">
                              {language === 'id' ? 'Sifat & Fasilitas Gerbong' : 'Onboard Features'}
                            </span>
                            <span className="font-bold text-[10px] text-[#4F252E] uppercase tracking-wide">
                              🔌 OUTLET LISTRIK • 📶 WIFI GRATIS • ❄️ AC DINGIN
                            </span>
                          </div>
                        </div>

                        {/* Right Side: Recharts Bar Chart */}
                        <div className="lg:col-span-6 bg-white border-2 border-black p-3.5 shadow-[3.5px_3.5px_0px_#4F252E] flex flex-col justify-between min-h-[220px]">
                          <div className="flex items-center justify-between border-b border-[#4F252E]/10 pb-1.5 mb-2 shrink-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#4F252E]">
                              {language === 'id' ? '📈 GRAFIK HUNIAN GERBONG' : '📈 DETAILED CARRIAGE STATISTICS'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                              <span className="font-mono text-[9px] font-black text-red-500 uppercase">LIVE</span>
                            </div>
                          </div>

                          <div className="flex-1 w-full h-[140px] select-none font-mono text-[10px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={occupiesChartData}
                                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#4F252E" opacity={0.15} vertical={false} />
                                <XAxis 
                                  dataKey="name" 
                                  tickLine={true} 
                                  axisLine={true} 
                                  stroke="#4F252E"
                                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                                />
                                <YAxis 
                                  domain={[0, 100]} 
                                  tickLine={true} 
                                  axisLine={true} 
                                  stroke="#4F252E"
                                  tickFormatter={(v) => `${v}%`}
                                  tick={{ fontSize: 9, fontWeight: 'bold' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 37, 46, 0.05)' }} />
                                <Bar 
                                  dataKey="occupancy"
                                  stroke="#4F252E"
                                  strokeWidth={2}
                                  radius={0}
                                >
                                  {occupiesChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Advisory notice */}
                      <div className="bg-amber-50 border-2 border-[#4F252E]/20 p-2.5 flex items-start gap-2 text-[11px] font-bold text-[#4F252E]/85">
                        <span className="text-base text-[#F4AE52] shrink-0">💡</span>
                        <p className="leading-snug">
                          {language === 'id' 
                            ? 'Saran: Pilihlah rangkaian gerbong dengan warna Hijau (Sangat Lengang) demi kemudahan mobilisasi dan aksesibilitas selama perjalanan.' 
                            : 'Protip: Board closer to coaches colored in green (Relaxed status) to easily secure open seats and experience a comfortable commute.'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="w-10 h-10 text-[#F4AE52]" />
            {isLoading ? (
              <p className="font-mono text-xs font-bold text-[#4F252E]/60 uppercase tracking-wider animate-pulse animate-duration-1000">
                Sedang menghubungkan ke Comuline...
              </p>
            ) : activeFilter === 'Shinkansen' ? (
              <div className="space-y-3">
                <p className="font-mono text-xs font-black text-[#4F252E] uppercase tracking-wider">
                  🚄 INFO BULLET TRAIN WHOOSH
                </p>
                <p className="text-xs font-sans font-bold text-[#4F252E]/85 leading-relaxed max-w-md mx-auto">
                  Kereta Cepat <b>WHOOSH</b> tidak tersedia di <b>{currentStationName}</b>. Layanan WHOOSH hanya tersedia secara eksklusif di stasiun:
                </p>
                <div className="font-mono text-xs font-black bg-white/70 border border-[#4F252E]/20 px-3 py-1.5 rounded-none inline-block uppercase text-[#4F252E] shadow-[1px_1px_0px_#4F252E]">
                  📍 STASIUN HALIM (HLM)
                </div>
                <div className="block pt-1">
                  <button
                    onClick={() => {
                      triggerVibration([20, 10, 20]);
                      playClickSound();
                      setSelectedStationId('HLM');
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 font-mono text-[10px] font-black text-[#FFF7C5] bg-[#4F252E] border-2 border-[#4F252E] rounded-none hover:bg-white hover:text-[#4F252E] transition-all shadow-[2px_2px_0px_#F4AE52] cursor-pointer"
                  >
                    <span>PINDAH KE STASIUN HALIM (HLM)</span>
                    <ArrowRight className="w-3 h-3 text-current" />
                  </button>
                </div>
              </div>
            ) : activeFilter === 'Rapid' ? (
              <div className="space-y-3">
                <p className="font-mono text-xs font-black text-[#4F252E] uppercase tracking-wider">
                  🚈 INFO KERETA ARGO & INTERCITY
                </p>
                <p className="text-xs font-sans font-bold text-[#4F252E]/85 leading-relaxed max-w-md mx-auto">
                  Kereta <b>Argo & Intercity</b> tidak dijadwalkan di <b>{currentStationName}</b> saat ini. Kereta jenis ini biasanya hanya beroperasi di stasiun utama berikut:
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {[
                    { id: 'MRI', name: 'Manggarai (MRI)' },
                    { id: 'BKS', name: 'Bekasi (BKS)' },
                    { id: 'PSE', name: 'Pasar Senen (PSE)' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        triggerVibration([20, 10, 20]);
                        playClickSound();
                        setSelectedStationId(st.id);
                      }}
                      className="inline-flex items-center px-3 py-1.5 font-mono text-[9px] font-black text-[#4F252E] bg-white border-2 border-[#4F252E] rounded-none hover:bg-[#F4AE52] shadow-[2px_2px_0px_#4F252E] cursor-pointer"
                    >
                      <span>PINDAH KE {st.name.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : activeFilter === 'Commuter' ? (
              <div className="space-y-3">
                <p className="font-mono text-xs font-black text-[#4F252E] uppercase tracking-wider">
                  🚇 INFO KRL COMMUTER LINE
                </p>
                <p className="text-xs font-sans font-bold text-[#4F252E]/85 leading-relaxed max-w-md mx-auto">
                  Layanan <b>KRL Commuter Line</b> tidak dijadwalkan di stasiun <b>{currentStationName}</b>. Silakan kembali ke stasiun transit/komuter terdekat:
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {[
                    { id: 'MRI', name: 'Manggarai (MRI)' },
                    { id: 'SUD', name: 'Sudirman (SUD)' },
                    { id: 'THB', name: 'Tanah Abang (THB)' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        triggerVibration([20, 10, 20]);
                        playClickSound();
                        setSelectedStationId(st.id);
                      }}
                      className="inline-flex items-center px-3 py-1.5 font-mono text-[9px] font-black text-[#4F252E] bg-white border-2 border-[#4F252E] rounded-none hover:bg-[#F4AE52] shadow-[2px_2px_0px_#4F252E] cursor-pointer"
                    >
                      <span>PINDAH KE {st.name.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs font-bold text-[#4F252E]/60 uppercase tracking-wider">
                Tidak ada jadwal aktif dalam kategori {activeFilter} di stasiun ini.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Selected Train Preview Drawer */}
      <div className="mt-4 bg-[#C1EBE9] rounded-none border-2 border-[#4F252E] p-3 flex justify-between items-center sm:px-4 shrink-0 shadow-[3px_3px_0px_0px_#4F252E]">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-10 bg-[#4F252E]" />
          <div>
            <span className="font-mono text-[9px] text-[#4F252E]/70 block leading-none font-bold uppercase">
              {language === 'id' ? 'Rute Terpilih' : 'Selected Train'}
            </span>
            <span className="font-display font-black text-sm text-[#4F252E] block">
              {selectedTrainId && schedules.length > 0
                ? schedules.find(s => s.id === selectedTrainId)?.destination || 'Bandung - Tegalluar'
                : language === 'id' ? 'Pilih kereta di atas untuk mencocokkan tiket' : 'Select train above to match ticket'
              }
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            triggerVibration([25, 10, 20]);
            playClickSound();
            const scannerElem = document.getElementById('ticket-scanner-hub');
            if (scannerElem) {
              scannerElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          onMouseEnter={() => triggerVibration(8)}
          className="font-mono text-[10px] text-[#FFF7C5] font-black flex items-center space-x-1.5 bg-[#4F252E] px-3.5 py-2.5 rounded-none border-2 border-black shadow-[2px_2px_0px_0px_#F4AE52] hover:bg-[#FFF7C5] hover:text-[#4F252E] transition-all cursor-pointer"
        >
          <span>{language === 'id' ? 'COCOKKAN TIKET SAYA' : 'MATCH MY TICKET'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FFF7C5]" />
        </button>
      </div>

    </div>
  );
}
