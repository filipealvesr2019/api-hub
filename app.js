require('dotenv').config(); // Load environment variables
const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const port = process.env.PORT || 3000;
const app = express();

// Configure Clerk middleware with secret key
app.use(ClerkExpressRequireAuth({
  // Options if needed
}));

// Use the strict middleware that raises an error when unauthenticated
app.get(
  '/protected-endpoint',
  (req, res) => {
    res.json(req.auth);
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
