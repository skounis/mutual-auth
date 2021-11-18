const pug = require('pug');
const express = require('express');
const fs = require("fs");
const https = require("https");

const port = process.env.PORT || 8080;

const options = {
  key: fs.readFileSync(`${__dirname}/certs/cs/server-key.pem`),
  cert: fs.readFileSync(`${__dirname}/certs/cs/server-crt.pem`),
  ca: [
    fs.readFileSync(`${__dirname}/certs/cs/client-ca-crt.pem`)
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

app.set('view engine', 'pug');
app.get('/', function (req, res) {
  try {
    res.render('server', { });
  } catch (error) {
    console.log(error);
    res.render('error', { message: error });
  }
});

app.get('/api', function(req,res) {
  res.send('"OK!');
});

app.get('/api/feds', function (req, res) {
  res.end(JSON.stringify(data.federators, null, 2));
})

app.get('/api/crl', function (req, res) {
  res.end(JSON.stringify(data.crl, null, 2));
})

app.get('/api/batches/:id', function (req, res) {
  res.end(JSON.stringify(data.batches[req.params.id], null, 2));
})

https
  .createServer(options, app)
  .listen(port);