const path = require('path')
const express = require('express')
const webpack = require('webpack')
const webpackConfig = require('../webpack.config')
const db = require('./db')

// express
const app = express()
const port = 3000

// HMR
const compiler = webpack(webpackConfig)
app.use(require("webpack-dev-middleware")(compiler, {
    logLevel: 'warn', path: '/__webpack_hmr', publicPath: webpackConfig.output.publicPath
}))
app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
}))

// server
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
app.listen(port, () => console.log(`skynet running at http://localhost:${ port }`))
