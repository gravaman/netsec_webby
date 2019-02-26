const path = require('path')

// HMR
const webpack = require('webpack')
const webpackConfig = require('../webpack.config')
const compiler = webpack(webpackConfig)

// express
const express = require('express')
const app = express()
const port = 3000

// HMR
app.use(require("webpack-dev-middleware")(compiler, {
    logLevel: 'warn', path: '/__webpack_hmr', publicPath: webpackConfig.output.publicPath
}))
app.use(require('webpack-hot-middleware')(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
}))

// express server
app.use(express.static(path.join(path.normalize(__dirname + '/..'), 'client', 'dist')))
app.get('/', (req, res) => res.send('skynet reporting for duty'))
app.listen(port, () => console.log(`skynet running at http://localhost:${ port }`))
