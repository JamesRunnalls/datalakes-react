import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './home.css';

class Home extends Component {
    render() { 
        document.title = "Home - Datalakes";
         return ( 
            <React.Fragment>
                <div className="home-container">
                    <div className="home-inner" id="home-left">
                        <div className="home-content">
                            <div className="home-text">
                                Explore <b>the</b> data portal for Swiss lakes.
                            </div>
                            <Link to="/about" title="Learn more about datalakes">
                                <button className="home-button">Learn More</button>
                            </Link>
                        </div>
                    </div>
                    <div className="home-inner">
                        <div className="home-banners">
                            <Link to="/live" title="See live lake observations">
                                <div className="home-banner live">
                                    Live Observations
                                </div>
                            </Link>
                            <Link to="/predictions" title="See model predictions">
                                <div className="home-banner predictions">
                                    Model Predictions
                                </div>
                            </Link>
                            <Link to="/dataportal" title="See data portal">
                                <div className="home-banner data">
                                    Data Portal
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

            </React.Fragment>
        );
    }
}
 
export default Home;