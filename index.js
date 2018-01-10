const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('river.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the river database.');
});

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

app.get('/stations', (req, res) => {
    let sql = `SELECT * FROM Stations`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }

        res.send(JSON.stringify(rows));
    });
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

process.on('exit', function() {
    db.close();
});