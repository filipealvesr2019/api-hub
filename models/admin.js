const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { isEmail } = require("validator");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Digite um email válido!"],
    lowercase: true,
    unique: true,
    validate: [isEmail, "Digite um email válido"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Digite um número de telefone válido!"],
  },
  cep: {
    type: String,
    required: [true, "Digite um CEP válido!"],
  },
  cpf: {
    type: String,
    required: [true, "Digite um CPF válido!"],
  },
  houseNumber: {
    type: String,
    required: [true, "Digite um número da casa válido!"],
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

adminSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION
  });
};

const User = mongoose.model("Admin", adminSchema);

module.exports = User;
