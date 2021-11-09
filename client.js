const fs = require("fs");
const https = require("https");
const message = { msg: "Hello!" };

const req = https.request(
  {
    host: "server.ma.appseed.io",
    port: 8080,
    secureProtocol: "TLSv1_2_method",
    key: fs.readFileSync(`${__dirname}/certs/client-key.pem`),
    cert: fs.readFileSync(`${__dirname}/certs/client-crt.pem`),
    ca: [
      fs.readFileSync(`${__dirname}/certs/server-ca-crt.pem`)
    ],
    path: "/",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(JSON.stringify(message))
    }
  },
  function(response) {
    console.log("Response statusCode: ", response.statusCode);
    console.log("Response headers: ", response.headers);
    console.log(
      "Server Host Name: " + response.connection.getPeerCertificate().subject.CN
    );
    if (response.statusCode !== 200) {
      console.log(`Wrong status code`);
      return;
    }
    let rawData = "";
    response.on("data", function(data) {
      rawData += data;
    });
    response.on("end", function() {
      if (rawData.length > 0) {
        console.log(`Received message: ${rawData}`);
      }
      console.log(`TLS Connection closed!`);
      req.end();
      return;
    });
  }
);
req.on("socket", function(socket) {
  socket.on("secureConnect", function() {
    if (socket.authorized === false) {
      console.log(`SOCKET AUTH FAILED ${socket.authorizationError}`);
    }
    console.log("TLS Connection established successfully!");
  });
  socket.setTimeout(10000);
  socket.on("timeout", function() {
    console.log("TLS Socket Timeout!");
    req.end();
    return;
  });
});
req.on("error", function(err) {
  console.log(`TLS Socket ERROR (${err})`);
  req.end();
  return;
});
req.write(JSON.stringify(message));
