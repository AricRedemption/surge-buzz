import { useEffect, useState } from 'react';

const useImagesPreview = (
  files: FileList
): [string[], React.Dispatch<React.SetStateAction<string[]>>] => {
  const [imgSrcs, setImgSrcs] = useState<string[]>([]);

  useEffect(() => {
    if (files) {
      const imageArray: string[] = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImgSrcs(imageArray);
    }
  }, [files]);

  return [imgSrcs, setImgSrcs];
};

export default useImagesPreview;
