
function runEsriQuery() {
    if (typeof Forms_InMotion === 'undefined') { //fallback token
        esriToken = 'wne_tWGi8jlxeoL8pgILBIFMfXb_nQfGX4JJRL6ZKq0L1O2sSXRykJx5NaS37TC-b7bcGwtsyU3bY6AVRT0_VyG4PGGXObM7nrHY7yVNFCgVoVt_HPZNVzAFcdvuMvqSt0XftWQtniVfZkKjFT0hyA..';
        console.log('Esri token fallback used');
    } else {
        Forms_inMotion("esritoken", "esricallback");
    }

}

function esricallback(data) {
    data = JSON.parse(data);
    if (data.OK) {
        esriToken = data.responseString;
        console.log("We have an Esri token");
    }
    else if (data.responseContent && data.responseContent=="UPDATING") {
        //the server had to generate a new token.  try this call again
        runEsriQuery();
    }
}

function geocodeAttempt(address,magickey,rowNum) {
    if (address == '' || magickey == '') {
        return;
    }
    var requestUrl = "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&singleLine=" + address + "&magicKey=" + magickey;
    $.ajax({
        url:requestUrl
    })
        .done(function(data) {
            //console.log(data);
            data = JSON.parse(data);
            var x = data.candidates[0].location.x;
            var y = data.candidates[0].location.y;
            var coordinates = x + "," + y;
            $('#esriAddress_'+rowNum).data('coordinates',coordinates);
            $('#esriAddressGeocode_'+rowNum).val(coordinates);
        });
}
$('.esriMapping').on('click', '.calctrip', function () {
    var miles = "";
    $('#addressTotal').val(miles);
    calculateRoute();
});
function calculateRoute() {
    var stops = [];
    //todo: create array of stops from geocode inputs
    var destinationRow = $('.destination');
    var numStopsWithData = 0;
    destinationRow.each(function(i) {
        var destinationCoordinates = $(this).data('coordinates');
        //console.log(destinationCoordinates);
        if (typeof destinationCoordinates !== 'undefined') {
            numStopsWithData++;
            stops.push(destinationCoordinates);
        }
    });

    if (numStopsWithData >= 2) {
        var stopsAsString = stops.join(';');
        var requestUrl = "//route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World/solve?stops=" +
            stopsAsString +
            ";&token=" +
            esriToken +
            "&restrictionAttributeNames=Avoid Carpool Roads, Avoid Gates, Avoid Private Roads, Avoid Unpaved Roads, Driving an Automobile, Roads Under Construction Prohibited, Through Traffic Prohibited" +
            "&f=json";
        console.log(requestUrl);
        $.ajax({
            url:requestUrl
        })
            .done(function(data) {
                data = JSON.parse(data);
                console.log(data);
                miles = Number(data.routes.features[0].attributes.Total_Miles).toFixed(2);
                $('#totalMileage').data("calculatedValue", miles);
                $('#totalMileage').val(miles);
                $('.mileage').trigger('change');
            });
    } else {
        console.log('you need at least 2 stops to calculate route')
    }
}
