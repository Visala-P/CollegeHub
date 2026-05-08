async function testApi() {
  const url = 'https://collegeapi.onrender.com/api/colleges?page=1&limit=5';
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data:', JSON.stringify(data).substring(0, 200));
  } catch (error) {
    console.error('Error fetching from API:', error.message);
  }
}

testApi();
