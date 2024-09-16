import { IBtcConnector } from "@metaid/metaid";
import { Tweet } from "../../api/request";
import BuzzFormWrap from "../BuzzFormWrap";

type Iprops = {
  btcConnector: IBtcConnector;
  quotePin: Tweet;
};
const RepostModal = ({ btcConnector, quotePin }: Iprops) => {
  return (
    <dialog id={"repost_buzz_modal_" + quotePin.id} className="modal !z-20">
      <div className="modal-box bg-[#191C20] !z-20 py-5 w-[90%] lg:w-[50%]">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5">
            ✕
          </button>
        </form>
        <h3 className="font-medium text-white text-[16px] text-center">
          Repost Buzz
        </h3>
        <BuzzFormWrap btcConnector={btcConnector!} quotePin={quotePin} />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default RepostModal;
