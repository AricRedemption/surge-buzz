import { BookCheck } from 'lucide-react';
// about modal
const AboutModal = () => {
  const onCloseAlertModal = () => {
    const aboutModalEle = document.getElementById(
      'about_modal'
    ) as HTMLDialogElement;
    aboutModalEle.close();
  };
  return (
    <dialog id='about_modal' className='modal'>
      <div className='modal-box bg-[#191C20] py-5 w-[90%] lg:w-[50%]'>
        <form method='dialog'>
          {/* if there is a button in form, it will close the modal */}
          {/* <button
            className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'
            onClick={onCloseAlertModal}
          >
            ✕
          </button> */}
        </form>
        <div className='flex flex-col relative items-start'>
          <div className='w-full  flex items-center justify-center pt-4'>
            <BookCheck
              size={120}
              className='text-lime-500 bg-lime-800/20 rounded-full p-6 rotate-12'
            />
          </div>
          <h3 className='text-white text-xl mt-8 mb-2'>About BitBuzz</h3>

          <p className='text-gray'>
            BitBuzz is an open-source application based on
            <a
              href='https://doc.metaid.io/'
              className='text-secondary hover:underline mx-1 italic'
              target='_blank'
            >
              MetaID v2
            </a>
            .
          </p>
          <a
            href='https://github.com/senmonster/bitbuzz'
            className='text-lime-500 hover:underline'
          >
            View source code
          </a>

          {/* <h3 className='text-white text-xl mt-8 mb-2'>About Fee</h3>
          <p className='text-gray'>
            BitBuzz charges a service fee of 1999 satoshi per PIN.
          </p>
          <p className='text-gray mt-2'>
            We encourage more developers to run their own BitBuzz or create an
            improved version to compete with us.
          </p>

          <div className='flex flex-col items-center mt-12 gap-8 w-full'>
            <button
              className='btn btn-md btn-primary rounded-full text-md font-medium	w-[180px]'
              onClick={onCloseAlertModal}
            >
              OK
            </button>
          </div> */}
        </div>
      </div>

      <form method='dialog' className='modal-backdrop'>
        <button>close</button>
      </form>
    </dialog>
  );
};

export default AboutModal;
