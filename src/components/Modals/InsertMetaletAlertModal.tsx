const InsertMetaletAlertModal = () => {
  //   const onCloseAlertModal = () => {
  //     const doc_modal = document.getElementById(
  //       'alert_install_metalet_modal'
  //     ) as HTMLDialogElement;
  //     doc_modal.close();
  //   };
  return (
    <dialog id='alert_install_metalet_modal' className='modal'>
      <div className='modal-box bg-[#191C20] py-5 md:w-[90%] w-[50%]'>
        <form method='dialog'>
          {/* if there is a button in form, it will close the modal */}
          {/* <button
            className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'
            onClick={onCloseAlertModal}
          >
            ✕
          </button> */}
        </form>
        <div className='flex flex-col relative items-center'>
          <img src='/metalet-icon.png' className='w-[120px] h-[120px]' />
          <div className='text-white text-[24px] mt-6'>
            Download Metalet Wallet
          </div>
          <div className='flex flex-col items-center mt-12 gap-8'>
            <div className='flex flex-col gap-2'>
              <div className='font-medium text-gray w-full text-[16px] text-center'>
                You haven't installed the Metalet plugin wallet yet. Once
                installed successfully, please refresh the page or restart the
                browser and try again.{' '}
              </div>
              <div className='font-medium text-gray w-full text-[14px] text-center'>
                (Currently, it only supports the Metalet wallet.){' '}
              </div>
            </div>

            <div
              className='btn btn-md btn-primary rounded-full text-md font-medium	w-[180px]'
              onClick={() => {
                window.open(
                  `https://chromewebstore.google.com/search/metalet?hl=zh-CN&utm_source=ext_sidebar`,
                  '_blank'
                );
              }}
            >
              Download
            </div>
          </div>
        </div>
      </div>

      <form method='dialog' className='modal-backdrop'>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default InsertMetaletAlertModal;
