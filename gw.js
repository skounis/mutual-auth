const express = require('express');
const fs = require("fs");
const https = require("https");

const port = process.env.PORT || 8080;

const options = {
  key: fs.readFileSync(`${__dirname}/certs/fed/gw-key.pem`),
  cert: fs.readFileSync(`${__dirname}/certs/fed/gw-crt.pem`),
  ca: [
    fs.readFileSync(`${__dirname}/certs/fed/ca-crt.pem`)
  ],
  // Requesting the client to provide a certificate, to authenticate.
  requestCert: true,
  // As specified as "true", so no unauthenticated traffic
  // will make it to the specified route specified
  rejectUnauthorized: true
};
// Load mock data
const data = JSON.parse(fs.readFileSync(__dirname + "/data/" + "data.json", 'utf8'));
const app = express();
app.get('/', function(req,res) {
  res.send('"OK!');
});

app.get('/feds', function (req, res) {
  res.end(JSON.stringify(data.federators, null, 2));
})

https
  .createServer(options, app)
  .listen(port);