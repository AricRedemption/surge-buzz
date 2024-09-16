/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  btcConnectorAtom,
  connectedAtom,
  globalFeeRateAtom,
  myFollowingListAtom,
} from '../../store/user';
import { useAtom, useAtomValue } from 'jotai';
import { environment } from '../../utils/environments';
import { isEmpty, isNil } from 'ramda';
import {
  fetchFollowDetailPin,
  fetchFollowerList,
  fetchFollowingList,
} from '../../api/buzz';
import CustomAvatar from '../Public/CustomAvatar';
import FollowButton from '../Buttons/FollowButton';
import {
  checkMetaletConnected,
  checkMetaletInstalled,
} from '../../utils/wallet';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

type Iprops = {
  address: string;
  isDropdown?: boolean;
};

const ProfileCard = ({ address, isDropdown = false }: Iprops) => {
  const queryClient = useQueryClient();
  const btcConnector = useAtomValue(btcConnectorAtom);
  const connected = useAtomValue(connectedAtom);
  const globalFeeRate = useAtomValue(globalFeeRateAtom);
  const navigate = useNavigate();

  const [myFollowingList, setMyFollowingList] = useAtom(myFollowingListAtom);

  const profileUserData = useQuery({
    queryKey: ['userInfo', address, environment.network],
    queryFn: () =>
      btcConnector?.getUser({
        network: environment.network,
        currentAddress: address,
      }),
  });

  const { data: followingListData } = useQuery({
    queryKey: ['following', profileUserData?.data?.metaid],
    enabled: !isEmpty(profileUserData?.data?.metaid ?? ''),
    queryFn: () =>
      fetchFollowingList({
        metaid: profileUserData?.data?.metaid ?? '',
        params: { cursor: '0', size: '100', followDetail: false },
      }),
  });

  const { data: followerListData } = useQuery({
    queryKey: ['follower', profileUserData?.data?.metaid],
    enabled: !isEmpty(profileUserData?.data?.metaid ?? ''),
    queryFn: () =>
      fetchFollowerList({
        metaid: profileUserData?.data?.metaid ?? '',
        params: { cursor: '0', size: '100', followDetail: false },
      }),
  });

  const { data: myFollowingListData } = useQuery({
    queryKey: ['myFollowing', btcConnector?.metaid],
    enabled: !isEmpty(btcConnector?.metaid ?? ''),
    queryFn: () =>
      fetchFollowingList({
        metaid: btcConnector?.metaid ?? '',
        params: { cursor: '0', size: '100', followDetail: false },
      }),
  });

  const { data: followDetailData } = useQuery({
    queryKey: [
      'followDetail',
      btcConnector?.metaid,
      profileUserData?.data?.metaid,
    ],
    enabled:
      !isEmpty(btcConnector?.metaid ?? '') &&
      !isEmpty(profileUserData?.data?.metaid),
    queryFn: () =>
      fetchFollowDetailPin({
        metaId: profileUserData?.data?.metaid ?? '',
        followerMetaId: btcConnector?.metaid ?? '',
      }),
  });

  const metaidPrefix = (profileUserData?.data?.metaid ?? '').slice(0, 6);

  const handleFollow = async () => {
    await checkMetaletInstalled();
    await checkMetaletConnected(connected);

    // const doc_modal = document.getElementById(
    //   'confirm_follow_modal'
    // ) as HTMLDialogElement;
    // doc_modal.showModal();

    if (
      !isNil(followDetailData) &&
      (myFollowingListData?.list ?? []).includes(profileUserData?.data?.metaid)
    ) {
      try {
        const unfollowRes = await btcConnector!.inscribe({
          inscribeDataArray: [
            {
              operation: 'revoke',
              path: `@${followDetailData.followPinId}`,
              contentType: 'text/plain;utf-8',
              flag: environment.flag,
            },
          ],
          options: {
            noBroadcast: 'no',
            feeRate: Number(globalFeeRate),
            service: {
              address: environment.service_address,
              satoshis: environment.service_staoshi,
            },
            // network: environment.network,
          },
        });
        if (!isNil(unfollowRes?.revealTxIds[0])) {
          queryClient.invalidateQueries({ queryKey: ['buzzes'] });
          setMyFollowingList((d) => {
            return d.filter((i) => i !== profileUserData?.data?.metaid);
          });
          // await sleep(5000);
          toast.success(
            'Unfollowing successfully!Please wait for the transaction to be confirmed.'
          );
        }
      } catch (error) {
        console.log('error', error);
        const errorMessage = (error as any)?.message ?? error;
        const toastMessage = errorMessage?.includes(
          'Cannot read properties of undefined'
        )
          ? 'User Canceled'
          : errorMessage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error(toastMessage, {
          className:
            '!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg',
        });
      }
    } else {
      try {
        const followRes = await btcConnector!.inscribe({
          inscribeDataArray: [
            {
              operation: 'create',
              path: '/follow',
              body: profileUserData?.data?.metaid,
              contentType: 'text/plain;utf-8',

              flag: environment.flag,
            },
          ],
          options: {
            noBroadcast: 'no',
            feeRate: Number(globalFeeRate),
            service: {
              address: environment.service_address,
              satoshis: environment.service_staoshi,
            },
            // network: environment.network,
          },
        });
        if (!isNil(followRes?.revealTxIds[0])) {
          queryClient.invalidateQueries({ queryKey: ['buzzes'] });
          setMyFollowingList((d: string[]) => {
            return [...d, profileUserData!.data!.metaid];
          });
          // queryClient.invalidateQueries({
          //   queryKey: ['payLike', buzzItem!.id],
          // });
          // await sleep(5000);
          toast.success(
            'Follow successfully! Please wait for the transaction to be confirmed!'
          );
        }
      } catch (error) {
        console.log('error', error);
        const errorMessage = (error as any)?.message ?? error;
        const toastMessage = errorMessage?.includes(
          'Cannot read properties of undefined'
        )
          ? 'User Canceled'
          : errorMessage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error(toastMessage, {
          className:
            '!text-[#DE613F] !bg-[black] border border-[#DE613f] !rounded-lg',
        });
      }
    }
  };
  if (isDropdown) {
    return (
      <div
        style={{
          borderRadius: '12px',
          opacity: '1',
          background: '#131519',
          boxSizing: 'border-box',
          border: '1px solid #4D5041',
          boxShadow: '2px 2px 10px 0px rgba(218, 247, 115, 0.3)',
        }}
        className='flex flex-col p-6 gap-y-6 min-w-[280px]'
      >
        <div className='flex justify-between'>
          <div className='flex flex-col gap-2 items-start '>
            <CustomAvatar userInfo={profileUserData?.data} />

            <div
              className='tooltip tooltip-secondary mt-0.5 z-50'
              data-tip={
                profileUserData?.data?.name ?? `MetaID-User-${metaidPrefix}`
              }
            >
              <div
                className='font-bold font-mono text-left w-[115px] truncate'
                style={{ textWrap: 'nowrap' }}
              >
                {profileUserData?.data?.name ?? `MetaID-User-${metaidPrefix}`}
              </div>
            </div>
            <div className='flex gap-2 text-[10px]'>
              <div className='text-main'>{`MetaID:  ${metaidPrefix}`}</div>
            </div>
          </div>
          {btcConnector?.metaid !== profileUserData?.data?.metaid && (
            <FollowButton
              isFollowed={(myFollowingListData?.list ?? []).includes(
                profileUserData?.data?.metaid
              )}
              isFollowingPending={
                (myFollowingList ?? []).includes(
                  profileUserData?.data?.metaid ?? ''
                ) &&
                !(myFollowingListData?.list ?? []).includes(
                  profileUserData?.data?.metaid
                )
              }
              isUnfollowingPending={
                !(myFollowingList ?? []).includes(
                  profileUserData?.data?.metaid ?? ''
                ) &&
                (myFollowingListData?.list ?? []).includes(
                  profileUserData?.data?.metaid
                )
              }
              handleFollow={handleFollow}
            />
          )}
        </div>

        <div
          className='flex text-[12px] cursor-pointer'
          onClick={() =>
            navigate(`/follow-detail/${profileUserData?.data?.metaid}`)
          }
        >
          <div className='flex gap-1'>
            <div className='text-main'>{followingListData?.total ?? 0}</div>
            <div className='text-[#A4A59D]'>Following</div>
          </div>
          <div className='border-r border-[#A4A59D] border mx-3'></div>
          <div className='flex gap-1'>
            <div className='text-main'>{followerListData?.total ?? 0}</div>
            <div className='text-[#A4A59D]'>Followers</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className='border w-full border-white rounded-xl relative pt-[100px] md:pt-[170px]'>
      <img src='/profile-bar.png' className='absolute top-0' />
      <div className='flex justify-between p-6'>
        <div className='flex flex-col gap-2 items-start '>
          <div className='md:block hidden'>
            <CustomAvatar userInfo={profileUserData?.data} size='80px' />
          </div>
          <div className='md:hidden block'>
            <CustomAvatar userInfo={profileUserData?.data} size='66px' />
          </div>
          <div className='font-bold font-mono text-[12px] md:text-[24px] '>
            {profileUserData?.data?.name ?? `MetaID-User-${metaidPrefix}`}
          </div>
          <div className='flex gap-2 text-[12px] md:text-[14px] '>
            <div className='text-main'>{`MetaID:  ${metaidPrefix}`}</div>
          </div>
        </div>

        <div className='flex flex-col gap-5 items-end self-end'>
          {btcConnector?.metaid !== profileUserData?.data?.metaid && (
            <FollowButton
              isFollowed={(myFollowingListData?.list ?? []).includes(
                profileUserData?.data?.metaid
              )}
              isFollowingPending={
                (myFollowingList ?? []).includes(
                  profileUserData?.data?.metaid ?? ''
                ) &&
                !(myFollowingListData?.list ?? []).includes(
                  profileUserData?.data?.metaid
                )
              }
              isUnfollowingPending={
                !(myFollowingList ?? []).includes(
                  profileUserData?.data?.metaid ?? ''
                ) &&
                (myFollowingListData?.list ?? []).includes(
                  profileUserData?.data?.metaid
                )
              }
              handleFollow={handleFollow}
            />
          )}

          <div
            className='flex self-center text-[12px] md:text-[14px] cursor-pointer'
            onClick={() =>
              navigate(`/follow-detail/${profileUserData?.data?.metaid}`)
            }
          >
            <div className='flex gap-1'>
              <div className='text-main'>{followingListData?.total ?? 0}</div>
              <div className='text-[#A4A59D]'>Following</div>
            </div>
            <div className='border-r border-[#A4A59D] border mx-3'></div>
            <div className='flex gap-1'>
              <div className='text-main'>{followerListData?.total ?? 0}</div>
              <div className='text-[#A4A59D]'>Followers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
