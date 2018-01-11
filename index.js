const express = require('express');
const mustacheExpress = require('mustache-express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');

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

app.use(session({
    secret: 'i like potatoes dunno',
    resave: true,
    saveUninitialized: false
}));

app.get('/', (req, res) => {
    res.render('index', req.session.user);
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

app.post('/register', (req, res) => {
    let userData = req.body;

    bcrypt.hash(userData.pass, saltRounds, function(err, hash) {
        db.serialize(function() {
            let stmt = db.prepare("INSERT INTO Users(Name, Email, Password, Phone, isAdmin) VALUES (?,?,?,?,?)");

            stmt.run([
                userData.name,
                userData.email,
                hash,
                userData.phone,
                0
            ]);

            stmt.finalize();
        });

    });

    res.send(JSON.stringify({
        name: userData.name
    }));
});

app.post('/login', (req, res) => {
    let userData = req.body;

    let sql = `SELECT * FROM Users where Email="` + userData.email + `"`;

    db.get(sql, [], (err, row) => {
        if (err) {
            throw err;
        }

        if (!row || typeof(row) === "undefined") {
            res.status(400).json({error: "Not found."});
        }

        bcrypt.compare(userData.password, row.Password).then(function(isValid) {
            if (isValid) {
                req.session.user = {
                    id: row.ID,
                    name: row.Name
                };

                res.status(200).json({
                    name: userData.name
                });
            } else {
                res.status(400).json({error: "Invalid password."});
            }
        });
    });
});

app.post('/logout', function(req, res) {

    let sess = req.session.user;
    if(sess){
        req.session.user = null;
        res.json({ 'success': 200, 'message': "Successfully logged out" });
    } else {
        res.status(200).send({});
    }
});

app.get('/add', (req, res) => {
    console.log("Latitude: " + req.query['latitude']);
    console.log("Longitude: " + req.query['longitude']);

    res.render('add', {
        latitude: req.query['latitude'],
        longitude: req.query['longitude'],
    });
});

app.post('/incidents', (req, res) => {
    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'potato.cat001@gmail.com',
            pass: 'ilikepotatoes'
        }
    });

    var mailOptions = {
        from: 'potato.cat001@gmail.com',
        to: 'moisa.anca10@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent!');
        }
    });
});


app.listen(3001, () => console.log('Example app listening on port 3001!'));

process.on('exit', function() {
    db.close();
});