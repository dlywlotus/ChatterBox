import pool from "../db.js";
import onRefreshChat from "./onRefreshChat.js";
import onRefreshSidebar from "./onRefreshSidebar.js";

export default async function onUpdateChatIcon(
  io,
  new_icon,
  user_id,
  conversation_id
) {
  const chat_icon = (
    await pool.query(
      "UPDATE conversation SET chat_icon = $1 WHERE conversation_id = $2 RETURNING chat_icon ",
      [new_icon, conversation_id]
    )
  ).rows[0].chat_icon;
  onRefreshChat(io, user_id, conversation_id);
  onRefreshSidebar(io, conversation_id, {
    chat_icon: chat_icon ? "data:image/png;base64," + chat_icon : null,
  });
}
