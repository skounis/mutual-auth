const pug = require('pug');
const express = require('express');
const fs = require("fs");
const https = require("https");
const axios = require('axios');

const port = process.env.PORT || 8089;

// Capture arguments
const args = process.argv.slice(2);
const input = JSON.parse(fs.readFileSync(__dirname + "/input/" + args[0] + '.json', 'utf8'));

// Server options
const options = {
  key: fs.readFileSync(`${__dirname}/${input.key}`),
  cert: fs.readFileSync(`${__dirname}/${input.cert}`),
  // Enable client authentication
  // ca: [
  //   fs.readFileSync(`${__dirname}/${input.ca}`)
  // ],
  // Requesting the client to provide a certificate, to authenticate.
  // requestCert: true,
  // As specified as "true", so no unauthenticated traffic
  // will make it to the specified route specified
  // rejectUnauthorized: true
};

const httpsAgent = new https.Agent({
  key: fs.readFileSync(`${__dirname}/${input.key}`),
  cert: fs.readFileSync(`${__dirname}/${input.cert}`),
  ca: fs.readFileSync(`${__dirname}/${input.ca}`),
  port: input.port,
  secureProtocol: "TLSv1_2_method",
});

const app = express();
app.set('view engine', 'pug');
app.get('/', async function (req, res) {
  try {
    // Query the GW for getting the nodes.
    const result = await axios.get('https://gw.ma.appseed.io:8080/feds', { httpsAgent });
    res.render('home', { title: input.name, nodes: result.data });
  } catch (error) {
    console.log(error);
    res.render('error', { message: error });
  }
});

https
  .createServer(options, app)
  .listen(port);
