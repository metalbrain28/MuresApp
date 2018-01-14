require([
    "dojo/parser",
    "dojo/ready",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dojo/dom",
    "esri/map",
    "esri/urlUtils",
    "esri/arcgis/utils",
    "esri/dijit/Legend",
    "esri/dijit/Scalebar",
    'esri/graphic',
    'esri/symbols/SimpleMarkerSymbol',
    "esri/symbols/SimpleLineSymbol",
    'esri/Color',
    'dojo/request',
    'esri/geometry/Point',
    "dojo/domReady!"
], function (
    parser,
    ready,
    BorderContainer,
    ContentPane,
    dom,
    Map,
    urlUtils,
    arcgisUtils,
    Legend,
    Scalebar,
    Graphic,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    Color,
    request,
    Point
) {
    ready(function () {

        var map = null;
        var description = null;
        var latitude = null;
        var longitude = null;
        var submitted = false;
        let lastPoint = null,
            point = null;
        var issues = [];


        parser.parse();

        //if accessing webmap from a portal outside of ArcGIS Online, uncomment and replace path with portal URL
        //arcgisUtils.arcgisUrl = "https://pathto/portal/sharing/content/items";
        arcgisUtils.createMap("a21aac6bafac4a8db22eb167822f7cc8", "map", {
            mapOptions: {
                center: [21.655, 46.075],
                zoom:9
            }}).then(function (response) {
            //update the app
            dom.byId("title").innerHTML = response.itemInfo.item.title;
            dom.byId("subtitle").innerHTML = response.itemInfo.item.snippet;

            map = response.map;

            //add the scalebar
            var scalebar = new Scalebar({
                map: map,
                scalebarUnit: "english"
            });

            //add the legend. Note that we use the utility method getLegendLayers to get
            //the layers to display in the legend from the createMap response.
            var legendLayers = arcgisUtils.getLegendLayers(response);
            var legendDijit = new Legend({
                map: map,
                layerInfos: legendLayers
            }, "legend");
            legendDijit.startup();

            handleMapExtraActions(map);
            displayAllIncidents();
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

        function handleMapExtraActions(map) {

            var myPoint = new Point(21.108430175781148, 46.27374974057721);
            var symbol0 = new SimpleMarkerSymbol().setColor(new Color('blue'));
            var graphic = new Graphic(myPoint, symbol0);
            map.graphics.add(graphic);

            myPoint = new Point(22.352631835936794, 46.00922633069789);
            symbol0 = new SimpleMarkerSymbol().setColor(new Color('blue'));
            graphic = new Graphic(myPoint, symbol0);
            map.graphics.add(graphic);

            map.on("click", function(evt){

                if (!isAuthenticated()) return;

                latitude = evt.mapPoint.getLatitude();
                longitude = evt.mapPoint.getLongitude();
                point = new Graphic(evt.mapPoint, symbol);

                /* For checking not to interfere with existing points */
                var layerCircles = $(".esriMapContainer circle");
                var isInFirstLayer = layerCircles.filter(function(k, v) {return v === evt.target;}).length;
                if (!isInFirstLayer) {

                    /*var ok3 = false;
                    for (i = 0; i < issues.length; i++) {
                        if((issues[i].geometry.getLatitude() <= (latitude + 0.005) && issues[i].geometry.getLatitude() >= (latitude - 0.005))
                            && (issues[i].geometry.getLongitude() <= (longitude + 0.005) && issues[i].geometry.getLongitude() >= (longitude - 0.005))) {
                            ok3 = true;
                            break;
                        }
                    }
                    var form = null;
                    if (ok3 === true)
                        form = "<b>Latitude: </b>" + latitude + "<br><br> <b>Longitude: </b>" + longitude + "<br><br>  <b>Issue Description: </b>" + description + "</b>";*/
                    map.graphics.add(point);

                    form = "<b>Latitude: </b>" + latitude + "<br><br> <b>Longitude: </b>" + longitude + "<br><br><form id='add_point'> Describe issue:<br><input type=" + "'text'" + "class='add_issue'" + "name=" + "'describe'" + "><br><br><input type=" + "'submit'" + " class='submit-incident' value=" + "'Submit'" + "></form> ";

                    map.infoWindow.setContent(form);
                    map.infoWindow.show(evt.mapPoint);

                    if(!submitted)
                        removeMapClickBullet();
                    submitted = false;
                }
            });
        }

        $(document).on("click", ".submit-incident", function(e) {
            e.preventDefault();

            description = $('.add_issue').val();
            //submitted = true;
            issues.push(point);

            request.post("/incidents", {
                data: {
                    description: description,
                    longitude: longitude,
                    latitude: latitude
                }
            }).then(function(text){
                console.log("The server returned: ", text);

                map.graphics.add(point);
            });
        });

        function removeMapClickBullet() {
            if (lastPoint) {
                map.graphics.remove(lastPoint);
            }

            lastPoint = point;
        }

        function displayAllIncidents() {
            request.get("/incidents", {
                handleAs: "json"
            }).then(function(data){

                let incidentPoint;
                data.map(function(entry) {
                    incidentPoint = new Point(entry.Longitude, entry.Latitude);
                    var symbol = new SimpleMarkerSymbol().setColor(new Color('red'));
                    var graphic = new Graphic(incidentPoint, symbol);
                    map.graphics.add(graphic);
                });

            });
        }

        function isAuthenticated() {
            return $("#user_logout").length;
        }
    });

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