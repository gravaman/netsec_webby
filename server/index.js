const fs = require('fs')
const path = require('path')
const https = require('https')
const express = require('express')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config')
const db = require('./db')

// create ws
const wsPort = 3001
const app = express()
const creds = {
    key: fs.readFileSync('./skynet.com.key', 'utf8'),
    cert: fs.readFileSync('./skynet.com.crt', 'utf8')
}

// HMR
const compiler = webpack(webpackConfig)
app.use(require("webpack-dev-middleware")(compiler, {
    logLevel: 'warn', path: '/__webpack_hmr', publicPath: webpackConfig.output.publicPath
}))
app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
}))

// ws setup and routing
app.use(express.static(path.join(path.normalize(__dirname + '/..'), 'client', 'dist')))

app.get('/requests.json', (req, res) => {
    db.any('SELECT * from requests')
        .then(data => {
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(data))
        })
        .catch(err => {
            console.error('error:', err)
            res.send(500)
        })
})
app.get('/', (req, res) => res.send('skynet reporting for duty'))

https.createServer(creds, app)
        .listen(wsPort, () => console.log(`web server running at https://localhost:${ wsPort }`))
