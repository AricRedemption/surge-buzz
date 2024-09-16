/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
// import { getPinDetailByPid } from '../api/buzz';
import BackButton from '../components/Buttons/BackButton';

import { useQuery } from '@tanstack/react-query';
import { fetchFollowerList, fetchFollowingList } from '../api/buzz';
import { isEmpty } from 'ramda';
import cls from 'classnames';
import { useState } from 'react';
import ProfileCard from '../components/Cards/ProfileCard';

// import BuzzCard from '../components/BuzzList/BuzzCard';

const FollowDetail = () => {
  const [showFollowing, setShowFollowing] = useState(true);
  const { id: metaid } = useParams();

  const { data: followingListData } = useQuery({
    queryKey: ['following', metaid],
    enabled: !isEmpty(metaid ?? ''),
    queryFn: () =>
      fetchFollowingList({
        metaid: metaid ?? '',
        params: { cursor: '0', size: '100', followDetail: true },
      }),
  });

  const { data: followerListData } = useQuery({
    queryKey: ['follower', metaid],
    enabled: !isEmpty(metaid ?? ''),
    queryFn: () =>
      fetchFollowerList({
        metaid: metaid ?? '',
        params: { cursor: '0', size: '100', followDetail: true },
      }),
  });
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-start'>
        <BackButton />
      </div>

      <div className='text-white flex mx-auto border border-white w-fit rounded-full mb-4'>
        <div
          className={cls(
            'btn w-[120px] h-[20px] md:w-[150px] md:h-[26px] cursor-pointer',
            {
              'btn-primary rounded-full': showFollowing,
              'btn-outline border-none': !showFollowing,
            }
          )}
          onClick={() => setShowFollowing(true)}
        >
          Following
        </div>
        <div
          className={cls(
            'btn w-[120px] h-[20px] md:w-[150px] md:h-[26px] cursor-pointer',
            {
              'btn-primary rounded-full': !showFollowing,
              'btn-outline border-none': showFollowing,
            }
          )}
          onClick={() => setShowFollowing(false)}
        >
          Follower
        </div>
      </div>

      {showFollowing ? (
        <div className='grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {isEmpty(followingListData?.list ?? []) ? (
            <div>No Following Data Founded</div>
          ) : (
            (followingListData?.list ?? []).map((d: any, index: any) => (
              <ProfileCard
                key={d?.metaid ?? index}
                address={d?.address}
                isDropdown
              />
            ))
          )}
        </div>
      ) : (
        <div className='grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {isEmpty(followerListData?.list ?? []) ? (
            <div>No Follower Data Founded</div>
          ) : (
            (followerListData?.list ?? []).map((d: any, index: any) => (
              <ProfileCard
                key={d?.metaid ?? index}
                address={d?.address}
                isDropdown
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FollowDetail;
