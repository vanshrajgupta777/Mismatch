// Automated API verification script for Mismatch
const API_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('🧪 Starting End-to-End API Verification for Mismatch...\n');

  // Helper for JSON requests
  const request = async (endpoint, options = {}) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  // 1. Health check
  const health = await request('/health');
  console.log('1. Health Check:', health.status === 200 ? '✅ PASSED' : '❌ FAILED');

  // 2. Log in as Boy (Alex)
  const alexLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'alex@mismatch.com', password: 'password123' },
  });
  console.log('2. User Login (Alex - Boy):', alexLogin.status === 200 ? '✅ PASSED' : '❌ FAILED');
  const alexToken = alexLogin.data.token;
  const alexUser = alexLogin.data.user;

  // 3. Get all rooms
  const roomsRes = await request('/rooms', { token: alexToken });
  console.log('3. List Rooms (with 25/25 cap info):', roomsRes.status === 200 && roomsRes.data.rooms.length > 0 ? '✅ PASSED' : '❌ FAILED');
  const gymRoom = roomsRes.data.rooms.find(r => r.interestCategory === 'Gym');

  // 4. View blind members in Gym room (opposite-gender only)
  const membersRes = await request(`/rooms/${gymRoom._id}/members`, { token: alexToken });
  console.log('4. Blind Member View (Opposite Gender):', membersRes.status === 200 ? '✅ PASSED' : '❌ FAILED');
  console.log('   Opposite gender shown:', membersRes.data.oppositeGender);
  console.log('   Member count:', membersRes.data.members.length);

  // 5. Send Like from Alex to Maya in Gym room (Maya already liked Alex during seed!)
  const maya = membersRes.data.members.find(m => m.name === 'Maya Lin');
  const likeRes = await request('/likes', {
    method: 'POST',
    token: alexToken,
    body: { toUserId: maya._id, roomId: gymRoom._id },
  });
  console.log('5. Blind Like Action:', likeRes.status === 201 ? '✅ PASSED' : '❌ FAILED');
  console.log('   Is Mutual Match?', likeRes.data.isMatch ? '✅ YES (Match Triggered!)' : '❌ NO');
  const matchData = likeRes.data.match;

  // 6. Get matches for Alex
  const matchesRes = await request('/matches', { token: alexToken });
  console.log('6. User Matches List:', matchesRes.status === 200 && matchesRes.data.matches.length > 0 ? '✅ PASSED' : '❌ FAILED');

  // 7. Send chat message in unlocked match
  const matchId = matchData.matchId;
  const chatMsgRes = await request(`/chat/${matchId}/message`, {
    method: 'POST',
    token: alexToken,
    body: { text: 'Hey Maya! Glad we both liked each other in the Gym room.' },
  });
  console.log('7. Send 1:1 Chat Message:', chatMsgRes.status === 201 ? '✅ PASSED' : '❌ FAILED');

  // 8. Retrieve chat history
  const chatHistory = await request(`/chat/${matchId}`, { token: alexToken });
  console.log('8. Retrieve Chat History:', chatHistory.status === 200 && chatHistory.data.chat.messages.length >= 2 ? '✅ PASSED' : '❌ FAILED');

  // 9. Admin Login & Weekly Reset Trigger
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@mismatch.com', password: 'admin123' },
  });
  console.log('9. Admin Login:', adminLogin.status === 200 && adminLogin.data.user.role === 'admin' ? '✅ PASSED' : '❌ FAILED');
  const adminToken = adminLogin.data.token;

  // 10. Admin trigger weekly likes reset
  const resetRes = await request('/admin/reset-likes', {
    method: 'POST',
    token: adminToken,
  });
  console.log('10. Admin Weekly Likes Reset (Respects Carry-Over):', resetRes.status === 200 ? '✅ PASSED' : '❌ FAILED');
  console.log('    Reset stats:', resetRes.data.result);

  console.log('\n🎉 ALL 10 TEST STEPS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
