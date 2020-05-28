import React, { Component } from "react";
import { Link } from "react-router-dom";
import Twitter from "../../components/twitter/twitter";
import ContactForm from "../../components/contactform/contactform";
import epfl from "./img/epfl.svg";
import epflc from "./img/epflc.svg";
import eawag from "./img/eawag.svg";
import eawagc from "./img/eawagc.svg";
import unil from "./img/unil.svg";
import unilc from "./img/unilc.svg";
import geneve from "./img/geneve.svg";
import genevec from "./img/genevec.svg";
import carrtel from "./img/carrtel.svg";
import carrtelc from "./img/carrtelc.svg";
import sdsc from "./img/sdsc.svg";
import sdscc from "./img/sdscc.svg";
import map from "./img/map.png";
import data from "./img/data.png";
import api from "./img/api.png";
import rs from "./img/rs.png";
import zurich from "./img/zurich.png";
import "./home.css";

class PartnerBanner extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <div className="home-partners">
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www.eawag.ch/en/department/siam/projects/datalakes/"
            target="_blank"
            title="Visit the Eawag project page for datalakes"
          >
            <img alt="Eawag Logo" src={eawag} className="black" />
            <img alt="Eawag Logo" src={eawagc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://datascience.ch/project/data-platform-and-bayesian-forecasting-of-swiss-lakes-datalakes/"
            target="_blank"
            title="Visit the SDSC project page for datalakes"
          >
            <img alt="SDSC Logo" src={sdsc} className="black" />
            <img alt="SDSC Logo" src={sdscc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www.epfl.ch/research/domains/limnc/projects/lexplore/"
            target="_blank"
            title="Visit the EPFL project page for the L'EXPLORE platform"
          >
            <img alt="EPFL Logo" src={epfl} className="black" />
            <img alt="EPFL Logo" src={epflc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://wp.unil.ch/lexplore/"
            target="_blank"
            title="Visit the UNIL project page for the L'EXPLORE platform"
          >
            <img alt="UNIL Logo" src={unil} className="black" />
            <img alt="UNIL Logo" src={unilc} className="color" />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www.unige.ch/sciences/terre/en/highlights/lexplore-floating-laboratory-study-lake-geneva/"
            target="_blank"
            title="Visit the UNIGE news page for the L'EXPLORE platform"
          >
            <img
              alt="Universite de Geneve Logo"
              src={geneve}
              className="black"
            />
            <img
              alt="Universite de Geneve Logo"
              src={genevec}
              className="color"
            />
          </a>
          <a
            className="partner-logo"
            rel="noopener noreferrer"
            href="https://www6.dijon.inra.fr/thonon/Actualites-du-CARRTEL/La-plateforme-experimentale-LeXPLORE-Exploration-du-Leman-baptisee"
            target="_blank"
            title="Visit the CARRTEL news page for the L'EXPLORE platform"
          >
            <img alt="Carrtel Logo" src={carrtel} className="black" />
            <img alt="Carrtel Logo" src={carrtelc} className="color" />
          </a>
        </div>
      </React.Fragment>
    );
  }
}

