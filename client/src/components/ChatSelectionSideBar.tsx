import { useEffect, useState } from "react";
import styles from "../styles/ChatSelectionSideBar.module.css";
import getDateOnly from "../utils/getDateOnly";
import ProfileSettings from "./ProfileSettings";
import { chatGroup } from "./ChatApp";
import { socket } from "./ChatApp";
import { profile } from "./ChatApp";
import defaultIcon from "../images/default.png";
import { useImmer } from "use-immer";

type props = {
  profile: profile;
  setIsAddModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setIsShowMessages: React.Dispatch<React.SetStateAction<boolean>>;
  setIsShowChatInfo: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ChatSelectionSideBar({
  profile,
  setIsAddModalOpen,
  setIsShowChatInfo,
  setIsShowMessages,
  setIsAuthenticated,
}: props) {
  const [currentConversationId, setCurrentConversationId] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [convos, setConvos] = useState<chatGroup[]>([]);
  const [friendConvos, setFriendConvos] = useImmer<chatGroup[]>([]);
  const [groupConvos, setGroupConvos] = useImmer<chatGroup[]>([]);
  const [filter, setFilter] = useState("none");

  const renderCurrentChat = (conversation_id: string) => {
    setIsShowMessages(true);
    setIsShowChatInfo(false);
    setCurrentConversationId(conversation_id);
    socket.emit("enter_chat", { user_id: profile.userId, conversation_id });
  };

  useEffect(() => {
    const renderScrollBar = () => {
      const chatList = document.querySelector("#chat_groups");
      const chatListHeight = chatList!.clientHeight;
      const boolean = chatListHeight && convos.length * 55 > chatListHeight;
      chatList?.setAttribute("data-scroll-bar", `${boolean}`);
    };
    renderScrollBar();
    window.addEventListener("resize", renderScrollBar);
    return () => {
      window.removeEventListener("resize", renderScrollBar);
    };
  }, [convos]);

  useEffect(() => {
    socket.on("receive_chat_groups", data => {
      setFriendConvos(data.friendConvos);
      setGroupConvos(data.groupConvos);
    });
    return () => {
      socket.off("receive_chat_groups");
    };
  }, [setFriendConvos, setGroupConvos]);

  useEffect(() => {
    socket.on("invited_to_group", (data: { member_ids: string[] }) => {
      if (data.member_ids.includes(profile.userId))
        socket.emit("get_chat_groups", profile.userId);
    });
    return () => {
      socket.off("invited_to_group");
    };
  }, [profile.userId]);

  useEffect(() => {
    socket.on("refresh_side_bar", data => {
      const updateConvos = (convos: chatGroup[]) => {
        const filteredGroups = convos.filter(
          convo => convo.conversation_id !== data.conversation_id
        );
        const chatGroup = convos.find(
          cg => cg.conversation_id === data.conversation_id
        );
        const updatedChatGroup = {
          ...chatGroup,
          ...data,
        };
        return [updatedChatGroup, ...filteredGroups];
      };

      if (data.isFriend) {
        setFriendConvos(updateConvos);
      } else {
        setGroupConvos(updateConvos);
      }
    });

    return () => {
      socket.off("refresh_side_bar");
    };
  }, [setFriendConvos, setGroupConvos]);

  useEffect(() => {
    const getUnixTime = (timestamp: string | undefined) => {
      return new Date(timestamp ?? "").getTime();
    };
    if (filter === "none") {
      const sortedConvos = [...friendConvos, ...groupConvos].sort(
        (a, b) =>
          getUnixTime(b.sent_datetime) - getUnixTime(a.sent_datetime) ?? 1
      );
      setConvos(sortedConvos);
    } else if (filter === "onlyFriends") {
      setConvos(friendConvos);
    } else {
      setConvos(groupConvos);
    }
  }, [filter, friendConvos, groupConvos]);

  return (
    <>
      <div className={styles.sideBar}>
        <ProfileSettings
          profile={profile}
          isProfileModalOpen={isProfileModalOpen}
          setIsProfileModalOpen={setIsProfileModalOpen}
          setIsAuthenticated={setIsAuthenticated}
        />

        <div className={styles.header}>
          <div className={styles.logo}>ChatterBox</div>
          <div
            className={styles.btn_icon}
            onClick={() => {
              setIsProfileModalOpen(true);
              setIsProfileModalOpen(true);
            }}
          >
            <i className='fa-solid fa-user'></i>
          </div>
        </div>
        <ul
          className={styles.chat_groups}
          id='chat_groups'
          data-scroll-bar={false}
        >
          {convos.map(cg => (
            <li
              key={cg.conversation_id}
              onClick={() => renderCurrentChat(cg.conversation_id)}
              data-active={currentConversationId === cg.conversation_id}
            >
              <img
                className={styles.chat_icon}
                src={cg.chat_icon ?? defaultIcon}
                alt='icon'
              />
              <div className={styles.name_and_last_message}>
                <div className={styles.chat_name}>{cg.conversation_name}</div>
                <div
                  data-hidden={cg.message_type === "hidden"}
                  className={styles.latest_message}
                >
                  {cg.isFriend || cg.message_type === "announcement"
                    ? ""
                    : `${cg.user_name}: `}
                  {cg.message_text}
                </div>
              </div>
              <div className={styles.latest_message_date}>
                {getDateOnly(cg.sent_datetime)}
              </div>
            </li>
          ))}
          {convos.length < 1 && (
            <div className={styles.no_friends}>
              {filter === "onlyGroups"
                ? "Create a group chat to start chatting"
                : " Add a friend to start chatting"}
            </div>
          )}
        </ul>

        <div className={styles.button_row}>
          <div
            className={styles.btn_icon}
            data-active={filter === "onlyGroups"}
            onClick={() => {
              setFilter(filter === "onlyGroups" ? "none" : "onlyGroups");
            }}
          >
            <i className='fa-solid fa-people-group'></i>
          </div>
          <div
            className={styles.btn_icon}
            data-active={filter === "onlyFriends"}
            onClick={() => {
              setFilter(filter === "onlyFriends" ? "none" : "onlyFriends");
            }}
          >
            <i className='fa-solid fa-user-group'></i>
          </div>
          <div
            className={styles.btn_icon}
            onClick={() => {
              setIsAddModalOpen(true);
            }}
          >
            <i className='fa-solid fa-plus'></i>
          </div>
        </div>
      </div>
    </>
  );
}
