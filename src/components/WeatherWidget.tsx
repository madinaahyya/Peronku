import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudFog, Wind, Thermometer, RefreshCw } from 'lucide-react';
import { triggerVibration, playClickSound } from '../utils';
import { useLanguage } from '../LanguageContext';

interface WeatherData {
  temp: number;
  wind: number;
  code: number;
  isDay: number;
  live: boolean;
  source?: string;
  timestamp: string;
}

export default function WeatherWidget() {
  const { language, t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorCount, setErrorCount] = useState<number>(0);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      } else {
        throw new Error('Failed response');
      }
    } catch (err) {
      console.warn('Weather client-side load failed, using local model backup:', err);
      // Double safe client-side fallback
      const now = new Date();
      const currentHour = now.getHours();
      const isDay = currentHour >= 6 && currentHour < 18 ? 1 : 0;
      setWeather({
        temp: isDay ? 31.8 : 26.4,
        wind: isDay ? 11.2 : 6.8,
        code: 1, // Partly cloudy
        isDay: isDay,
        live: false,
        timestamp: now.toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 5 minutes to stay accurate
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    triggerVibration(10);
    playClickSound();
    fetchWeather();
  };

  // Get condition description and custom Lucide weather icon
  const getWeatherDetails = (code: number, isDay: boolean) => {
    switch (code) {
      case 0:
        return {
          icon: <Sun className="w-5 h-5 text-[#F4AE52] animate-[spin_20s_linear_infinite]" />,
          textId: 'Cerah',
          textEn: 'Clear Sky',
          bgColor: 'bg-[#FFF7C5]'
        };
      case 1:
      case 2:
      case 3:
        return {
          icon: <Cloud className="w-5 h-5 text-[#8CD1CE] animate-pulse" />,
          textId: 'Cerah Berawan',
          textEn: 'Partly Cloudy',
          bgColor: 'bg-white/10'
        };
      case 45:
      case 48:
        return {
          icon: <CloudFog className="w-5 h-5 text-gray-400 animate-pulse" />,
          textId: 'Berkabut',
          textEn: 'Foggy',
          bgColor: 'bg-slate-500/10'
        };
      case 51:
      case 53:
      case 55:
        return {
          icon: <CloudDrizzle className="w-5 h-5 text-[#54A0B0] animate-bounce" style={{ animationDuration: '2.5s' }} />,
          textId: 'Gerimis Ringan',
          textEn: 'Light Drizzle',
          bgColor: 'bg-[#C1EBE9]/20'
        };
      case 61:
      case 63:
      case 65:
        return {
          icon: <CloudRain className="w-5 h-5 text-[#3D7180] animate-bounce" style={{ animationDuration: '2s' }} />,
          textId: 'Hujan Basah',
          textEn: 'Rainy',
          bgColor: 'bg-blue-500/10'
        };
      case 80:
      case 81:
      case 82:
        return {
          icon: <CloudRain className="w-5 h-5 text-[#4F252E] animate-bounce" style={{ animationDuration: '1.5s' }} />,
          textId: 'Hujan Deras',
          textEn: 'Heavy Showers',
          bgColor: 'bg-red-500/10'
        };
      case 95:
      case 96:
      case 99:
        return {
          icon: <CloudLightning className="w-5 h-5 text-[#F4AE52] animate-[pulse_1s_infinite]" />,
          textId: 'Badai Petir',
          textEn: 'Thunderstorm',
          bgColor: 'bg-yellow-500/10'
        };
      default:
        return {
          icon: <Cloud className="w-5 h-5 text-gray-500" />,
          textId: 'Berawan',
          textEn: 'Cloudy',
          bgColor: 'bg-white/10'
        };
    }
  };

  if (!weather) {
    return (
      <div className="flex items-center space-x-2 bg-[#FFF7C5] text-[#4F252E] border-2 border-black px-4 py-2 rounded-none shadow-[3px_3px_0px_0px_#F4AE52] h-[42px] animate-pulse">
        <span className="w-2.5 h-2.5 rounded-full bg-[#F4AE52] animate-ping" />
        <span className="font-mono text-[10px] font-black uppercase">SYNC WEATHER...</span>
      </div>
    );
  }

  const details = getWeatherDetails(weather.code, weather.isDay === 1);
  const conditionLabel = language === 'id' ? details.textId : details.textEn;

  return (
    <div 
      id="station-weather-widget"
      className="flex items-center space-x-3 bg-[#FFF7C5] text-[#4F252E] border-2 border-black pl-3.5 pr-2 py-1.5 rounded-none shadow-[3px_3px_0px_0px_#F4AE52] group shrink-0 select-none h-[42px] justify-between"
    >
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center p-1 rounded-sm bg-[#4F252E]/10">
          {loading ? (
            <RefreshCw className="w-4 h-4 text-[#4F252E] animate-spin" />
          ) : (
            details.icon
          )}
        </div>
        
        <div className="flex flex-col leading-tight pr-1 border-r border-[#4F252E]/25">
          <div className="flex items-center space-x-1">
            <span className="font-display font-black text-xs sm:text-sm tracking-tight">{weather.temp}°C</span>
            <span className="font-mono text-[9px] bg-[#4F252E] text-[#FFF7C5] px-1 py-0.2 rounded-sm uppercase tracking-widest font-black scale-90">
              {language === 'id' ? 'JKT' : 'JKT'}
            </span>
          </div>
          <span className="font-mono text-[9px] font-black uppercase tracking-tight text-[#4F252E]/70 max-w-[85px] truncate">
            {conditionLabel}
          </span>
        </div>

        <div className="hidden sm:flex flex-col leading-none text-left font-mono text-[8px] text-[#4F252E]/60 gap-0.5 justify-center pr-1.5">
          <div className="flex items-center gap-0.5">
            <Wind className="w-2 h-2" />
            <span>{weather.wind} km/h</span>
          </div>
          <div className="flex items-center gap-1 font-black">
            <span className={`w-1.5 h-1.5 rounded-full ${weather.live ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="uppercase text-[7.5px] tracking-tight text-[#4F252E]/90">{weather.source || (weather.live ? t('transitOnline') || 'LIVE' : t('transitOffline') || 'OFFLINE')}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleManualRefresh}
        disabled={loading}
        title="Refresh Weather Info"
        className="p-1 text-[#4F252E]/50 hover:text-[#4F252E] hover:bg-[#4F252E]/10 rounded-sm cursor-pointer transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
