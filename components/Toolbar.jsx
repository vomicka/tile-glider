'use client'
import React, {useEffect, useRef, useState} from 'react';
import '../styles/toolbar.css'

function Toolbar({counter, length, animate, setAnimate, consumeMove, medicineName, ganttData, simulationId}) {
    const [selectedGantt, setSelectedGantt] = useState(0)
    const [btnStates, setStates] = useState(["", "", "", "", ""])
    const [barMode, setBarMode] = useState('barAttached')
    const gridIframe = useRef(null);
    const [contentWindow, setContentWindow] = useState(null)
    const contentWindowRef = useRef();
    const ganttNamesArray = ganttData.names;
    const currentPlotFilename = ganttNamesArray[selectedGantt];
    const plotUrl = `${process.env.NEXT_PUBLIC_API_URL}/${simulationId}/plots/${currentPlotFilename}`;

    useEffect(() => {
        // noinspection JSValidateTypes
        contentWindowRef.current = contentWindow
    }, [contentWindow])

    const select = (idx, animation) => {
        const states = ["", "", "", "", ""]
        if (animation < 0) {
            if (animate !== 0) {
                setAnimate(0)
            }
            if (animation < -1) {
                consumeMove()
            }
        } else {
            states[idx] = "selected"
            setAnimate(animation)
        }
        setStates(states)
    }

    let iframeItem = gridIframe.current ? gridIframe.current.contentWindow : null

    useEffect(() => {
        if(iframeItem == null) return
       iframeItem.postMessage({
                type: 'UPDATE_MARKER',
                position: counter
            }, '*');
    }, [ animate, counter, iframeItem])

    const handleGrid = () => {
        const iframeItem = gridIframe.current.contentWindow
        iframeItem.postMessage({
            type: 'UPDATE_MARKER',
            position: counter
        }, '*');
        setContentWindow(iframeItem)
    }

    const showMedicine = () => {
        let splitMedicineName = medicineName.split(',').join(', ')
        if (medicineName.length !== 0)
            return <div className="text-xs medicine">{splitMedicineName}</div>
    }

    return (<div className={barMode}>
        <div className="toolbarWrapper">
            {showMedicine()}
            <div className="toolbar">
                <span>Frame: {counter}/{length - 1} </span>
                {counter !== length ? <>
                    <div className='flex gap-1'>
                    <button className={btnStates[0]} onClick={() => select(0, -2)}>Next Frame</button>
                    <button className={btnStates[1] + " separate"} onClick={() => select(1, 250)}>
                        <span>Play </span>
                    </button>
                    <button className={btnStates[2]} onClick={() => select(2, 50)}><span>Fast </span>
                    </button>
                    <button className={btnStates[3]} onClick={() => select(3, 8)}><span>Fastest </span>
                    </button>
                    <button onClick={() => select(0, -1)}><span>Pause</span></button>
                    </div>
                    <button
                        className="separate"
                        onClick={() => setBarMode(state => state === 'barAttached' ? 'barDetached' : 'barAttached')}>
                        <span>{barMode === 'barAttached' ? 'Detach' : 'Attach'}</span>
                    </button>

                    <div className="chartButtons">
                        <button
                            onClick={() => setSelectedGantt(idx => ((idx > 0 ? idx - 1 : ganttNamesArray.length - 1)))}>
                            <span>Prev</span></button>
                        <button
                            onClick={() => setSelectedGantt(idx => ((idx + 1) % ganttNamesArray.length))}>
                            <span>Next</span></button>
                    </div>
                </> : ""}
            </div>
        </div>
        <iframe ref={gridIframe} onLoad={handleGrid}
                src={plotUrl} title="Gantt"/>
    </div>);
}

export default Toolbar;