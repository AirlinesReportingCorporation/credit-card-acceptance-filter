import React, { Component } from "react";
import { MemoryRouter as Router, Route, Link } from "react-router-dom";
import { withRouter } from "react-router";
import { AnimatedRoute } from "react-router-transition";
import { Motion, spring } from "react-motion";
import { hot } from "react-hot-loader";
import axios from "axios";
import XLSX from "xlsx";

//navigation
//import Navigation from './pages/Navigation.jsx';
function search(nameKey, myArray) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].Airline === nameKey) {
      return myArray[i];
    }
  }
}

function multiMatch(cardTypes, myArray , key) {
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

    if(truthArray == cardTypes.length){
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
      cardFilter: []
    };

    this.getRoute = this.getRoute.bind(this);
    this.airlineChange = this.airlineChange.bind(this);
    this.cardChange = this.cardChange.bind(this);
    this.cardGen = this.cardGen.bind(this);
  }

  componentDidMount() {
    var e = this;
    //https://www2.arccorp.com/globalassets/support--training/agency-support/credit-card-acceptance/cc-acceptance-chart.xlsx
    axios({
      method: "get",
      url:
        "https://www2.arccorp.com/globalassets/support--training/agency-support/credit-card-acceptance/cc-acceptance-chart.xlsx?" +
        new Date().toLocaleString(),
      responseType: "arraybuffer"
    }).then(function(response) {
      console.log("===== CC Chart Loaded =====");
      var data = new Uint8Array(response.data);
      var workbook = XLSX.read(data, { type: "array" });

      var workbookData = workbook["Sheets"]["CC Acceptance Chart"];

      var json = XLSX.utils.sheet_to_json(workbookData);
      e.setState({ jsonData: json });

      //traverseEntireWorkBook
      for (var key in workbookData) {
        //value in cell
        var val = workbookData[key].w;

        var str = key.match(/[a-z]+|[^a-z]+/gi);

        if (val) {
          if (str[1] === "1") {
            e.state.jsonHeaders[key[0]] = val; ///.replace(/ /g,"_").replace(":", "");
          }
          //console.log(val + ":" + str);
        }
      }

      console.log(e.state.jsonHeaders);
    });
  }

  airlineChange() {
    this.setState({ filter: event.target.value });
    //this.setState({filterObj: search(event.target.value, )})
  }

  cardGen() {}

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

    var match = multiMatch(this.state.cardFilter, this.state.jsonData, "Payment Type Accepted");
    this.setState({cardData: match});
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
    
    if(this.state.cardFilter.length > 0) {
      objtofilter = this.state.cardData;
    }

    const listItems = objtofilter.map((data, i) => {
      var payment,
        code,
        exception = "";

      if (data["Payment Type Accepted"]) {
        payment = (
          <div className="ccPayment">
            <strong>Payment Types Accepted</strong>
            <p>{data["Payment Type Accepted"]}</p>
          </div>
        );
      }

      if (data["Code"]) {
        code = (
          <div className="ccCode">
            <strong>Code</strong>
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
            <div className="col-md-4">
              <div className="ccSection1">
                <div className={"ccAirline"}>{data["Airline"]}</div>
                <div className="ccAirlineCode">{data["Airline Code"]}</div>
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
      );

      return returnHTML;
    });

    return (
      <div>
        <div className="ccJumbo">
          <div className="bgOpacity"></div>
          <h2 className="animated fadeInDown">Credit Card Acceptance</h2>
          <p className="animated fadeIn">
            The Airline Credit Card Acceptance Chart denotes Airlines&apos;
            acceptance of different credit cards. The chart also identifies any
            restrictions Airlines have for accepting credit cards on their
            behalf.
          </p>
        </div>

        <div className="ccContainer">
          <div className="container">
            <div className="row">
              <div className="col-md-3">
                <div className="ccFilterSidebar">
                  <h3>Filter</h3>

                  <div className="ccFilterTitle">Airline</div>
                  <select
                    name="Airline"
                    id="Airline"
                    onChange={this.airlineChange}
                    value={this.state.filter}
                  >
                    <option value="">Select an Airline</option>
                    {airlineOptions}
                  </select>

                  <div className="ccFilterTitle">Card Type</div>
                  <div className="ccFilterSection">
                    <input
                      name="card"
                      type="checkbox"
                      onChange={this.cardChange.bind(this, "AMEX")}
                    />
                    <label htmlFor="">AMEX</label>
                    <br />
                    <input
                      name="card"
                      type="checkbox"
                      onChange={this.cardChange.bind(this, "CA")}
                    />
                    <label htmlFor="">CA</label>
                    <br />
                    <input
                      name="card"
                      type="checkbox"
                      onChange={this.cardChange.bind(this, "DCI")}
                    />
                    <label htmlFor="">DCI</label>
                    <br />
                    <input
                      name="card"
                      type="checkbox"
                      onChange={this.cardChange.bind(this, "DS")}
                    />
                    <label htmlFor="">DS</label>
                    <br />
                    <input
                      name="card"
                      type="checkbox"
                      onChange={this.cardChange.bind(this, "JCB")}
                    />
                    <label htmlFor="">JCB</label>
                    <br />
                    <input
                      name="card"
                      type="checkbox"
                      onChange={this.cardChange.bind(this, "UATP")}
                    />
                    <label htmlFor="">UATP</label>
                    <br />
                    <input
                      name="card"
                      type="checkbox"
                      onChange={this.cardChange.bind(this, "VI")}
                    />
                    <label htmlFor="">VI</label>
                    <br />
                  </div>

                  
                </div>
              </div>
              <div className="col-md-9">
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
