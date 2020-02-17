const cote = require('cote');
const keys = require('./keys');

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.CUSTOMER_PG_USER,
    host: keys.CUSTOMER_PG_HOST,
    database: keys.CUSTOMER_PG_DB,
    password: keys.CUSTOMER_PG_PASS,
    port: keys.CUSTOMER_PG_PORT
});

pgClient.on('error', () => console.log('Lost PG connection'))





// USING COTE : Customers Service is expected to REQUEST (connected|disconnected) Vehicles => From Vehicles Service
const vehicleRequester = new cote.Requester({ 
    name: 'customers',
    key:'customers_vehicles_request'
});



//TESTING MICROSERVICES IN MULTI_DOCKER_CONTAINERS
// vehicleRequester.send({ type: 'customer_vehicle_handshake' }, handshake_Response => {
//     console.log('### Customers > Handshake Response : ' + handshake_Response + ' ###');
// });



const filterVehicles = (queryObj, cb) => {
    queryObj.type = 'customers_vehicles_request';
    vehicleRequester.send(queryObj, vehicles => {
        cb(vehicles);
    });
}




const utilityObj = {
    prepareTable: () => {
        pgClient
            .query("DROP TABLE IF EXISTS customers CASCADE")
            .then(() => {
                pgClient
                    .query("CREATE TABLE IF NOT EXISTS customers (customerId integer PRIMARY KEY,fullName varchar(45) UNIQUE NOT NULL,address varchar(450) NOT NULL)")
                    .then(() => {
                        pgClient.query("INSERT INTO customers (customerId, fullName, address) VALUES " +
                            "(123, 'mohamed zaki', 'new address')," +
                            "(124, 'momtaz ahmed', 'other value')," +
                            "(125, 'mark tomas', 'somewhere')"
                        )
                            .then(() => {
                                pgClient.query("SELECT * from customers")
                                    .then(allCustomers => {

                                        // console.log('### ALL CUSTOMERS ###');
                                        // console.log(allCustomers.rows);
                                        // console.log('### ----------------------------------------------------------------------- ###');


                                        // pgClient.query("SELECT * from customers WHERE fullName LIKE 'mo%' ")
                                        //     .then(fewCustomers => {

                                        //         console.log('### LESS CUSTOMERS ###');
                                        //         console.log(fewCustomers.rows);
                                        //         console.log('### ----------------------------------------------------------------------- ###');


                                        //     })
                                        //     .catch(err => console.log(err));

                                    })
                                    .catch(err => console.log(err));
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    },
    getCustomers: (query, cb) => {
        pgClient
            .query(query)
            .then((customers) => {
                cb(customers.rows);
            })
            .catch(err => cb({ error: err }));
    },
    queryCustomers: (queryParams, cb) => {
        let query = 'SELECT * from customers ',
            filterExpression = false,
            filterExpressionString = 'WHERE ';

        if (queryParams && (queryParams.customerId || queryParams.vehicleStatus)) {

            if (queryParams.customerId) {

                filterExpression = true;
                filterExpressionString += ' customerId=' + queryParams.customerId
                utilityObj.getCustomers(query + filterExpressionString, customersResponse => {
                    if (customersResponse.error) cb({ error: customersResponse.error });
                    else cb(customersResponse);
                });
            }

            else if (queryParams.vehicleStatus) {
                filterVehicles(queryParams, filtered_vehciles => {
                    let customerIds = filtered_vehciles.map(fv => fv.customerid);
                    if (customerIds.length) filterExpressionString += ' customerId IN (' + customerIds.join(',') + ')';
                    let finalQuery = query + filterExpressionString;
                    utilityObj.getCustomers(finalQuery, customersResponse => {
                        if (customersResponse.error) cb({ error: customersResponse.error });
                        else cb(customersResponse);
                    });

                });
            }

        }
        else {
            utilityObj.getCustomers(query, customersResponse => {
                if (customersResponse.error) cb({ error: customersResponse.error });
                else cb(customersResponse);
            });
        }



    }

};

module.exports = utilityObj;