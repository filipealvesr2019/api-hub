const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Adicione o ID do cliente do Google

const verifyGoogleToken = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token do Google é obrigatório.' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Adicione o ID do cliente do Google
    });

    const payload = ticket.getPayload();
    req.googleUser = payload; // Adicione as informações do usuário do Google ao request

    next();
  } catch (error) {
    console.error('Erro ao verificar o token do Google:', error);
    res.status(401).json({ success: false, error: 'Token do Google inválido.' });
  }
};

module.exports = { verifyGoogleToken };
