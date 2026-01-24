(async () => {
  const urls = [
    { email: 'test@example.com', password: 'test123' },
    { email: 'admin@test.com', password: 'admin123' }
  ];

  for (const u of urls) {
    try {
      const res = await fetch('http://localhost:3002/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, password: u.password }),
      });
      console.log('---RESULT', u.email, 'status=', res.status);
      const text = await res.text();
      try { console.log(JSON.parse(text)); } catch { console.log(text); }
    } catch (e) {
      console.log('---ERROR', u.email, e.message || e);
    }
  }
})();
