import onGetChatGroups from "./onGetChatGroups.js";
import onGetUserProfile from "./onGetUserProfile.js";

export default async function onConnected(socket, user_id) {
  onGetChatGroups(socket, user_id);
  onGetUserProfile(socket, user_id);
}
