import getChatDetails from "../utils/getChatDetails.js";

export default async function onRefreshChat(io, user_id, conversation_id) {
  const { members, conversationInfo } = await getChatDetails(
    user_id,
    conversation_id
  );

  io.in(conversation_id).emit("receive_chat_data", {
    members,
    conversationInfo,
    conversation_id,
  });
}
