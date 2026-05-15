const mongoose = require("mongoose")

const outfitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Clothing"
            }
        ],

        title: {
            type: String,
            required: true
        },

        occasion: {
            type: String,
            default: ""
        },

        aiSuggestion: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Outfit", outfitSchema)