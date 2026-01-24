const axios = require('axios');
(async () => {
  const urls = ['http://localhost:3002/', 'http://localhost:3002/api', 'http://localhost:3002/api/users', 'http://localhost:3002/api/users/login'];
  for (const u of urls) {
    try {
      const res = await axios.get(u, { timeout: 5000 });
      console.log('GET', u, 'status=', res.status);
      console.log(typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data).slice(0,200));
    } catch (e) {
      console.log('GET', u, 'ERROR');
      if (e.response) console.log('status:', e.response.status, 'data:', e.response.data);
      else console.log('msg:', e.message);
    }
  }
})();
