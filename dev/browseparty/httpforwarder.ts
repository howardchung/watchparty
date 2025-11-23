const http = require('http');
const net = require('net');
const port = 5902;

const client = new net.Socket();
const server = http.createServer((req, res) => {
  console.log(req.url);
  res.setHeader('Content-Type', 'audio/ogg');
  client.connect(5901, 'localhost');
  client.pipe(res);
});

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});
