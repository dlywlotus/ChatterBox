import pool from "../db.js";

const getGroupList = async user_id => {
  const groupData = await pool.query(
    "SELECT DISTINCT ON (conversation_id) conversation_name, message_text, message_type, sent_datetime, sender.displayed_name as user_name, chat_icon, conversation_id,conversation.description as description FROM message JOIN account AS sender ON message.from_user_id = sender.user_id JOIN conversation USING (conversation_id) JOIN group_member USING (conversation_id) JOIN account ON account.user_id = group_member.user_id WHERE account.user_id = $1 AND conversation_name <> 'friend' ORDER BY conversation_id, sent_datetime DESC",
    [user_id]
  );
  const groupConvos = groupData.rows.map(convo => {
    convo.isFriend = false;
    convo.chat_icon =
      convo.chat_icon && "data:image/png;base64," + convo.chat_icon;
    return convo;
  });
  const friendData = await pool.query(
    "SELECT DISTINCT ON (account.user_id) account.displayed_name as conversation_name, account.user_image as chat_icon, account.description as description, conversation_id, sent_datetime, message_text, message_type, sender.displayed_name FROM account JOIN group_member USING (user_id) JOIN conversation USING (conversation_id) JOIN message USING (conversation_id) JOIN account as sender ON message.from_user_id = sender.user_id JOIN group_member as logged_in_member USING (conversation_id) JOIN account as logged_in_user ON logged_in_member.user_id = logged_in_user.user_id WHERE conversation_name = 'friend' AND logged_in_user.user_id = $1 AND account.user_id <> $1 ORDER BY account.user_id, sent_datetime DESC",
    [user_id]
  );
  const friendConvos = friendData.rows.map(convo => {
    convo.isFriend = true;
    convo.chat_icon =
      convo.chat_icon && "data:image/png;base64," + convo.chat_icon;
    return convo;
  });

  return { groupConvos, friendConvos };
};

export default getGroupList;
