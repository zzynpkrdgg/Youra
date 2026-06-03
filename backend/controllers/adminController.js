const User = require('../models/user');
const Clothing = require('../models/clothing');
const Outfit = require('../models/outfit');

function hexToRgb(hex) {
    if (!hex) return null;
    let normalized = hex.toLowerCase().trim();
    if (normalized === 'black') return { r: 0, g: 0, b: 0 };
    if (normalized === 'white') return { r: 255, g: 255, b: 255 };
    if (normalized === 'red') return { r: 255, g: 0, b: 0 };
    if (normalized === 'blue') return { r: 0, g: 0, b: 255 };
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
}

function getClosestColor(hexStr) {
    const rgb = hexToRgb(hexStr);
    if (!rgb) return { name: 'Diğer', hex: '#cccccc' };

    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (l < 18) return { name: 'Siyah', hex: '#111827' };
    if (l > 90) return { name: 'Beyaz', hex: '#f9fafb' };
    if (s < 18) return { name: 'Gri', hex: '#9ca3af' };

    if (h >= 0 && h < 15) return { name: 'Kırmızı', hex: '#ef4444' };
    if (h >= 15 && h < 45) {
        // Distinguish brown and orange by lightness/saturation
        if (l < 50) return { name: 'Kahverengi', hex: '#92400e' };
        return { name: 'Turuncu', hex: '#f97316' };
    }
    if (h >= 45 && h < 70) return { name: 'Sarı', hex: '#eab308' };
    if (h >= 70 && h < 155) return { name: 'Yeşil', hex: '#10b981' };
    if (h >= 155 && h < 195) return { name: 'Turkuaz', hex: '#06b6d4' };
    if (h >= 195 && h < 260) return { name: 'Mavi', hex: '#3b82f6' };
    if (h >= 260 && h < 310) return { name: 'Mor', hex: '#8b5cf6' };
    if (h >= 310 && h < 345) return { name: 'Pembe', hex: '#ec4899' };
    if (h >= 345 && h <= 360) return { name: 'Kırmızı', hex: '#ef4444' };

    return { name: 'Diğer', hex: '#cccccc' };
}

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalClothes = await Clothing.countDocuments();
        const totalOutfits = await Outfit.countDocuments();

        // Get daily user registrations for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyUsers = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { "_id": 1 } }
        ]);

        // Get clothing color distribution
        const clothes = await Clothing.find({}, 'color').lean();
        const colorCounts = {};
        clothes.forEach(item => {
            const toneObj = getClosestColor(item.color);
            if (!colorCounts[toneObj.name]) {
                colorCounts[toneObj.name] = { count: 0, hex: toneObj.hex };
            }
            colorCounts[toneObj.name].count++;
        });
        const colorDistribution = Object.keys(colorCounts).map(name => ({ 
            name, 
            value: colorCounts[name].count,
            fill: colorCounts[name].hex
        }));

        // Get outfit occasion distribution
        const outfits = await Outfit.find({}, 'occasion').lean();
        const occasionCounts = {};
        outfits.forEach(item => {
            const occ = item.occasion || 'Belirtilmemiş';
            occasionCounts[occ] = (occasionCounts[occ] || 0) + 1;
        });
        const occasionDistribution = Object.keys(occasionCounts).map(name => ({ name, value: occasionCounts[name] }));

        // Get 10 most recent users
        const recentUsers = await User.find({}, 'username email createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.status(200).json({
            totalUsers,
            totalClothes,
            totalOutfits,
            dailyUsers,
            colorDistribution,
            occasionDistribution,
            recentUsers
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).json({ message: "Sunucu hatası" });
    }
};

module.exports = {
    getDashboardStats
};
