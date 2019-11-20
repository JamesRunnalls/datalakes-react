import React, { Component } from 'react';
import Play from './img/play.svg';
import Pause from './img/pause.svg';
import Forward from './img/forward.svg';
import Backward from './img/backward.svg';
import './animationcontrols.css'

class AnimationControls extends Component {
    state = {
        playpause:"play"
    }

    play = () => {
        this.setState({ playpause:"play" });
    }

    pause = () => {
        this.setState({ playpause:"pause" });
    }

    render() { 
        if (this.state.playpause === "play"){
            return ( 
                <div className="animation-controls">
                    <img alt="Step backwards" className="step" src={Backward} />
                    <img onClick={() => this.pause()} title="Play" alt="Play Pause" className="playpause" src={Play} />
                    <img alt="Step forwards" className="step" src={Forward} />
                </div>
             );
        } else {
            return ( 
                <div className="animation-controls">
                    <img alt="Step backwards" className="step" src={Backward} />
                    <img onClick={() => this.play()} title="Pause" alt="Play Pause" className="playpause" src={Pause} />
                    <img alt="Step forwards" className="step" src={Forward} />
                </div>
             );
        }
    }
}

export default AnimationControls;