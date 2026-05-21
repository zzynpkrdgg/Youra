const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    // We need to login to get a token for zey@gmail.com
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'zey@gmail.com',
      password: 'password123' // assuming standard test password
    });
    const token = loginRes.data.token;
    
    console.log("Logged in:", loginRes.data.user.email);
    
    // Create a dummy image file
    fs.writeFileSync('dummy.jpg', Buffer.alloc(1024, 0));
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream('dummy.jpg'));
    formData.append('category', 'Üst');
    formData.append('color', '#000000');
    formData.append('style', 'test_style');
    formData.append('season', 'Yaz');
    
    console.log("Uploading...");
    const uploadRes = await axios.post('http://localhost:5000/api/clothing/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Upload success:", uploadRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
testUpload();
