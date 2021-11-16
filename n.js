const pug = require('pug');
const express = require('express');
const fs = require("fs");
const https = require("https");
const axios = require('axios');

const port = process.env.PORT || 8089;

// Capture arguments
const args = process.argv.slice(2);
const input = JSON.parse(fs.readFileSync(__dirname + "/input/" + args[0] + '.json', 'utf8'));

// Load mock data
const data = JSON.parse(fs.readFileSync(__dirname + "/data/" + input.data, 'utf8'));

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
  // port: input.port,
  secureProtocol: "TLSv1_2_method",
});

/**
 * 
 * @param {*} data 
 * @returns 
 */
 function encode(data) {
  const buff = new Buffer(data);
  return buff.toString('base64');
}

/**
 * 
 * @param {*} data 
 * @returns 
 */
function decode(data) {
  const buff = new Buffer(data, 'base64');
  return text = buff.toString('ascii');
}

const app = express();
app.set('view engine', 'pug');
app.get('/', async function (req, res) {
  try {
    //
    // Query the GW. Get all the nodes.
    //
    const result = await axios.get('https://gw.ma.appseed.io:8080/feds', { httpsAgent });
    for (let node of result.data) {
      const url = node.url + '/api/crl';
      const nodedata = await axios.get(url, { httpsAgent });
      console.log(nodedata);
    }
    //
    // Query the nodes. Get all the batches
    //
    // https://futurestud.io/tutorials/node-js-how-to-run-an-asynchronous-function-in-array-map
    let crl = result.data.map(async function(node){
      const response = await axios.get(node.url + '/api/crl', { httpsAgent });
      return {
        reference: node.url,
        crl: response.data,
      }      
    })
    // wait until all promises resolve
    crl = await Promise.all(crl)

    res.render('home', { title: input.name, nodes: result.data, crl: crl , encode: encode});
  } catch (error) {
    console.log(error);
    res.render('error', { message: error });
  }
});

app.get('/batches/:endpoint/:id', async function (req, res) {
  const endpoint = decode(req.params.endpoint);
  const id = req.params.id;
  const result = await axios.get(endpoint + '/api/batches/' + id, { httpsAgent });
  res.end(JSON.stringify(result.data, null, 2));
})

app.get('/api/crl', function (req, res) {
  res.end(JSON.stringify(data.crl, null, 2));
})
app.get('/api/batches', function (req, res) {
  res.end(JSON.stringify(data.batches, null, 2));
})
app.get('/api/batches/:id', function (req, res) {
  res.end(JSON.stringify(data.batches[req.params.id], null, 2));
})

https
  .createServer(options, app)
  .listen(port);
