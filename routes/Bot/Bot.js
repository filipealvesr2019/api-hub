// routes/faq.js
const express = require('express');
const router = express.Router();
const Bot = require('../../models/Bot/Bot');

router.get('/getALL/bots/:storeID', async (req, res) => {
    const { storeID } = req.params; // Extract adminID from request parameters

    try {
        const bots = await Bot.find({ storeID }); // Use the extracted adminID
        res.status(200).json({
            bots
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter bots.', error }); // Handle errors appropriately
    }
});
router.get('/get/bot/:storeID', async (req, res) => {
    const { storeID } = req.params; // Extract adminID from request parameters

    try {
        const bots = await Bot.findOne({ storeID }); // Use the extracted adminID
        res.status(200).json({
            bots
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter bots.', error }); // Handle errors appropriately
    }
});
// Rota para cadastrar uma nova pergunta e resposta
router.post('/add/bot', async (req, res) => {
    const { storeID, question, answer } = req.body;

    try {
        // Cria um novo documento FAQ com as informações enviadas
        const newBot = new Bot({storeID, question, answer });
        
        // Salva no banco de dados
        await newBot.save();
        
        res.status(201).json({ message: 'bot cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar bot.', error });
    }
});

// Rota para excluir um bot por ID
router.delete("/delete/bot/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedBot = await Bot.findByIdAndDelete(id);
      
      if (!deletedBot) {
        return res.status(404).json({ message: "Bot not found" });
      }
  
      res.status(200).json({ message: "Bot deleted successfully", deletedBot });
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  
module.exports = router;
