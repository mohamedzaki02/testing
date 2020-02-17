const keys = require('./keys');

const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.VEHICLE_PG_USER,
    host: keys.VEHICLE_PG_HOST,
    database: keys.VEHICLE_PG_DB,
    password: keys.VEHICLE_PG_PASS,
    port: keys.VEHICLE_PG_PORT
});

pgClient.on('error', () => console.log('Lost PG connection'));


const cote = require('cote');

// vehicles service should reply back to customers service 
// VEHICLES >> REPLY >> CUSTOMERS
const vehicleResponder = new cote.Responder({
    name: 'vehicles_responder',
    key: 'customers_vehicles_request'
});

// USING COTE : Vehicles Service is expected to REQUEST (only connected) Vehicles => From Monitor Service
// VEHICLES >> REQUEST >> Monitor
const vehicleStatusRequester = new cote.Requester({
    name: 'vehicles',
    key:'vehicles_monitor_request'
});


//TESTING MICROSERVICES IN MULTI_DOCKER_CONTAINERS
// vehicles send reply to customers
// vehicleResponder.on('customer_vehicle_handshake', (req, cb) => {
//     cb(new Date());
// });


vehicleResponder.on('customers_vehicles_request', (req, cb) => {

    vehicleUtility.queryVehicles(req, vehicles => cb(vehicles))
});


//TESTING MICROSERVICES IN MULTI_DOCKER_CONTAINERS
// vehicles send request to monitor service
// vehicleStatusRequester.send({ type: 'vehicle_monitor_handshake' }, handshake_Response => {
//     console.log('### Vehicles > Handshake Response : ' + handshake_Response + ' ###');
// });



const monitorVehicles = (cb) => {
    // vehicles requests only connected vehicles from monitor service
    console.log('#vRequesting monitor : ');
    vehicleStatusRequester.send({ type: 'vehicles_monitor_request' }, connectedVehcilesIds => {
        console.log('#vIncoming response from monitor : ');
        cb(connectedVehcilesIds);
    });
}


const vehicleUtility = {
    prepareTable: () => {
        pgClient
            .query("DROP TABLE IF EXISTS vehicles CASCADE")
            .then(() => {
                pgClient
                    .query("CREATE TABLE IF NOT EXISTS vehicles (vehicleId integer PRIMARY KEY,customerId integer NOT NULL,registerNo varchar(45) UNIQUE NOT NULL)")
                    .then(() => {
                        pgClient.query("INSERT INTO vehicles (vehicleId, customerId, registerNo) VALUES " +
                            "(1, 123, 'asd-123')," +
                            "(2, 123, 'dxb-527')," +
                            "(3, 124, 'qwe-331')," +
                            "(4, 124, 'wer-455')," +
                            "(5, 124, 'rty-776')," +
                            "(6, 124, 'khj-654')," +
                            "(7, 125, 'hfg-227')"
                        )
                            .then(() => {
                                pgClient.query("SELECT * from vehicles")
                                    .then(allVehicles => {

                                        // console.log('### ALL vehicles ###');
                                        // console.log(allVehicles.rows);
                                        // console.log('### ----------------------------------------------------------------------- ###');

                                    })
                                    .catch(err => console.log(err));
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    },
    getVehicles: (query, cb) => {
        console.log('#vQuery : ' + query);
        pgClient
            .query(query)
            .then((vehicles) => {
                cb(vehicles.rows);
            })
            .catch(err => cb({ error: err }));
    },
    queryVehicles: (queryParams, cb) => {
        let query = 'SELECT * from vehicles ',
            filterExpression = false,
            filterExpressionString = 'WHERE ';

        if (queryParams) {
            if (queryParams.customerId) {
                filterExpression = true;
                filterExpressionString += ' customerId=' + queryParams.customerId;
            }
            else if (queryParams.customerIds) {
                filterExpression = true;
                filterExpressionString += ' customerId= IN (' + queryParams.customerIds.join(',') + ')';
            }
            if (queryParams.vehicleStatus) {
                let status = queryParams.vehicleStatus == 'connected' ? true : false;
                monitorVehicles(connectedVehcilesIds => {

                    if (connectedVehcilesIds && connectedVehcilesIds.length) filterExpressionString += ((filterExpression ? ' AND ' : '') + (status ? '' : 'NOT ') + 'vehicleId IN (' + connectedVehcilesIds.join(',') + ')');
                    let finalQuery = query + filterExpressionString;

                    vehicleUtility.getVehicles(finalQuery, customersResponse => {
                        if (customersResponse.error) cb({ error: customersResponse.error });
                        else cb(customersResponse);
                    });
                });
            } else {
                vehicleUtility.getVehicles(query + (filterExpression ? filterExpressionString : ''), customersResponse => {
                    if (customersResponse.error) cb({ error: customersResponse.error });
                    else cb(customersResponse);
                });
            }
        }
        else {
            vehicleUtility.getVehicles(query, customersResponse => {
                if (customersResponse.error) cb({ error: customersResponse.error });
                else cb(customersResponse);
            });
        }
    }
};

module.exports = vehicleUtility;