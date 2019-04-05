// main security visual
buildMap()

// d3 helpers
function buildMap() {
    let svg = d3.select("#security-chart")
                    .append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .attr("viewBox", `0 0 900 500`)
                        .attr("preserveAspectRatio", "xMinYMin meet")

    pullData().then(function(data) {
        [worldMap, dnsAll, dnsLocal] = data
        console.log("worldMap:", worldMap)
        console.log("dnsAll:", dnsAll)
        console.log("dnsLocal:", dnsLocal)

        // plot data
        let projection = d3.geoMercator()
                            .fitSize([parseFloat(svg.style("width")), parseFloat(svg.style("height"))], worldMap)
        let worldpath = d3.geoPath(projection)

        svg.selectAll("path")
                .data(worldMap.features)
                .enter().append("path")
                    .attr("class", "world")
                    .attr("d", worldpath)

        svg.selectAll("circle")
            .data(dnsAll)
            .enter().append("circle")
                .attr("class", "ipaddr")
                .attr("r", 2)
                .attr("cx", d => projection([d.longitude, d.latitude])[0])
                .attr("cy", d => projection([d.longitude, d.latitude])[1])
                .attr("stroke", d => d.malicious ? "#FF6347" : "#90EE90")
                .attr("stroke-width", d => d.malicious ? 5 : 2)
    })
}

function pullData(){
    let paths = {
        worldMap: 'world-countries.json',
        dnsAll: 'dns_records_all.csv',
        dnsLocal: 'dns_records_local.csv'
    }

    function pullMap(path) {
        return d3.json(path)
    }

    function pullDns(path) {
        return d3.csv(path, function(record) {
            return {
                ip: record.ip,
                domain: record.domain,
                malicious: (record.malicious == 'true'),
                longitude: parseFloat(record.longitude),
                latitude: parseFloat(record.latitude)
            }
        })
    }

    return Promise.all([pullMap(paths.worldMap), pullDns(paths.dnsAll), pullDns(paths.dnsLocal)])
}

// HMR
if (module.hot) {
    module.hot.accept()
}
