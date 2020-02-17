module.exports = {
  //pgHost: 'vehicles-db-instance.c7bffioqk8tn.us-east-2.rds.amazonaws.com',
  VEHICLE_PG_HOST: process.env.VEHICLE_PG_HOST,
  VEHICLE_PG_DB:   process.env.VEHICLE_PG_DB,
  VEHICLE_PG_USER: process.env.VEHICLE_PG_USER,
  VEHICLE_PG_PASS: process.env.VEHICLE_PG_PASS,
  VEHICLE_PG_PORT: process.env.VEHICLE_PG_PORT
};
