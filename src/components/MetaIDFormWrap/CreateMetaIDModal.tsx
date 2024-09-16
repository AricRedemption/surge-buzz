import { IBtcConnector } from '@metaid/metaid';
import CreateMetaIDFormWrap from './CreateMetaIDFormWrap';
// import CreateMetaIDSuccessModal from './CreateMetaIDSuccessModal';

type Iprops = {
  btcConnector: IBtcConnector;
  onWalletConnectStart: () => void;
};

const CreateMetaIDModal = ({ btcConnector, onWalletConnectStart }: Iprops) => {
  const onCloseSuccessModal = () => {
    const doc_modal = document.getElementById(
      'create_metaid_success_modal'
    ) as HTMLDialogElement;
    doc_modal.close();
  };

  return (
    <>
      <dialog id='create_metaid_modal' className='modal'>
        <div className='modal-box bg-[#191C20] py-5 w-[90%] lg:w-[50%]'>
          <form method='dialog'>
            {/* if there is a button in form, it will close the modal */}
            <button className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'>
              ✕
            </button>
          </form>
          <h3 className='font-medium text-white text-[16px] text-center'>
            MetaID Profile
          </h3>
          <CreateMetaIDFormWrap
            btcConnector={btcConnector!}
            onWalletConnectStart={onWalletConnectStart}
          />
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button>close</button>
        </form>
      </dialog>
      {/* <CreateMetaIDSuccessModal /> */}

      <dialog id='create_metaid_success_modal' className='modal'>
        <div className='modal-box bg-[#191C20] py-5 w-[90%] lg:w-[50%]'>
          <form method='dialog'>
            {/* if there is a button in form, it will close the modal */}
            {/* <button
							className="border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5"
							onClick={onCloseSuccessModal}
						>
							✕
						</button> */}
          </form>
          <div className='flex flex-col relative items-center'>
            <img
              className='absolute top-2'
              src='/create_metaid_success_logo.png'
              width={300}
              height={300}
            />
            <div className='flex flex-col items-center mt-48 gap-8'>
              <div className='flex flex-col gap-2'>
                <div className='font-medium text-white w-full text-[16px] text-center'>
                  MetaID created successfully!
                </div>
                <div className='font-medium text-white w-full text-[16px] text-center'>
                  Now you can connect your wallet again!
                </div>
              </div>
              <div
                className='btn btn-sm btn-primary rounded-full text-md font-medium	w-[80px]'
                onClick={onCloseSuccessModal}
              >
                Done
              </div>
            </div>
          </div>
        </div>
        {/* <form method="dialog" className="modal-backdrop">
					<button>close</button>
				</form> */}
      </dialog>
    </>
  );
};

export default CreateMetaIDModal;
