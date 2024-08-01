const mongoose = require('mongoose');

const EcommerceSchema = new mongoose.Schema({
  clienteId: mongoose.Schema.Types.ObjectId,
 
  layout: { type: String, required: true }, // 'layout1', 'layout2', etc.

  theme: {
    header: {
      backgroundColor: {type: String, default:"#0088CC"},
      color:  { type: String, default: "#ffffff" }, 
      
    },
    footer: {
      backgroundColor: {type: String, default:"#ffffff"},

      color:  { type: String, default: "#222529" }, 

     
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
