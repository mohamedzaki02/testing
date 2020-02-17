const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());


const cote = require('cote');
const AWS = require('aws-sdk');
const redis = require('redis');


const keys = require('./keys');


const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort
});



//protocol://service-code.region-code.amazonaws.com
const ep = new AWS.Endpoint('http://dynamodb.' + keys.region + '.amazonaws.com');

AWS.config.update({
    region: keys.region,
    endpoint: ep,
    accessKeyId: keys.dynamo_user_access_key,
    secretAccessKey: keys.dynamo_user_secret_access_key
});

const docClient = new AWS.DynamoDB.DocumentClient();

const monitorResponder = new cote.Responder({
    name: 'monitor_responder',
    key: 'vehicles_monitor_request'
});

//TESTING MICROSERVICES IN MULTI_DOCKER_CONTAINERS
// monitor send reply to vehicles
// monitorResponder.on('vehicle_monitor_handshake', (req, cb) => {
//     cb(new Date());
// });




const sub = redisClient.duplicate();


sub.on('connect', () => console.log('### Monitor >> connecting to redis ###'));


sub.on('err', err => console.log(err));


sub.on('message', (channel, message) => {
    var currentDate = new Date();
    currentDate.setMinutes(currentDate.getSeconds() + 10);
    var params = {
        TableName: keys.dynamo_table,
        Item: {
            vehicleId: Number(message),
            expiryDate: Math.round(currentDate.getTime() / 1000)
        }
    };

    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            //console.log('item has been added');
        }
    });
});
sub.subscribe('insert');





monitorResponder.on('vehicles_monitor_request', (req, cb) => {
    console.log('#v monitor gets vehicles request');
    const params = {
        TableName: keys.dynamo_table
    };

    // usually I avoid using scans and if i have too; i do small parallel scans
    // in our scenario here rows have a TTL period of one minute after that it will be marked { expired } and gets deleted in 48 hours.
    docClient.scan(params, function (err, result) {
        if (err) {
            cb({ error: err });
        } else {
            let results = result.Items,
                currentDate = Math.round((new Date().getTime()) / 1000),
                filteredVehicles = results.filter(m => m.expiryDate > currentDate);
            console.log('#v monitor sends back response');
            console.log(filteredVehicles.length ? filteredVehicles.map(m => m.vehicleId) : []);
            cb(filteredVehicles.length ? filteredVehicles.map(m => m.vehicleId) : []);
        }
    });
});



app.listen(7000, () => console.log('LISTENING ON SERVER 7000'));




