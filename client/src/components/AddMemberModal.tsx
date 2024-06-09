import styles from "../styles/AddMemberModal.module.css";
import { useEffect, useState } from "react";
import { Friend } from "./AddFriendPage";
import { socket } from "./ChatApp";
import defaultIcon from "../images/default.png";

type props = {
  user_id: string;
  conversation_id: string | undefined;
  isShowAddMemberModal: boolean;
  setIsShowAddMemberModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AddMemberModal({
  user_id,
  conversation_id,
  isShowAddMemberModal,
  setIsShowAddMemberModal,
}: props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<Friend>>([]);
  const [alert, setAlert] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const animateAlert = (message: string) => {
    setAlert(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 1500);
  };

  const exitModal = () => {
    setIsShowAddMemberModal(false);
    setQuery("");
    setResults([]);
  };

  const inviteToGroup = (member_id: string) => {
    socket.emit("add_member", { member_id, user_id, conversation_id });
  };

  const renderFriends = async (e: React.FormEvent<HTMLFormElement>) => {
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

  useEffect(() => {
    socket.on("add_member_outcome", data => {
      animateAlert(data.outcome);
    });
    return () => {
      socket.off("add_member_outcome");
    };
  }, []);

  return (
    <div
      className={styles.overlay}
      data-active={isShowAddMemberModal}
      onClick={e => {
        if (!(e.target as HTMLElement).closest("#modal")) exitModal();
      }}
    >
      <div className={styles.modal} id='modal'>
        <div className={styles.header}>
          <span className={styles.title}>Add member</span>
          <button className={styles.btn_exit} onClick={exitModal}>
            <i className='fa-solid fa-xmark'></i>
          </button>
        </div>
        <div className={styles.container}>
          <form className={styles.search_users_form} onSubmit={renderFriends}>
            <input
              type='text'
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className={styles.btn_search}>
              <i className='fa-solid fa-magnifying-glass'></i>
            </button>
          </form>
          <div className={styles.account_grid}>
            {results?.map(acc => (
              <div key={acc.user_id} className={styles.search_result}>
                <div className={styles.flex}>
                  <img src={acc.user_image ?? defaultIcon} alt='icon' />
                  <span>{acc.displayed_name}</span>
                </div>
                <button
                  id={acc.user_id}
                  className={styles.btn_circle}
                  onClick={() => inviteToGroup(acc.user_id)}
                >
                  <i className='fa-solid fa-plus'></i>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.alert} data-active={showAlert}>
          {alert}
        </div>
      </div>
    </div>
  );
}
