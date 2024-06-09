import { useState } from "react";
//the children of the Addmodal component share the same css module.
import styles from "../styles/AddModal.module.css";
import defaultIcon from "../images/default.png";

export type Friend = {
  user_id: string;
  displayed_name: string;
  user_image: string;
};

type AddFriendProps = {
  user_id: string;
  showAlert: (data: string) => void;
};

export default function AddFriend({ user_id, showAlert }: AddFriendProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<Friend>>();

  const searchUser = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!query) return;
      const res = await fetch(
        `http://localhost:5000/search/names/${user_id}/${query}`
      );
      const users = await res.json();
      if (typeof users === "string") return;
      setResults(users);
      setQuery("");
    } catch (error) {
      console.log(error);
    }
  };

  const sendFriendRequest = async (sender_id: string, receiver_id: string) => {
    try {
      const res = await fetch("http://localhost:5000/requests/send_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sender_id, receiver_id }),
      });
      const data = await res.json();

      showAlert(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div>
        Search users:
        <form className={styles.search_users_form} onSubmit={searchUser}>
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
        {(results as Array<Friend>)?.map(acc => (
          <div key={acc.user_id} className={styles.search_result}>
            <div className={styles.flex}>
              <img src={acc.user_image ?? defaultIcon} alt='icon' />
              <span>{acc.displayed_name}</span>
            </div>
            <button
              id={acc.user_id}
              className={styles.btn_circle}
              onClick={() => sendFriendRequest(user_id, acc.user_id)}
            >
              <i className='fa-solid fa-plus'></i>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
