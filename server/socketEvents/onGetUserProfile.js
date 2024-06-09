import pool from "../db.js";

export default async function onGetUserProfile(socket, user_id) {
  const account = await pool.query(
    `SELECT displayed_name, description, user_image FROM account WHERE user_id = $1`,
    [user_id]
  );
  const profileData = account.rows[0];
  const base64Data = profileData.user_image;
  socket.emit("get_user_profile", {
    ...profileData,
    user_image: base64Data ? "data:image/png;base64," + base64Data : null,
  });
}
