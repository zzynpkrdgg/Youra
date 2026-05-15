require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
const clothingRoutes = require('./routes/clothingRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const authRoutes = require('./routes/authRoutes');

// Test Route
app.get('/', (req, res) => {
    res.send('Youra API çalışıyor');
});

app.use('/api/auth', authRoutes);
app.use('/api/wardrobe', clothingRoutes);
app.use('/api/outfit', outfitRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
