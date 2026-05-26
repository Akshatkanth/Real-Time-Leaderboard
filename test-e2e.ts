import 'dotenv/config'

async function testLeaderboard() {
  const BASE_URL = 'http://localhost:3000';
  
  try {
    // 1. Register a new user
    const username = 'cyber_tester_' + Date.now();
    const email = username + '@test.com';
    const password = 'password123';
    
    console.log('Registering user...');
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    // 2. Login to get token
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    // 3. Submit text with emojis
    console.log('Submitting text with emojis...');
    await fetch(`${BASE_URL}/scores/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text: 'HELLO world! 😊🚀' })
    });

    // 4. Check emojis leaderboard
    console.log('Fetching emojis leaderboard...');
    const emojisRes = await fetch(`${BASE_URL}/leaderboard/emojis`);
    const emojisData = await emojisRes.json();
    console.log('Emojis Leaderboard:', JSON.stringify(emojisData.data, null, 2));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLeaderboard();
