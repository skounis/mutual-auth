
# SSL Mutual Auth with Node
SSL mutual authentication example with NodeJS.

## Certificates
All the certificates are create with the same pass phrase: `phrase`

### Domains

* ma.appseed.io
* server.ma.appseed.io
* ma2.appseed.io
* client.ma2.appseed.io

### Export in `.p12` 
```
openssl pkcs12 -export -out client-key.p12 -inkey client-key.pem -in client-crt.pem
```

## References
* https://www.matteomattei.com/client-and-server-ssl-mutual-authentication-with-nodejs/
* https://stackoverflow.com/questions/21141215/creating-a-p12-file
* https://www.ssl.com/how-to/configuring-client-authentication-certificates-in-web-browsers/
