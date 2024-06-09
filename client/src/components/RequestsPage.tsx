import { useCallback, useEffect, useState } from "react";
//the children of the Addmodal component share the same css module.
import styles from "../styles/AddModal.module.css";
import { socket } from "./ChatApp";
import { Friend } from "./AddFriendPage";
import defaultIcon from "../images/default.png";

type RequestsProps = {
  user_id: string;
  showAlert: (data: string) => void;
};

export default function Requests({ user_id, showAlert }: RequestsProps) {
  const [friendRequests, setFriendRequests] = useState<Array<Friend>>([]);

  const renderFriendRequests = useCallback(
    async (ignore?: false) => {
      const res = await fetch(
        `http://localhost:5000/search/pending_friends/${user_id}`
      );
      if (!ignore) {
        const data = await res.json();
        setFriendRequests(data);
      }
    },
    [user_id]
  );

  const acceptRequest = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      const sender_id = (e.target as HTMLElement).closest("button")!.id;
      await fetch("http://localhost:5000/requests/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id,
          receiver_id: user_id,
        }),
      });

      await deleteRequest(e);
      renderFriendRequests();

      socket.emit("create_group", {
        groupName: "friend",
        groupIcon: "friend",
        user_id,
        friend_ids: [sender_id],
      });
      showAlert("Added as friend");
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRequest = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      await fetch("http://localhost:5000/requests/delete_request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: (e.target as HTMLElement).closest("button")?.id,
          receiver_id: user_id,
        }),
      });
      renderFriendRequests();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let ignore = false;
    renderFriendRequests(ignore);
    return () => {
      ignore = true;
    };
  }, [user_id, renderFriendRequests]);

  return (
    <>
      <div>
        {friendRequests.length > 0
          ? "Your friend requests:"
          : "You have no friend requests."}
      </div>
      <div className={styles.account_grid}>
        {friendRequests?.map(acc => (
          <div key={acc.user_id} className={styles.search_result}>
            <div className={styles.flex}>
              <img src={acc.user_image ?? defaultIcon} alt='icon' />
              <span>{acc.displayed_name}</span>
            </div>
            <div className={styles.flex}>
              <button
                id={acc.user_id}
                className={styles.btn_circle}
                onClick={acceptRequest}
              >
                <i className='fa-solid fa-check'></i>
              </button>
              <button
                id={acc.user_id}
                className={styles.btn_circle}
                onClick={deleteRequest}
              >
                <i className='fa-solid fa-xmark'></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
