import React, { Component } from "react";
import { Link } from "react-router-dom";
import Twitter from "../../components/twitter/twitter";
import epfl from "./img/epfl.svg";
import eawag from "./img/eawag.svg";
import unil from "./img/unil.svg";
import geneve from "./img/geneve.svg";
import carrtel from "./img/carrtel.svg";
import sdsc from "./img/sdsc.svg";
import "./home.css";

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
              <Link to="/map">
                <div className="home-banner live">
                  <div className="inner-banner left">
                    Map
                    <br />
                    Viewer
                  </div>
                  <div className="inner-banner right">
                    <div className="inner-banner-vert">
                      Real time access to water temperature and weather
                      observations across Switzerland.
                    </div>
                  </div>
                </div>
              </Link>
              <Link to="/dataportal">
                <div className="home-banner data">
                  <div className="inner-banner left">
                    Data
                    <br />
                    Portal
                  </div>
                  <div className="inner-banner right">
                    <div className="inner-banner-vert">
                      Visualise, download and see the lineage of our
                      limnological data.
                    </div>
                  </div>
                </div>
              </Link>
              <div className="home-partners">
                <a
                  className="home-partner-logo"
                  href="https://www.eawag.ch/en/department/siam/projects/datalakes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit the Eawag project page for datalakes"
                >
                  <img alt="Eawag Logo" src={eawag} />
                </a>
                <a
                  className="home-partner-logo"
                  href="https://datascience.ch/project/data-platform-and-bayesian-forecasting-of-swiss-lakes-datalakes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit the SDSC project page for datalakes"
                >
                  <img alt="SDSC Logo" src={sdsc} />
                </a>
                <a
                  className="home-partner-logo"
                  href="https://www.epfl.ch/research/domains/limnc/projects/lexplore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit the EPFL project page for the L'EXPLORE platform"
                >
                  <img alt="EPFL Logo" src={epfl} />
                </a>
                <a
                  className="home-partner-logo"
                  href="https://wp.unil.ch/lexplore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit the UNIL project page for the L'EXPLORE platform"
                >
                  <img alt="UNIL Logo" src={unil} />
                </a>
                <a
                  className="home-partner-logo"
                  href="https://www.unige.ch/sciences/terre/en/highlights/lexplore-floating-laboratory-study-lake-geneva/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit the UNIGE news page for the L'EXPLORE platform"
                >
                  <img
                    alt="Universite de Geneve Logo"
                    src={geneve}
                    className="black"
                  />
                </a>
                <a
                  className="home-partner-logo"
                  href="https://www6.dijon.inra.fr/thonon/Actualites-du-CARRTEL/La-plateforme-experimentale-LeXPLORE-Exploration-du-Leman-baptisee"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit the CARRTEL news page for the L'EXPLORE platform"
                >
                  <img alt="Carrtel Logo" src={carrtel} />
                </a>
              </div>
            </div>
          </div>
          <Twitter />
        </div>
      </React.Fragment>
    );
  }
}

export default Home;
