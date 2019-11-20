import React, { Component } from 'react';
import SidebarLayout from '../../format/sidebarlayout/sidebarlayout';
import ContactForm from '../../components/contactform/contactform';

class About extends Component {
    render() { 
        document.title = "About - Datalakes";
         return ( 
            <React.Fragment>
                <h1>About Datalakes</h1>
                <SidebarLayout 
                    sidebartitle="Get in touch" 
                    left={
                        <React.Fragment>
                           <div><b>Heterogeneous data platform for operational modeling and forecasting of Swiss lakes</b></div>
                           The objective of this project is to advance the forecasting capabilities of the data-driven hydrological and ecological
                            lake modeling algorithms using methodologies inspired by data science and accelerated by high performance computing. We 
                            aim to develop a parallel framework interfacing high resolution 3D numerical solvers for the underlying lake dynamics 
                            with modern numerical Markov Chain Monte Carlo sampling methods for Bayesian inference, with particular interest in 
                            investigating particle filtering and multi-level variance reduction methodologies. The resulting framework aims at 
                            accurate data assimilation and uncertainty quantification in both model parameters and the associated forecasts. DATALAKES 
                            project is a collaboration with the Swiss Data Science Center (SDSC), EPF Lausanne and ETH Zurich, aiming at a sensor-to
                            -frontend data platform providing and analyzing the dynamics of lake ecosystems at high spatial and temporal resolutions. 
                        </React.Fragment>
                        } 
                    right={
                        <ContactForm />
                        }
                />
            </React.Fragment>
        );
    }
}
 
export default About;