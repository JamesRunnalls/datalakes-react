import React, { Component } from 'react';
import { GithubPicker } from 'react-color';
import './colorselect.css';

class ColorSelect extends Component {
    render() { 
        var { id, onchange, defaultcolor } = this.props;
        var colors = ['transparent', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB', '#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#BEDADC', '#C4DEF6', '#BED3F3', '#D4C4FB']
        return ( 
            <GithubPicker triangle="hide" colors={colors} onChangeComplete={onchange}/>
         );
    }
}
 
export default ColorSelect;