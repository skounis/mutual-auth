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
// Load mock data
const rawdata = fs.readFileSync(__dirname + "/data/" + "data.json", 'utf8');
const data = JSON.parse(rawdata);
const app = express();
app.get('/', function(req,res) {
  res.send('"OK!');
});

app.get('/', function (req, res) {
  // fs.readFile( __dirname + "/data/" + "crl.json", 'utf8', function (err, data) {
  //    console.log( data );
  //    res.end( data );
  // });
  res.end(JSON.stringify(data.crl, null, 2));
})

app.get('/feds', function (req, res) {
  res.end(JSON.stringify(data.federators, null, 2));
})

app.get('/crl', function (req, res) {
  res.end(JSON.stringify(data.crl, null, 2));
})


app.get('/batches/:id', function (req, res) {
  res.end(JSON.stringify(data.batches[req.params.id], null, 2));
})


https
  .createServer(options, app)
  .listen(8080);