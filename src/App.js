import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Header from './format/header/header';
import Footer from './format/footer/footer';
import Live from './pages/live/live';
import Home from './pages/home/home';
import Predictions from './pages/prediction/prediction';
import NotFound from './pages/notfound/notfound';
import DataPortal from './pages/dataportal/dataportal';
import HydrodynamicModel from './pages/hydrodynamicmodel/hydrodynamicmodel';
import WeatherStationDetail from './pages/weatherstationdetail/weatherstationdetail';
import About from './pages/about/about';
import API from './pages/api/api';
import DataDetail from './pages/datadetail/datadetail';
import AddDataset from './pages/adddataset/adddataset';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
          <Header />
          <main className="container">
              <Switch>
                <Route path='/live' exact component={Live} />
                <Route path='/live' component={WeatherStationDetail} />

                <Route path='/predictions' exact component={Predictions} />
                <Route path='/predictions' component={HydrodynamicModel} />

                <Route path='/dataportal' component={DataPortal} />
                <Route path='/datadetail' component={DataDetail} />

                <Route path='/API' component={API} />
                
                <Route path='/about' component={About} />

                <Route path='/adddataset' component={AddDataset} />
                
                <Route path='/' exact component={Home} />
                <Route path='/' component={NotFound} />
              </Switch>
          </main>
          <Footer />
      </BrowserRouter>
    );
  }
}

export default App;
