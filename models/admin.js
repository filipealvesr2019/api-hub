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
  password: {
    type: String,
    required: [true, "Digite uma senha"],
    minLength: [10, "Digite uma senha de no mínimo 10 caracteres"],
    select: false,
    validate: {
      validator: function (value) {
        // Verifica se a senha contém pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial
        return /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value);
      },
      message: "A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.",
    },
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
});

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION
  });
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
