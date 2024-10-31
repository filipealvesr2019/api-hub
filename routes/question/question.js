const express = require("express");
const router = express.Router();
const Question = require('../../models/question/question');
const axios = require('axios'); // Importando o axios
const apiToken = process.env.LLAMA_TOKEN;

// Função para carregar LlamaAI dinamicamente
async function loadLlamaAI() {
    const { default: LlamaAI } = await import('llamaai');
    return new LlamaAI(apiToken);
}

// Rota para obter todas as perguntas e respostas
router.get("/questions", async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para adicionar uma nova pergunta e resposta
router.post("/add/question", async (req, res) => {
    const { question, answer } = req.body;
    const newQuestion = new Question({ question, answer });

    try {
        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Função para enviar a pergunta para a LlamaAI
async function sendToLlama(question) {
    const llamaAPI = await loadLlamaAI();
    // Caso o método para enviar perguntas esteja diretamente no objeto exportado
    const response = await llamaAPI.default(question); // Use `default` se `llamaai` exportar uma função padrão
    return response;
}

// Rota para comparar perguntas
// Rota para comparar perguntas
router.post('/compare', async (req, res) => {
    const { userQuestion } = req.body;

    try {
        // Busque perguntas no banco de dados
        const questions = await Question.find();
        let foundMatch = false;

        for (const q of questions) {
            // Estrutura da requisição de acordo com a documentação
            const response = await axios.post('https://api.llama-api.com/chat/completions', {
                messages: [
                    { role: "user", content: `Comparar: "${userQuestion}" e "${q.question}". Eles têm significados iguais?` }
                ],
                functions: [
                    {
                        name: "get_current_weather", // Ou o nome da função que você quer usar
                        description: "Get the current weather in a given location",
                        parameters: {
                            type: "object",
                            properties: {
                                location: { type: "string", description: "The city and state, e.g. San Francisco, CA" },
                                days: { type: "number", description: "for how many days ahead you wants the forecast" },
                                unit: { type: "string", enum: ["celsius", "fahrenheit"] },
                            },
                        },
                        required: ["location", "days"],
                    }
                ],
                stream: false,
                function_call: "get_current_weather", // Ajuste se necessário
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiToken}` // Adiciona o token de autenticação
                }
            });

            // Verifique se a resposta tem a propriedade `match` ou outra que você precise
            // Isso vai depender da estrutura real da resposta da API
            if (response.data.match) { // Supondo que a resposta tenha uma propriedade `match`
                foundMatch = true;
                return res.json({ message: 'Pergunta encontrada!', answer: q.answer });
            }
        }

        if (!foundMatch) {
            return res.json({ message: 'Nenhuma pergunta semelhante encontrada.' });
        }
    } catch (error) {
        console.error(error); // Log do erro para depuração
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
