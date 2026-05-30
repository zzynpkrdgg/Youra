require('dotenv').config();
const mongoose = require('mongoose');
const Clothing = require('./models/clothing');

const VALID_CATEGORIES = ['Üst', 'Alt', 'Elbise', 'Dış Giyim', 'Ayakkabı', 'Aksesuar', 'Diğer'];

// Yanlış yazılmış kategorileri doğru olanlarla eşleştir
const categoryMap = {
  'ÜST': 'Üst',
  'üst': 'Üst',
  'ALT': 'Alt',
  'alt': 'Alt',
  'ELBİSE': 'Elbise',
  'elbise': 'Elbise',
  'DIŞ GIYIM': 'Dış Giyim',
  'dış giyim': 'Dış Giyim',
  'DIŞ_GIYIM': 'Dış Giyim',
  'AYAKKABI': 'Ayakkabı',
  'ayakkabı': 'Ayakkabı',
  'AKSESUAR': 'Aksesuar',
  'aksesuar': 'Aksesuar',
  'DİĞER': 'Diğer',
  'diğer': 'Diğer',
};

async function normalizeCategories() {
  try {
    console.log('📋 MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB\'ye bağlandı!');

    const clothes = await Clothing.find({});
    console.log(`\n📊 Toplam ${clothes.length} kıyafet bulundu.\n`);

    let updated = 0;
    let issues = [];

    for (const item of clothes) {
      const original = item.category;
      let normalized = (item.category || '').trim();
      
      // Eşleştirme tablosunda varsa düzelt
      if (categoryMap[normalized]) {
        normalized = categoryMap[normalized];
      }
      
      // Eğer normalize ettikten sonra değişmişse güncelle
      if (original !== normalized) {
        issues.push({
          id: item._id.toString().slice(0, 8),
          style: item.style,
          original: `"${original}"`,
          corrected: `"${normalized}"`
        });
        
        item.category = normalized;
        await item.save();
        updated++;
        console.log(`✅ ${item.style}: "${original}" → "${normalized}"`);
      }
    }

    if (issues.length > 0) {
      console.log('\n⚠️  DÜZELTILEN KATEGORİLER:');
      console.table(issues);
      console.log(`\n✅ ${updated} kıyafet güncellendi!\n`);
    } else {
      console.log('✅ Tüm kategoriler temiz!\n');
    }

    await mongoose.connection.close();
    console.log('✅ Tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

normalizeCategories();
