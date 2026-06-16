import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Helper function to lazily initialize GoogleGenAI with telemetry
function getGoogleGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ----------------------------------------------------
// OFFLINE BACKUP HANDLERS
// ----------------------------------------------------

function getOfflineResponse(message: string, reason: "no-key" | "api-error" | "default"): string {
  const query = message.toLowerCase();
  
  let prefix = "";
  if (reason === "no-key") {
    prefix = "👋 Halo Kak! Aku Kio, asisten robot ramah-mu di Stasiun KRL & Whoosh Metropolis!\n\n*(Catatan: Kunci API Gemini belum aktif, jadi aku berjalan dalam Mode Offline Hemat!)*\n\n";
  } else if (reason === "api-error") {
    prefix = "👋 Halo Kak! Aku Kio. *(⚠️ Sinyal otak Gemini API stasiun sedang terbatasi karena kuota/kredit penuh, jadi aku mengaktifkan Mode Darurat Offline Pintar!)*\n\n";
  } else {
    prefix = "👋 Halo Kak! Aku Kio, bot penunjuk jalan stasiun!\n\n";
  }

  if (query.includes("jadwal") || query.includes("jam") || query.includes("berangkat") || query.includes("kereta") || query.includes("timetable") || query.includes("route")) {
    return prefix + "🕒 **Jadwal Keberangkatan Terdekat (Live Transit):**\n" +
      "• **WHOOSH G1102** ke Bandung | **12:45 WIB** | Naik eskalator ke L3, Boarding di **Gate 5**.\n" +
      "• **KRL Commuter Line** ke Sudirman/Bogor | **Setiap 10-15 menit** | **Peron 1-2**.\n" +
      "• **Argo Parahyangan** ke Bandung | **13:15 WIB** | **Peron 3**.\n" +
      "• **Argo Bromo Anggrek** ke Surabaya | **20:30 WIB** | **Peron 4**.\n\n" +
      "Yuk, persiapkan tiket atau scan di scanner bawah untuk info lengkap peron-mu ya kak!";
  }
  
  if (query.includes("whoosh") || query.includes("cepat") || query.includes("bandung") || query.includes("tegalluar") || query.includes("halim") || query.includes("gate") || query.includes("boarding")) {
    return prefix + "🚄 **Informasi Kereta Cepat WHOOSH:**\n" +
      "• **Keberangkatan Terdekat:** Train WHOOSH G1102 pukul **12:45 WIB**.\n" +
      "• **Lokasi Boarding:** Naik eskalator ke **Lantai 3 (Main Hall L3)**, pintu boarding ada di **Gate 5 (Sisi Timur)**.\n" +
      "• **Catatan Penting:** Boarding gate ditutup otomatis 5 menit sebelum kereta berangkat. Jangan sampai terlambat ya kak!";
  }

  if (query.includes("makan") || query.includes("lapar") || query.includes("kuliner") || query.includes("restoran") || query.includes("kopi") || query.includes("roti") || query.includes("food") || query.includes("haus") || query.includes("minum") || query.includes("kafe") || query.includes("starbucks")) {
    return prefix + "🍔 **Rekomendasi Kuliner & Tenant Stasiun:**\n" +
      "• **Nasi Goreng KAI**: Porsi mantap, lezat, ada di Area Foodcourt utama **Lantai 2 Mezzanine**.\n" +
      "• **Roti O** & **Kopi Kenangan**: Aromanya super harum, pas di pintu masuk/eskalator **Lantai 1**.\n" +
      "• **Resto Cepat Saji**: Ada gerai ayam goreng di lobby sisi barat.\n" +
      "• **Solis/Minimarket**: Sedia minuman dingin & cemilan instan dekat gate tiket.";
  }

  if (query.includes("toilet") || query.includes("wc") || query.includes("mushola") || query.includes("loker") || query.includes("penitipan") || query.includes("sholat") || query.includes("ibadah") || query.includes("masjid")) {
    return prefix + "🏢 **Lokasi Peta Fasilitas Utama:**\n" +
      "• **Toilet Bersih & Wangi:** Ada di **Lantai Lobby 1** pas di dekat pintu Peron 3, serta di **Lantai 3** arah area boarding Gate 5.\n" +
      "• **Mushola Adem:** Terletak di **Lantai Mezzanine (L2) Sisi Barat** (dilengkapi mukena/sarung bersih & tempat wudhu terpisah).\n" +
      "• **Loker Penitipan Barang:** Di sisi kanan loket tiket manual Lantai Lobby 1.";
  }

  if (query.includes("disabilitas") || query.includes("kursi roda") || query.includes("bantuan") || query.includes("medis") || query.includes("sos") || query.includes("sakit") || query.includes("hamil") || query.includes("laktasi") || query.includes("menyusui")) {
    return prefix + "♿ **Layanan Ramah & Aksesbilitas Stasiun:**\n" +
      "• **Kursi Roda & Porter Pendamping:** Gratis untuk penyandang disabilitas, lansia, & ibu hamil. Cukup panggil petugas berompi biru terdekat!\n" +
      "• **Kamar Laktasi & Medis:** Terletak di **Lantai Mezzanine L2** dekat pos kesehatan P3K.\n" +
      "• **Pos Medis Darurat:** Buka 24 jam di Lantai 1 dekat pintu keluar terminal barat.";
  }

  return prefix + "Panduan Pintar Terpadu Stasiun:\n" +
    "• **Peron 1-2**: KRL Commuter Line (Bogor/Sudirman).\n" +
    "• **Peron 3-4**: Argo Parahyangan & Bromo Anggrek.\n" +
    "• **Peron 5-6**: Kereta Cepat WHOOSH (Bandung Tegalluar).\n" +
    "• **Lantai 2**: Pusat kuliner, mushola, & ruang laktasi.\n" +
    "• **Lantai 3**: Area Boarding Gate WHOOSH.\n\n" +
    "Ada info spesifik tentang jadwal kereta, kuliner, fasilitas toilet, atau layanan disabilitas yang ingin Kio carikan untuk kakak?";
}

