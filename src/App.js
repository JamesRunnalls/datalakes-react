import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Header from './format/header/header';
import Home from './pages/home/home';
import NotFound from './pages/notfound/notfound';
import DataPortal from './pages/dataportal/dataportal';
import Station from './pages/station/station';
import About from './pages/about/about';
import API from './pages/api/api';
import DataDetail from './pages/datadetail/datadetail';
import AddDataset from './pages/adddataset/adddataset';
import GIS from './pages/gis/gis';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
          <Header />
          <main>
              <Switch>
                <Route path='/live' component={Station} />

                <Route path='/map' exact component={GIS} />

                <Route path='/data' component={DataPortal} />
                <Route path='/datadetail' component={DataDetail} />

                <Route path='/API' component={API} />
                
                <Route path='/about' component={About} />

                <Route path='/adddataset' component={AddDataset} />
                
                <Route path='/' exact component={Home} />
                <Route path='/' component={NotFound} />
              </Switch>
          </main>
      </BrowserRouter>
    );
  }
}

export default App;
