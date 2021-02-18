import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.css";
import Header from "./format/header/header";
import Home from "./pages/home/home";
import NotFound from "./pages/notfound/notfound";
import DataPortal from "./pages/dataportal/dataportal";
import Station from "./pages/station/station";


import AddDataset from "./pages/adddataset/adddataset";
import GIS from "./pages/gis/gis";
import Footer from "./format/footer/footer";
import NetCDF from "./pages/netcdf/netcdf";
import ErrorBoundary from "./pages/errorboundary/errorboundary";
import ReactGA from "react-ga";
import Monitor from "./pages/monitor/monitor";
import LakeMorphology from "./pages/lakemorphology/lakemorphology";
import asyncComponent from './components/asynccomponent/asynccomponent';

const AsyncThreeViewer = asyncComponent(() => import("./graphs/three/threeviewer"));
const AsyncDataDetail = asyncComponent(() => import("./pages/datadetail/datadetail"));
const AsyncAPI = asyncComponent(() => import("./pages/api/api"));

ReactGA.initialize("UA-186400369-1");
ReactGA.pageview(window.location.pathname + window.location.search);

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Header />
        <main>
          <Switch>
            <Route
              path="/map"
              exact
              render={(props) => (
                <ErrorBoundary {...props}>
                  <GIS {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/data"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <DataPortal {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/datadetail"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <AsyncDataDetail {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/lakemorphology"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <LakeMorphology {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/lakestation"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <Station {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/API"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <AsyncAPI {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/netcdf"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <NetCDF {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/adddataset"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <AddDataset {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/three"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <AsyncThreeViewer {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/monitor"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <Monitor {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <Home {...props} />
                </ErrorBoundary>
              )}
              exact
            />

            <Route
              path="/"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <NotFound {...props} />
                </ErrorBoundary>
              )}
            />
          </Switch>
        </main>
        <Footer />
      </BrowserRouter>
    );
  }
}

export default App;
