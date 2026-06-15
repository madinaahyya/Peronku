import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function apiMockPlugin(): Plugin {
  return {
    name: 'api-mock-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        
        // Parse the requested URL path and query parameters
        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        if (pathname === '/api/comuline/stations') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([
            { id: "MRI", name: "Manggarai (Transit Pusat)" },
            { id: "SUD", name: "Sudirman (Sudirman Jkt)" },
            { id: "THB", name: "Tanah Abang (Transit Barat)" },
            { id: "JAKK", name: "Jakarta Kota" },
            { id: "BOO", name: "Bogor" },
            { id: "DPK", name: "Depok Baru" },
            { id: "BKS", name: "Bekasi" },
            { id: "PSE", name: "Pasar Senen" },
            { id: "HLM", name: "Halim (Stasiun WHOOSH)" }
          ]));
          return;
        }

        if (pathname === '/api/comuline/schedule') {
          const stationId = urlObj.searchParams.get('id') || 'MRI';
          const mockSchedules = [];
          
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

          const currentHour = 12;
          const currentMinute = 30;
          for (let i = 0; i < 8; i++) {
            const totalMinutes = currentHour * 60 + currentMinute + (i * 12);
            const trainHour = Math.floor(totalMinutes / 60) % 24;
            const trainMinute = totalMinutes % 60;
            const timeStr = `${String(trainHour).padStart(2, '0')}:${String(trainMinute).padStart(2, '0')}`;
            const info = destinations[i % destinations.length];
            
            let platform = "01";
            if (info.line === "Bogor") platform = (i % 2 === 0) ? "01" : "02";
            else if (info.line === "Cikarang") platform = (i % 2 === 0) ? "03" : "04";
            else if (info.line === "Rangkas") platform = (i % 2 === 0) ? "05" : "06";
            else if (info.line === "Whoosh") platform = "05";
            else platform = String(Math.floor(Math.random() * 4) + 1).padStart(2, '0');

            let status = "On Time";
            if (i === 0) status = "Arriving";
            else if (i === 1) status = "Boarding";

            mockSchedules.push({
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

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(mockSchedules));
          return;
        }

        if (pathname === '/api/assistant' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => {
            bodyStr += chunk;
          });
          req.on('end', () => {
            let message = '';
            try {
              const parsed = JSON.parse(bodyStr);
              message = parsed.message || '';
            } catch (err) {}
            
            const reply = "Halo Kak! Aku Kio, bot penunjuk jalan stasiun! Ada yang bisa aku bantu?";
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: reply }));
          });
          return;
        }

        if (pathname === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: "healthy", timestamp: new Date().toISOString(), aiActive: false }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMockPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
