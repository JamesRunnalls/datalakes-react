import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom'
import logo from './img/logo.svg';
import contact from './img/contact.svg';
import live from './img/live.svg';
import data from './img/data.svg';
import predictions from './img/predictions.svg';
import home from './img/home.svg';
import more from './img/more.svg';
import rs from './img/rs.svg';
import api from './img/api.svg';
import './header.css';

class Header extends Component {
    state = {
        showMenu : false
    }

    toggle = () => {
        this.setState({showMenu: !this.state.showMenu});
    }

    closeMenu = () => {
        this.setState({showMenu: false});
    }

    render() { 
        var { showMenu } = this.state;
         return ( 
            <header>
                <div className="logo">
                    <Link to="/">
                        <img alt="Datalakes logo" src={logo} />
                    </Link>
                </div>
                
                <div className="desktop-nav">
                    <div className="desktop-navbar">
                        <div className="links">
                            <NavLink activeClassName="active" onClick={this.closeMenu} to="/live">Live</NavLink>
                            <NavLink activeClassName="active" onClick={this.closeMenu} to="/predictions">Predictions</NavLink>
                            <NavLink activeClassName="active" onClick={this.closeMenu} to="/dataportal">Data Portal</NavLink>
                        </div>
                        <div className="menu-icon" onClick={this.toggle}><h3>More <div className="symbol">{showMenu ? ">":"<"}</div></h3></div>
                    </div>
                    <div className={showMenu ? "desktop-menu show" : "desktop-menu"}>
                        <NavLink activeClassName="home" onClick={this.closeMenu} to="/">Home</NavLink>
                        <NavLink activeClassName="active" onClick={this.closeMenu} to="/remotesensing">Remote Sensing</NavLink>
                        <NavLink activeClassName="active" onClick={this.closeMenu} to="/api">API</NavLink>
                        <NavLink activeClassName="active" onClick={this.closeMenu} to="/about">About</NavLink>
                        <div className="midscreen">
                            <NavLink activeClassName="active" onClick={this.closeMenu} to="/live">Live</NavLink>
                            <NavLink activeClassName="active" onClick={this.closeMenu} to="/predictions">Predictions</NavLink>
                            <NavLink activeClassName="active" onClick={this.closeMenu} to="/dataportal">Data Portal</NavLink>
                        </div>        
                    </div>
                </div>
          
                <div className="mobile-nav">
                    <div className="mobile-navbar">
                        <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/live"><img alt="Live Data" src={live} /></NavLink>
                        <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/predictions"><img alt="Predictions" src={predictions} /></NavLink>
                        <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/dataportal"><img alt="Data Portal" src={data} /></NavLink>
                        <div onClick={this.toggle} className="more"><img alt="More" src={more} /></div>
                    </div>
                    <div className={showMenu ? "mobile-menu show" : "mobile-menu"}>
                        <NavLink onClick={this.closeMenu} to="/"><img alt="Home" src={home} /></NavLink>
                        <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/remotesensing"><img alt="Remote Sensing" src={rs} /></NavLink>
                        <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/api"><img alt="API" src={api} /></NavLink>
                        <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/about"><img alt="Contact" src={contact} /></NavLink>
                    </div>
                </div>
            </header>
        );
    }
}
 
export default Header;