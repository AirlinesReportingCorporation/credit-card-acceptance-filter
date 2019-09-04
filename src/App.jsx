import React, {Component} from "react";
import {MemoryRouter as Router, Route, Link} from "react-router-dom";
import {withRouter} from "react-router";
import {AnimatedRoute} from 'react-router-transition';
import {Motion, spring} from 'react-motion';
import {hot} from 'react-hot-loader';
import axios from 'axios';
import XLSX from 'xlsx';

//navigation
//import Navigation from './pages/Navigation.jsx';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      jsonHeaders: [],
      jsonData: []
    };

    this.getRoute = this.getRoute.bind(this);
  }

  componentDidMount(){

    var e = this;
    //https://www2.arccorp.com/globalassets/support--training/agency-support/credit-card-acceptance/cc-acceptance-chart.xlsx
    axios({
      method:'get',
      url: "https://www2.arccorp.com/globalassets/support--training/agency-support/credit-card-acceptance/cc-acceptance-chart.xlsx?" + new Date().toLocaleString(),
      responseType:'arraybuffer'
    })
      .then(function(response) {
        console.log("===== CC Chart Loaded =====");
        var data = new Uint8Array(response.data);
        var workbook = XLSX.read(data, {type:"array"});



        var workbookData = workbook["Sheets"]["CC Acceptance Chart"];

        var json = XLSX.utils.sheet_to_json(workbookData);
        e.setState({jsonData: json});

        //traverseEntireWorkBook
        for(var key in workbookData) {

          //value in cell
          var val = workbookData[key].w;

          var str = key.match(/[a-z]+|[^a-z]+/gi);


          if(val) {
            if(str[1] === "1") {
              e.state.jsonHeaders[key[0]] = val///.replace(/ /g,"_").replace(":", "");

            }
            //console.log(val + ":" + str);
          }


        }

        console.log(e.state.jsonHeaders);
      });


  }

  //getRoute on route Navigation
  //update state for slide controls on navigation if needed
  getRoute(rPath, sCount) {

  }

  render() {

    var e = this;

    var showSlideCtrls = (this.state.showSlideCtrls)
      ? '1'
      : '0';

    console.log(this.state.jsonData);

    const listItems = this.state.jsonData.map((data, i) => {

      var payment, code, exception = "";

      if(data["Payment Type Accepted"]) {
        payment = <div className="ccPayment">
          <strong>Payment Types Accepted</strong>
          <p>{data["Payment Type Accepted"]}</p>
        </div>
      }

      if(data["Code"]) {
        code = <div className="ccCode">
          <strong>Code</strong>
          <p>{data["Code"]}</p>
        </div>
      }

      if(data["Exception"]) {
        exception = <div className="ccException">
          <strong>Exception</strong>
          <p>{data["Exception"]}</p>
        </div>
      }


        return <div key={i} className="ccAirlineContainer">
          <div className="row">
            <div className="col-md-4">
              <div className="ccSection1">
                <div className="ccAirline">
                  {data["Airline"]}
                </div>
                <div className="ccAirlineCode">
                  {data["Airline Code"]}
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="ccSection2">
                {payment}
                {code}
                {exception}
              </div>
            </div>
          </div>
        </div>
    });

    return (<div>
      <div className="ccJumbo">
        <div className="bgOpacity"></div>
        <h2 className="animated fadeInDown">Credit Card Acceptance</h2>
        <p className="animated fadeIn">The Airline Credit Card Acceptance Chart denotes Airlines&apos; acceptance of different credit cards. The chart also identifies any restrictions Airlines have for accepting credit cards on their behalf.</p>
      </div>

      <div className="ccContainer">
        <div className="container">
          <div className="row">
            <div className="col-md-3">
              <div className="ccFilterSidebar">
                <h3>Filter</h3>

                <div className="ccFilterTitle">Airline</div>
                <select name="Airline" id="">
                  <option value=""></option>
                </select>

                <div className="ccFilterTitle">Card Type</div>
                <div className="ccFilterSection">
                  <input name="" type="checkbox"/><label htmlFor="">AMEX</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">CA</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">DCI</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">DS</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">JCB</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">UATP</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">VI</label><br/>
                </div>

                <div className="ccFilterTitle">Restriction Type</div>
                <div className="ccFilterSection">
                  <input name="" type="checkbox"/><label htmlFor="">Test</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">Test</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">Test</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">Test</label><br/>
                  <input name="" type="checkbox"/><label htmlFor="">Test</label><br/>
                </div>

              </div>
            </div>
            <div className="col-md-9">
              <div className="ccContentArea">
                {listItems}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>)
  }
}

export default hot(module)(App);
