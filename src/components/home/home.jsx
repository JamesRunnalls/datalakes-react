import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import LeftBanner from './img/leftbanner.svg';
import RightBanner from './img/rightbanner.svg';
import './home.css';

class Home extends Component {
    render() { 
        document.title = "Home - Datalakes";
         return ( 
            <React.Fragment>
                <div className="intro"><h1>The Open Data Platform for Swiss Lakes</h1></div>

                <div className="banner">
                    <Link to="/live" title="Explore our live observations">
                        <div className="bannersub left">
                            <span>
                                <div className="bannertext">
                                    <h2>Live</h2>
                                    <h3>Observations</h3>
                                </div>
                                <img alt="Datalakes drawing left" src={LeftBanner} />
                            </span>
                        </div>
                    </Link>
                    <Link to="/predictions" title="Explore our predictive lake models">
                        <div  className="bannersub right">
                            <span>
                                <img alt="Datalakes drawing right" src={RightBanner} />
                                <div className="bannertext">
                                    <h2>Predictions</h2>
                                    <h3>Lake Models</h3>
                                </div>
                            </span>
                        </div>
                    </Link>
                </div>

                <div className="dataportal"><h2>Or access all data through our <Link to="/dataportal" title="Explore our data.">data portal</Link></h2></div>


            </React.Fragment>
        );
    }
}
 
export default Home;