require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:5173', 
  'https://youra.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
