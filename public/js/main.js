require([
    'esri/map',
    'esri/geometry/Point',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/Color',
    'esri/graphic',
    'dojo/request',
    'dojo/domReady!'
], function (Map, Point, SimpleMarkerSymbol, Color, Graphic, request) {
    var map = new Map("map", {
        center: [21.655, 46.075],
        zoom: 10,
        basemap: "streets",
        height: 800
    });

    map.on('load', function () {
        var myPoint = new Point(20.92, 46.11);
        var symbol = new SimpleMarkerSymbol().setColor(new Color('blue'));
        var graphic = new Graphic(myPoint, symbol);
        map.graphics.add(graphic);

        myPoint = new Point(22.391111, 46.042222);
        symbol = new SimpleMarkerSymbol().setColor(new Color('blue'));
        graphic = new Graphic(myPoint, symbol);
        map.graphics.add(graphic);

        drawStations();
    });

    function drawStations() {
        request("/stations").then(
            function(data){
                var jsonData = JSON.parse(data);

                _.map(jsonData, function(item) {
                    var myPoint = new Point(item.Longitude, item.Latitude);
                    var symbol = new SimpleMarkerSymbol().setColor(new Color('green'));
                    var graphic = new Graphic(myPoint, symbol);
                    map.graphics.add(graphic);
                });
            },
            function(error){
                console.log("An error occurred: " + error);
            }
        );
    }
});

(function () {
    var login = new Login();
    var register = new Register();
    login.initialize();
    register.initialize();


    $("#logout-link").on("click", function(e) {
        $.ajax({
            url: "homepage/logout",
            method: "GET",
            dataType: "json",
            success: _.bind(function() {
                $(".invalid-data").addClass("hidden");

                window.location.reload();

            }, this),
            error: function(res, err) {
                console.log("Fail logout");
            }
        });
    });
})($);