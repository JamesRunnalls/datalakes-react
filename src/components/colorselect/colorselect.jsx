import React, { Component } from 'react';
import { GithubPicker } from 'react-color';
import './colorselect.css';

class ColorSelect extends Component {
    render() { 
        var { onchange, color } = this.props;
        var colors = ['transparent', 'white', 'lightgrey', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'darkblue', 'purple']
        return ( 
            <GithubPicker triangle="hide" colors={colors} onChangeComplete={onchange} color={color}/>
         );
    }
}
 
export default ColorSelect;