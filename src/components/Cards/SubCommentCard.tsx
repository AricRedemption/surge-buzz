import { LucideLink } from 'lucide-react';
import CustomAvatar from '../Public/CustomAvatar';
import dayjs from '../../utils/dayjsConfig';
import {
  checkMetaletConnected,
  checkMetaletInstalled,
} from '../../utils/wallet';
import { useAtomValue } from 'jotai';
import { connectedAtom, UserInfo } from '../../store/user';
import { IBtcConnector } from '@metaid/metaid';
import { Pin } from '../../api/request';

import ReplyModal from '../Modals/ReplyModal';

type Iprops = {
  commentPin: Pin;
  btcConnector: IBtcConnector;
  commentUserInfo: UserInfo | undefined;
};

const SubCommentCard = ({
  commentPin,
  btcConnector,
  commentUserInfo,
}: Iprops) => {
  const connected = useAtomValue(connectedAtom);

  const mock = {
    name: 'Subs',
    replyTo: 'Yiomik',
    comment:
      'someone castle will belong to its own story traces, as long as you are careful enough, you can always find the traces.',
    id: '456',
    timeStamp: '2021 10:23',
  };

  return (
    <>
      <div className='flex gap-2.5'>
        <CustomAvatar size='30px' />
        <div className='flex flex-col gap-2 mt-3 w-full text-xs'>
          <div className='flex gap-2'>
            <div>{mock.name}</div>
            <div className='text-main'>Reply</div>
            <div>{mock.replyTo}</div>
          </div>
          <div>{mock.comment}</div>
          <div className='flex justify-between text-gray'>
            <div className='flex gap-2'>
              <div className='flex gap-1 items-center hover:text-slate-300 cursor-pointer'>
                <LucideLink size={12} />
                <div>{mock.id.slice(0, 8) + '...'}</div>
              </div>
              <div>
                {dayjs
                  .unix(dayjs().unix())
                  .tz(dayjs.tz.guess())
                  .format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            <div
              className='hover:text-slate-300 cursor-pointer'
              onClick={async () => {
                await checkMetaletInstalled();
                await checkMetaletConnected(connected);
                (document.getElementById(
                  'reply_buzz_modal_' + mock.id
                ) as HTMLDialogElement)!.showModal();
              }}
            >
              Reply
            </div>
          </div>
        </div>
      </div>
      <ReplyModal
        commentPin={commentPin}
        btcConnector={btcConnector!}
        commentToUser={commentUserInfo}
      />{' '}
    </>
  );
};

export default SubCommentCard;
