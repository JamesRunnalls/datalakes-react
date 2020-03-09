import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom'
import logo from './img/logo.svg';
import contact from './img/contact.svg';
import live from './img/live.svg';
import data from './img/data.svg';
import predictions from './img/predictions.svg';
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
        var mainNav = "MainNav";
        var symbol = "\u2630";
        if (this.state.showMenu){mainNav = "MainNav Show";symbol="\u2715"};
         return ( 
            <header className="container">
            <div id="logo" className="logo">
                <Link to="/">
                    <img alt="Datalakes logo" src={logo} />
                </Link>
            </div>
            <div id="langs" className="langs">
                
            </div>
            <div className={mainNav}>
                <div className="links-widescreen">
                    <NavLink activeClassName="active" onClick={this.closeMenu} to="/live">Live</NavLink>
                    <NavLink activeClassName="active" onClick={this.closeMenu} to="/predictions">Predictions</NavLink>
                    <NavLink activeClassName="active" onClick={this.closeMenu} to="/dataportal">Data Portal</NavLink>
                </div>
                <div className="hamburger" onClick={this.toggle}><h3>{symbol} Menu</h3></div>
                <ul>
                    <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/">Home</NavLink></li>
                    <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/live">Live</NavLink></li>
                    <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/remotesensing">Remote Sensing</NavLink></li>
                    <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/predictions">Predictions</NavLink></li>
                    <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/dataportal">Data Portal</NavLink></li>
                    <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/api">API</NavLink></li>
                    <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/about">About</NavLink></li>
                </ul>
            </div>
            <div className="footer-nav">
                    <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/live"><img alt="Live Data" src={live} /></NavLink>
                    <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/predictions"><img alt="Predictions" src={predictions} /></NavLink>
                    <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/dataportal"><img alt="Data Portal" src={data} /></NavLink>
                    <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/about"><img alt="Contact" src={contact} /></NavLink>
            </div>



        </header>
        );
    }
}
 
export default Header;