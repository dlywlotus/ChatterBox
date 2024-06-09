import AvatarEditor from "react-avatar-editor";
import styles from "../styles/ImageCropper.module.css";
import { useRef, useState } from "react";

type props = {
  onSave: any;
  imageURL: string;
  setIsCropToolOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ImageCropper = ({ onSave, imageURL, setIsCropToolOpen }: props) => {
  const [scale, setScale] = useState(1.5);
  const editorRef = useRef<any>(null);

  const exit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if ((e.target as HTMLElement).closest("#image-cropper-modal")) return;

    setIsCropToolOpen(false);
  };

  return (
    <div className={styles.background} onMouseDown={exit}>
      <div
        id='image-cropper-modal'
        className={styles.modal}
        onWheel={e => {
          if (e.deltaY < 0) {
            if (scale < 3) setScale(scale + 0.1);
          } else {
            if (scale > 1.1) setScale(scale - 0.1);
          }
        }}
      >
        <div className={styles.header}>Drag and scroll to crop the image</div>
        <div className={styles.editor_wrapper}>
          <AvatarEditor
            ref={editorRef}
            image={imageURL}
            width={250}
            height={250}
            border={50}
            color={[0, 0, 0, 0.4]} // RGBA
            scale={scale}
            borderRadius={500}
            rotate={0}
          />
        </div>
        <button
          className={styles.btn_save_crop}
          onClick={() => {
            setIsCropToolOpen(false);
            const newImageURL = editorRef.current.getImage().toDataURL();
            onSave(newImageURL);
          }}
        >
          <i className='fa-solid fa-check'></i>
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
