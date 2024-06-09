import pool from "../db.js";
import onRefreshSidebar from "./onRefreshSidebar.js";

export default async function onSendMessage(
  socket,
  io,
  from_user_id,
  conversation_id,
  message_text,
  message_type
) {
  const member = await pool.query(
    "SELECT * FROM account JOIN group_member USING (user_id) WHERE user_id = $1 AND conversation_id = $2",
    [from_user_id, conversation_id]
  );

  if (member.rows.length === 0)
    return console.log("you are not a member of this group");

  const message = await pool.query(
    "INSERT INTO message (from_user_id, message_text, conversation_id, message_type) VALUES ($1, $2, $3, $4) RETURNING *",
    [from_user_id, message_text, conversation_id, message_type]
  );

  io.in(conversation_id).emit("receive_message", {
    ...message.rows[0],
    displayed_name: member.rows[0].displayed_name,
  });

  onRefreshSidebar(io, conversation_id, {
    ...message.rows[0],
    displayed_name: member.rows[0].displayed_name,
  });
}
