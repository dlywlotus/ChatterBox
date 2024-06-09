import { useState, useRef } from "react";
//the children of the Addmodal component share the same css module.
import styles from "../styles/AddModal.module.css";
import { useImmer } from "use-immer";
import { socket } from "./ChatApp";
import ImageCropper from "./ImageCropper";
import defaultIcon from "../images/default.png";
import { Friend } from "./AddFriendPage";
import compressImage from "../utils/compressImage";
import getFileSizeFromBase64 from "../utils/getFileSizeFromBase64";

type CreateGroupProps = {
  user_id: string;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateGroup({
  user_id,
  setIsAddModalOpen,
}: CreateGroupProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<Friend>>();
  const [groupName, setGroupName] = useState("");
  const [groupIconURL, setGroupIconURL] = useState("");
  const [invitedFriends, updateInvitedFriends] = useImmer<Array<Friend>>([]);
  const [error, setError] = useState("");
  const [isShowError, setIsShowError] = useState(false);
  const [isCropToolOpen, setIsCropToolOpen] = useState(false);
  const imageFileInputRef = useRef<any>(null);

  const showError = (error: string) => {
    setError(error);
    setIsShowError(true);
    setTimeout(() => {
      setIsShowError(false);
    }, 1000);
  };

  const searchFriends = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!query) return;
      const res = await fetch(
        `http://localhost:5000/search/friends/${user_id}/${query}`
      );
      const users = await res.json();
      setResults(users);
      setQuery("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.length < 1) return showError("name required");
    if (groupIconURL.length < 1) return showError("icon required");

    const friend_ids = invitedFriends.map(fr => fr.user_id);
    const newGroupIconURL = groupIconURL.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    if (getFileSizeFromBase64(newGroupIconURL) > 850)
      return console.log("image too big");

    socket.emit("create_group", {
      groupName,
      groupIconURL: newGroupIconURL,
      user_id,
      friend_ids,
    });
    setIsAddModalOpen(false);
  };

  return (
    <>
      {isCropToolOpen && (
        <ImageCropper
          onSave={setGroupIconURL}
          imageURL={groupIconURL}
          setIsCropToolOpen={setIsCropToolOpen}
        />
      )}
      <div>
        Group name:{" "}
        <input
          className={styles.group_name_input}
          type='text'
          placeholder=''
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
        />
      </div>

      <div>
        Group icon:{" "}
        <div className={styles.group_icon}>
          <input
            ref={imageFileInputRef}
            type='file'
            accept='image/png, image/jpeg'
            onClick={() => {
              imageFileInputRef.current.value = null;
            }}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                compressImage(e.target.files[0], setGroupIconURL);
                setIsCropToolOpen(true);
              }
            }}
          />
          <img
            src={groupIconURL === "" ? defaultIcon : groupIconURL}
            alt='group-icon'
          />
        </div>
      </div>
      <div className={styles.invite_friend}>
        Invite your friends:
        <form className={styles.search_users_form} onSubmit={searchFriends}>
          <input
            type='text'
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className={styles.btn_search}>
            <i className='fa-solid fa-magnifying-glass'></i>
          </button>
        </form>
      </div>
      <div className={styles.account_grid}>
        {results &&
          (results as Array<Friend>)?.map(acc => (
            <div key={acc.user_id} className={styles.search_result}>
              <div className={styles.flex}>
                <img src={acc.user_image ?? defaultIcon} alt='icon' />
                <span>{acc.displayed_name}</span>
              </div>
              <button
                id={acc.user_id}
                className={styles.btn_circle}
                onClick={() => {
                  updateInvitedFriends(draft => {
                    if (invitedFriends.some(fr => fr.user_id === acc.user_id))
                      return;
                    draft.push(acc);
                  });
                }}
              >
                <i className='fa-solid fa-plus'></i>
              </button>
            </div>
          ))}
      </div>
      <div className={styles.bottom_row}>
        <div className={styles.error_message} data-shown={isShowError}>
          {error}
        </div>
        <div className={styles.invited_friend_icons}>
          {invitedFriends.slice(0, 3).map(fr => (
            <img
              key={fr.user_id}
              alt='icon'
              src={fr.user_image ?? defaultIcon}
            ></img>
          ))}
          {invitedFriends.length > 3 && (
            <div className={styles.counter}> + {invitedFriends.length - 3}</div>
          )}
        </div>

        <button className={styles.btn_create_group} onClick={handleCreateGroup}>
          Create
        </button>
      </div>
    </>
  );
}
