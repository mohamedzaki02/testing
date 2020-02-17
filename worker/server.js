const keys = require('./keys');


const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();


setInterval(function () {
    let val = Math.floor(Math.random() * 10);
    if (val == 0) val = 1;
    //console.log('Pushing : ' + val);
    redisPublisher.hset('values', 'CarNO', val);
    redisPublisher.publish('insert', val);
}, 2000);
