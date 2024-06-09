import styles from "../styles/ChatInfo.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import AddMemberModal from "./AddMemberModal";
import { member } from "./Messages";
import { chatGroup } from "./ChatApp";
import { socket } from "./ChatApp";
import defaultIcon from "../images/default.png";
import ImageCropper from "./ImageCropper";
import compressImage from "../utils/compressImage";
import getFileSizeFromBase64 from "../utils/getFileSizeFromBase64";

type props = {
  setIsShowChatInfo: React.Dispatch<React.SetStateAction<boolean>>;
  chatDetails: chatGroup;
  user_id: string;
  displayedName: string;
  members: member[];
  sendMessage: (
    from_user_id: string,
    conversation_id: string | undefined,
    message_text: string,
    message_type: string
  ) => Promise<void>;
};

type membersProps = {
  user_id: string;
  members: member[];
  isMember: boolean;
  isAdmin: boolean | undefined;
  isFriend: boolean | undefined;
  isShowAllMembers: boolean;
  setIsShowAddMemberModal: React.Dispatch<React.SetStateAction<boolean>>;

  kickMember: (memberUserId: string, memberUserName: string) => Promise<void>;
  makeAdmin: (memberUserId: string, memberUserName: string) => void;
};

type memberProps = {
  member_data: member;
  currentUserId: string;
  isMember: boolean;
  kickMember: (memberUserId: string, memberUserName: string) => Promise<void>;
  makeAdmin: (memberUserId: string, memberUserName: string) => void;
};

