require('dotenv').config();
const { ClerkExpressRequireAuth } = require ('@clerk/clerk-sdk-node')
const express  = require ('express');
const cors = require('cors'); // Importando o módulo cors

const bodyParser = require('body-parser');
const port = process.env.PORT || 3003;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const passport = require('passport');

const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const superAdmin = require('./routes/superAdmin');

const admin = require('./routes/admin');


const Ecommerce = require('./routes/Ecommerce');
const Customer = require('./routes/Customer');
const Monthly = require('./routes/subscriptions/basic/monthly');
const User = require('./routes/User');
const Product = require('./routes/Product');



const File = require('./models/File'); // Assumindo que o modelo está em models/file.js
const upload = require('./upload'); // Assu
const question = require('./routes/question/question'); // Assu
const Bot = require('./routes/Bot/Bot'); // Importe a rota de FAQ


app.use(bodyParser.json());
app.use(cookieParser());
// Configurações e middlewares
app.use(cors({ origin: "*"}));
// app.use(cors({
//   origin: ['http://localhost:5003', 'http://localhost:5004'],
//   credentials: true
// }));
// Use the strict middleware that raises an error when unauthenticated
app.get(
  '/protected-endpoint',
  ClerkExpressRequireAuth({
    // Add options here
    // See the Middleware options section for more details
  }),
  (req, res) => {
    res.send('vc esta autorisado')
    res.json(req.auth);
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});


app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo enviado.');
    }

    // Cria um novo documento com o arquivo
    const newFile = new File({
      filename: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype
    });

    // Salva o arquivo no banco de dados
    await newFile.save();
    res.status(200).send('Arquivo enviado e salvo com sucesso.');
  } catch (err) {
    res.status(500).send('Erro ao salvar o arquivo.');
  }
});


// Rota para baixar o arquivo
app.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).send('Arquivo não encontrado');
    }

    // Definir o tipo de conteúdo e o nome do arquivo
    res.setHeader('Content-disposition', 'attachment; filename=' + file.filename);
    res.setHeader('Content-type', file.contentType);

    // Enviar o arquivo
    res.send(file.data);
  } catch (error) {
    res.status(500).send('Erro ao baixar o arquivo');
  }
});





app.use('/api', superAdmin);
app.use('/api', admin);
app.use('/api', Ecommerce);
app.use('/api', Customer);
app.use('/api', Monthly);
// Acesso à variável de ambiente MONGODB_URI do arquivo .env
app.use('/api', User);
app.use('/api', Product);
app.use('/api', question);
app.use('/api', Bot);


// Definindo um esquema e modelo para suas perguntas e respostas
const perguntaSchema = new mongoose.Schema({
  pergunta: String,
  resposta: String,
});

const Pergunta = mongoose.model('Pergunta', perguntaSchema);

// Rota para buscar respostas
app.post('/responder', async (req, res) => {
  const { pergunta } = req.body;
  const resposta = await Pergunta.findOne({ pergunta: new RegExp(pergunta, 'i') });
  
  if (resposta) {
    res.json({ resposta: resposta.resposta });
  } else {
    res.json({ resposta: "Desculpe, não consegui entender sua pergunta." });
  }
});

const uri = process.env.MONGODB_URI;


const options = {
  serverSelectionTimeoutMS: 30000, // 30 segundos
  socketTimeoutMS: 30000 // 30 segundos
};
// Conexão com o banco de dados
mongoose.connect(uri,  options).then(() => {
  console.log('Conectado ao banco de dados');
}).catch((error) => {
  console.error('Erro de conexão com o banco de dados:', error);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});