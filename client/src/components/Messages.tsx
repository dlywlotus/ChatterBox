import styles from "../styles/Messages.module.css";
import { useCallback, useEffect, useState, useRef } from "react";
import ChatInfo from "./ChatInfo";
import { chatGroup } from "./ChatApp";
import { socket } from "./ChatApp";
import textColors from "../textColors";
import { useImmer } from "use-immer";
import defaultIcon from "../images/default.png";
import { CSSTransition } from "react-transition-group";

type props = {
  user_id: string;
  displayedName: string;
  isShowMessages: boolean;
  setIsShowMessages: React.Dispatch<React.SetStateAction<boolean>>;
  isShowChatInfo: boolean;
  setIsShowChatInfo: React.Dispatch<React.SetStateAction<boolean>>;
};

type MessageProps = {
  user_id: string;
  members: member[];
  message: message;
  nameColors: Record<string, string>;
};

export type member = {
  displayed_name: string;
  user_image: string;
  user_id: string;
  is_admin: boolean;
  description: string;
};

type message = {
  conversation_id: string;
  message_id: string;
  from_user_id: string;
  displayed_name: string;
  message_text: string;
  sent_datetime: string;
  is_announcement: boolean;
  message_type: string;
  status: string;
};

type chatData = {
  members: member[];
  messages: message[];
  conversationInfo: chatGroup;
  conversation_id: string;
  type: string;
};