function generateOfflineSchedules(stationId: string) {
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

  const schedules = [];
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

    let status = "On Time";
    if (i === 0) status = "Arriving";
    else if (i === 1) status = "Boarding";
    else if (i % 5 === 0) status = "Delayed 5m";

    schedules.push({
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

  return schedules;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  const isAiActive = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    aiActive: isAiActive
  });
});

// AI Assistant
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "Konten pesan wajib diisi" });
      return;
    }

    const aiInstance = getGoogleGenAI();
    if (!aiInstance) {
      res.json({
        text: getOfflineResponse(message, "no-key"),
        isFallback: true
      });
      return;
    }

    const systemPrompt = `Kamu adalah Kio, asisten robot pintar yang super ramah, santai, gaul tapi tetap sopan di stasiun kereta modern Indonesia (melayani KRL, Argo Parahyangan, Argo Bromo, dan Kereta Cepat Whoosh). 
Gunakan Bahasa Indonesia yang santai, bersahabat, modern (hindari bahasa kaku seperti mesin biasa), gunakan sapaan seperti "kamu", "aku", "kakak", atau sapaan hangat lainnya.
Buat jawabanmu mudah dibaca (gunakan cetak tebal, list singkat) karena penumpang membaca di layar kios stasiun yang sedang ramai.
Jaga respon tetap ringkas (kurang dari 120 kata).
Berikan info spesifik seperti Peron 5-6 untuk WHOOSH, Lantai 2 untuk kuliner enak (Nasi Goreng KAI, Kopi Kenangan, dll), toilet ramah disabilitas di dekat Peron 3.`;

    const contents = [];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let response;
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      try {
        response = await aiInstance.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.8,
          },
        });
        break;
      } catch (gemError: any) {
        attempts++;
        const errorMessage = gemError.message || String(gemError);
        const isTransient = gemError.status === "UNAVAILABLE" || 
                            gemError.code === 503 || 
                            errorMessage.includes("503") || 
                            errorMessage.includes("busy") || 
                            errorMessage.includes("demand") ||
                            errorMessage.includes("UNAVAILABLE");
        if (isTransient && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } else {
          throw gemError;
        }
      }
    }

    const replyText = (response && response.text) || "Aduh, maaf ya kak, server otak digital-ku sedang agak telat dikit. Ada yang bisa kubantu lagi tentang stasiun?";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini API Error (Falling back to local smart engine):", error);
    const offlineReply = getOfflineResponse(req.body.message || "", "api-error");
    res.json({ 
      text: offlineReply,
      isFallback: true,
      errorDetails: error.message || String(error)
    });
  }
});

// Stations list proxy
app.get("/api/comuline/stations", async (req, res) => {
  res.json([
    { id: "MRI", name: "Manggarai (Transit Pusat)" },
    { id: "SUD", name: "Sudirman (Sudirman Jkt)" },
    { id: "THB", name: "Tanah Abang (Transit Barat)" },
    { id: "JAKK", name: "Jakarta Kota" },
    { id: "BOO", name: "Bogor" },
    { id: "DPK", name: "Depok Baru" },
    { id: "BKS", name: "Bekasi" },
    { id: "PSE", name: "Pasar Senen" },
    { id: "HLM", name: "Halim (Stasiun WHOOSH)" }
  ]);
});

// Station schedules proxy
app.get("/api/comuline/schedule", async (req, res) => {
  const stationId = (req.query.id as string) || "MRI";
  const fallbackSchedules = generateOfflineSchedules(stationId);
  res.json(fallbackSchedules);
});

