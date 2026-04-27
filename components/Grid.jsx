// noinspection JSValidateTypes,JSIncompatibleTypesComparison

'use client';
import {useState, useEffect, useRef, useCallback} from 'react';
import {animated, useSprings} from '@react-spring/web';
import Tile from './Tile';
import Toolbar from './Toolbar';
import {useMemo} from 'react';

const CELL_SIZE = 240;
const MOVER_SIZE = 112;
// m x n
export default function Grid({m, n, simulationData, fill, simulationId}) {
  const tileTypeInfo = simulationData['tile_type_dict'];
  const dispenserInfo = simulationData['dispenser_dict'];
  const orderColors = simulationData['order_color_dict'];
  const ganttData = simulationData['gantts'];

  let simulationDatumElement = simulationData['mover_paths']['paths'];
  const positions = useMemo(() => {
    const logicalToExactPos = (allPaths) => {
      return allPaths.map(moverPath => {
        return moverPath.map(pos => {
          let newPos = {...pos};
          newPos.logicalX = pos.x;
          newPos.logicalY = pos.y;
          newPos.x = pos.x * CELL_SIZE + CELL_SIZE / 2 - MOVER_SIZE / 2;
          newPos.y = pos.y * CELL_SIZE + CELL_SIZE / 2 - MOVER_SIZE / 2;
          if (pos.mode === 'wait_rest') {
            newPos.x += pos['rest_offset_x'] * CELL_SIZE / 2;
            newPos.y += pos['rest_offset_y'] * CELL_SIZE / 2;

          }
          return newPos;
        });
      });
    };

    return logicalToExactPos(simulationDatumElement);
  }, [simulationDatumElement]);

  const [counter, setCounter] = useState(1);
  const [speed, setSpeed] = useState(0);
  const [matrix, setMatrix] = useState(() => {
    return Array.from({length: m}, () => Array(n).fill(0));
  });
  const [selected, setSelected] = useState(() => {
    return Array.from({length: m}, () => Array(n).fill(0));
  });
  const [medicineName, setMedicine] = useState('');

  const statePosC = positions.map(
      arr => ({x: arr[0].x, y: arr[0].y}));
  const [srpingVals, api] = useSprings(positions.length, idx => ({
    from: statePosC[idx],
  }));

  const moversRefs = useRef(statePosC);
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const animateRef = useRef(0);
  const progressRef = useRef(1);
  const medicineRef = useRef('');

  // react to animation speed change
  useEffect(() => {
    animateRef.current = speed;
  }, [speed]);

  // react to medicine selection
  useEffect(() => {
    if (medicineName === medicineRef.current) return;
    let updatedSelected = Array.from({length: m}, () => Array(n).fill(0));
    if (medicineName.length > 0) {
      for (const singleMedicineName of medicineName.split(',')) {

        if (singleMedicineName === 'unavailable' || singleMedicineName === 'blocked' || singleMedicineName === 'empty') continue;

        if (!tileTypeInfo[singleMedicineName]) continue;

        for (let coordinate of tileTypeInfo[singleMedicineName]) {
          const x = coordinate[0];
          const y = coordinate[1];
          updatedSelected[x][y] = 1;
        }
      }
      medicineRef.current = medicineName;
    } else {
      medicineRef.current = '';
    }
    setSelected(updatedSelected);
  }, [tileTypeInfo, matrix, m, medicineName, n, selected]);

  const consumeMove = useCallback(() => {
    if (positions && positions.length > 0 && progressRef.current !== positions[0].length - 1) {
      let newCoords = [];
      for (const path of positions) {
        const nextStep = path[progressRef.current + 1];
        newCoords.push(nextStep);
      }

      api.start(index => {
        const position = newCoords[index];
        let res;
        const pos = moversRefs.current;
        if (pos.y !== (n - 1) * CELL_SIZE && pos.y !== 0) {
          res = {
            from: {x: pos.x, y: pos.y},
            to: [{x: (position.x)}, {y: (position.y)}].reverse(),
          };
        } else {
          res = {
            from: {x: pos.x, y: pos.y},
            to: [{x: (position.x)}, {y: (position.y)}],
          };
        }
        moversRefs.current[index] = {
          x: position.x,
          y: position.y,
        };
        return {...res, config: {duration: animateRef.current}};
      });

      progressRef.current += 1;
      setCounter(ct => ct + 1);

      // The single, correct state update
      setMatrix(prevMatrix => {
        const newMatrix = prevMatrix.map(row => [...row]);

        for (const pos of newCoords) {
          const {logicalX, logicalY, mode} = pos;
          if (mode === 'transit') {
            newMatrix[logicalX][logicalY] += 1;
          }
        }
        return newMatrix;
      });
    }
  }, [api, matrix, n, positions]);

  const animateV = useCallback(time => {
    if (!positions || positions.length === 0) {
      return;
    }

    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      if (animateRef.current > 0 && deltaTime > animateRef.current) {
        consumeMove();
        previousTimeRef.current = time;
      }
    } else {
      previousTimeRef.current = time;
    }
    if (progressRef.current !==
        positions[0].length) requestRef.current = requestAnimationFrame(
        animateV); else progressRef.current -= 1;
  }, [consumeMove, positions]);

  useEffect(() => {
    window.abc = (val) => {
      const name = val['points'][0]['data']['offsetgroup'];
      if (name in tileTypeInfo) {
        setMedicine(name);
      }
    };
    window.reset = () => {
      setMedicine('');
    };
    window.legend = (data) => {
      setMedicine(medicine => {
        const newMed = data['data'][data['curveNumber']]['legendgroup'];
        if (medicine === newMed) {
          return '';
        } else {
          return newMed;
        }
      });
    };
    requestRef.current = requestAnimationFrame(animateV);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animateV, tileTypeInfo]);

  // Calculate the absolute maximum visits any tile will receive during the entire simulation
  const maxTileVisits = useMemo(() => {
    if (!positions || positions.length === 0) return 1;

    const futureMatrix = Array.from({length: m}, () => Array(n).fill(0));

    for (const path of positions) {
      for (const pos of path) {
        if (pos.mode === 'transit') {
          futureMatrix[pos.logicalX][pos.logicalY] += 1;
        }
      }
    }

    return Math.max(1, ...futureMatrix.flat());
  }, [positions, m, n]);

  const placeTiles = () => {
    let res = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (fill || i === 0 || j === 0 || i === m - 1 || j === n - 1) {
          res.push(<Tile maxPath={maxTileVisits}
                         setMedicine={setMedicine} selected={selected[i][j]}
                         speed={speed} key={`${i}x${j}`}
                         name={dispenserInfo[`${i}x${j}`]}
                         w={CELL_SIZE} x={i * CELL_SIZE} y={j * CELL_SIZE}
                         idx={matrix[i][j]}/>);
        }
      }
    }
    return res;
  };

  return (<>
    <svg viewBox={`-5 -5 ${m * CELL_SIZE + 10} ${n * CELL_SIZE + 10}`}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        {srpingVals.map((spring, id) => (
            <pattern key={`def${id}`} id={`bgPattern${id}`}
                     patternUnits="userSpaceOnUse" width="20"
                     height="20">

              <rect width="20" height="20"
                    fill={orderColors[positions[id][progressRef.current]['order']]}/>
              <path d="M-1,1 l2,-2
                        M0,20 l20,-20
                        M19,21 l2,-2"
                    stroke="black" strokeWidth="4"/>
            </pattern>))}
      </defs>

      <g id="gridSvg">
        {placeTiles()}
      </g>
      {srpingVals.map((spring, id) => {
        return (
            <animated.rect key={`mover${id}`} x={spring['x']} y={spring['y']}
                           width={MOVER_SIZE} height={MOVER_SIZE} style={{
              fill: `url(#bgPattern${id})`,
            }} rx="15">{id}</animated.rect>);
      })}
    </svg>
    <Toolbar
        counter={counter}
        length={positions.length > 0 ? positions[0].length : 0}
        hasSimulation={positions.length > 0}
        animate={speed}
        medicineName={medicineName}
        consumeMove={consumeMove}
        setAnimate={setSpeed}
        setMedicine={setMedicine}
        ganttData={ganttData}
        simulationId={simulationId}/>
  </>);

}