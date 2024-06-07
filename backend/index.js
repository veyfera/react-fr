import { WebSocketServer } from "ws";
import { createServer } from "node:http";

const hostname = "127.0.0.1";
const port = 8080;

const MAX_MSG_LEN = 9;
const messages = [];

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "POST") {
    let body = [];
    req
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        body = Buffer.concat(body).toString();
        console.log("new message: ", body);
        messages.push(body);
        gWs.send(JSON.stringify({msg: body}));
      });
    if (messages.length >= MAX_MSG_LEN) {
      messages.shift();
      gWs.send(JSON.stringify({cmd: "remove"}));
    }
    console.log(messages);
    res.end("ok");
  } else {
    res.end(JSON.stringify(messages));
  }
});

const wss = new WebSocketServer({ server });
let gWs;

wss.on("connection", function connection(ws) {
  gWs = ws;
  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received %s", data);
  });

  ws.on("send", function send(msg) {
    ws.send(msg);
  });

  //ws.send('something');
  console.log("new ws connection");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

