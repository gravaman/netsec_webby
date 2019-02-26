const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: [
        'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
        './client/src/index.js'
    ],
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        path: path.join(__dirname, 'client', 'dist'),
        publicPath: '/',
        filename: 'bundle.js',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
}
