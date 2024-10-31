// models/FAQ.js
const mongoose = require("mongoose");

const botSchema = new mongoose.Schema({
  storeID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ecommerce", // Refere-se ao modelo Admin, conectando com o administrador
  },
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

module.exports = mongoose.model("Bot", botSchema);
