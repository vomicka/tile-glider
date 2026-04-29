import React, {memo, useEffect, useRef, useState} from 'react';
import {getColorFromGradient} from '@/utils/colorUtilities';

const Tile = memo(function NonMemoTile({
                                           w,
                                           h = w,
                                           x,
                                           y,
                                           idx,
                                           selected,
                                           maxPath,
                                           setMedicine,
                                           name = 'empty',
                                           speed,
                                       }) {
    let color = getColorFromGradient(idx, maxPath);
    let tileType = 'tile';
    let innerStrokeColor = null;

    if (name === 'blocked') {
        tileType += ' blocked';
        color = 'black';
    } else if (name === 'interface') {
        tileType += ' interface';
        innerStrokeColor = 'lightblue';
        if (idx === 0) color = 'lightblue';
    } else if (name === 'empty' || name === 'unavailable') {
        tileType += ' empty';
        if (idx === 0) color = 'lightgrey';
    } else if (name === 'capper') {
        tileType += ' capper';
        innerStrokeColor = 'violet';
        if (idx === 0) color = '#f3e8ff';
    } else if (name === 'mixer') {
        tileType += ' mixer';
        innerStrokeColor = 'green';
        if (idx === 0) color = '#dcfce7';
    } else {
        tileType += ' dispenser';
        innerStrokeColor = 'orange';
        if (idx === 0) color = '#ffedd5';
    }

    if (selected === 1) {
        tileType += ' selected';
        if (name === 'interface') color = 'lightblue';
        else if (name === 'capper') color = 'violet';
        else if (name === 'mixer') color = 'green';
        else color = 'orange';
    }

    const [stateY, setStateY] = useState(y);
    const [stateX, setStateX] = useState(x);
    const trans = `fill ${speed}ms linear`;
    const textRef = useRef(null);

    const strokeThickness = 10;

    useEffect(() => {
        setStateX(x + 10);
        setStateY(y + 60);
    }, [x, y]);

    return (
        <g className={tileType} onMouseEnter={() => {
            setMedicine(name);
        }} onMouseLeave={() => {
            setMedicine('');
        }}>
            {/* Heatmap Layer */}
            <rect y={y} x={x} width={w} height={h} fill={color}
                  style={{
                      transition: trans,
                      msTransition: trans,
                      WebkitTransition: trans,
                  }}/>

            {/* Inner Stroke Layer */}
            {innerStrokeColor && (
                <rect
                    x={x + strokeThickness / 2}
                    y={y + strokeThickness / 2}
                    width={w - strokeThickness}
                    height={h - strokeThickness}
                    fill="none"
                    stroke={innerStrokeColor}
                    strokeWidth={strokeThickness}
                    style={{ pointerEvents: 'none' }}
                />
            )}

            {/* Text Layer */}
            {name !== 'blocked' && (
                <text ref={textRef} y={stateY} x={stateX} width={w} height={h}
                      fontFamily="Verdana" fontSize="50"
                      fill="black">{idx}</text>
            )}
        </g>
    );
});

export default Tile;