export default function Messages({
  user_id,
  displayedName,
  isShowMessages,
  setIsShowMessages,
  isShowChatInfo,
  setIsShowChatInfo,
}: props) {
  const chatLogRef = useRef<any>(null);
  const bottomOfChatRef = useRef<any>(null);
  const nodeRef = useRef(null);
  const [input, setInput] = useState("");
  const [verticallyScrolledDist, setVerticalledScrolledDist] = useState(0);
  const [nameColors, setNameColors] = useState<Record<string, string>>({});
  const [chatLog, updateChatLog] = useImmer<message[]>([]);
  const [members, setMembers] = useState<Array<member>>([]);
  const [maxNoOfMessages, setMaxNoOfMessages] = useState(50);
  const [chatDetails, setChatDetails] = useState<chatGroup>({
    conversation_id: "",
    chat_icon: "",
    conversation_name: "",
    isFriend: false,
    description: "",
  });

  const scrollToBottom = () => {
    bottomOfChatRef.current?.scrollIntoView();
  };

  const onScrollChat = () => {
    const chatLog = chatLogRef.current;
    setVerticalledScrolledDist(
      chatLog.scrollHeight - chatLog.clientHeight - chatLog.scrollTop
    );
  };

  const sendMessage = async (
    from_user_id: string,
    conversation_id: string | undefined,
    message_text: string,
    message_type: string
  ) => {
    if (message_text.trim() !== "") {
      socket.emit("send_message", {
        from_user_id,
        conversation_id,
        message_text: message_text.trim(),
        message_type,
      });
    }
    setInput("");
  };

  const loadMoreMessages = () => {
    socket.emit("show_more_messages", {
      conversation_id: chatDetails.conversation_id,
      messageCount: maxNoOfMessages + 50,
    });
    socket.on("get_more_messages", data => {
      setMaxNoOfMessages(n => n + 50);
      updateChatLog(data.messages);
      socket.off("get_more_messages");
    });
    setTimeout(() => socket.off("get_more_messages"), 1000);
  };

  const onRecieveChatData = useCallback(
    (data: chatData) => {
      if (
        data.type === "firstRender" &&
        chatDetails.conversation_id !== data.conversation_id
      ) {
        setMaxNoOfMessages(50);
        setVerticalledScrolledDist(0);
      }
      if (
        data.type === "firstRender" ||
        chatDetails.conversation_id === data.conversation_id
      ) {
        //set text colors
        const userIds = data.members?.map((member: member) => member.user_id);
        let initialColors: any = {};
        userIds.forEach((user_id: string, index: number) => {
          initialColors[user_id] = textColors[index % 5];
        });
        setNameColors(initialColors);
        setMembers(data.members);
        setChatDetails({
          ...data.conversationInfo,
          conversation_id: data.conversation_id,
        });
        data.messages && updateChatLog(data.messages);
      }
    },
    [updateChatLog, chatDetails.conversation_id]
  );

  useEffect(() => {
    socket.on("receive_message", data => {
      if (chatDetails.conversation_id === data.conversation_id) {
        updateChatLog(draft => {
          data && draft.push(data);
        });
      }
    });
    return () => {
      socket.off("receive_message");
    };
  }, [updateChatLog, chatDetails.conversation_id]);

  useEffect(() => {
    socket.on("receive_chat_data", (data: chatData) => {
      onRecieveChatData(data);
    });

    return () => {
      socket.off("receive_chat_data");
    };
  }, [onRecieveChatData]);

  useEffect(() => {
    if (verticallyScrolledDist > 0) return;
    scrollToBottom();
  }, [chatLog, verticallyScrolledDist]);

  return (
    <div className={styles.wrapper} data-is-show-chat-info={isShowChatInfo}>
      <CSSTransition
        in={isShowChatInfo}
        timeout={300}
        classNames='slide-left'
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className={styles.chat_info_transition}>
          <ChatInfo
            setIsShowChatInfo={setIsShowChatInfo}
            chatDetails={chatDetails}
            user_id={user_id}
            displayedName={displayedName}
            sendMessage={sendMessage}
            members={members}
          />
        </div>
      </CSSTransition>

      <div className={styles.chat_display}>
        <div className={styles.header} onClick={() => setIsShowChatInfo(true)}>
          <button
            className={styles.btn_exit}
            onClick={e => {
              e.stopPropagation();
              setIsShowMessages(false);
            }}
          >
            <i className='fa-solid fa-arrow-left'></i>
          </button>

          <img
            className={styles.profile_pic}
            src={chatDetails.chat_icon || defaultIcon}
            alt={"profile_pic"}
          />

          <span>{chatDetails.conversation_name}</span>
        </div>
        <div
          className={styles.chat_log}
          ref={chatLogRef}
          onScroll={onScrollChat}
        >
          <button
            className={styles.btn_see_more}
            onClick={loadMoreMessages}
            data-hidden={chatLog[0]?.message_type === "hidden"}
          >
            <div>See more</div>
            <i className='fa-solid fa-chevron-up'></i>
          </button>
          {chatLog?.map(msg => {
            if (msg.message_type === "hidden")
              return (
                <div
                  className={styles.hidden_message}
                  key={msg.message_id}
                ></div>
              );
            if (msg.message_type === "announcement")
              return (
                <div className={styles.announcement} key={msg.message_id}>
                  {msg.message_text}
                </div>
              );
            return (
              <Message
                key={msg.message_id}
                user_id={user_id}
                nameColors={nameColors}
                message={msg}
                members={members}
              />
            );
          })}
          <div ref={bottomOfChatRef}></div>

          <form
            className={styles.text_input_field}
            onSubmit={e => {
              e.preventDefault();
              sendMessage(
                user_id,
                chatDetails.conversation_id,
                input,
                "normal"
              );
            }}
            data-shorten={isShowChatInfo}
          >
            <input
              type='text'
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Enter Text here...'
            />
            <button className={styles.btn_send}>
              <i className='fa-solid fa-paper-plane'></i>
            </button>
            <button
              className={styles.btn_scroll_down}
              data-shown={verticallyScrolledDist > 72}
              onClick={scrollToBottom}
            >
              <i className='fa-solid fa-chevron-down'></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Message({ message, members, user_id, nameColors }: MessageProps) {
  const userImage = members.find(
    member => member.user_id === message.from_user_id
  )?.user_image;

  const getDateOnly = (dateTime: string) => {
    const MDYDateArr = dateTime.slice(0, dateTime.indexOf(",")).split("/");
    const DMYDateArr = [MDYDateArr[1], MDYDateArr[0], MDYDateArr[2]];
    return DMYDateArr.join("/");
  };

  const getTimeOnly = (dateTime: string) => {
    const startOfTimeStr = dateTime.indexOf(",") + 1;
    const AMPM = dateTime.slice(-2);
    return `${dateTime.slice(startOfTimeStr, -6)} ${AMPM}`;
  };

  const dateTime = new Date(message.sent_datetime).toLocaleString();

  return (
    <>
      <div key={message.message_id}>
        <div
          className={
            styles[
              message.from_user_id === user_id
                ? "message_sending"
                : "message_receiving"
            ]
          }
        >
          <img
            className={styles.profile_pic}
            src={userImage ?? defaultIcon}
            alt={"profile_pic"}
          />
          <div className={styles.text_bubble}>
            <div
              className={styles.name}
              style={{ color: nameColors[message.from_user_id] }}
            >
              {message.displayed_name}
            </div>
            <div className={styles.date_time}>
              {getDateOnly(dateTime)},{getTimeOnly(dateTime)}
            </div>

            <div className={styles.message_text}>{message.message_text}</div>
          </div>
        </div>
      </div>
    </>
  );
}
