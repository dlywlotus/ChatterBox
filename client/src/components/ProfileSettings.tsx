import styles from "../styles/ProfileSettings.module.css";
import defaultIcon from "../images/default.png";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { profile } from "./ChatApp";
import { socket } from "./ChatApp";
import ImageCropper from "./ImageCropper";
import compressImage from "../utils/compressImage";
import getFileSizeFromBase64 from "../utils/getFileSizeFromBase64";
import { CSSTransition } from "react-transition-group";

type props = {
  profile: profile;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ProfileSettings({
  profile,
  isProfileModalOpen,
  setIsProfileModalOpen,
  setIsAuthenticated,
}: props) {
  const navigate = useNavigate();
  const [newDescription, setNewDescription] = useState("");
  const [newDisplayedName, setNewDisplayedName] = useState("");
  const [newProfileImageURL, setNewProfileImageURL] = useState("");
  const [isCropToolOpen, setIsCropToolOpen] = useState(false);
  const [currentlyEditedInput, setCurrentlyEditedInput] = useState("");
  const imageFileInputRef = useRef<any>(null);
  const displayedNameInputRef = useRef<any>(null);
  const descriptionInputRef = useRef<any>(null);
  const nodeRef = useRef(null);

  const logout = () => {
    localStorage.setItem("token", "");
    setIsAuthenticated(false);
    navigate("/login");
    window.location.reload();
  };

  const updateProfile = (updatedPart: any) => {
    socket.emit("update_profile", {
      user_id: profile.userId,
      newProfilePic: profile.icon
        ? profile.icon.replace(/^data:image\/\w+;base64,/, "")
        : profile.icon,
      newDescription: profile.description,
      newDisplayedName: profile.displayedName,
      ...updatedPart,
    });
  };

  const updateAvatar = (newImageURL: string) => {
    const newProfilePic = newImageURL.replace(/^data:image\/\w+;base64,/, "");
    if (getFileSizeFromBase64(newProfilePic) > 850)
      return console.log("image too big");
    updateProfile({
      newProfilePic,
    });
  };

  const setTextAreaHeight = () => {
    const textArea = document.querySelector("#desc-text-area");
    if (textArea && textArea instanceof HTMLElement) {
      textArea.style.height = "0px";
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (currentlyEditedInput === "name") displayedNameInputRef.current.focus();
    if (currentlyEditedInput === "description") {
      descriptionInputRef.current.focus();
      setTextAreaHeight();
    }
  }, [currentlyEditedInput]);

  return (
    <CSSTransition
      in={isProfileModalOpen}
      timeout={300}
      classNames='slide-right'
      unmountOnExit
      nodeRef={nodeRef}
    >
      <div
        className={styles.profile}
        data-is-crop-tool-open={isCropToolOpen}
        ref={nodeRef}
      >
        <div className={styles.header}>
          <button
            className={styles.btn_exit}
            onClick={() => setIsProfileModalOpen(false)}
          >
            <i className='fa-solid fa-arrow-left'></i>
          </button>
          <h1>Profile</h1>
        </div>
        <div className={styles.container}>
          <div className={styles.profile_pic}>
            <img src={profile.icon ?? defaultIcon} alt='icon' />
            <span>Edit icon</span>
            <input
              ref={imageFileInputRef}
              type='file'
              accept='image/png, image/jpeg'
              onClick={() => {
                imageFileInputRef.current.value = null;
              }}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  compressImage(e.target.files[0], setNewProfileImageURL);
                  setIsCropToolOpen(true);
                }
              }}
            />
          </div>
          <div
            className={styles.info}
            data-is-editing={currentlyEditedInput === "name"}
          >
            <div className={styles.secondary_header}>
              <div className={styles.title}>Your name</div>
              {currentlyEditedInput === "name" ? (
                <button
                  className={styles.btn_save}
                  onClick={() => {
                    setCurrentlyEditedInput("");
                    if (newDisplayedName !== profile.displayedName)
                      updateProfile({ newDisplayedName });
                  }}
                >
                  <i className='fa-solid fa-check'></i>
                </button>
              ) : (
                <button
                  className={styles.btn_edit}
                  onClick={() => {
                    setCurrentlyEditedInput("name");
                    setNewDisplayedName(profile.displayedName);
                  }}
                >
                  <i className='fa-solid fa-pen'></i>
                </button>
              )}
            </div>
            {currentlyEditedInput === "name" ? (
              <input
                ref={displayedNameInputRef}
                value={newDisplayedName}
                onChange={e => {
                  if (e.target.value.length > 17) return;
                  setNewDisplayedName(e.target.value);
                }}
              ></input>
            ) : (
              <div className={styles.flex_space_between}>
                <span>{profile.displayedName}</span>
              </div>
            )}
          </div>
          <div
            className={styles.info}
            data-is-editing={currentlyEditedInput === "description"}
          >
            <div className={styles.secondary_header}>
              <div className={styles.title}>About</div>
              {currentlyEditedInput === "description" ? (
                <button
                  className={styles.btn_save}
                  onClick={() => {
                    setCurrentlyEditedInput("");
                    if (newDescription !== profile.description)
                      updateProfile({ newDescription });
                  }}
                >
                  <i className='fa-solid fa-check'></i>
                </button>
              ) : (
                <button
                  className={styles.btn_edit}
                  onClick={() => {
                    setCurrentlyEditedInput("description");
                    setNewDescription(profile.description);
                  }}
                >
                  <i className='fa-solid fa-pen'></i>
                </button>
              )}
            </div>
            {currentlyEditedInput === "description" ? (
              <textarea
                value={newDescription}
                id='desc-text-area'
                ref={descriptionInputRef}
                onChange={e => {
                  if (e.target.value.length > 140) return;
                  setNewDescription(e.target.value);
                  setTextAreaHeight();
                }}
                onFocus={e =>
                  e.currentTarget.setSelectionRange(
                    e.currentTarget.value.length,
                    e.currentTarget.value.length
                  )
                }
              />
            ) : (
              <span>{profile.description}</span>
            )}
          </div>
          <button className={styles.btn_logout} onClick={logout}>
            Logout
          </button>
        </div>
        {isCropToolOpen && (
          <ImageCropper
            onSave={updateAvatar}
            imageURL={newProfileImageURL}
            setIsCropToolOpen={setIsCropToolOpen}
          />
        )}
      </div>
    </CSSTransition>
  );
}
