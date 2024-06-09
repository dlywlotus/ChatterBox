import pool from "../db.js";
import getGroupList from "../utils/getGroupList.js";

export default async function onCreateGroup(
  socket,
  io,
  groupName,
  groupIconURL,
  user_id,
  friend_ids
) {
  const conversation_id = (
    await pool.query(
      "INSERT INTO conversation (conversation_name, chat_icon) VALUES ($1, $2) RETURNING conversation_id",
      [groupName, groupIconURL]
    )
  ).rows[0].conversation_id;
  const member_ids = [...friend_ids, user_id];

  //2. Invite all members
  for (const member_id of member_ids) {
    await pool.query(
      "INSERT INTO group_member (user_id, conversation_id) VALUES ($1, $2)",
      [member_id, conversation_id]
    );
  }

  //3. Send first hidden message so chat group shows up in sidebar
  await pool.query(
    "INSERT INTO message (from_user_id, message_text, conversation_id, message_type) VALUES ($1, $2, $3, $4) RETURNING *",
    [user_id, "", conversation_id, "hidden"]
  );

  //4. Make the group creator an admin
  if (groupName !== "friend")
    await pool.query(
      "UPDATE group_member SET is_admin = true WHERE conversation_id = $1 AND user_id = $2",
      [conversation_id, user_id]
    );

  const { friendConvos, groupConvos } = await getGroupList(user_id);
  const allGroups = [...groupConvos, ...friendConvos];

  allGroups
    .map(convo => convo.conversation_id)
    .forEach(convo_id => {
      socket.join(convo_id);
    });

  io.in("globalNotificationChannel").emit("invited_to_group", {
    member_ids,
  });
}
