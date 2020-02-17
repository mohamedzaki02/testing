module.exports = {
    region: process.env.DYNAMO_REGION,
    dynamo_user_access_key: process.env.DYNAMO_ACCESS_KEY,
    dynamo_user_secret_access_key: process.env.DYNAMO_SECRET_KEY,
    dynamo_table: process.env.DYNAMO_TABLE,
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
};
