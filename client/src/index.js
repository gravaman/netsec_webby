// client js
import 'bootstrap'
import $ from 'jquery'
import * as secVis from './securityVisual'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

$("#period-buttons").find(".btn").click(function() {
    $("#period-buttons").find(".btn")
        .removeClass("btn-success active")
        .addClass("btn-secondary")
    $(this).removeClass("btn-secondary")
            .addClass("btn-success active")
})

$("#malicious-switch").click(() => secVis.updateData(switchState()))
$('#safe-switch').click(() => secVis.updateData(switchState()))

function switchState() {
    return [$('#safe-switch').is(':checked'), $('#malicious-switch').is(':checked')]
}
