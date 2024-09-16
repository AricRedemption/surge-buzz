import { useEffect, useMemo } from 'react';
import cls from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { environment } from '../../utils/environments';
import { fetchFeeRate } from '../../api/buzz';
import { globalFeeRateAtom } from '../../store/user';

const CustomFeerate = () => {
  const { data: feeRateData } = useQuery({
    queryKey: ['feeRate', environment.network],
    queryFn: () => fetchFeeRate({ netWork: environment.network }),
  });

  const [globalFeerate, setGlobalFeerate] = useAtom(globalFeeRateAtom);

  useEffect(() => {
    setGlobalFeerate(
      (feeRateData?.fastestFee ?? Number(globalFeerate)).toString()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeRateData]);

  const feeRateOptions = useMemo(() => {
    return [
      {
        name: 'Slow',
        number: feeRateData?.hourFee ?? Number(globalFeerate),
        img: '/riding-fill.png',
      },
      {
        name: 'Avg',
        number: feeRateData?.halfHourFee ?? Number(globalFeerate),
        img: '/police-car-fill.png',
      },
      {
        name: 'Fast',
        number: feeRateData?.fastestFee ?? Number(globalFeerate),
        img: '/plane-fill.png',
      },
    ];
  }, [feeRateData, globalFeerate]);

  return (
    <div className='w-full flex flex-col lg:flex-row gap-6 items-center rounded border border-main/40 shadow p-4'>
      <div className='flex flex-col gap-4 w-[55%]'>
        <div className='text-gray text-[14px] md:text-[20px]'>Fee Rate</div>

        <div className='flex items-center gap-2'>
          <input
            inputMode='numeric'
            type='number'
            min={0}
            max={'100000'}
            style={{
              appearance: 'none',
            }}
            aria-hidden
            className='border-main  w-[150px] input input-sm md:input-md  bg-gray/40  shadow-inner !pr-0 focus:border-main text-main focus:outline-none [&::-webkit-inner-spin-button]:appearance-none'
            step={1}
            value={globalFeerate}
            onChange={(e) => {
              const v = e.currentTarget.value;
              setGlobalFeerate(v); //
            }}
          />
          <div className='text-main  text-xs md:text-sm'>sat/vB</div>
        </div>
      </div>

      <div className='flex flex-col gap-4 text-xs md:text-sm'>
        {feeRateOptions.map((d) => {
          return (
            <div
              onClick={() => setGlobalFeerate(d.number.toString())}
              key={d.name}
              className={cls('cursor-pointer')}
            >
              <div className='flex items-center gap-2'>
                <img src={d.img} alt={d.name} className='w-4 h-4' />
                <div className='text-white'>{d.name}</div>
                <div className='flex items-center gap-4 text-md'>
                  <div className='text-gray'></div>
                  <div
                    className={cls('text-main justify-self-center', {
                      'ml-2': d.name === 'Avg',
                      'ml-[6px]': d.name === 'Fast',
                    })}
                  >
                    {`${d.number}  sat/vB`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomFeerate;
