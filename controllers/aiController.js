// controllers/aiController.js
const tf = require('@tensorflow/tfjs-node');
const Bot = require('../models/FAQ');

// Função para treinar o modelo
async function trainModel() {
    const bots = await Bot.find(); // Recupera todos os bots do banco de dados

    // Prepare os dados
    const questions = bots.map(bot => bot.question);
    const answers = bots.map(bot => bot.answer);

    // Tokenização simples e criação de vetores
    const questionTensor = tf.tensor2d(questions.map(q => q.split(' ').map(word => word.length))); // Exemplo simples
    const answerTensor = tf.tensor2d(answers.map(a => a.split(' ').map(word => word.length))); // Exemplo simples

    // Definindo o modelo
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [questionTensor.shape[1]] }));
    model.add(tf.layers.dense({ units: answers.length, activation: 'softmax' }));

    model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });

    // Treina o modelo
    await model.fit(questionTensor, answerTensor, { epochs: 100 });

    return model;
}

// Função para prever a resposta
async function predictAnswer(model, question) {
    const questionTensor = tf.tensor2d([question.split(' ').map(word => word.length)]); // Tokenização simples

    const prediction = model.predict(questionTensor);
    const predictedIndex = prediction.argMax(-1).dataSync()[0];

    return predictedIndex; // Retorna o índice da resposta
}

// Função para iniciar o treinamento e prever uma resposta
exports.handleQuestion = async (req, res) => {
    const { question } = req.body;

    try {
        const model = await trainModel(); // Treina o modelo com os dados do MongoDB
        const predictedIndex = await predictAnswer(model, question);

        const bots = await Bot.find(); // Obtemos novamente para pegar as respostas
        const answer = bots[predictedIndex].answer; // Retorna a resposta correspondente

        res.status(200).json({ answer });
    } catch (error) {
        console.error("Erro ao processar a pergunta:", error);
        res.status(500).json({ message: "Erro no processamento da pergunta." });
    }
};
