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
        var mainNav = "MainNav";
        var symbol = ">";
        if (this.state.showMenu){mainNav = "MainNav Show";symbol="<"};
         return ( 
            <header className="container">
            <div id="logo" className="logo">
                <Link to="/">
                    <img alt="Datalakes logo" src={logo} />
                </Link>
            </div>
            <div id="langs" className="langs"></div>
            <div className={mainNav}>
                <div className="links-widescreen">
                    <NavLink activeClassName="active" onClick={this.closeMenu} to="/live">Live</NavLink>
                    <NavLink activeClassName="active" onClick={this.closeMenu} to="/predictions">Predictions</NavLink>
                    <NavLink activeClassName="active" onClick={this.closeMenu} to="/dataportal">Data Portal</NavLink>
                </div>
                <div className="hamburger" onClick={this.toggle}><h3>More <div className="header-rotate">{symbol}</div></h3></div>
                <div className="header-dropdown">
                    <div className="mobile"><NavLink onClick={this.closeMenu} to="/"><img alt="Home" src={home} /></NavLink></div>
                    <div className="desktop"><NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/live"><img alt="Live Data" src={live} /></NavLink></div>
                    <div className="mobile"><NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/remotesensing"><img alt="Remote Sensing" src={rs} /></NavLink></div>
                    <div className="desktop"><NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/predictions"><img alt="Predictions" src={predictions} /></NavLink></div>
                    <div className="desktop"><NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/dataportal"><img alt="Data Portal" src={data} /></NavLink></div>
                    <div className="mobile"><NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/api"><img alt="API" src={api} /></NavLink></div>
                    <div className="mobile"><NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/about"><img alt="Contact" src={contact} /></NavLink></div>
                </div>
            </div>
            <div className="footer-nav">
                    <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/live"><img alt="Live Data" src={live} /></NavLink>
                    <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/predictions"><img alt="Predictions" src={predictions} /></NavLink>
                    <NavLink activeClassName="imgactive" onClick={this.closeMenu} to="/dataportal"><img alt="Data Portal" src={data} /></NavLink>
                    <div onClick={this.toggle} ><img alt="More" src={more} /></div>
            </div>
        </header>
        );
    }
}
 
export default Header;