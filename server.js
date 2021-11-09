const express = require('express');
const fs = require("fs");
const https = require("https");

const options = {
  key: fs.readFileSync(`${__dirname}/certs/server-key.pem`),
  cert: fs.readFileSync(`${__dirname}/certs/server-crt.pem`),
  ca: [
    fs.readFileSync(`${__dirname}/certs/client-ca-crt.pem`)
  ],
  // Requesting the client to provide a certificate, to authenticate.
  requestCert: true,
  // As specified as "true", so no unauthenticated traffic
  // will make it to the specified route specified
  rejectUnauthorized: true
};

const app = express();
app.get('/', function(req,res) {
  res.send('"OK!');
});

https
  .createServer(options, app)
  .listen(8080);