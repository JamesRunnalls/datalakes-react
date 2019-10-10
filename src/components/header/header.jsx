import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom'
import logo from './img/logo.svg';
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
                    <div className="hamburger" onClick={this.toggle}><h3>{symbol} Menu</h3></div>
                    <ul>
                      <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/live">Live</NavLink></li>
                      <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/predictions">Predictions</NavLink></li>
                      <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/dataportal">Data Portal</NavLink></li>
                      <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/api">API</NavLink></li>
                      <li><NavLink activeClassName="active" onClick={this.closeMenu} to="/about">About</NavLink></li>
                    </ul>
                  </div>
        </header>
        );
    }
}
 
export default Header;