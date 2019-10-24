import React, { Fragment, Component } from "react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import './dateslider.css';

// *******************************************************
// SLIDER RAIL (no tooltips)
// *******************************************************

export function SliderRail({ getRailProps }) {
return (
    <Fragment>
    <div className="railOuterStyle" {...getRailProps()} />
    <div className="railInnerStyle" />
    </Fragment>
)
}

SliderRail.propTypes = {
getRailProps: PropTypes.func.isRequired,
}

// *******************************************************
// HANDLE COMPONENT
// *******************************************************
function formatTooltip(ms) {
    return format(new Date(ms), "d.MM.yy");
}

export class Handle extends Component {
state = {
    mouseOver: false,
}

onMouseEnter = () => {
    this.setState({ mouseOver: true })
}

onMouseLeave = () => {
    this.setState({ mouseOver: false })
}

render() {
    const {
    domain: [min, max],
    handle: { id, value, percent },
    isActive,
    disabled,
    getHandleProps,
    } = this.props
    const { mouseOver } = this.state

    return (
    <Fragment>
        {(mouseOver || isActive) && !disabled ? (
        <div
            style={{
            left: `${percent}%`,
            position: 'absolute',
            marginLeft: '-25px',
            marginTop: '-35px',
            }}
        >
            <div className="tooltip">
            <span className="tooltiptext">{formatTooltip(value)}</span>
            </div>
        </div>
        ) : null}
        <div
        style={{
            left: `${percent}%`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            WebkitTapHighlightColor: 'rgba(0,0,0,0)',
            zIndex: 400,
            width: 26,
            height: 42,
            cursor: 'pointer',
            // border: '1px solid grey',
            backgroundColor: 'none',
        }}
        {...getHandleProps(id, {
            onMouseEnter: this.onMouseEnter,
            onMouseLeave: this.onMouseLeave,
        })}
        />
        <div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
            left: `${percent}%`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            WebkitTapHighlightColor: 'rgba(0,0,0,0)',
            zIndex: 300,
            width: 2,
            height: 20,
            border: 0,
            backgroundColor: disabled ? '#666' : '#000',
        }}
        />
    </Fragment>
    )
}
}

Handle.propTypes = {
domain: PropTypes.array.isRequired,
handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
getHandleProps: PropTypes.func.isRequired,
isActive: PropTypes.bool.isRequired,
disabled: PropTypes.bool,
}

Handle.defaultProps = {
disabled: false,
}

// *******************************************************
// TRACK COMPONENT
// *******************************************************
export function Track({ source, target, getTrackProps, disabled }) {
return (
    <div
    style={{
        position: 'absolute',
        transform: 'translate(0%, -50%)',
        height: 7,
        zIndex: 1,
        backgroundColor: disabled ? '#999' : '#000',
        borderRadius: 7,
        cursor: 'pointer',
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
    }}
    {...getTrackProps()}
    />
)
}

Track.propTypes = {
source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
getTrackProps: PropTypes.func.isRequired,
disabled: PropTypes.bool,
}

Track.defaultProps = {
disabled: false,
}

// *******************************************************
// TICK COMPONENT
// *******************************************************
export function Tick({ tick, count, format }) {
return (
    <div>
    <div
        style={{
        position: 'absolute',
        marginTop: 17,
        width: 1,
        height: 5,
        backgroundColor: 'rgb(200,200,200)',
        left: `${tick.percent}%`,
        }}
    />
    <div
        style={{
        position: 'absolute',
        marginTop: 25,
        fontSize: 10,
        textAlign: 'center',
        marginLeft: `${-(100 / count) / 2}%`,
        width: `${100 / count}%`,
        left: `${tick.percent}%`,
        }}
    >
        {format(tick.value)}
    </div>
    </div>
)
}

Tick.propTypes = {
tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
count: PropTypes.number.isRequired,
format: PropTypes.func.isRequired,
}

Tick.defaultProps = {
format: d => d,
}