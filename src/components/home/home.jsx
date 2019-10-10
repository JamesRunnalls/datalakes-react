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
                <div className="intro"><h2>The Open Data Platform for Swiss Lakes</h2></div>

                <div className="banner">
                    <Link to="/live" title="Explore our live observations" id="button-left" className="bannertext">
                        Live Observations
                    </Link>
                    <Link to="/predictions" className="bannertext" id="button-right" title="Explore our predictive lake models" >
                        Models Predictions
                    </Link>  
                    <br />            
                    <Link to="/live" title="Explore our live observations" id="img-left">
                        <img alt="Datalakes drawing left" src={LeftBanner} />
                    </Link>
                    <Link to="/predictions" title="Explore our predictive lake models" id="img-right">
                        <img alt="Datalakes drawing right" src={RightBanner} />
                    </Link>
                     
                </div>

                <div className="dataportal"><h2>Or access all data through our <Link to="/dataportal" title="Explore our data.">data portal</Link></h2></div>


            </React.Fragment>
        );
    }
}
 
export default Home;