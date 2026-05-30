require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
const clothingRoutes = require('./routes/clothingRoutes');
const outfitRoutes = require('./routes/outfitRoutes');
const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

app.use('/api/auth', authRoutes);

// Aliased routes so both your AI integration and friend's DB integration work without changing frontend code
app.use('/api/auth', authRoutes);

app.use('/api/clothing', clothingRoutes);
app.use('/api/clothes', clothingRoutes);

app.use('/api/outfit', outfitRoutes);
app.use('/api/outfits', outfitRoutes);

app.use('/api/weather', weatherRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Youra API çalışıyor');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
