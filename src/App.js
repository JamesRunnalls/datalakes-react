import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Header from './components/header/header';
import Footer from './components/footer/footer';
import Live from './components/live/live';
import Home from './components/home/home';
import Predictions from './components/prediction/prediction';
import NotFound from './components/notfound/notfound';
import DataPortal from './components/dataportal/dataportal';
import HydrodynamicModel from './components/hydrodynamicmodel/hydrodynamicmodel';
import WeatherStationDetail from './components/weatherstationdetail/weatherstationdetail';
import About from './components/about/about';
import API from './components/api/api';
import DataDetail from './components/datadetail/datadetail';

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
                <Route path='/data' component={DataDetail} />

                <Route path='/API' component={API} />
                
                <Route path='/about' component={About} />
                
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
