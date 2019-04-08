// main security visual
import * as d3 from 'd3'
import d3tip from 'd3-tip'

let tip = d3tip()
            .attr('class', 'd3-tip')
            .html(displayDnsRecord)
let projection = null
let svg = d3.select("#security-chart")
                .append("svg")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("viewBox", `0 0 1000 700`)
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .call(tip)
let scales = {
    circleR: null
}

pullData().then(function(data) {
    let worldMap, dnsRecords
    [worldMap, dnsRecords] = data

    // prep data
    dnsRecords = dnsRecords.filter(d => d.latitude != null && d.longitude != null)
    updateScales(dnsRecords)

    // plot data
    projection = d3.geoMercator()
                    .fitSize([parseFloat(svg.style("width")) * 0.9, parseFloat(svg.style("height")) * 0.9], worldMap)
    let worldpath = d3.geoPath(projection)

    svg.selectAll("path")
            .data(worldMap.features)
            .enter().append("path")
                .attr("class", "world")
                .attr("d", worldpath)

    let dnsCircles = svg.selectAll("circle").data(dnsRecords)
    plotDnsCircles(dnsCircles)
})

function displayDnsRecord(d) {
    return (
        `
        <div class="dns-data">
            <div class="dns-data-header">${ d.domain }</div>
            <div><span class="dns-data-label">category:</span><span class="dns-data-value">${ d.malicious ? 'malicious' : 'safe' }</span></div>
            <div><span class="dns-data-label">last date:</span><span class="dns-data-value">${ d.last_req.getFullYear() }-${ d.last_req.getMonth() + 1 }-${ d.last_req.getDate() }</span></div>
            <div><span class="dns-data-label">frequency:</span><span class="dns-data-value">${ d.frequency }</span></div>
            <div><span class="dns-data-label">ip address:</span><span class="dns-data-value">${ d.ip }</span></div>
        </div>
        `
    )
}

function pullData(){
    return Promise.all([d3.json('world-countries.json'), pullDns()])
}

function pullDns() {
    return fetch('/requests.json')
                .then(res => res.json())
                .then(data => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].last_req = new Date(Date.parse(data[i].last_req))
                    }
                    return data
                })
}

function updateScales(data) {
    scales.circleR = d3.scaleLinear()
                        .domain([d3.min(data, d => d.frequency), d3.max(data, d => d.frequency)])
                        .range([3, 7])
}

function updateDnsCircles(dnsCircles) {
    dnsCircles
        .attr("class", "ipaddr")
        .attr("r", d => scales.circleR(d.frequency))
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("fill", d => d.malicious ? "#FF6347" : "#90EE90")
}

function plotDnsCircles(dnsCircles) {
    dnsCircles.enter().append("circle")
            .attr("class", "ipaddr")
            .attr("r", d => scales.circleR(d.frequency))
            .attr("cx", d => projection([d.longitude, d.latitude])[0])
            .attr("cy", d => projection([d.longitude, d.latitude])[1])
            .attr("fill", d => d.malicious ? "#FF6347" : "#90EE90")
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
}

// public helpers
export function updateData(toggleState) {
    let safeState, malState
    [safeState, malState] = toggleState

    pullDns().then(function(dnsRecords) {
        // prep data
        updateScales(dnsRecords)

        if (!safeState && malState) {
            dnsRecords = dnsRecords.filter(d => d.malicious)
        } else if (safeState && !malState) {
            dnsRecords = dnsRecords.filter(d => !d.malicious)
        } else if (!safeState && !malState) {
            dnsRecords = []
        }

        // update existing; remove old; add new
        let dnsCircles = svg.selectAll("circle").data(dnsRecords)
        updateDnsCircles(dnsCircles)
        dnsCircles.exit().remove()
        plotDnsCircles(dnsCircles)
    })
}

export function lastRequest() {
    return pullDns().then(recs => recs.sort((a, b) => b.last_req - a.last_req)[0])
}

// HMR
if (module.hot) {
    module.hot.accept()
}
