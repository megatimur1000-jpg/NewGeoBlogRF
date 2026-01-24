const axios = require('axios');

const creds = [
  { email: 'test@example.com', password: 'test123' },
  { email: 'admin@test.com', password: 'admin123' }
];

(async () => {
  for (const c of creds) {
    try {
      const res = await axios.post('http://localhost:3002/api/users/login', c, { timeout: 10000 });
      console.log('---RESULT', c.email, 'status=', res.status);
      console.log(res.data);
    } catch (e) {
      console.log('---ERROR', c.email);
      if (e.response) {
        console.log('status:', e.response.status);
        console.log('data:', e.response.data);
      } else {
        console.log('message:', e.message);
      }
    }
  }
})();
