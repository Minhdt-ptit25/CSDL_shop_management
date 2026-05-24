require('dotenv/config');
const { createApp } = require('./app');

const port = process.env.PORT || 8000;
const app = createApp();

app.listen(port, '0.0.0.0', () => {
  console.log(`Express server running on http://localhost:${port}`);
});