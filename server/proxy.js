const dns = require('dns')
const express = require("express")
const proxy = require('http-proxy')
const geoip = require('geoip-lite')
const db = require('./db')

// [TBU: include classification engine; enable https requests;]
const psPort = 3000
const wsPort = 3001
const app = express()
const ps = proxy.createProxyServer()

app.all('/*', (req, res) => {
    let dnsRecord = {
        domain: req.headers.host,
        ip: null,
        malicious: isMalicious(req.headers.host),
        last_req: new Date().toUTCString(),
        longitude: null,
        latitude: null,
        frequency: 1
    }

    console.log('received request:', req.headers.host)
    if (req.headers.host == `localhost:${ wsPort }`) {
        console.log('proxying from ws...', req.url)
        ps.web(req, res, { target: req.url, prependPath: false })
    } else {
        getIp(req.headers.host)
            .then(addrs => {
                if (addrs.length > 0) {
                    dnsRecord.ip = addrs[0]
                }
                // get existing db record if exists
                return db.any('SELECT * FROM requests WHERE domain = $1', req.headers.host)
            })
            .then(result => {
                if (result.length == 0) {
                    let geo = geoip.lookup(dnsRecord.ip)
                    if (geo && geo.ll) {
                        dnsRecord.latitude = geo.ll[0]
                        dnsRecord.longitude = geo.ll[1]
                    }

                    return db.none('INSERT INTO requests (domain, ip, malicious, last_req, longitude, latitude, frequency) \
                        VALUES (${domain}, ${ip}, ${malicious}, ${last_req}, ${longitude}, ${latitude}, ${frequency})', dnsRecord)
                } else {
                    return db.none('UPDATE requests SET frequency = $1 WHERE id = $2', [result[0].frequency + 1, result[0].id])
                }
            })
            .then(() => {
                console.log('dnsRecord:', dnsRecord, 'req url:', req.url)
                if (dnsRecord.malicious) {
                    console.log('redirecting...')
                    res.redirect(`http://localhost:${ wsPort }`)
                } else {
                    console.log('proxying...')
                    ps.web(req, res, { target: req.url, prependPath: false })
                }
            })
            .catch(e => {
                console.error(e)
                console.log('the request:', req.headers, req.url)
                res.sendStatus(500)
            })
    }
})

app.listen(psPort, () => console.log(`proxy server running at http://localhost:${ psPort }`))

function isMalicious(host) {
    // [TBU by classification engine]
    return host == 'ardcontracting.com'
}

function getIp(host) {
    return new Promise((resolve, reject) => {
        dns.resolve4(host, (err, addrs) => err ? reject(err) : resolve(addrs))
    })
}
