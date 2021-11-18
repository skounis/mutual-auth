
# SSL Mutual Auth with Node
SSL mutual authentication example with NodeJS.

## Client / Server

Test it online: 

1. [Download the client certification in `.p12` format](https://github.com/skounis/mutual-auth/raw/main/certs/cs/client-key.p12)
2. Imprort the [`.p12`](https://github.com/skounis/mutual-auth/raw/main/certs/cs/client-key.p12) certification in your browser
   passkey: `phrase` 
   see: https://computersluggish.com/windows-tutorials/software-apps/how-to-add-a-certificate-in-microsoft-edge/
3. Visit https://server.ma.appseed.io:8090/

### Local Development Instructions
Configure the domain names:
```
sudo echo '127.0.0.1 server.ma.appseed.io' >> /etc/hosts
```

Start the server:
```
npm run server
``` 


Query the server - curl
```
curl -v -s -k --key certs/cs/client-key.pem --cert certs/cs/client-crt.pem https://server.ma.appseed.io:8080
```

Query the server - node
```
npm run client
```

### Certificates
All the certificates are create with the same pass phrase: `phrase`

### Domains
* ma.appseed.io
* server.ma.appseed.io
* ma2.appseed.io
* client.ma2.appseed.io

## Federated Nodes with a Gateway
Configure the domain names:
```
echo '127.0.0.1 gw.ma.appseed.io' >> /etc/hosts
echo '127.0.0.1 n1.ma.appseed.io' >> /etc/hosts
echo '127.0.0.1 n2.ma.appseed.io' >> /etc/hosts
```
or with sudo
```
sudo sh -c "echo '127.0.0.1 gw.ma.appseed.io' >> /etc/hosts"
sudo sh -c "echo '127.0.0.1 n1.ma.appseed.io' >> /etc/hosts"
sudo sh -c "echo '127.0.0.1 n2.ma.appseed.io' >> /etc/hosts"
```

Start the server:
```
npm run gw
```

Query the gateway as node 1 and node 2 - curl
```
curl -v -s -k --key certs/fed/n1-key.pem --cert certs/fed/n1-crt.pem https://gw.ma.appseed.io:8080
curl -v -s -k --key certs/fed/n2-key.pem --cert certs/fed/n2-crt.pem https://gw.ma.appseed.io:8080
```

Query the gateway - nodejs
```
npm run n1
npm run n2
```


### Create the Certificates
#### Gateway 
Create Certification Authority (CA) - `ma.appseed.io`
```
openssl genrsa -out ca-key.pem 4096
openssl req -new -x509 -days 365 -key ca-key.pem -out ca-crt.pem

openssl x509 --in ca-crt.pem -text --noout
```

Create certificates - `gw.ma.appseed.io`
```
openssl genrsa -out gw-key.pem 4096
openssl req -new -sha256 -key gw-key.pem -out gw-csr.pem
openssl x509 -req -days 365 -in gw-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out gw-crt.pem

openssl x509 --in gw-crt.pem -text --noout
```
Verify the certificate
```
openssl verify -CAfile ca-crt.pem gw-crt.pem
```

#### Federated Nodes 
We prepare keys/certificates for two nodes `n1` and `n2`.

> The gw would just sign the CSR and return the certificate to the user.

Create certificates
```
openssl genrsa -out n1-key.pem 4096
openssl req -new -sha256 -key n1-key.pem -out n1-csr.pem
openssl x509 -req -days 365 -in n1-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out n1-crt.pem

openssl genrsa -out n2-key.pem 4096
openssl req -new -sha256 -key n2-key.pem -out n2-csr.pem
openssl x509 -req -days 365 -in n2-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out n2-crt.pem

openssl x509 --in n1-crt.pem -text --noout
openssl x509 --in n2-crt.pem -text --noout
```

Verify the certificates
```
openssl verify -CAfile ca-crt.pem n1-crt.pem
openssl verify -CAfile ca-crt.pem n2-crt.pem
```

## Export in `.p12` 
Export a certificate in `.p12` for importing in a browser, e.g. Firefox.
```
openssl pkcs12 -export -out client-key.p12 -inkey client-key.pem -in client-crt.pem
```
Check 
*  https://www.ssl.com/how-to/configuring-client-authentication-certificates-in-web-browsers/


## Deploy
Start the GW and two Nodes as services: 
```
pm2 start npm --name ma -- run gw
pm2 start npm --name ma -- run n2
pm2 start npm --name ma -- run n2
```

## References
* https://www.matteomattei.com/client-and-server-ssl-mutual-authentication-with-nodejs/
* https://stackoverflow.com/questions/21141215/creating-a-p12-file
* https://www.ssl.com/how-to/configuring-client-authentication-certificates-in-web-browsers/
* https://intown.biz/2016/11/22/node-client-auth/
* https://codeburst.io/mutual-tls-authentication-mtls-de-mystified-11fa2a52e9cf

### Mutual TLS Authentication
* NGINX: https://www.javacodegeeks.com/2016/03/set-mutual-tls-authentication.html