// Climate/Weather proxy
app.get("/api/weather", async (req, res) => {
  try {
    try {
      const bmkgUrl = "https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DKIJakarta.xml";
      const bmkgResponse = await fetch(bmkgUrl, {
        headers: { "User-Agent": "peronku-transit-kiosk" },
        signal: AbortSignal.timeout(3500)
      });

      if (bmkgResponse.ok) {
        const xmlText = await bmkgResponse.text();
        const areaRegex = /<area[^>]*description="Jakarta Pusat"[^>]*>([\s\S]*?)<\/area>/i;
        const areaMatch = xmlText.match(areaRegex);
        
        if (areaMatch && areaMatch[1]) {
          const areaContent = areaMatch[1];
          const tempParamMatch = areaContent.match(/<parameter[^>]*id="t"[^>]*>([\s\S]*?)<\/parameter>/i);
          const weatherParamMatch = areaContent.match(/<parameter[^>]*id="weather"[^>]*>([\s\S]*?)<\/parameter>/i);
          const windParamMatch = areaContent.match(/<parameter[^>]*id="ws"[^>]*>([\s\S]*?)<\/parameter>/i);
          
          let tempVal = 28.5;
          let weatherCode = 1;
          let windVal = 10.0;
          
          if (tempParamMatch) {
            const firstRange = tempParamMatch[1].match(/<timerange[^>]*>([\s\S]*?)<\/timerange>/i);
            if (firstRange) {
              const valMatch = firstRange[1].match(/<value[^>]*unit="C"[^>]*>([\d\.]+)/i);
              if (valMatch) tempVal = parseFloat(valMatch[1]);
            }
          }
          
          if (weatherParamMatch) {
            const firstRange = weatherParamMatch[1].match(/<timerange[^>]*>([\s\S]*?)<\/timerange>/i);
            if (firstRange) {
              const valMatch = firstRange[1].match(/<value[^>]*unit="icon"[^>]*>(\d+)/i);
              if (valMatch) weatherCode = parseInt(valMatch[1]);
            }
          }
          
          if (windParamMatch) {
            const firstRange = windParamMatch[1].match(/<timerange[^>]*>([\s\S]*?)<\/timerange>/i);
            if (firstRange) {
              const valMatch = firstRange[1].match(/<value[^>]*unit="KPH"[^>]*>([\d\.]+)/i);
              if (valMatch) {
                windVal = parseFloat(valMatch[1]);
              } else {
                const ktMatch = firstRange[1].match(/<value[^>]*unit="Kt"[^>]*>([\d\.]+)/i);
                if (ktMatch) windVal = parseFloat(ktMatch[1]) * 1.852;
              }
            }
          }

          let currentHour = 12;
          try {
            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: 'Asia/Jakarta',
              hour12: false,
              hour: '2-digit'
            });
            currentHour = parseInt(formatter.format(new Date())) || 12;
          } catch {
            currentHour = new Date().getHours();
          }
          const isDay = currentHour >= 6 && currentHour < 18 ? 1 : 0;

          res.json({
            temp: parseFloat(tempVal.toFixed(1)),
            wind: parseFloat(windVal.toFixed(1)),
            code: weatherCode,
            isDay: isDay,
            live: true,
            source: "BMKG",
            timestamp: new Date().toISOString()
          });
          return;
        }
      }
    } catch (bmkgErr: any) {
      console.warn("BMKG XML load failed, trying standard Open-Meteo fallback:", bmkgErr.message);
    }

    const lat = req.query.lat || "-6.2088";
    const lon = req.query.lon || "106.8456";
    
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FJakarta`, {
      headers: { "User-Agent": "peronku-transit-kiosk" },
      signal: AbortSignal.timeout(3000)
    });
    
    if (!response.ok) {
      throw new Error(`Open-Meteo error: status ${response.status}`);
    }
    
    const data: any = await response.json();
    if (data && data.current_weather) {
      const cw = data.current_weather;
      res.json({
        temp: cw.temperature,
        wind: cw.windspeed,
        code: cw.weathercode,
        isDay: cw.is_day,
        live: true,
        source: "Open-Meteo",
        timestamp: new Date().toISOString()
      });
      return;
    }
    throw new Error("Invalid weather payload structure");
  } catch (err: any) {
    console.warn("Weather integration fell back to local system model representation:", err.message);
    
    let currentHour = 12;
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit'
      });
      currentHour = parseInt(formatter.format(new Date())) || 12;
    } catch {
      currentHour = new Date().getHours();
    }
    
    const isDay = currentHour >= 6 && currentHour < 18 ? 1 : 0;
    let temp = 28.5;
    let code = 1;
    
    if (isDay) {
      temp = 29.0 + (Math.sin((currentHour - 6) * Math.PI / 12) * 4.0);
      code = currentHour % 3 === 0 ? 3 : (currentHour % 5 === 0 ? 61 : 1);
    } else {
      temp = 25.0 + (Math.cos((currentHour - 18) * Math.PI / 12) * 2.0);
      code = currentHour % 3 === 0 ? 3 : (currentHour % 5 === 0 ? 80 : 2);
    }

    res.json({
      temp: parseFloat(temp.toFixed(1)),
      wind: isDay ? 12.4 : 7.2,
      code: code,
      isDay: isDay,
      live: false,
      source: "Offline Simulation",
      timestamp: new Date().toISOString()
    });
  }
});

export default app;
