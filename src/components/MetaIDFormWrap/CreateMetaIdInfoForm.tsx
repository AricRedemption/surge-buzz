/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import cls from 'classnames';
import { Copy, CopyCheck, Image } from 'lucide-react';
import useImagesPreview from '../../hooks/useImagesPreview';
import { isEmpty, isNil } from 'ramda';
import { image2Attach } from '../../utils/file';
import { MetaidUserInfo } from './CreateMetaIDFormWrap';
import { useClipboard } from '@mantine/hooks';
import Decimal from 'decimal.js-light';

import { globalFeeRateAtom } from '../../store/user';
import { useAtomValue } from 'jotai';
import CustomFeerate from '../Public/CustomFeerate';
// import { useEffect, useState } from 'react';

export type UserInfo = {
  name: string;
  avatar: FileList;
  bio?: string;
};

type IProps = {
  onSubmit: (userInfo: MetaidUserInfo) => void;
  initialValues?: MetaidUserInfo;
  address: string;
  balance: string;
};

const CreateMetaIdInfoForm = ({
  onSubmit,
  initialValues,
  address,
  balance,
}: IProps) => {
  const globalFeerate = useAtomValue(globalFeeRateAtom);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<UserInfo>({
    defaultValues: { name: initialValues?.name, bio: initialValues?.bio },
  });

  const avatar = watch('avatar');

  const [filesPreview, setFilesPreview] = useImagesPreview(avatar);
  const onCreateSubmit: SubmitHandler<UserInfo> = async (data) => {
    const submitAvatar =
      !isNil(data?.avatar) && data.avatar.length !== 0
        ? await image2Attach(data.avatar)
        : [];

    const submitData = {
      ...data,
      avatar: !isEmpty(submitAvatar)
        ? Buffer.from(submitAvatar[0].data, 'hex').toString('base64')
        : undefined,
      bio: isEmpty(data?.bio ?? '') ? undefined : data?.bio,
      feeRate: Number(globalFeerate),
    };
    console.log('submit profile data', submitData);
    onSubmit(submitData);
  };
  // console.log("avatar", avatar, !isEmpty(avatar));
  const clipboard = useClipboard({ timeout: 3000 });
  return (
    <form
      autoComplete='off'
      onSubmit={handleSubmit(onCreateSubmit)}
      className='mt-8 flex flex-col gap-6'
    >
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-2'>
          <div className='flex gap-6 text-sm text-gray'>
            <div className='flex gap-2 text-sm text-gray items-center'>
              <div className=''>Your Address: </div>
              <div> {address.slice(0, 4) + '...' + address.slice(-4)}</div>
              {!clipboard.copied ? (
                <Copy
                  className='cursor-pointer text-gray/30 hover:text-gray'
                  onClick={() => clipboard.copy(address)}
                  size={16}
                />
              ) : (
                <CopyCheck className='cursor-pointer text-main' size={16} />
              )}
            </div>
            <div className='flex gap-2 text-sm text-gray'>
              <div>Your Balance: </div>
              <div> {new Decimal(balance).div(10 ** 8).toNumber()}</div>
              <div>sats</div>
            </div>
          </div>
          {/* <div className="text-sm text-gray">
						This address haven't created MetaID.Please create one first.
					</div> */}
        </div>

        <div className='flex flex-col gap-2'>
          <div className='text-white'>Name</div>
          <label
            className={cls(
              'input input-bordered border-white text-white bg-[black] flex items-center gap-2 relative',
              {
                'input-error': errors.name,
              }
            )}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 16 16'
              fill='currentColor'
              className='w-4 h-4 opacity-70'
            >
              <path d='M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z' />
            </svg>
            <input
              type='text'
              className='grow bg-[black]'
              {...register('name', { required: true })}
            />
            {errors.name && (
              <span className='text-error absolute top-[50px] text-sm'>
                Username can't be empty.
              </span>
            )}
          </label>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between'>
            <div className='text-white'>Your Avatar(Optional)</div>
            {!isNil(avatar) && avatar.length !== 0 && (
              <div
                className='btn btn-xs btn-outline font-normal text-white'
                onClick={() => {
                  setFilesPreview([]);
                  setValue('avatar', [] as any);
                }}
              >
                clear current uploads
              </div>
            )}
          </div>

          <Controller
            control={control}
            name='avatar'
            render={({ field: { onChange } }) => (
              <input
                type='file'
                id='addPFP'
                accept='.gif,.jpg,.jpeg,.png,.webp'
                className='hidden'
                {...register('avatar')}
                onChange={(e) => {
                  const maxFileSize = 200 * 1024; // max file size 200 kb
                  const files = e.target.files;
                  if (!isNil(files) && files[0].size > maxFileSize) {
                    alert('File size cannot be greater than 200kb');

                    setValue('avatar', [] as any); // clear file input value
                    e.target.value = ''; // clear file input value
                    return;
                  }
                  onChange(files);
                }}
              />
            )}
          />

          {/* <input type="file" id="addPFP" className="hidden" {...register("avatar")} /> */}

          {!isNil(avatar) && avatar.length !== 0 ? (
            <div className='relative w-[105px] h-[105px]  bg-inheirt border border-dashed border-main rounded-full grid place-items-center mx-auto'>
              <img
                className='absolute top-[1px] left-0.5 image self-center rounded-full h-[100px] w-[100px] '
                style={{
                  objectFit: 'cover',
                }}
                src={filesPreview[0]}
                alt=''
              />
            </div>
          ) : (
            <div
              onClick={() => {
                document.getElementById('addPFP')!.click();
              }}
              className='btn btn-outline font-normal text-white bg-[black]'
            >
              <Image size={16} />
              Upload
            </div>
          )}
        </div>

        <CustomFeerate />

        {/* <div className='flex flex-col gap-2'>
          <div className='text-white'>Your Bio</div>

          <textarea
            className={cls(
              'textarea textarea-bordered border-white text-white bg-[black] h-[200px] flex items-center gap-2 relative'
            )}
            {...register('bio')}
          />
        </div> */}
        {/* <div className="flex items-center gap-2">
					<div className="text-white">Realtime Gas Fee Estimated : </div>
					<div className="text-main">{isNil(gas) ? "data is empty" : gas + " sats"}</div>
				</div> */}
      </div>

      <button
        className='btn btn-primary  rounded-full font-medium w-[120px] flex self-center mt-6'
        type='submit'
      >
        Submit
      </button>
    </form>
  );
};

export default CreateMetaIdInfoForm;
