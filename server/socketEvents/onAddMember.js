import pool from "../db.js";
import onSendMessage from "./onSendMessage.js";
import onRefreshChat from "./onRefreshChat.js";

export default async function onAddMember(
  socket,
  io,
  member_id,
  user_id,
  conversation_id
) {
  const member = await pool.query(
    "SELECT * FROM group_member  WHERE user_id = $1 AND conversation_id = $2",
    [member_id, conversation_id]
  );

  if (member.rows.length > 0)
    return socket.emit("add_member_outcome", {
      outcome: "User is already a member",
    });

  await pool.query(
    "INSERT INTO group_member (user_id, conversation_id) VALUES ($1, $2)",
    [member_id, conversation_id]
  );

  const user = await pool.query(
    "SELECT * FROM group_member JOIN account ON group_member.user_id = account.user_id WHERE group_member.user_id = $1 AND conversation_id = $2",
    [member_id, conversation_id]
  );

  socket.emit("add_member_outcome", {
    outcome: "Added user to the group",
  });

  onRefreshChat(io, user_id, conversation_id);
  onSendMessage(
    socket,
    io,
    member_id,
    conversation_id,
    `${user.rows[0].displayed_name} joined the group`,
    "announcement"
  );
}
