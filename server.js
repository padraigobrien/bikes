var mongoose = require('mongoose');
var timeseries = require("timeseries-analysis");
var http = require('http');
var express    = require('express');//
var bodyParser = require('body-parser');


var app        = express();

mongoose.connect('mongodb://localhost/bikes');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function (callback) {
    // yay!
});

var bikeSchema = mongoose.Schema({
    timestamp: Date,
    free: Number
})

var Bikes = mongoose.model('Bike', bikeSchema);

var router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

router.get('/Stations/:StationName', function(req, res) {

    console.log("Station " + req.params.StationName + " was asked for")
    Bikes.find({ name : req.params.StationName}, {'_id': 0, 'free': 1, 'timestamp': 1 }, function (err, Bikes) {
        if (err) return console.error(err);

        var t     = new timeseries.main(timeseries.adapter.fromDB(Bikes, {
            date:   'timestamp',
            value:  'free'
        }));

        var chart_url = t.ma({period: 14}).chart({main:true});
        res.setHeader( "Access-Control-Allow-Origin", req.headers.origin );
        res.write(chart_url );
        res.end();


    })
});

router.get('/Stations/', function(req, res) {
    Bikes
        .find()
        .distinct('name', function(error, names) {
            res.setHeader( "Access-Control-Allow-Origin", req.headers.origin );
            res.json(names);
    });
});


app.use('/api', router);

app.listen(port);

console.log('Magic happens on port ' + port);











