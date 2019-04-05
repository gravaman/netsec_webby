// main security visual
buildMap()

// d3 helpers
function buildMap() {
    let svg = d3.select("#security-chart")
                    .append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%")
                        .attr("viewBox", `0 0 1000 700`)
                        .attr("preserveAspectRatio", "xMinYMin meet")

    pullData().then(function(data) {
        [worldMap, dnsAll, dnsLocal] = data
        console.log("worldMap:", worldMap)
        console.log("dnsAll:", dnsAll)
        console.log("dnsLocal:", dnsLocal)

        // prep data
        let scales = {
            circleR: d3.scaleLinear()
                    .domain([d3.min(dnsAll, d => d.frequency), d3.max(dnsAll, d => d.frequency)])
                    .range([3, 7])
        }

        // plot data
        let projection = d3.geoMercator()
                            .fitSize([parseFloat(svg.style("width")) * 0.9, parseFloat(svg.style("height")) * 0.9], worldMap)
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
                .attr("r", d => scales.circleR(d.frequency))
                .attr("cx", d => projection([d.longitude, d.latitude])[0])
                .attr("cy", d => projection([d.longitude, d.latitude])[1])
                .attr("fill", d => d.malicious ? "#FF6347" : "#90EE90")
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
                latitude: parseFloat(record.latitude),
                frequency: parseInt(record.frequency)
            }
        })
    }

    return Promise.all([pullMap(paths.worldMap), pullDns(paths.dnsAll), pullDns(paths.dnsLocal)])
}

// HMR
if (module.hot) {
    module.hot.accept()
}
