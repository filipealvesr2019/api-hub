const mongoose = require('mongoose');

const EcommerceSchema = new mongoose.Schema({
  clienteId: mongoose.Schema.Types.ObjectId,
  theme: {
    header: {
      backgroundColor: {type: String, default:"#2a2d34"},
      color:  { type: String, default: "#ffffff" }, 
    },
    footer: {
      backgroundColor: String,
      color: String,
    },
    main: {
      backgroundColor: String,
      color: String,
    },
  },
  dominio: { type: String, default: null },
  porta: { type: Number, default: null },
});

module.exports = mongoose.model('Ecommerce', EcommerceSchema);
