const mongoose = require("mongoose")

const clothingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        image: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        color: {
            type: String,
            required: true
        },

        style: {
            type: String,
            required: true
        },

        season: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["available", "dirty"],
            default: "available"
}
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Clothing", clothingSchema)