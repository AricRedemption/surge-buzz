/* eslint-disable @typescript-eslint/no-explicit-any */
// import { FileEdit } from "lucide-react";
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import cls from 'classnames';
import { IsEncrypt } from '../../utils/file';
import CustomFeerate from '../Public/CustomFeerate';

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
  onCreateSubmit: SubmitHandler<CommentData>;
  commentFormHandle: UseFormReturn<CommentData, any, CommentData>;
  isReply?: boolean;
};

export type CommentData = {
  content: string;
};

const CommentForm = ({
  onCreateSubmit,
  commentFormHandle,
  isReply,
}: IProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = commentFormHandle;

  return (
    <form
      onSubmit={handleSubmit(onCreateSubmit)}
      className='mt-8 flex flex-col gap-6'
    >
      <div className='flex flex-col gap-2 '>
        <div className={cls('relative rounded-md  ')}>
          <textarea
            className={cls(
              'textarea textarea-bordered focus:outline-none border-none  text-white bg-[black] textarea-sm h-[160px] w-full ',
              {
                'textarea-error': errors.content,
              }
            )}
            {...register('content', { required: true })}
          />

          {errors.content && (
            <span className='text-error absolute left-0 bottom-[-24px] text-sm'>
              Comment content can't be empty.
            </span>
          )}
        </div>
      </div>

      <CustomFeerate />

      <button
        className='btn btn-primary btn-sm rounded-full font-medium w-[80px] flex self-center'
        type='submit'
      >
        {isReply ? 'Reply' : 'Comment'}
      </button>
    </form>
  );
};

export default CommentForm;
