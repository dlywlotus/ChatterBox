import pool from "../db.js";
import dataTagAdder from "./datTagAdder.js";

const getChatDetails = async (user_id, conversation_id) => {
  let newConvo, conversationInfo;

  const memberArray = (
    await pool.query(
      "SELECT user_name, displayed_name, user_image, account.user_id as user_id, is_admin FROM group_member JOIN account ON group_member.user_id = account.user_id WHERE conversation_id = $1",
      [conversation_id]
    )
  ).rows;

  const convo = await pool.query(
    "SELECT conversation_id, conversation_name, conversation.description as chat_description, account.description, chat_icon, user_image, displayed_name, user_id FROM account JOIN group_member USING (user_id) JOIN conversation USING (conversation_id) WHERE conversation_id = $1",
    [conversation_id]
  );

  if (convo.rows.length < 1) return;

  newConvo =
    convo.rows[0].conversation_name === "friend"
      ? convo.rows.filter(cv => cv.user_id !== user_id)[0]
      : convo.rows[0];

  conversationInfo =
    convo.rows[0].conversation_name === "friend"
      ? {
          conversation_name: newConvo.displayed_name,
          chat_icon: newConvo.user_image,
          description: newConvo.description ?? "",
          isFriend: true,
        }
      : {
          conversation_name: newConvo.conversation_name,
          chat_icon: newConvo.chat_icon,
          description: newConvo.chat_description ?? "",
          isFriend: false,
        };

  const members = dataTagAdder(memberArray);

  conversationInfo = {
    ...conversationInfo,
    chat_icon:
      conversationInfo.chat_icon &&
      "data:image/png;base64," + conversationInfo.chat_icon,
  };

  return { members, conversationInfo };
};

export default getChatDetails;
