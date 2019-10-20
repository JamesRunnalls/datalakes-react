import React, { Component } from 'react';
import epfl from './img/epfl.svg';
import eawag from './img/eawag.svg';
import unil from './img/unil.svg';
import geneve from './img/geneve.svg';
import carrtel from './img/carrtel.svg';
import sdsc from './img/sdsc.svg'
import './footer.css';

class Footer extends Component {
    render() { 
         return ( 
            <footer>
              <div className="container">
                  <div className="partners">
                      <a href="https://www.eawag.ch/en/department/siam/projects/datalakes/" target="_blank" className="card" title="Visit the Eawag project page for datalakes">
                          <img alt="Eawag Logo" src={eawag} />
                      </a>
                      <a href="https://datascience.ch/project/data-platform-and-bayesian-forecasting-of-swiss-lakes-datalakes/" target="_blank" title="Visit the SDSC project page for datalakes"><img alt="SDSC Logo" src={sdsc} /></a>
                      <a href="https://www.epfl.ch/research/domains/limnc/projects/lexplore/" target="_blank" title="Visit the EPFL project page for the L'EXPLORE platform"><img alt="EPFL Logo" src={epfl} /></a>
                      <a href="https://wp.unil.ch/lexplore/" target="_blank" title="Visit the UNIL project page for the L'EXPLORE platform"><img alt="UNIL Logo" src={unil} /></a>
                      <a href="https://www.unige.ch/sciences/terre/en/highlights/lexplore-floating-laboratory-study-lake-geneva/" target="_blank" title="Visit the UNIGE news page for the L'EXPLORE platform"><img alt="Universite de Geneve Logo" src={geneve} /></a>
                      <a href="https://www6.dijon.inra.fr/thonon/Actualites-du-CARRTEL/La-plateforme-experimentale-LeXPLORE-Exploration-du-Leman-baptisee" target="_blank" title="Visit the CARRTEL news page for the L'EXPLORE platform"><img alt="Carrtel Logo" src={carrtel} /></a>
                  </div>
                  <div className="copyright"><div className="inline">Copyright © 2019 Datalakes | </div><div className="inline">&nbsp; Developed @ Eawag</div></div>

              </div>
          </footer>
        );
    }
}
 
export default Footer;