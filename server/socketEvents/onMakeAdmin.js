import pool from "../db.js";
import onRefreshChat from "./onRefreshChat.js";

export default async function onMakeAdmin(
  io,
  memberUserId,
  user_id,
  conversation_id
) {
  await pool.query(
    "UPDATE group_member SET is_admin = true WHERE user_id = $1 AND conversation_id = $2;",
    [memberUserId, conversation_id]
  );
  onRefreshChat(io, user_id, conversation_id);
}
