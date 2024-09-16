import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
// import { buzzEntityAtom } from '../../store/buzz';
// import { IBtcEntity } from '@metaid/metaid';
// import { environment } from '../../utils/environments';
import { isEmpty } from 'ramda';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchFollowingList,
  fetchMyFollowingBuzzs,
  fetchMyFollowingTotal,
} from '../../api/buzz';
import { Pin } from '../../api/request';
import BuzzCard from '../Cards/BuzzCard';
import { btcConnectorAtom } from '../../store/user';

const FollowingBuzzList = () => {
  const [total, setTotal] = useState<null | number>(null);

  const navigate = useNavigate();
  const { ref, inView } = useInView();
  const btcConnector = useAtomValue(btcConnectorAtom);
  // const buzzEntity = useAtomValue(buzzEntityAtom);

  const { data: myFollowingListData } = useQuery({
    queryKey: ['myFollowing', btcConnector?.metaid],
    enabled: !isEmpty(btcConnector?.metaid ?? ''),
    queryFn: () =>
      fetchFollowingList({
        metaid: btcConnector?.metaid ?? '',
        params: { cursor: '0', size: '100', followDetail: false },
      }),
  });

  const getTotal = async () => {
    setTotal(
      await fetchMyFollowingTotal({
        page: 1,
        size: 1,
        path: '/protocols/simplebuzz,/protocols/banana',
        metaidList: myFollowingListData?.list ?? [],
      })
    );
  };
  console.log(total);

  useEffect(() => {
    if (!isEmpty(myFollowingListData?.list ?? [])) {
      getTotal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ['following', 'buzzes'],
      enabled: !isEmpty(myFollowingListData?.list ?? []),

      queryFn: ({ pageParam }) =>
        fetchMyFollowingBuzzs({
          page: pageParam,
          size: 5,
          path: '/protocols/simplebuzz,/protocols/banana',
          metaidList: myFollowingListData?.list ?? [],
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = lastPage?.length ? allPages.length + 1 : undefined;
        if (allPages.length * 5 >= (total ?? 0)) {
          return;
        }
        return nextPage;
      },
    });

  const buzzes = data?.pages.map((pins: Pin[] | null) =>
    (pins ?? []).map((pin) => {
      return (
        <BuzzCard
          key={pin.id}
          buzzItem={pin}
          onBuzzDetail={(txid) => navigate(`/buzz/${txid}`)}
        />
      );
    })
  );

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  return (
    <>
      {isLoading ? (
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
      )}
    </>
  );
};

export default FollowingBuzzList;
