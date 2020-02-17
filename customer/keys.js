module.exports = {
  //pgHost: 'customers-db-instance.c7bffioqk8tn.us-east-2.rds.amazonaws.com',
  CUSTOMER_PG_HOST: process.env.CUSTOMER_PG_HOST,
  CUSTOMER_PG_DB:   process.env.CUSTOMER_PG_DB,
  CUSTOMER_PG_USER: process.env.CUSTOMER_PG_USER,
  CUSTOMER_PG_PASS: process.env.CUSTOMER_PG_PASS,
  CUSTOMER_PG_PORT: process.env.CUSTOMER_PG_PORT
};
