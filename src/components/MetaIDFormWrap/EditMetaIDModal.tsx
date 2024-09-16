import { IBtcConnector } from '@metaid/metaid';
import EditMetaIDFormWrap from './EditMetaIDFormWrap';

type Iprops = {
  btcConnector: IBtcConnector;
};

const EditMetaIDModal = ({ btcConnector }: Iprops) => {
  return (
    <dialog id='edit_metaid_modal' className='modal'>
      <div className='modal-box bg-[#191C20] py-5 !z-20 w-[90%] lg:w-[50%]'>
        <form method='dialog'>
          {/* if there is a button in form, it will close the modal */}
          <button className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'>
            ✕
          </button>
        </form>
        <h3 className='font-medium text-white text-[16px] text-center'>
          MetaID Profile
        </h3>
        <EditMetaIDFormWrap btcConnector={btcConnector!} />
      </div>
      <form method='dialog' className='modal-backdrop'>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default EditMetaIDModal;
