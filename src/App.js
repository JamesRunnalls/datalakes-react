import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import Header from "./format/header/header";
import Home from "./pages/home/home";
import NotFound from "./pages/notfound/notfound";
import DataPortal from "./pages/dataportal/dataportal";
import Station from "./pages/station/station";
import API from "./pages/api/api";
import DataDetail from "./pages/datadetail/datadetail";
import AddDataset from "./pages/adddataset/adddataset";
import GIS from "./pages/gis/gis";
import Footer from "./format/footer/footer";
import ch2018Graph from "./pages/datadetail/inner/ch2018graph";
import ThreeViewer from "./graphs/three/threeviewer";
import NetCDF from "./pages/netcdf/netcdf";
import Amplify from "aws-amplify";
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Header />
        <main>
          <Switch>
            <Route path="/live" component={Station} />

            <Route path="/map" exact component={GIS} />

            <Route path="/data" component={DataPortal} />
            <Route path="/datadetail" component={DataDetail} />
            <Route path="/lakestation" component={Station} />

            <Route path="/API" component={API} />

            <Route path="/netcdf" component={NetCDF} />

            <Route path="/adddataset" component={AddDataset} />

            <Route path="/ch2018" component={ch2018Graph} />
            <Route path="/three" component={ThreeViewer} />

            <Route path="/" exact component={Home} />
            <Route path="/" component={NotFound} />
          </Switch>
        </main>
        <Footer />
      </BrowserRouter>
    );
  }
}

export default App;
