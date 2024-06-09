import pool from "../db.js";
import getUnixTime from "../utils/getUnixTime.js";

const getMessages = async (conversation_id, messageCount = 50) => {
  const messages = (
    await pool.query(
      "SELECT message_id, message_text, message_type, sent_datetime, displayed_name, from_user_id FROM message JOIN account ON from_user_id = user_id WHERE conversation_id = $1 ORDER BY sent_datetime DESC LIMIT $2",
      [conversation_id, messageCount]
    )
  ).rows;
  const orderedMessages = messages.sort(
    (a, b) => getUnixTime(a.sent_datetime) - getUnixTime(b.sent_datetime)
  );

  return orderedMessages;
};

export default getMessages;
