const express = require("express")
const proxy = require('http-proxy')

// [TBU: include classification engine; enable https requests]
const psPort = 3000
const wsPort = 3001
const app = express()
const ps = proxy.createProxyServer()

app.all('/*', (req, res) => {
    // classify request
    if (isMalicious(req.headers.host)) {
        // malicious requests redirected web server
        res.redirect(`http://localhost:${ wsPort }`)
    } else {
        // safe requests proxied
        ps.web(req, res, {
            target: req.url,
            prependPath: false,
        })
    }
})

app.listen(psPort, () => console.log(`proxy server running at http://localhost:${ psPort }`))

function isMalicious(host) {
    // [TBU by classification engine]
    return host == 'ardcontracting.com'
}
