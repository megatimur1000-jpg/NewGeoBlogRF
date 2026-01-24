const axios = require('axios');

function normalizeBoundingBox(nominatimBbox) {
  // Nominatim returns [south, north, west, east] as strings
  const south = parseFloat(nominatimBbox[0]);
  const north = parseFloat(nominatimBbox[1]);
  const west = parseFloat(nominatimBbox[2]);
  const east = parseFloat(nominatimBbox[3]);
  return [south, west, north, east];
}

async function fetchCityBBox(cityName) {
  const url = 'https://nominatim.openstreetmap.org/search';
  const params = {
    q: cityName,
    format: 'json',
    addressdetails: 1,
    limit: 1,
    polygon_geojson: 0,
  };
  const headers = {
    'User-Agent': 'WayAtomParser/1.0 (contact: parser@wayatom.local)'
  };

  const { data } = await axios.get(url, { params, headers, timeout: 15000 });
  if (!Array.isArray(data) || data.length === 0) return null;
  const item = data[0];
  if (!item.boundingbox) return null;
  return normalizeBoundingBox(item.boundingbox);
}

module.exports = {
  fetchCityBBox,
};


