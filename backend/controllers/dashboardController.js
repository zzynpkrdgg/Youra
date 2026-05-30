const User = require('../models/user');
const Clothing = require('../models/clothing');
const Outfit = require('../models/outfit');

const getAdminDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalClothes = await Clothing.countDocuments();
        const totalOutfits = await Outfit.countDocuments();

        const recentUsers = await User.find().select('username email createdAt').sort({ createdAt: -1 }).limit(5);

        // Aggregate clothes by category
        const categoriesDist = await Clothing.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        const categories = categoriesDist.map(c => ({ name: c._id || 'Belirtilmemiş', value: c.count }));

        // Aggregate clothes by color
        const colorDist = await Clothing.aggregate([
            { $group: { _id: "$color", count: { $sum: 1 } } }
        ]);

        // Helper to map any hex/string to generic color category
        const hexToRgb = (hex) => {
            if (!hex) return null;
            if (hex === 'black') return { r: 0, g: 0, b: 0 };
            if (hex === 'white') return { r: 255, g: 255, b: 255 };
            if (hex === 'gray') return { r: 128, g: 128, b: 128 };
            let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
        };

        const colorCategories = {
            'Siyah Tonları': { ...hexToRgb('#1f2937'), hex: '#1f2937' },
            'Beyaz Tonları': { ...hexToRgb('#ffffff'), hex: '#ffffff' },
            'Gri Tonları': { ...hexToRgb('#6b7280'), hex: '#6b7280' },
            'Kırmızı Tonları': { ...hexToRgb('#ef4444'), hex: '#ef4444' },
            'Yeşil Tonları': { ...hexToRgb('#10b981'), hex: '#10b981' },
            'Mavi Tonları': { ...hexToRgb('#3b82f6'), hex: '#3b82f6' },
            'Sarı Tonları': { ...hexToRgb('#f59e0b'), hex: '#f59e0b' },
            'Turuncu Tonları': { ...hexToRgb('#f97316'), hex: '#f97316' },
            'Mor Tonları': { ...hexToRgb('#8b5cf6'), hex: '#8b5cf6' },
            'Pembe Tonları': { ...hexToRgb('#ec4899'), hex: '#ec4899' },
            'Turkuaz Tonları': { ...hexToRgb('#06b6d4'), hex: '#06b6d4' }
        };

        const getNearestCategory = (hex) => {
            const rgb = hexToRgb(hex);
            if (!rgb) return { name: 'Diğer', hex: '#cccccc' };
            let minDistance = Infinity;
            let closest = 'Diğer';
            let closestHex = '#cccccc';
            for (const [name, color] of Object.entries(colorCategories)) {
                const distance = Math.sqrt(Math.pow(rgb.r - color.r, 2) + Math.pow(rgb.g - color.g, 2) + Math.pow(rgb.b - color.b, 2));
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = name;
                    closestHex = color.hex;
                }
            }
            return { name: closest, hex: closestHex };
        };

        const groupedColorsMap = {};
        for (const c of colorDist) {
            const cat = getNearestCategory(c._id);
            if (!groupedColorsMap[cat.name]) groupedColorsMap[cat.name] = { value: 0, hex: cat.hex };
            groupedColorsMap[cat.name].value += c.count;
        }

        const colors = Object.keys(groupedColorsMap).map(name => ({
            name,
            value: groupedColorsMap[name].value,
            hex: groupedColorsMap[name].hex
        }));

        res.status(200).json({
            stats: { totalUsers, totalClothes, totalOutfits },
            charts: { categories, colors },
            recentUsers
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Dashboard verileri alınamadı" });
    }
}

module.exports = {
    getAdminDashboardStats
}
