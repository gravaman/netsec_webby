# netsec_webby

## install and startup
* download/install [nvm](https://github.com/creationix/nvm)
* use nvm to install latest version of node `nvm install node`
* install dependencies with `npm install`
* enable https for webserver by creating key (skynet.com.key) and cert (skynet.com.crt) with openssl
* launch web server from project directory with `npm start`
* launch proxy server from project directory with `node server/proxy.js`
* use firefox browser and manually set proxy configuration to localhost:8080 for all protocols
* visit the interweb
