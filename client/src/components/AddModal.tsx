import { useState, useRef } from "react";
import styles from "../styles/AddModal.module.css";
import AddFriend from "./AddFriendPage";
import Requests from "./RequestsPage";
import CreateGroup from "./CreateGroupPage";
import { CSSTransition } from "react-transition-group";

type props = {
  isAddModalOpen: boolean;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user_id: string;
};

export default function AddModal({
  isAddModalOpen,
  setIsAddModalOpen,
  user_id,
}: props) {
  const [selectedNavPage, setSelectedNavPage] = useState("Add friend");
  const [alert, setAlert] = useState("");
  const [isAlertShown, setIsAlertShown] = useState(false);
  const nodeRef = useRef(null);

  const onNavClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    if (!(e.target instanceof HTMLElement) || !e.target.closest("li")) return;
    setSelectedNavPage(e.target.closest("li")?.textContent ?? "");
  };

  const showAlert = (data: string) => {
    setAlert(data);
    setIsAlertShown(true);
    setTimeout(() => setIsAlertShown(false), 1000);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setSelectedNavPage("Add friend");
  };

  return (
    <>
      {isAddModalOpen && <div className={styles.overlay}></div>}
      <CSSTransition
        in={isAddModalOpen}
        timeout={400}
        classNames='fade-up'
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div
          className={styles.wrapper}
          ref={nodeRef}
          onClick={e => {
            if (!(e.target as HTMLElement).closest("#modal")) closeModal();
          }}
        >
          <div className={styles.modal} id='modal'>
            <button className={styles.btn_exit} onClick={closeModal}>
              <i className='fa-solid fa-xmark'></i>
            </button>
            <nav className={styles.nav} onClick={onNavClick}>
              <ul>
                <li data-active={selectedNavPage === "Add friend"}>
                  <span>Add friend</span>
                  <i className='fa-solid fa-user-plus'></i>
                </li>
                <li data-active={selectedNavPage === "Create group"}>
                  <span>Create group</span>
                  <i className='fa-solid fa-people-group'></i>
                </li>
                <li data-active={selectedNavPage === "Requests"}>
                  <span>Requests</span>
                  <i className='fa-solid fa-user-group'></i>
                </li>
              </ul>
            </nav>
            <div className={styles.modal_right}>
              {selectedNavPage === "Add friend" && (
                <AddFriend user_id={user_id} showAlert={showAlert} />
              )}
              {selectedNavPage === "Create group" && (
                <CreateGroup
                  user_id={user_id}
                  setIsAddModalOpen={setIsAddModalOpen}
                />
              )}
              {selectedNavPage === "Requests" && (
                <Requests user_id={user_id} showAlert={showAlert} />
              )}
            </div>
            <div data-active={isAlertShown} className={styles.alert}>
              {alert}
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  );
}
