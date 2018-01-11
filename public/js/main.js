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
    var submitted = false;
    var locations  = [];
    var issues = [];

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

        locations.push(myPoint);

        myPoint = new Point(22.391111, 46.042222);
        symbol = new SimpleMarkerSymbol().setColor(new Color('blue'));
        graphic = new Graphic(myPoint, symbol);
        map.graphics.add(graphic);

        locations.push(myPoint);

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

    var description = null;
    var latitude = null;
    var longitude = null;

    map.on("click", function(evt){

        latitude = evt.mapPoint.getLatitude();
        longitude = evt.mapPoint.getLongitude();
        point = new Graphic(evt.mapPoint, symbol);

        var ok = false;
        for (i = 0; i < stations.length; i++) {
            if((stations[i].getLatitude() <= (latitude + 0.008) && stations[i].getLatitude() >= (latitude - 0.008))
                && (stations[i].getLongitude() <= (longitude + 0.008) && stations[i].getLongitude() >= (longitude - 0.008)))
            {
                ok = true;
                break;
            }
        }

        var ok2 = false;
        for (i = 0; i < locations.length; i++) {
            if((locations[i].getLatitude() <= (latitude + 0.008) && locations[i].getLatitude() >= (latitude - 0.008))
                && (locations[i].getLongitude() <= (longitude + 0.008) && locations[i].getLongitude() >= (longitude - 0.008)))
            {
                ok2 = true;
                break;
            }
        }

        var ok3 = false;
        for (i = 0; i < issues.length; i++) {
            if((issues[i].geometry.getLatitude() <= (latitude + 0.005) && issues[i].geometry.getLatitude() >= (latitude - 0.005))
                && (issues[i].geometry.getLongitude() <= (longitude + 0.005) && issues[i].geometry.getLongitude() >= (longitude - 0.005)))
            {
                ok3 = true;
                break;
            }
        }

        if(ok === true || ok2 === true || ok3 === true) {
            var content = null;
            if(ok === true) {
                content = "<b><u>Station</u></b><br><br><b>Latitude: </b>" + latitude + "<br><br> <b>Longitude: </b>" + longitude + "<br><br> <b>Other Information: </b>";
            } else if (ok2 === true) {
                var name = "<b>Location:</b> <u>";
                if (longitude < 21.655) {
                    name = name + "Semlac</u><br><br>";
                } else {
                    name = name + "Petris</u></b><br><br>";
                }
                content = name + "<b>Latitude: </b>" + latitude + "<br><br> <b>Longitude: </b>" + longitude + "<br><br> <b>Other Information: </b>";
            } else {
                content = "<b>Latitude: </b>" + latitude + "<br><br> <b>Longitude: </b>" + longitude + "<br><br>  <b>Issue Description: </b>" + description + "</b>";
            }
            map.infoWindow.setContent(content);
            map.infoWindow.show(evt.mapPoint);
            return;
        }

        map.graphics.add(point);

        var form = "<b>Latitude: </b>" + latitude + "<br><br> <b>Longitude: </b>" + longitude + "<br><br><form id='add_point'> Describe issue:<br><input type=" + "'text'" + "class='add_issue'" + "name=" + "'describe'" + "><br><br><input type=" + "'submit'" + " class='submit-incident' value=" + "'Submit'" + "></form> ";

        map.infoWindow.setContent(form);
        map.infoWindow.show(evt.mapPoint);

        if(!submitted)
            removeMapClickBullet();
        submitted = false;
    });

    $(document).on("click", ".submit-incident", function(e) {
        e.preventDefault();

        description = $('.add_issue').val();
        $('.add_issue').val('');
        submitted = true;
        issues.push(point);

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
                    stations.push(myPoint);
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