(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/predictor/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'indian', exam: 'jee-advanced', rank: 50 }),
    });

    const json = await res.json();
    console.log('mode:', json.mode, 'exam:', json.exam, 'rank:', json.rank);
    console.log('returned colleges:', json.colleges.map((c) => c.name).slice(0, 30));
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
