require([
    'esri/map',
    'esri/geometry/Point',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/Color',
    'esri/graphic',
    'dojo/request',
    "esri/InfoTemplate",
    "esri/symbols/SimpleLineSymbol",
    'dojo/domReady!'
], function (Map, Point, SimpleMarkerSymbol, Color, Graphic, request, InfoTemplate, SimpleLineSymbol) {

    let lastPoint = null;
    var point = null;
    var stations = [];

    var map = new Map("map", {
        center: [21.655, 46.075],
        zoom: 10,
        basemap: "streets"
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

    var symbol = new SimpleMarkerSymbol(
        SimpleMarkerSymbol.STYLE_CIRCLE,
        12,
        new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_NULL,
            new Color([247, 34, 101, 0.9]),
            1
        ),
        new Color([207, 34, 171, 0.5])
    );

    map.on("click", function(evt){
        point = new Graphic(evt.mapPoint, symbol);
        map.graphics.add(point);
        var form = "<b>Latitude: </b>" + evt.mapPoint.getLatitude() + "<br><br> <b>Longitude: </b>" + evt.mapPoint.getLongitude() + "<br><br><form id='add_point'> Describe issue:<br><input type=" + "'text'" + "name=" + "'describe'" + "><br><br><input type=" + "'submit'" + " class='submit-incident' value=" + "'Submit'" + "></form> ";

        map.infoWindow.setContent(form);
        map.infoWindow.show(evt.mapPoint);

        removeMapClickBullet();
    });

    $(document).on("click", ".submit-incident", function(e) {
        e.preventDefault();

        map.graphics.add(point);
    });

    function removeMapClickBullet() {
        if (lastPoint) {
            map.graphics.remove(lastPoint);
        }

        lastPoint = point;
    }

    function drawStations() {
        request("/stations").then(
            function(data){
                var jsonData = JSON.parse(data);
                stations = jsonData;

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


    $("#user_logout").on("click", function(e) {
        $.ajax({
            url: "logout",
            method: "POST",
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