import pool from "../db.js";
import onGetUserProfile from "./onGetUserProfile.js";

export default async function onUpdateProfile(
  socket,
  user_id,
  newProfilePic,
  newDescription,
  newDisplayedName
) {
  await pool.query(
    "UPDATE account SET user_image = $1, description = $2, displayed_name = $3 WHERE user_id = $4",
    [newProfilePic, newDescription, newDisplayedName, user_id]
  );

  onGetUserProfile(socket, user_id);
}
