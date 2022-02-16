const axios = require('axios');

start();

async function start() {
  try {
    const resp = await axios({
      method: 'GET',
      url: 'https://gateway3.watchparty.me/?ip=10.1.0.81/health',
      timeout: 1000,
    });
    console.log(resp);
  } catch (ex) {
    console.log(ex);
  }
}
