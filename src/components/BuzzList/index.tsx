import { Sparkle } from 'lucide-react';
import { useState } from 'react';

import cls from 'classnames';
import AllNewBuzzList from './AllNewBuzzList';
import FollowingBuzzList from './FollowingBuzzList';
// pin detail

const BuzzList = () => {
  const [showNewBuzz, setShowNewBuzz] = useState<boolean>(true);

  return (
    <>
      <div className='flex gap-2 items-center place-content-center mt-0'>
        <Sparkle className='text-main' />

        <div className="text-white text-[24px] lg:text-[36px] font-['Impact']">
          {"What's New Today"}
        </div>

        <Sparkle className='text-main' />
      </div>

      <div className='text-white flex mx-auto border border-white w-fit rounded-full mt-8'>
        {/* <div
          className={cls(
            'btn w-[120px] h-[20px] md:w-[150px] md:h-[26px] cursor-pointer',
            {
              'btn-primary rounded-full': showNewBuzz,
              'btn-outline border-none': !showNewBuzz,
            }
          )}
          onClick={() => setShowNewBuzz(true)}
        >
          New
        </div> */}
        {/* <div
          className={cls(
            'btn w-[120px] h-[20px] md:w-[150px] md:h-[26px] cursor-pointer',
            {
              'btn-primary rounded-full': !showNewBuzz,
              'btn-outline border-none': showNewBuzz,
            }
          )}
          onClick={() => setShowNewBuzz(false)}
        >
          Follow
        </div> */}
      </div>
      {showNewBuzz ? <AllNewBuzzList /> : <FollowingBuzzList />}

      {/* {isLoading ? (
        <div className='flex items-center gap-2 justify-center h-[200px]'>
          <div>Buzz Feed is Coming</div>
          <span className='loading loading-bars loading-md grid text-white'></span>
        </div>
      ) : (
        <div className='flex flex-col gap-3 my-4'>
          {buzzes}
          <button
            ref={ref}
            className='btn'
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {hasNextPage && isFetchingNextPage ? (
              <div className='flex items-center gap-1'>
                <div>Loading </div>
                <span className='loading loading-dots loading-md grid text-white'></span>
              </div>
            ) : (
              //:
              // hasNextPage ? (
              // 	<div className="bg-[black]  grid w-full place-items-center">
              // 		Load More
              // 	</div>
              // )
              <div className=' place-items-center'>No more results</div>
            )}
          </button>
        </div>
      )} */}
    </>
  );
};

export default BuzzList;
