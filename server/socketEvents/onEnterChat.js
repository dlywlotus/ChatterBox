import getChatDetails from "../utils/getChatDetails.js";
import getMessages from "../utils/getMessages.js";

export default async function onEnterChat(
  socket,
  user_id,
  conversation_id,
  messageCount = 50
) {
  const { members, conversationInfo } = await getChatDetails(
    user_id,
    conversation_id
  );

  const messages = await getMessages(conversation_id, messageCount);

  socket.emit("receive_chat_data", {
    members,
    messages,
    conversationInfo,
    conversation_id,
    type: "firstRender",
  });
}
