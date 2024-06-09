import pool from "../db.js";
import onRefreshChat from "./onRefreshChat.js";
import onRefreshSideBar from "./onRefreshSidebar.js";

export default async function onUpdateChatName(
  io,
  new_name,
  user_id,
  conversation_id
) {
  const conversation_name = (
    await pool.query(
      "UPDATE conversation SET conversation_name = $1 WHERE conversation_id = $2 RETURNING conversation_name",
      [new_name, conversation_id]
    )
  ).rows[0].conversation_name;
  onRefreshChat(io, user_id, conversation_id);
  onRefreshSideBar(io, conversation_id, { conversation_name });
}
