import http from 'node:http';
import net from 'node:net';

const port = 5902;

const client = new net.Socket();
const server = http.createServer((req, res) => {
  console.log(req.url);
  res.setHeader('Content-Type', 'audio/ogg');
  client.connect(5901, 'localhost');
  client.pipe(res);
});

server.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
