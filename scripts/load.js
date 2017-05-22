var loaded = false;

$(document).ready(function(){
    PreDataLoad();
});

function PreDataLoad() {

    if (loaded) {
        return;
    }
    loaded = true;
    function getRowNumberFromObject(obj) {
        var id = obj.attr("id");
        return (id.substring(id.lastIndexOf("_") + 1));
    }
    var autocompleteList = [];
    var addressAutocompleteOptions = {
        minLength: 3,
        open : function(){
            $(".ui-autocomplete:visible").position({
                my: "center",
                at: "center",
                of: "body"
            })
        },
        source: function (request, response) {
            var url = "//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=" + request.term + "&location=-82.65895459657656,34.79080574129301&f=json";
            $.ajax({
                url:url
            })
                .done(function(data) {
                    autocompleteList = [];
                    data = JSON.parse(data);
                    for (var i=0; i<data.suggestions.length; i++) {
                        autocompleteList.push({
                            magickey:data.suggestions[i].magicKey,
                            value:data.suggestions[i].text,
                            label:data.suggestions[i].text
                        });
                    }
                    response(autocompleteList);
                });
        },
        select: function (event, ui) {
            var magickey = ui.item.magickey;
            var address = ui.item.value;
            var rowNum = getRowNumberFromObject($(this));
            $('#esriAddress_'+rowNum).data('magickey',magickey);
            $('#esriAddressMagickey_'+rowNum).val(magickey);
            geocodeAttempt(address,magickey,rowNum);
        }
    };
    $(".destination").autocomplete(addressAutocompleteOptions);
    runEsriQuery();
}