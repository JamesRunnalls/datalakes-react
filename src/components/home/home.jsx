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
                            <Link to="/live">
                                <div className="home-banner live">
                                    <div className="inner-banner left">
                                        Live<br />Observations
                                    </div>
                                    <div className="inner-banner right">
                                        <div className="inner-banner-vert">
                                            Real time access to water temperature and weather observations across Switzerland.
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <Link to="/predictions">
                                <div className="home-banner predictions">
                                    <div className="inner-banner left">
                                        Model<br />Predictions
                                    </div>
                                    <div className="inner-banner right">
                                        <div className="inner-banner-vert">
                                            Hydrodynamic model now-casts and forecasts for lakes across Switzerland.
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <Link to="/dataportal">
                                <div className="home-banner data">
                                    <div className="inner-banner left">
                                        Data<br />Portal
                                    </div>
                                    <div className="inner-banner right">
                                        <div className="inner-banner-vert">
                                            Visualise, download and see the lineage of our limnological data.
                                        </div>
                                    </div>
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