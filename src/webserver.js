const express = require('express');
const app = express();

// simple health endpoint
app.get('/', (req, res) => {
  res.send('Bot is running');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Webserver listening on port ${port}`);
});
