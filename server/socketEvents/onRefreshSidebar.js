import pool from "../db.js";

export default async function onRefreshSidebar(
  io,
  conversation_id,
  refreshed_content
) {
  const isFriend =
    (
      await pool.query(
        "SELECT conversation_name FROM conversation WHERE conversation_id = $1",
        [conversation_id]
      )
    ).rows[0].conversation_name === "friend";

  io.in(conversation_id).emit("refresh_side_bar", {
    ...refreshed_content,
    conversation_id,
    isFriend,
  });
}
