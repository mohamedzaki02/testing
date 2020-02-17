import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import Customer from '../components/customer/customer';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import socketIOClient from 'socket.io-client';


class App extends Component {

  socket = socketIOClient(window.location.hostname);

  state = {
    customers: [],
    customerId: null,
    vehicleStatus: null
  };

  componentDidMount() {
    this.fetchCustomerVehicles(null, null, () => this.startVehiclesStatusCountDown());
  }

  async fetchCustomerVehicles(vehicleStatus, customerId, cb) {
    let queryParams = {};
    if (customerId) queryParams.customerId = customerId;
    if (vehicleStatus) queryParams.vehicleStatus = vehicleStatus;
    let customers = await axios.post('/api/customers', queryParams);
    let vehicles = await axios.post('/api/vehicles', queryParams);
    customers = customers.data.map(cust => {
      cust.vehicles = vehicles.data.filter(v => v.customerid == cust.customerid)
      return cust;
    });
    this.setState({
      customers: customers,
      customerId: customerId,
      vehicleStatus: vehicleStatus
    });
    if (cb) cb();
  }


  startVehiclesStatusCountDown() {
    let counterInterval;
    if (!counterInterval) {
      counterInterval = setInterval(() => {
        let counters = $("[id $='_lbl_status']");
        let btns = $("[id $='_btn_status']");
        counters.each((indx) => {
          let _counter = counters.eq(indx);
          let counterVal = _counter.text();
          if (!counterVal) {
            _counter.text('00');
            _counter.css({ 'color': 'red' });
          }
          else {
            let val = Number(_counter.text());
            let newCounterVal = 0;
            if (val > 0) {
              newCounterVal = (val - 1);
            } else {
              btns.eq(indx).css({ 'background-color': 'red' });
              btns.eq(indx).text('disConnected');
            }
            _counter.text(newCounterVal < 10 ? ('0' + newCounterVal) : newCounterVal);
            _counter.css({ 'color': 'red' });
          }
        });
      }, 1000);
    }
  }



  render() {

    this.socket.on('connect', function () {
      console.log('Client Connected');
    });

    this.socket.on('vehicle_connected', function (data) {
      $('#' + data.vehicleId + '_btn_status').css({ 'background-color': 'green' });
      $('#' + data.vehicleId + '_btn_status').text('Connected');
      $('#' + data.vehicleId + '_lbl_status').text('10');
      $('#' + data.vehicleId + '_lbl_status').css({ 'color': 'green' });
    });

    let selectedCustomerVal = this.state.customers && this.state.customerId ? this.state.customers.filter(c => c.customerid == this.state.customerId)[0].fullname : 'Customers List';

    return (
      <div className="App">
        <h3>Challange Demo</h3>




        <div>
          <div className="filters">
            <DropdownButton id="customersDDL" size="sm" className="mt-3"
              title={selectedCustomerVal} variant="info"
              key="customersDDL"
            >
              {
                this.state.customers.map(cust =>
                  <Dropdown.Item eventKey={cust.customerid}
                    onClick={this.fetchCustomerVehicles.bind(this, this.state.vehicleStatus, cust.customerid)}>
                    {cust.fullname}
                  </Dropdown.Item>
                )
              }
              <Dropdown.Divider />
              <Dropdown.Item eventKey="basic" onClick={this.fetchCustomerVehicles.bind(this, this.state.vehicleStatus, null)} active>ALL</Dropdown.Item>
            </DropdownButton>

            <ButtonGroup id="vstatus" aria-label="Vehicle Status" size="sm" className="mt-3">
              <Button onClick={this.fetchCustomerVehicles.bind(this, 'connected', this.state.customerId)} variant="success">connected</Button>
              <Button onClick={this.fetchCustomerVehicles.bind(this, null, this.state.customerId)} variant="warning" active>All</Button>
              <Button onClick={this.fetchCustomerVehicles.bind(this, 'disConnected', this.state.customerId)} variant="danger">Disconnected</Button>
            </ButtonGroup>


          </div>


          <ListGroup>
            <ListGroup.Item disabled>
              {
                this.state.customers.map(customer =>
                  <Customer fullName={customer.fullname} address={customer.address} vehicles={customer.vehicles}></Customer>
                )
              }
            </ListGroup.Item>
          </ListGroup>
        </div>



      </div>
    );
  }
}

export default App;
