import CommentFormWrap from '../CommentFormWrap';
import { Pin } from '../../api/request';
import { UserInfo } from '../../store/user';
import { IBtcConnector } from '@metaid/metaid';

type Iprops = {
  commentPin: Pin;
  commentToUser: UserInfo | undefined;
  btcConnector: IBtcConnector;
};

const ReplyModal = ({ commentPin, commentToUser, btcConnector }: Iprops) => {
  return (
    <dialog id={'reply_buzz_modal_' + commentPin?.id} className='modal !z-20'>
      <div className='modal-box bg-[#191C20] !z-20 py-5 w-[90%] lg:w-[50%]'>
        <form method='dialog'>
          {/* if there is a button in form, it will close the modal */}
          <button className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'>
            ✕
          </button>
        </form>
        <h3 className='font-medium text-white text-[16px] text-center'>
          {`Reply to @${
            commentToUser?.name ??
            `MetaID-User-${commentToUser?.metaid.slice(0, 6)}`
          }`}
        </h3>
        <CommentFormWrap
          btcConnector={btcConnector!}
          commentPin={commentPin}
          isReply
        />
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ReplyModal;
