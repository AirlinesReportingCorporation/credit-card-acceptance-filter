import React, { Component } from "react";
import { MemoryRouter as Router, Route, Link } from "react-router-dom";
import { withRouter } from "react-router";
import { AnimatedRoute } from "react-router-transition";
import { Motion, spring } from "react-motion";
import { hot } from "react-hot-loader";
import axios from "axios";
import XLSX from "xlsx";

import Autosuggest from 'react-autosuggest';

//navigation
//import Navigation from './pages/Navigation.jsx';
function search(nameKey, myArray) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].Airline === nameKey) {
      return myArray[i];
    }
  }
}

function multiMatch(cardTypes, myArray, key) {
  var tempArray = [];
  for (var i = 0; i < myArray.length; i++) {
    var truthArray = 0;
    for (var j = 0; j < cardTypes.length; j++) {
      if (myArray[i][key] != undefined) {
        if (myArray[i][key].indexOf(cardTypes[j]) > -1) {
          if (tempArray.indexOf(myArray[i]) == -1) {
            truthArray++;
          }
        }
      }
    }

    if (truthArray == cardTypes.length) {
      tempArray.push(myArray[i]);
    }
  }

  return tempArray;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonHeaders: [],
      jsonData: [],
      cardData: [],
      filter: "",
      filterObj: [],
      cardFilter: [],
      cardList: []
    };

    this.getRoute = this.getRoute.bind(this);
    this.airlineChange = this.airlineChange.bind(this);
    this.cardChange = this.cardChange.bind(this);
    this.clearfilters = this.clearfilters.bind(this);
  }

  componentDidMount() {
    var e = this;
    //https://www2.arccorp.com/globalassets/support--training/agency-support/credit-card-acceptance/cc-acceptance-chart.xlsx
    axios({
      method: "get",
      url:
        "https://www2.arccorp.com/globalassets/support--training/agency-support/credit-card-acceptance/cchart.xlsx?" +
        new Date().toLocaleString(),
      responseType: "arraybuffer"
    }).then(function(response) {
      console.log("===== CC Chart Loaded =====");
      var data = new Uint8Array(response.data);
      var workbook = XLSX.read(data, { type: "array" });

      var workbookData = workbook["Sheets"]["CC Acceptance Chart"];

      var json = XLSX.utils.sheet_to_json(workbookData);

      var cardTypes = [];

      e.setState({ jsonData: json });

      //traverseEntireWorkBook
      for (var key in workbookData) {
        //value in cell
        var val = workbookData[key].w;

        var str = key.match(/[a-z]+|[^a-z]+/gi);

        if (str[0] === "D" && str[1] != 1) {
          var payments = val.split("\n");

          for (var i = 0; i < payments.length; i++) {
            var paymentVal = payments[i].trim();

            if (!(cardTypes.indexOf(paymentVal) > -1) && paymentVal != "") {
              cardTypes.push(paymentVal);
            }
          }
        }

        if (val) {
          if (str[1] === "1") {
            e.state.jsonHeaders[key[0]] = val; ///.replace(/ /g,"_").replace(":", "");
          }
          //console.log(val + ":" + str);
        }
      }

      e.setState({ cardList: cardTypes });

      console.log(e.state.jsonHeaders);
      console.log(e.state.cardList);
    });
  }

  airlineChange(e) {
    this.setState({ filter: e.target.value });
    //this.setState({filterObj: search(event.target.value, )})
    var x = document.getElementsByClassName("cardType");
    for (var i = 0; i < x.length; i++) {
      x[i].checked = false;
    }

    this.setState({ cardFilter: [] });
  }

  clearfilters() {
    //uncheck the checkboxes
    var x = document.getElementsByClassName("cardType");
    for (var i = 0; i < x.length; i++) {
      x[i].checked = false;
    }

    this.setState({ filter: "" });
    this.setState({ cardFilter: [] });
  }

  cardChange(cardType) {
    //remove airline filter
    this.setState({ filter: "" });

    var curArray = this.state.cardFilter;

    if (curArray.indexOf(cardType) > -1) {
      var tempArray = this.state.cardFilter;
      tempArray.splice(tempArray.indexOf(cardType), 1);
      this.setState({ cardFilter: tempArray });
    } else {
      curArray.push(cardType);
      this.setState({ cardFilter: curArray });
    }

    var match = multiMatch(
      this.state.cardFilter,
      this.state.jsonData,
      "Payment Type Accepted"
    );
    this.setState({ cardData: match });
  }

  //getRoute on route Navigation
  //update state for slide controls on navigation if needed
  getRoute(rPath, sCount) {}

  render() {
    //console.log(this.state.jsonData[0]);

    const airlineOptions = this.state.jsonData.map((data, i) => {
      return (
        <option key={i} value={data["Airline"]}>
          {data["Airline"]}
        </option>
      );
    });

    var objtofilter =
      this.state.filter != "" && this.state.filter != null
        ? [search(this.state.filter, this.state.jsonData)]
        : this.state.jsonData;

    if (this.state.cardFilter.length > 0) {
      objtofilter = this.state.cardData;
    }

    const paymentItems = this.state.cardList.map((data, i) => {
      return (
        <div key={i}>
          <label htmlFor={"card-" + i}>
            <input
              className="cardType"
              name={"card-" + i}
              type="checkbox"
              onChange={this.cardChange.bind(this, data)}
            />
            {data}
          </label>
        </div>
      );
    });

    const listItems = objtofilter.map((data, i) => {
      var payment,
        code,
        exception = "";

      if (data["Payment Type Accepted"]) {
        var pay = data["Payment Type Accepted"].split("\n");
        var innerPayment = pay.map((data, i) => {
          return (
            <div className={"paymentpill " + data.replace(/ /g, "-").replace(/\(/g, "").replace(/\)/g, "").replace("'", "")} key={i}>
              {data}
            </div>
          );
        });

        payment = (
          <div className="ccPayment">
            <strong>Form of Payment Accepted</strong>
            {innerPayment}
          </div>
        );
      }

      if (data["Code"]) {
        code = (
          <div className="ccCode">
            <strong>Restriction</strong>
            <p>{data["Code"]}</p>
          </div>
        );
      }

      if (data["Exception"]) {
        exception = (
          <div className="ccException">
            <strong>Exception</strong>
            <p>{data["Exception"]}</p>
          </div>
        );
      }

      var returnHTML = (
        <div key={i} className={"ccAirlineContainer " + data["Airline"]}>
          <div className="row">
            <div className="col-lg-4">
              <div className="ccSection1">
                <div className={"ccAirline"}>{data["Airline"]}</div>
                <div className="ccAirlineCode">{data["Airline Code"]}</div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="ccSection2">
                {payment}
                {code}
                {exception}
              </div>
            </div>
          </div>
        </div>
      );

      return returnHTML;
    });

    return (
      <div>
        <div className="ccJumbo">
          <div className="bgOpacity"></div>
          <h2 className="animated fadeInDown">Payment Acceptance</h2>
          <p className="animated fadeIn">
            The Airlines Reporting Corporation, ARC, provides processing of
            various forms of payments on behalf of an airline.
          </p>
          <p className="animated fadeIn">
            Each airline determines which forms of payments it accepts and then
            works with the Global Distribution Systems and ARC to support those
            payments. Each airline may also place restrictions or exceptions
            based on the form of payment.
          </p>
          <p className="animated fadeIn">
            The following information is provided to assist agencies and other
            parties in identifying forms of payment accepted by airlines and any
            restriction placed on the acceptance of those forms of payment.
          </p>
          <p className="animated fadeIn">
            If you have any question about payment acceptance through ARC please
            contact the Payment Services team at &nbsp;
            <a href="mailto:CreditCardServices@arccorp.com">
              CreditCardServices@arccorp.com
            </a>
            .
          </p>
        </div>

        <div className="ccContainer">
          <div className="container">
            <div className="row">
              <div className="col-lg-3">
                <div className="ccFilterSidebar">
                  <h3>Filter By:</h3>

                  <div className="ccFilterTitle">Airline</div>
                  <select
                    name="Airline"
                    id="Airline"
                    onChange={e => this.airlineChange(e)}
                    onInput={e => this.airlineChange(e)}
                    defaultValue={this.state.filter}
                    value={this.state.filter}
                  >
                    <option value="">Select an Airline</option>
                    {airlineOptions}
                  </select>

                  <div className="ccFilterTitle">Form of Payment</div>
                  <div className="ccFilterSection">{paymentItems}</div>

                  <div onClick={this.clearfilters} className="filterclear">
                    Clear Filters
                  </div>
                </div>
              </div>
              <div className="col-lg-9">
                <div className="ccContentArea">{listItems}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default hot(module)(App);
