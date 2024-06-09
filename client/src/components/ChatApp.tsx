import { useEffect, useState, useCallback, useRef } from "react";

import Messages from "./Messages";
import ChatSelectionSideBar from "./ChatSelectionSideBar";
import { useNavigate } from "react-router-dom";
import AddModal from "./AddModal";
import styles from "../styles/ChatApp.module.css";
import { io } from "socket.io-client";
import { useImmer } from "use-immer";
import { CSSTransition } from "react-transition-group";

export const socket = io("http://localhost:5000");

export type chatGroup = {
  message_text?: string;
  message_type?: string;
  sent_datetime?: string;
  user_name?: string;
  conversation_id: string;
  chat_icon: string;
  conversation_name: string;
  isFriend: boolean;
  description: string;
};

export type profile = {
  userId: string;
  displayedName: string;
  description: string;
  icon: any;
};

export default function ChatApp() {
  const [profile, updateProfile] = useImmer<profile>({
    userId: "",
    displayedName: "",
    description: "",
    icon: "",
  });

  const [isShowMessages, setIsShowMessages] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShowChatInfo, setIsShowChatInfo] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1500);
  const nodeRef = useRef(null);

  const navigate = useNavigate();

  const getAuthenticationStatus = useCallback(
    async (ignore: boolean = false) => {
      try {
        const res = await fetch("http://localhost:5000/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token") ?? "",
          },
        });
        if (!ignore) {
          const data = await res.json();
          if (!res.ok) throw new Error(data);
          setIsAuthenticated(true);
          updateProfile(draft => {
            draft.userId = data;
          });

          socket.emit("connected", data);
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/login");
        console.log(error);
      }
    },
    [navigate, updateProfile]
  );

  useEffect(() => {
    let ignore = false;
    getAuthenticationStatus(ignore);
    socket.on("authenticate", getAuthenticationStatus);

    return () => {
      ignore = true;
      socket.off("authenticate");
    };
  }, [getAuthenticationStatus]);

  useEffect(() => {
    socket.on("get_user_profile", data => {
      updateProfile(draft => {
        draft.displayedName = data.displayed_name ?? "";
        draft.description = data.description ?? "";
        draft.icon = data.user_image;
      });
    });
    return () => {
      socket.off("get_user_profile");
    };
  }, [updateProfile]);

  //To disconnect socket so the user stops receiving new messages from the group
  useEffect(() => {
    socket.on("remove_member", data => {
      if (profile.userId === data.member_id) {
        socket.emit("leave_chat_group", data.conversation_id);
      }
    });
    return () => {
      socket.off("remove_member");
    };
  });

  useEffect(() => {
    const onResize = () => {
      setScreenWidth(window.innerWidth);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {isAuthenticated && (
        <div className={styles.main_container}>
          <ChatSelectionSideBar
            profile={profile}
            setIsShowMessages={setIsShowMessages}
            setIsAddModalOpen={setIsAddModalOpen}
            setIsShowChatInfo={setIsShowChatInfo}
            setIsAuthenticated={setIsAuthenticated}
          />

          <CSSTransition
            in={isShowMessages}
            timeout={300}
            classNames={screenWidth < 800 ? "slide-left" : "fade"}
            unmountOnExit
            nodeRef={nodeRef}
          >
            <div className={styles.message_transition} ref={nodeRef}>
              <Messages
                displayedName={profile.displayedName}
                user_id={profile.userId}
                isShowMessages={isShowMessages}
                setIsShowMessages={setIsShowMessages}
                isShowChatInfo={isShowChatInfo}
                setIsShowChatInfo={setIsShowChatInfo}
              />
            </div>
          </CSSTransition>

          <AddModal
            user_id={profile.userId}
            isAddModalOpen={isAddModalOpen}
            setIsAddModalOpen={setIsAddModalOpen}
          />
        </div>
      )}
    </>
  );
}
