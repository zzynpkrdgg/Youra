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

app.use('/api/wardrobe', clothingRoutes);
app.use('/api/outfit', outfitRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
