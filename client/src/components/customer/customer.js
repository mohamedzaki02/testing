import React from 'react';
import Vehicle from '../vehicle/vehicle'
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';

const customer = props => {



    return (
        <ListGroup.Item disabled>
            <div className="customerDetails">
                <h3>{props.fullName}</h3>
                <p>{props.address}</p>
            </div>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>Vehicle ID</th>
                        <th>Register Number</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.vehicles.map(veh =>
                            <Vehicle vehicleId={veh.vehicleid} registerNo={veh.registerno}></Vehicle>
                        )
                    }
                </tbody>
            </Table>
        </ListGroup.Item>
    );

}

export default customer;