class Triple extends Component {
  state = {};
  render() {
    var { id, title, text, img, link } = this.props;
    return (
      <React.Fragment>
        <div id={id} className="triple">
          <div className="triple-inner">
            <div className="triple-img">
              <img src={img[0]} alt={title} />
            </div>
            <div className="triple-title">{title[0]}</div>
            <div className="triple-text">{text[0]}</div>
            <div className="triple-button">
              {link && (
                <Link to={link[0]}>
                  <button>{title[0]}</button>
                </Link>
              )}
            </div>
          </div>
          <div className="triple-inner">
            <div className="triple-img">
              <img src={img[1]} alt={title} />
            </div>
            <div className="triple-title">{title[1]}</div>
            <div className="triple-text">{text[1]}</div>
            <div className="triple-button">
              {link && (
                <Link to={link[1]}>
                  <button>{title[1]}</button>
                </Link>
              )}
            </div>
          </div>
          <div className="triple-inner">
            <div className="triple-img">
              <img src={img[2]} alt={title} />
            </div>
            <div className="triple-title">{title[2]}</div>
            <div className="triple-text">{text[2]}</div>
            <div className="triple-button">
              {link && (
                <Link to={link[2]}>
                  <button>{title[2]}</button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.ourdata = React.createRef();
    this.accessoptions = React.createRef();
    this.about = React.createRef();
    this.contact = React.createRef();
  }
  componentDidMount() {
    this.parseSearch();
  }
  componentDidUpdate() {
    this.parseSearch();
  }

  parseSearch = () => {
    try {
      var { search } = this.props.location;
      if (search) {
        if (search === "?ourdata") this.scrollTo(this.ourdata, -50);
        if (search === "?accessoptions") this.scrollTo(this.accessoptions, -50);
        if (search === "?about") this.scrollTo(this.about, -50);
        if (search === "?contact") this.scrollTo(this.contact, -50);
      }
    } catch (e) {
      console.log(e);
    }
  };

  scrollTo = (rf, plus) => {
    window.scrollTo({
      top: rf.current.offsetTop + plus,
      behavior: "smooth",
    });
  };

  render() {
    document.title = "Home - Datalakes";
    return (
      <React.Fragment>
        <div className="home">
          <div id="home-banner" className="home-banner">
            <div className="home-tagline">
              Search, visualise and download data on Swiss lakes.
            </div>

            <button onClick={() => this.scrollTo(this.ourdata, -50)}>
              Find out more
            </button>
          </div>

          <PartnerBanner />
          <Twitter />

          <div className="sectiontitle" ref={this.ourdata}>
            Datalakes is a collaboration between a number of Swiss institutions
            to facilitate the disemination of reproducable datasets for Swiss
            lakes.
            <div className="sub">
              We provide lake simulations, insitu measurements and remote
              sensing data.
            </div>
            <div className="scroll">
              Keep scrolling to find our more about our datasets.
            </div>
            <div className="arrow">&darr;</div>
          </div>

          <div className="section lakesimulations">
            <img src={zurich} alt="Simulation of Lake Zurich" />
            <div className="textbox">
              <div className="straptext">
                Datalakes provides access to{" "}
                <b>hydrodynamic lake simulations</b>. Explore fluctuations of
                temperature and velocity at incredibly high spatial resolution
                over extended periods of time.
              </div>
              <div className="numberbox">
                <div className="number">4</div>
                3D Models
              </div>
              <div className="numberbox">
                <div className="number">54</div>
                1D Models
              </div>
            </div>
          </div>

          <div className="section insitudata">
            <div className="insitutext">
              <div className="title">
                {" "}
                Discover years of sampling and insitu data measurements.
              </div>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="numberbox">
                        <div className="number">22</div>
                        Insitu Datasets
                      </div>
                    </td>
                    <td>
                      <div className="numberbox">
                        <div className="number">36</div>
                        Measured Parameters
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="numberbox">
                        <div className="number">8</div>
                        Near-realtime datasets
                      </div>
                    </td>
                    <td>
                      <div className="numberbox">
                        <div className="number">34</div>
                        Lakes sampled
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="section rs">
            <div className="text">
              Access remotely sensed water quality parameters including
              cholorphyll and total suspended matter for water bodies across
              Switerland.
            </div>
            <img src={rs} alt="Remote sensing layer"/>
          </div>

          <div className="sectiontitle" ref={this.accessoptions}>
            Datalakes is helping drive limnology into the digital era with a
            step change in reproducability.
            <div className="acc">
              <div className="lw">
                <div className="letter">F</div>
                <div className="word">indable</div>
              </div>
              <div className="lw">
                <div className="letter">A</div>
                <div className="word">ccessible</div>
              </div>
              <div className="lw">
                <div className="letter">I</div>
                <div className="word">nteroperable</div>
              </div>
              <div className="lw">
                <div className="letter">R</div>
                <div className="word">eusable</div>
              </div>
            </div>
            <div className="sub">
              Plot geospatial data using our map viewer, visualise and download
              datasets in our data portal or get direct access through our API.
            </div>
            <div className="scroll">
              Keep scrolling to find our more about access options.
            </div>
            <div className="arrow">&darr;</div>
          </div>

          <Triple
            id="accessoptions"
            main="Access Options"
            title={["Map Viewer", "Data Portal", "API"]}
            img={[map, data, api]}
            text={[
              "Visualise geospatial lake data. The Datalakes Web Viewer allows you to plot multiple lake datasets.",
              "Access our full data repository, filter, search and discover data.",
              "Programmatic access to Datalakes datasets.",
            ]}
            link={["/map", "/data", "/api"]}
          />
          <div className="sectiontitle" ref={this.about}>
            <h2>About Datalakes</h2>
          </div>
          <div className="home-text">
            <div>
              <b>
                Heterogeneous data platform for operational modeling and
                forecasting of Swiss lakes
              </b>
            </div>
            The objective of this project is to advance the forecasting
            capabilities of the data-driven hydrological and ecological lake
            modeling algorithms using methodologies inspired by data science and
            accelerated by high performance computing. We aim to develop a
            parallel framework interfacing high resolution 3D numerical solvers
            for the underlying lake dynamics with modern numerical Markov Chain
            Monte Carlo sampling methods for Bayesian inference, with particular
            interest in investigating particle filtering and multi-level
            variance reduction methodologies. The resulting framework aims at
            accurate data assimilation and uncertainty quantification in both
            model parameters and the associated forecasts. DATALAKES project is
            a collaboration with the Swiss Data Science Center (SDSC), EPF
            Lausanne and ETH Zurich, aiming at a sensor-to -frontend data
            platform providing and analyzing the dynamics of lake ecosystems at
            high spatial and temporal resolutions.
          </div>
          <div className="sectiontitle" ref={this.contact}>
            <h2>Get in Touch</h2>
          </div>
          <div className="home-text">
            <ContactForm />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Home;
