// src/utils/trackingMath.ts

export const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatPace = (pace: number) => {
  if (!pace || pace === 0 || !isFinite(pace)) return '--';
  if (pace > 99) return '>99';
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace % 1) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getDistance = (
  c1: { latitude: number; longitude: number },
  c2: { latitude: number; longitude: number }
) => {
  const R = 6371;
  const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((c1.latitude * Math.PI) / 180) *
      Math.cos((c2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const smoothCoordinate = (
  prev: { latitude: number; longitude: number },
  current: { latitude: number; longitude: number },
  lastRaw: { latitude: number; longitude: number }
) => {
  const dx1 = prev.latitude - lastRaw.latitude;
  const dy1 = prev.longitude - lastRaw.longitude;
  const dx2 = current.latitude - prev.latitude;
  const dy2 = current.longitude - prev.longitude;
  const angle = Math.abs(dx1 * dy2 - dy1 * dx2);

  const alpha = angle > 0.0000005 ? 0.35 : 0.12;

  const ema = {
    latitude: prev.latitude + alpha * (current.latitude - prev.latitude),
    longitude: prev.longitude + alpha * (current.longitude - prev.longitude),
  };

  return {
    latitude: (ema.latitude + current.latitude) / 2,
    longitude: (ema.longitude + current.longitude) / 2,
  };
};

// 🔥 Kita ubah menjadi "Factory Function" agar tidak reset setiap detik
export const createKalmanFilter = () => {
  let lastLat = 0;
  let lastLng = 0;
  let initialized = false;
  let P = 1;

  return (lat: number, lng: number, speed: number) => {
    if (!initialized) {
      lastLat = lat;
      lastLng = lng;
      initialized = true;
      return { latitude: lat, longitude: lng };
    }

    let Q = 0.000001;
    let R = 0.00001;

    if (speed <= 2.2) {
      Q = 0.0000002;
      R = 0.00003;
    } else if (speed > 2.2 && speed <= 7) {
      Q = 0.000002;
      R = 0.00001;
    } else {
      Q = 0.000005;
      R = 0.000005;
    }

    P = P + Q;
    const K = P / (P + R);

    lastLat = lastLat + K * (lat - lastLat);
    lastLng = lastLng + K * (lng - lastLng);

    P = (1 - K) * P;

    return {
      latitude: lastLat,
      longitude: lastLng,
    };
  };
};