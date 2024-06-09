import { useState } from "react";
import styles from "../styles/Authentication.module.css";
import { Link, useNavigate } from "react-router-dom";

type props = {
  type: string;
};

export default function Authentication({ type }: props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onLogin() {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`${data}`);
        throw new Error(data);
      }
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  async function onRegister() {
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`${data}`);
        throw new Error(data);
      }
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.auth_modal}>
        <h2>{type}</h2>
        <input
          type='text'
          placeholder='username'
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type='text'
          placeholder='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          className={styles.btn_auth}
          onClick={type === "Login" ? onLogin : onRegister}
        >
          {type}
        </button>
        {type === "Login" ? (
          <Link to='/register' className={styles.link}>
            No account ? Sign up now
          </Link>
        ) : (
          <Link to='/Login' className={styles.link}>
            Already have an account ? Log in
          </Link>
        )}

        <span className={`${styles.error} ${error || styles.hidden}`}>
          {error ? error : "placeholder"}
        </span>
      </div>
    </div>
  );
}
