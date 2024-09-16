/* eslint-disable @typescript-eslint/no-explicit-any */
// import { FileEdit } from "lucide-react";
import { Image } from "lucide-react";
import { Controller, SubmitHandler, UseFormReturn } from "react-hook-form";
import cls from "classnames";
import { IsEncrypt, mergeFileLists } from "../../utils/file";
import { isNil } from "ramda";
import { Tweet } from "../../api/request";
import ForwardBuzzCard from "../Cards/TweetForwardBuzzCard";

export interface AttachmentItem {
  fileName: string;
  fileType: string;
  data: string;
  encrypt: IsEncrypt;
  sha256: string;
  size: number;
  url: string;
}

type IProps = {
  // onSubmit: (buzz: { content: string; images: AttachmentItem[] }) => void;
  onCreateSubmit: SubmitHandler<BuzzData>;
  buzzFormHandle: UseFormReturn<BuzzData, any, BuzzData>;
  onClearImageUploads: () => void;
  filesPreview: string[];
  handleRemoveImage: (index: number) => void;
  quotePin?: Tweet;
};

export type BuzzData = {
  content: string;
  images: FileList;
};

const renderImages = (
  data: string[],
  handleRemoveImage: (index: number) => void
) => {
  return (
    <div className="grid grid-cols-3 gap-2 place-items-center">
      {data.map((image, index) => {
        return (
          <div className="relative" key={index}>
            <img
              src="/icon_close.png"
              className="absolute top-1 right-1 cursor-pointer  w-[24px] h-[24px]"
              onClick={() => handleRemoveImage(index)}
            />
            <img
              className="image rounded-md w-[150px] h-[150px]"
              style={{
                objectFit: "cover",
              }}
              src={image}
              alt=""
              key={image}
            />
          </div>
        );
      })}
    </div>
  );
};

const BuzzForm = ({
  onCreateSubmit,
  buzzFormHandle,
  onClearImageUploads,
  filesPreview,
  handleRemoveImage,
  quotePin,
}: IProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = buzzFormHandle;
  const isQuoted = !isNil(quotePin);

  return (
    <form
      onSubmit={handleSubmit(onCreateSubmit)}
      className="mt-8 flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2 ">
        <div
          className={cls("relative rounded-md  ", {
            "p-4 border-white/20 rounded-md border": isQuoted,
          })}
        >
          <textarea
            placeholder={
              isQuoted
                ? "When you repost a buzz, you can leave this area empty."
                : ""
            }
            className={cls(
              "textarea textarea-bordered focus:outline-none border-none  text-white bg-[black] textarea-sm h-[160px] w-full ",
              {
                "textarea-error": errors.content,
              }
            )}
            {...register("content", { required: !isQuoted })}
          />

          {errors.content && !isQuoted && (
            <span className="text-error absolute left-0 bottom-[-24px] text-sm">
              Buzz content can't be empty.
            </span>
          )}
          {isQuoted && (
            <div className="p-2">
              <ForwardBuzzCard buzzItem={quotePin} />
            </div>
          )}
        </div>
        <div className="flex items-center self-end gap-2">
          {!isNil(filesPreview) && filesPreview.length !== 0 && (
            <div
              className="btn btn-xs btn-outline font-normal text-white"
              onClick={onClearImageUploads}
            >
              clear current uploads
            </div>
          )}
          <div
            onClick={() => {
              document.getElementById("addImage")!.click();
            }}
            className="btn btn-xs btn-outline font-normal text-white "
          >
            <Image size={16} />
            Select Image(s)
          </div>
        </div>
        <Controller
          control={buzzFormHandle.control}
          name="images"
          render={({ field: { onChange } }) => (
            <input
              type="file"
              accept=".gif,.jpg,.jpeg,.png,.webp"
              multiple
              id="addImage"
              className="hidden"
              {...register("images")}
              onChange={(e) => {
                const files = e.target.files;
                console.log(e.target.files![0].type, "file----type");
                if (!isNil(files) && files.length > 0) {
                  for (const item of Array.from(files ?? [])) {
                    if (item.size > 200 * 1024) {
                      alert(
                        `File size cannot be greater than 200kb (filename: ${item.name})`
                      );
                      e.target.value = ""; // clear file input value
                      return;
                    }
                  }
                  if (getValues("images").length > 0) {
                    const mergeRes = mergeFileLists(
                      getValues("images"),
                      files!
                    );

                    onChange(mergeRes);
                  } else {
                    onChange(files);
                  }
                }
              }}
            />
          )}
        />

        {filesPreview && renderImages(filesPreview, handleRemoveImage)}
      </div>
      {/* set price */}
      {/* <div className="flex flex-col gap-2">
				<div className="text-white font-normal text-[14px]">Set Price</div>
				<div className="relative">
					<input
						type="number"
						className="input input-bordered w-full text-white border-white bg-[black]"
					/>
					<select className="absolute right-2 top-3 select select-bordered select-xs  max-w-xs border-white text-white bg-[black] ">
						<option>BTC</option>
						<option>MVC</option>
					</select>
				</div>
			</div> */}

      <button
        className="btn btn-primary btn-sm rounded-full font-medium w-[80px] flex self-center"
        type="submit"
      >
        {isQuoted ? "Repost" : "Post"}
      </button>
    </form>
  );
};

export default BuzzForm;
