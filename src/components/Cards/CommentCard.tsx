import { LucideLink } from 'lucide-react';
import CustomAvatar from '../Public/CustomAvatar';
import dayjs from '../../utils/dayjsConfig';
import { IBtcConnector } from '@metaid/metaid';
import { CommentRes } from '../../api/buzz';
import { environment } from '../../utils/environments';
import { isNil } from 'ramda';
import { useQuery } from '@tanstack/react-query';

type Iprops = {
  commentRes: CommentRes;
  btcConnector: IBtcConnector;
};

const CommentCard = ({ commentRes, btcConnector }: Iprops) => {
  const currentUserInfoData = useQuery({
    enabled: !isNil(commentRes?.pinAddress),
    queryKey: ['userInfo', commentRes?.pinAddress, environment.network],
    queryFn: () =>
      btcConnector?.getUser({
        network: environment.network,
        currentAddress: commentRes?.pinAddress,
      }),
  });

  return (
    <>
      <div className='flex gap-2.5'>
        <CustomAvatar size='36px' />
        <div className='flex flex-col gap-2 mt-2 w-full'>
          <div>{currentUserInfoData?.data?.name ?? 'MetaID-User'}</div>
          <div>{commentRes.content}</div>
          <div className='flex justify-between text-gray text-xs mt-2'>
            <div className=' flex gap-2'>
              <div className='flex gap-1 items-center hover:text-slate-300 cursor-pointer'>
                <LucideLink size={12} />
                <div>{(commentRes?.pinId ?? '').slice(0, 8) + '...'}</div>
              </div>
              <div>
                {dayjs
                  .unix(dayjs().unix())
                  .tz(dayjs.tz.guess())
                  .format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            {/* <div
              className='hover:text-slate-300 cursor-pointer'
              onClick={async () => {
                await checkMetaletInstalled();
                await checkMetaletConnected(connected);
                (document.getElementById(
                  'reply_buzz_modal_' + commentPin.id
                ) as HTMLDialogElement)!.showModal();
              }}
            >
              Reply
            </div> */}
          </div>
          {/* {hasSubComment && (
            <SubCommentCard
              commentPin={commentPin}
              btcConnector={btcConnector!}
              commentUserInfo={commentUserInfo}
            />
          )} */}
        </div>
      </div>
      {/* <ReplyModal
        commentPin={commentPin}
        btcConnector={btcConnector!}
        commentToUser={commentUserInfo}
      /> */}
    </>
  );
};

export default CommentCard;
