import fetch from 'node-fetch';

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/upi/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'rishikgoud11',
        password: 'test123'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin(); 