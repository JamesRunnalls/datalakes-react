import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import epfl from './img/epfl.svg';
import epflc from './img/epflc.svg';
import eawag from './img/eawag.svg';
import eawagc from './img/eawagc.svg';
import unil from './img/unil.svg';
import unilc from './img/unilc.svg';
import geneve from './img/geneve.svg';
import genevec from './img/genevec.svg';
import carrtel from './img/carrtel.svg';
import carrtelc from './img/carrtelc.svg';
import sdsc from './img/sdsc.svg'
import sdscc from './img/sdscc.svg'
import './footer.css';

class Footer extends Component {
    render() { 
         return ( 
            <footer>
              <div className="container">
                  <div className="partners">
                      <a className="partner-logo" href="https://www.eawag.ch/en/department/siam/projects/datalakes/" target="_blank" title="Visit the Eawag project page for datalakes">
                          <img alt="Eawag Logo" src={eawag} className="black" />
                          <img alt="Eawag Logo" src={eawagc} className="color" />
                      </a>
                      <a className="partner-logo" href="https://datascience.ch/project/data-platform-and-bayesian-forecasting-of-swiss-lakes-datalakes/" target="_blank" title="Visit the SDSC project page for datalakes">
                          <img alt="SDSC Logo" src={sdsc} className="black" />
                          <img alt="SDSC Logo" src={sdscc} className="color" />
                      </a>
                      <a className="partner-logo" href="https://www.epfl.ch/research/domains/limnc/projects/lexplore/" target="_blank" title="Visit the EPFL project page for the L'EXPLORE platform">
                          <img alt="EPFL Logo" src={epfl} className="black" />
                          <img alt="EPFL Logo" src={epflc} className="color" />
                      </a>
                      <a className="partner-logo" href="https://wp.unil.ch/lexplore/" target="_blank" title="Visit the UNIL project page for the L'EXPLORE platform">
                          <img alt="UNIL Logo" src={unil} className="black" />
                          <img alt="UNIL Logo" src={unilc} className="color" />
                      </a>
                      <a className="partner-logo" href="https://www.unige.ch/sciences/terre/en/highlights/lexplore-floating-laboratory-study-lake-geneva/" target="_blank" title="Visit the UNIGE news page for the L'EXPLORE platform">
                          <img alt="Universite de Geneve Logo" src={geneve} className="black" />
                          <img alt="Universite de Geneve Logo" src={genevec} className="color" />
                      </a>
                      <a className="partner-logo" href="https://www6.dijon.inra.fr/thonon/Actualites-du-CARRTEL/La-plateforme-experimentale-LeXPLORE-Exploration-du-Leman-baptisee" target="_blank" title="Visit the CARRTEL news page for the L'EXPLORE platform">
                          <img alt="Carrtel Logo" src={carrtel} className="black" />
                          <img alt="Carrtel Logo" src={carrtelc} className="color" />
                      </a>
                  </div>
                  <div className="copyright">
                      <span className="contact">
                          <Link to="about">Contact us</Link>
                      </span>
                      <div className="inline">Copyright © 2019 Datalakes | </div><div className="inline">&nbsp; Developed @ Eawag</div>
                </div>

              </div>
          </footer>
        );
    }
}
 
export default Footer;