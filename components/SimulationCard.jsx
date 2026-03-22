import {useRouter} from 'next/navigation';
import {TbClock, TbGrid3X3, TbTruck, TbUsers} from 'react-icons/tb';
import {HiBeaker} from 'react-icons/hi';
import Image from 'next/image';
import {formatTimestamp} from '@/utils/timeParser';
import {MdOutlinePrecisionManufacturing} from 'react-icons/md';
import {PiWashingMachineDuotone} from 'react-icons/pi';

const SimulationCard = ({simulationDetail}) => {
  const router = useRouter();
  const {
    topology,
    n_tiles,
    n_interfaces,
    n_dispensers,
  } = simulationDetail.topology_info;

  const metrics = [
    {icon: <HiBeaker/>, label: 'Dose', value: simulationDetail.dose},
    {icon: <TbTruck/>, label: 'Movers', value: simulationDetail.movers},
    {icon: <TbUsers/>, label: 'Patients', value: simulationDetail.patients},
    {icon: <TbGrid3X3/>, label: 'Tiles', value: n_tiles + n_interfaces},
    {
      icon: <MdOutlinePrecisionManufacturing/>,
      label: 'Interfaces',
      value: n_interfaces,
    },
    {
      icon: <PiWashingMachineDuotone/>,
      label: 'Dispensers',
      value: n_dispensers,
    },
  ];

  return (
      <div
          onClick={() => router.push(`/${simulationDetail.id}/simulator`)}
          className="w-[300px] min-h-[350px] rounded-lg overflow-hidden shadow-md transition-shadow duration-200 bg-white hover:shadow-lg cursor-pointer"
      >
        <div className="relative bg-blue-200 p-2 text-gray-800">
          <h2 className="m-0 text-xl font-medium capitalize">{topology} simulation</h2>
        </div>
        <div className="card-content p-4 flex flex-col justify-between h-[90%]">
          <Image
              fill={true}
              src={`/layouts/${topology}.svg`}
              alt="Simulation Image"
          />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              {metrics.map(({icon, label, value}) => (
                  <div key={label}
                       className="flex flex-col items-center justify-center">
                <span
                    className="w-5 h-5 flex items-center justify-center mb-1 text-gray-700">
                  {icon}
                </span>
                    <span className="font-medium text-gray-800">{value}</span>
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
              ))}
            </div>

            <div
                className="flex items-center gap-2 text-gray-400 border-t pt-2">
            <span className="w-5 h-5 flex items-center justify-center">
              <TbClock/>
            </span>
              <span>{formatTimestamp(simulationDetail.calculated_at)}</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SimulationCard;