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
import ThreeViewer from "./graphs/three/threeviewer";
import NetCDF from "./pages/netcdf/netcdf";
import ErrorBoundary from './pages/errorboundary/errorboundary';

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
                  <DataDetail {...props} />
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
                  <API {...props} />
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
              path="/ch2018"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <ch2018Graph {...props} />
                </ErrorBoundary>
              )}
            />

            <Route
              path="/three"
              render={(props) => (
                <ErrorBoundary {...props}>
                  <ThreeViewer {...props} />
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
