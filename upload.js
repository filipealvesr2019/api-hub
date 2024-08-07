const multer = require('multer');
const path = require('path');

// Configuração do armazenamento do multer
const storage = multer.memoryStorage(); // Armazena o arquivo em memória

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Filtra apenas arquivos .ai
    const ext = path.extname(file.originalname);
    if (ext !== '.ai') {
      return cb(new Error('Somente arquivos .ai são permitidos'));
    }
    cb(null, true);
  }
});

module.exports = upload;
