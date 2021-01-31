const express = require('express');
const axios = require('axios');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log(await axios.get('http://localhost:8080/stats'));
});
