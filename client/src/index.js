import './securityVisual'

$("#period-buttons").find(".btn").click(function() {
    $("#period-buttons").find(".btn")
        .removeClass("btn-success active")
        .addClass("btn-secondary")
    $(this).removeClass("btn-secondary")
            .addClass("btn-success active")
})

// client js
console.log("skynet online")
