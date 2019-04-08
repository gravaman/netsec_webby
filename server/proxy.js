const http = require("http")
const dns = require('dns')
const url = require("url")
const net = require('net')
const httpProxy = require("http-proxy")
const geoip = require('geoip-lite')
const db = require('./db')

const proxyPort = 8080
const proxySslPort = 8443
const defaultssl = 443
const wsPort = 3001

let proxy = httpProxy.createProxyServer({})
proxy.on("error", function (err, req, res) {
  console.log("proxy error", err)
  res.end()
})

let server = http.createServer(function (req, res) {
  let urlObj = url.parse(req.url)
  let target = urlObj.protocol + "//" + urlObj.host
  console.log("Proxy HTTP request for:", target)

  let dnsRecord = {
      domain: urlObj.host,
      ip: null,
      malicious: isMalicious(urlObj.host),
      last_req: new Date().toUTCString(),
      longitude: null,
      latitude: null,
      frequency: 1
  }

  getIp(urlObj.host)
      .then(addrs => {
          if (addrs.length > 0) {
              dnsRecord.ip = addrs[0]
          }
          // get existing db record if exists
          return db.any('SELECT * FROM requests WHERE domain = $1', urlObj.host)
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
          if (dnsRecord.malicious) {
              res.writeHead(302, { 'Location': `https://localhost:${ wsPort }` })
              res.end()
          } else {
              proxy.web(req, res, { target: target, prependPath: false })
          }
      })
      .catch(e => {
          console.error(e)
          res.end()
      })
}).listen(proxyPort, () => console.log(`listening on ${ proxyPort }`))

server.addListener('connect', function (req, socket, bodyhead) {
  const hostPort = getHostPortFromString(req.url, defaultssl)
  let hostDomain = hostPort[0]
  let port = parseInt(hostPort[1])
  console.log("Proxying HTTPS request for:", hostDomain, port, req.headers, bodyhead)

  let dnsRecord = {
      domain: hostDomain,
      ip: null,
      malicious: isMalicious(hostDomain),
      last_req: new Date().toUTCString(),
      longitude: null,
      latitude: null,
      frequency: 1
  }

  let proxySocket = new net.Socket()

  proxySocket.on('data', chunk => socket.write(chunk))
                .on('end', () => socket.end())
                .on('error', () => {
                    socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n")
                    socket.end()
                })

  socket.on('data', chunk => proxySocket.write(chunk))
        .on('end', () => proxySocket.end())
        .on('error', () => proxySocket.end())

  getIp(hostDomain)
      .then(addrs => {
          if (addrs.length > 0) {
              dnsRecord.ip = addrs[0]
          }
          // get existing db record if exists
          return db.any('SELECT * FROM requests WHERE domain = $1', hostDomain)
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
          if (isMalicious(hostDomain)) {
              port = wsPort
              hostDomain = 'localhost'
          }

          proxySocket.connect(port, hostDomain, function () {
              proxySocket.write(bodyhead);
              socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n")
            }
          )
      })
      .catch(e => {
          console.error(e)
          socket.end()
      })
})

function isMalicious(host) {
    console.log('checking host:', host)
    // [TBU by classification engine]
    return host == 'ardcontracting.com' || host == 'www.hgvoracapital.com'
}

function getIp(host) {
    return new Promise((resolve, reject) => {
        dns.resolve4(host, (err, addrs) => err ? reject(err) : resolve(addrs))
    })
}

function getHostPortFromString(hostString, defaultPort) {
    const regex_hostport = /^([^:]+)(:([0-9]+))?$/
    let host = hostString
    let port = defaultPort
    let result = regex_hostport.exec(hostString)

    if (result != null) {
        host = result[1]
        if (result[2] != null) {
            port = result[3]
        }
    }

    return ([host, port])
}
