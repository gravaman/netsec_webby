// client js
import 'bootstrap'
import $ from 'jquery'
import * as secVis from './securityVisual'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

// update alert for last request domain
secVis.lastRequest().then(req => $('#security-alert-domain').text(`(${ req.domain })`))

// add switch handlers
$("#malicious-switch").click(() => secVis.updateData(switchState()))
$('#safe-switch').click(() => secVis.updateData(switchState()))

function switchState() {
    return [$('#safe-switch').is(':checked'), $('#malicious-switch').is(':checked')]
}
