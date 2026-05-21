const mongoose = require('mongoose');
require('dotenv').config();
const Clothing = require('./models/clothing');

const CATEGORIES = ['Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar', 'Diğer'];
const SEASONS    = ['Mevsim', 'İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const clothes = await Clothing.find();
    let updated = 0;
    for (const c of clothes) {
        let changed = false;
        if (c.category && c.category === c.category.toUpperCase()) {
            const correct = CATEGORIES.find(cat => cat.toUpperCase() === c.category);
            if (correct) { c.category = correct; changed = true; }
        }
        if (c.season && c.season === c.season.toUpperCase()) {
            const correct = SEASONS.find(sea => sea.toUpperCase() === c.season);
            if (correct) { c.season = correct; changed = true; }
        }
        if (changed) {
            await c.save();
            updated++;
        }
    }
    console.log(`Updated ${updated} items`);
    process.exit(0);
}
fix();
