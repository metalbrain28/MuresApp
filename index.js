const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set rendering engines
app.engine('html', mustacheExpress());
app.set('view engine', 'html');

//Setting view pages
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('index', {});
});


app.get('/add', (req, res) => {
    console.log("Latitude: " + req.query['latitude']);
    console.log("Longitude: " + req.query['longitude']);

    res.render('add', {
        latitude: req.query['latitude'],
        longitude: req.query['longitude'],
    });
});


app.listen(3001, () => console.log('Example app listening on port 3001!'));