export default function ChatInfo({
  user_id,
  displayedName,
  setIsShowChatInfo,
  chatDetails,
  sendMessage,
  members,
}: props) {
  const [desc, setDesc] = useState("");
  const [chatName, setChatName] = useState("");
  const [chatIconURL, setChatIconURL] = useState("");

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isEditingChatName, setIsEditingChatName] = useState(false);

  const [isCropToolOpen, setIsCropToolOpen] = useState(false);
  const [isShowAllMembers, setIsShowAllMembers] = useState(false);
  const [isShowAddMemberModal, setIsShowAddMemberModal] = useState(false);
  const [isReadMore, setIsReadMore] = useState("inactive");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const chatNameInputRef = useRef<HTMLInputElement>(null);
  const descTextRef = useRef<HTMLDivElement>(null);
  const mainWrapperRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<any>(null);
  const nodeRef = useRef(null);

  const isAdmin = members.find((m: member) => m.user_id === user_id)?.is_admin;
  const isMember = members.some((m: member) => m.user_id === user_id);

  const {
    conversation_id,
    conversation_name,
    chat_icon,
    description,
    isFriend,
  } = chatDetails;

  const removeMember = (member_id: string) => {
    socket.emit("remove_member", { member_id, user_id, conversation_id });
  };

  const setTextAreaHeight = () => {
    const textArea = document.querySelector("#text-area");
    if (textArea && textArea instanceof HTMLElement) {
      textArea.style.height = "0px";
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  };

  const sendAnnouncement = (message_text: string) => {
    sendMessage(user_id, conversation_id, message_text, "announcement");
  };

  const leaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group ?")) {
      sendAnnouncement(`${displayedName} left the group `);
      removeMember(user_id);
      setIsShowChatInfo(false);
    }
  };

  const kickMember = async (memberUserId: string, memberUserName: string) => {
    if (window.confirm("Are you sure you want to remove this member ?")) {
      sendAnnouncement(
        `${memberUserName} has been removed by ${displayedName}`
      );
      removeMember(memberUserId);
    }
  };

  const makeAdmin = (memberUserId: string, memberUserName: string) => {
    socket.emit("make_admin", { memberUserId, user_id, conversation_id });
    sendAnnouncement(`${memberUserName} is now an admin`);
  };

  const updateConversationName = () => {
    if (conversation_name === chatName.trim()) return;
    socket.emit("update_chat_name", {
      new_name: chatName.trim(),
      user_id,
      conversation_id,
    });
    sendAnnouncement(`${displayedName} updated the group name`);
  };

  const updateChatIcon = (imageURL: string) => {
    const new_icon = imageURL.replace("data:image/png;base64,", "");
    if (getFileSizeFromBase64(new_icon) > 850)
      return console.log("image too big");
    socket.emit("update_chat_icon", {
      new_icon,
      user_id,
      conversation_id,
    });
    sendAnnouncement(`${displayedName} updated the group icon`);
  };

  const updateDescription = () => {
    if (desc === "" || description === desc.trim()) return;
    socket.emit("update_chat_desc", {
      desc: desc.trim(),
      user_id,
      conversation_id,
    });
    sendAnnouncement(`${displayedName} updated the group description`);
  };

  const renderScrollBar = useCallback(() => {
    const wrapper = mainWrapperRef.current;
    if (!wrapper) return;
    const contentHeight = wrapper.firstElementChild!.clientHeight;
    const isRenderScrollBar = contentHeight > wrapper.clientHeight;
    wrapper.setAttribute("data-render-scroll-bar", `${isRenderScrollBar}`);
  }, []);

  useEffect(() => {
    renderScrollBar();
    window.addEventListener("resize", renderScrollBar);
    return () => {
      window.removeEventListener("resize", renderScrollBar);
    };
  }, [renderScrollBar]);

  useEffect(() => {
    chatNameInputRef.current?.focus();
  }, [isEditingChatName]);

  useEffect(() => {
    textAreaRef.current?.focus();
    setTextAreaHeight();
    renderScrollBar();
  }, [isEditingDesc, renderScrollBar]);

  useEffect(() => {
    const height = descTextRef?.current?.clientHeight;
    if (height && height > 24) {
      setIsReadMore("false");
    }
  }, []);

  return (
    <>
      <AddMemberModal
        user_id={user_id}
        conversation_id={conversation_id}
        isShowAddMemberModal={isShowAddMemberModal}
        setIsShowAddMemberModal={setIsShowAddMemberModal}
      />
      <div className={styles.chat_info} ref={nodeRef}>
        <div className={styles.header}>
          <div className={styles.flex}>
            <button
              className={styles.btn_exit}
              onClick={() => setIsShowChatInfo(false)}
            >
              <i className='fa-solid fa-arrow-left'></i>
            </button>
            <div className={styles.header_title}>
              {isFriend ? "Contact Info" : "Group info"}
            </div>
          </div>
        </div>
        <div className={styles.wrapper} ref={mainWrapperRef}>
          <main className={styles.main}>
            <div
              data-is-friend={isFriend}
              data-is-admin={isAdmin}
              data-is-member={isMember}
              className={styles.profile_pic}
            >
              <img src={chat_icon ?? defaultIcon} alt='icon' />
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
                    compressImage(e.target.files[0], setChatIconURL);
                    setIsCropToolOpen(true);
                  }
                }}
              />
            </div>
            {isCropToolOpen && (
              <ImageCropper
                onSave={updateChatIcon}
                imageURL={chatIconURL}
                setIsCropToolOpen={setIsCropToolOpen}
              />
            )}
            <div
              className={styles.chat_name}
              data-is-editing={isEditingChatName}
            >
              {isEditingChatName && isMember ? (
                <>
                  <input
                    ref={chatNameInputRef}
                    type='text'
                    value={chatName}
                    onChange={e => {
                      if (
                        e.target.value.length > 17 ||
                        e.target.value.length < 1
                      )
                        return;
                      setChatName(e.target.value);
                    }}
                  />
                  <button
                    className={styles.btn_save}
                    onClick={() => {
                      setIsEditingChatName(false);
                      updateConversationName();
                    }}
                  >
                    <i className='fa-solid fa-check'></i>
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.name}>{conversation_name}</div>
                  {isAdmin && (
                    <button
                      className={styles.btn_edit_name}
                      onClick={() => {
                        setIsEditingChatName(true);
                        setChatName(conversation_name);
                      }}
                    >
                      <i className='fa-solid fa-pen'></i>
                    </button>
                  )}
                </>
              )}
            </div>
            {isFriend || <div>{members.length} members </div>}
            <div
              className={styles.description}
              data-read-more={isReadMore}
              data-is-editing={isEditingDesc}
            >
              {isAdmin && isMember && (
                <>
                  {isEditingDesc ? (
                    <button
                      className={styles.btn_edit_desc}
                      onClick={() => {
                        setIsEditingDesc(false);
                        updateDescription();
                      }}
                    >
                      <i className='fa-solid fa-check'></i>
                    </button>
                  ) : (
                    <button
                      className={styles.btn_edit_desc}
                      onClick={() => {
                        setIsEditingDesc(true);
                        setDesc(description);
                      }}
                    >
                      <i className='fa-solid fa-pen'></i>
                    </button>
                  )}
                </>
              )}
              <h3>{isFriend ? "About" : "Description"}</h3>
              <textarea
                value={desc}
                id='text-area'
                ref={textAreaRef}
                data-shown={`${isEditingDesc}`}
                onChange={e => {
                  setDesc(e.target.value);
                  setTextAreaHeight();
                }}
                onFocus={e =>
                  e.currentTarget.setSelectionRange(
                    e.currentTarget.value.length,
                    e.currentTarget.value.length
                  )
                }
              />
              <div data-shown={`${!isEditingDesc}`}>
                <div className={styles.desc_text} ref={descTextRef}>
                  {description ?? (!isFriend && "Add a description")}
                </div>
                <div
                  className={styles.btn_read_more}
                  onClick={() => {
                    setIsReadMore(isReadMore === "true" ? "false" : "true");
                  }}
                >
                  {isReadMore === "true" ? (
                    <>
                      <span>Show less</span>
                      <i className='fa-solid fa-chevron-up'></i>
                    </>
                  ) : (
                    <>
                      <span>Show more</span>
                      <i className='fa-solid fa-chevron-down'></i>
                    </>
                  )}
                </div>
              </div>
            </div>

            {!isFriend && (
              <Members
                user_id={user_id}
                members={members}
                isAdmin={isAdmin}
                isFriend={isFriend}
                isMember={isMember}
                isShowAllMembers={isShowAllMembers}
                setIsShowAddMemberModal={setIsShowAddMemberModal}
                kickMember={kickMember}
                makeAdmin={makeAdmin}
              />
            )}
            {members.length > 8 && (
              <div
                className={styles.btn_view_all}
                onClick={() => setIsShowAllMembers(true)}
              >
                View all ({members.length - 8} more)
              </div>
            )}

            {isMember && !isFriend && (
              <div className={styles.leave_group}>
                <i className='fa-solid fa-arrow-right-from-bracket'></i>
                <button className={styles.btn_leave_group} onClick={leaveGroup}>
                  Leave group
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

function Members({
  members,
  isShowAllMembers,
  user_id,
  isAdmin,
  isFriend,
  isMember,
  setIsShowAddMemberModal,
  kickMember,
  makeAdmin,
}: membersProps) {
  //put current user infront
  const memberList = [
    ...members.filter(m => m.user_id === user_id),
    ...members.filter(m => m.user_id !== user_id),
  ];

  return (
    <>
      <ul className={styles.member_list} data-is-admin={isAdmin}>
        {!isFriend && isAdmin && (
          <div
            className={styles.add_member}
            onClick={() => setIsShowAddMemberModal(true)}
          >
            <button className={styles.btn_add_member}>
              <i className='fa-solid fa-user-plus'></i>
            </button>
            <span>Add member</span>
          </div>
        )}
        {(isShowAllMembers ? memberList : memberList.slice(0, 8)).map(
          member => (
            <Member
              key={member.user_id}
              member_data={member}
              currentUserId={user_id}
              kickMember={kickMember}
              makeAdmin={makeAdmin}
              isMember={isMember}
            />
          )
        )}
      </ul>
    </>
  );
}

function Member({
  member_data,
  kickMember,
  makeAdmin,
  currentUserId,
  isMember,
}: memberProps) {
  const isCurrentUser = member_data.user_id === currentUserId;

  const [isShowAdminFuncs, setIsShowAdminFuncs] = useState(false);

  const hideAdminFuncs = useCallback((e: any) => {
    if ((e.target as HTMLElement).closest("#admin_funcs_btn")) return;
    setIsShowAdminFuncs(false);
    window.removeEventListener("click", hideAdminFuncs);
  }, []);

  const toggleAdminFuncs = () => {
    if (isShowAdminFuncs) {
      setIsShowAdminFuncs(false);
      window.removeEventListener("click", hideAdminFuncs);
    } else {
      setIsShowAdminFuncs(true);
      window.addEventListener("click", hideAdminFuncs);
    }
  };

  return (
    <li
      key={member_data.user_id}
      className={styles.group_member}
      data-show-admin-funcs={isShowAdminFuncs}
    >
      <div className={styles.flex}>
        <img src={member_data.user_image ?? defaultIcon} alt='icon' />
        <div className={styles.group_member_name} data-bold={isCurrentUser}>
          {isCurrentUser ? "You" : member_data.displayed_name}
        </div>
      </div>
      {member_data.is_admin ? (
        <div className={styles.tag}>Admin</div>
      ) : (
        <div className={styles.not_visible}>blank</div>
      )}
      <button
        id='admin_funcs_btn'
        onClick={toggleAdminFuncs}
        className={styles.btn_show_admin_funcs}
        data-is-current-user={isCurrentUser}
        data-is-member={isMember}
      >
        <i className='fa-solid fa-chevron-down'></i>
      </button>
      {isShowAdminFuncs && (
        <div className={styles.admin_funcs_modal} id='admin_funcs_modal'>
          <div
            onClick={() =>
              kickMember(member_data.user_id, member_data.displayed_name)
            }
          >
            Remove
          </div>
          {member_data.is_admin || (
            <div
              onClick={() =>
                makeAdmin(member_data.user_id, member_data.displayed_name)
              }
            >
              Make admin
            </div>
          )}
        </div>
      )}
    </li>
  );
}
