import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Helper: безопасный fetch с таймаутом
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, headers: {
      'User-Agent': 'HorizonExplorer/1.0 (contact: admin@example.com)',
      ...(options.headers || {})
    }});
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Нормализация ответа Nominatim Reverse
function normalizeNominatimReverse(json, lat, lng) {
  if (!json) return null;
  const display = json.display_name || '';
  const name = json.name || json.address?.attraction || json.address?.building || json.address?.amenity || json.address?.road || display.split(',')[0]?.trim() || 'Неизвестное место';
  const type = json.type || 'unknown';
  const category = json.category || 'other';
  return {
    id: json.place_id?.toString(),
    name,
    address: display,
    type,
    category,
    source: 'osm',
    confidence: 0.7,
    coordinates: { latitude: Number(lat), longitude: Number(lng) }
  };
}

// GET /api/places/reverse?lat&lng
app.get('/api/places/reverse', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat и lng обязательны' });
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;
    const r = await fetchWithTimeout(url);
    if (!r.ok) {
      return res.status(502).json({ message: 'Ошибка Nominatim', status: r.status });
    }
    const data = await r.json();
    const place = normalizeNominatimReverse(data, lat, lng);
    const payload = place ? { places: [place], bestMatch: place, totalFound: 1 } : { places: [], totalFound: 0 };
    res.json(payload);
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера при reverse поиске' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Тестовый сервер геопривязки запущен!', endpoints: ['/api/places/reverse'] });
});

app.listen(PORT, () => {
  });

