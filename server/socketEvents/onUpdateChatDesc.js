import pool from "../db.js";
import onRefreshChat from "./onRefreshChat.js";

export default async function onUpdateChatIcon(
  io,
  desc,
  user_id,
  conversation_id
) {
  await pool.query(
    "UPDATE conversation SET description = $1 WHERE conversation_id = $2 RETURNING description",
    [desc, conversation_id]
  );
  onRefreshChat(io, user_id, conversation_id);
}
