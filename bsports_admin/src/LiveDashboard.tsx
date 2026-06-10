import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
import { Activity, MapPin, Trophy, Users, Loader2 } from "lucide-react";
import "./index.css";

// Setup Axios
const api = axios.create({
  baseURL: "https://lensasyariah.com/bsports_app/bsports_be/public/api",
  headers: {
    Accept: "application/json",
    Authorization: "Bearer 71|x9BwHts2rY7iIGo7rom3FLhVwJJ67ppAONsaL5Or815ee5da",
  },
});

// 🔥 Added ': string' to fix "implicitly has an 'any' type"
const getMarkerIcon = (status: string) => {
  let color = "#94A3B8";

  switch (status?.toLowerCase()) {
    case "running":
    case "recording":
      color = "#F97316";
      break;

    case "paused":
      color = "#FACC15";
      break;

    case "finished":
      color = "#22C55E";
      break;
  }

  return new L.DivIcon({
    className: "",
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:999px;
        background:${color};
        border:3px solid white;
        box-shadow:0 0 10px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

// 🔥 Added ': string'
const getStatusTextColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "running":
    case "recording":
      return "text-orange-600";
    case "paused":
      return "text-yellow-600";
    case "finished":
      return "text-green-600";
    default:
      return "text-slate-500";
  }
};

// You can create a simple interface or just use 'any' if you are rushing
const LiveDashboard = ({ eventId = 27 }: { eventId?: number }) => {
  // 🔥 Added '<any[]>'
  const [livePositions, setLivePositions] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [posRes, leadRes] = await Promise.all([
        api.get(`/events/${eventId}/live-positions`),
        api.get(`/events/${eventId}/realtime-leaderboard`),
      ]);

      setLivePositions(posRes.data.data || []);
      setLeaderboard(leadRes.data.data || []);

      if (leadRes.data.event) {
        setEventInfo(leadRes.data.event);
      }
    } catch (error) {
      console.error("Failed to fetch live data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [eventId]);

  // 🔥 Added ': number'
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // TypeScript needs explicit tuple type for coordinates sometimes
  const defaultCenter: [number, number] = [-6.2010057, 106.8238207];
  const mapCenter: [number, number] =
    livePositions.length > 0
      ? [
          Number.parseFloat(livePositions[0].latitude),
          Number.parseFloat(livePositions[0].longitude),
        ]
      : defaultCenter;


  {/* ... kode atas tetap sama ... */}

return (
  <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        
        {/* 🔥 PERBAIKAN: Ukuran kontainer diperbesar dan border dihilangkan agar logo maksimal 🔥 */}
        <div className="flex items-center justify-center w-16 h-16 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="B'Sports Logo" 
            className="w-full h-full object-contain scale-110" 
          />
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            B'Sports Command Center
          </h1>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Tracking - Event #{eventInfo?.id}
          </p>
        </div>
      </div>

{/* ... sisa kode bawah tetap sama ... */}


        <div className="flex gap-4">
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Pelari Aktif
            </p>
            <p className="text-lg font-bold text-orange-600 flex items-center gap-2">
              <Users className="w-4 h-4" />{" "}
              {
                livePositions.filter(
                  (p) =>
                    p.race_status === "running" || p.race_status === "paused",
                ).length
              }
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PETA LIVE TRACKING */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              Live Map Tracking
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>{" "}
                Running
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>{" "}
                Paused
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                Finished
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span> Idle
              </span>
            </div>
          </div>

          <div className="relative bg-slate-200 h-[600px] w-full z-0">
            <MapContainer
              center={mapCenter}
              zoom={16}
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />

              {/* 🔥 Added explicit 'any' for runner */}
              {livePositions.map((runner: any) => (
                <Marker
                  key={runner.user_id}
                  position={[
                    Number.parseFloat(runner.latitude),
                    Number.parseFloat(runner.longitude),
                  ]}
                  icon={getMarkerIcon(runner.race_status)}
                >
                  <Popup>
                    <div className="p-1 min-w-[120px]">
                      <h3 className="font-bold text-sm mb-1 border-b pb-1">
                        {runner.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-2">
                        <span className="text-slate-500">Jarak:</span>
                        <span className="font-semibold">
                          {runner.distance} km
                        </span>
                        <span className="text-slate-500">Durasi:</span>
                        <span className="font-semibold">
                          {formatDuration(Number(runner.duration))}
                        </span>
                        <span className="text-slate-500">Status:</span>
                        <span
                          className={`font-bold capitalize ${getStatusTextColor(runner.race_status)}`}
                        >
                          {runner.race_status}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* REALTIME LEADERBOARD */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-140px)]">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Realtime Leaderboard
            </h2>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rank</th>
                  <th className="px-4 py-3 font-semibold">Pelari</th>
                  <th className="px-4 py-3 font-semibold text-right">Jarak</th>
                  <th className="px-4 py-3 font-semibold text-right">Pace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 🔥 Added explicit 'any' for item */}
                {leaderboard.map((item: any, idx) => (
                  <tr
                    key={item.user_id}
                    className={`hover:bg-slate-50 transition-colors ${idx < 3 ? "bg-orange-50/20" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? "bg-yellow-100 text-yellow-700" : idx === 1 ? "bg-slate-200 text-slate-700" : idx === 2 ? "bg-orange-200 text-orange-800" : "text-slate-500 font-medium"}`}
                      >
                        {item.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.foto_profil ? (
                          <img
                            src={item.foto_profil}
                            alt={item.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">
                            {item.name}
                          </p>
                          <p
                            className={`text-[10px] capitalize font-semibold ${getStatusTextColor(item.status)}`}
                          >
                            {item.status}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-slate-800">
                        {item.distance}
                      </p>
                      <p className="text-[10px] text-slate-500">KM</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-mono text-slate-700">
                        {item.avg_pace}
                      </p>
                      <p className="text-[10px] text-slate-500">/km</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveDashboard;
