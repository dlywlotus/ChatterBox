import pool from "../db.js";
import onRefreshChat from "./onRefreshChat.js";

export default async function onRemoveMember(
  io,
  member_id,
  user_id,
  conversation_id
) {
  try {
    const isMember = await pool.query(
      "SELECT * FROM group_member WHERE user_id = $1 AND conversation_id = $2",
      [member_id, conversation_id]
    );

    if (isMember.rows.length < 1) throw new Error("User is not a member");

    await pool.query(
      "DELETE FROM group_member WHERE user_id = $1 AND conversation_id = $2",
      [member_id, conversation_id]
    );

    await onRefreshChat(io, user_id, conversation_id);

    io.in(conversation_id).emit("remove_member", {
      member_id,
      conversation_id,
    });
  } catch (error) {
    console.log(error.message);
  }
}
