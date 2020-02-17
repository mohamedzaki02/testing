import React from 'react';
import Badge from 'react-bootstrap/Badge';



const vehicle = props => {
    return (
        <tr>
            <td>#{props.vehicleId}</td>
            <td>{props.registerNo}</td>
            <td>
                <Badge id={props.vehicleId + '_btn_status'} variant="danger">Disconnected</Badge>
                <label id={props.vehicleId + '_lbl_status'} className="lblStatus"></label>
            </td>
        </tr>
    );
}


export default vehicle;