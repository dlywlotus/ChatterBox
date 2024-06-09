import getMessages from "../utils/getMessages.js";

export default async function onIncreaseMessageCount(
  socket,
  conversation_id,
  messageCount
) {
  const messages = await getMessages(conversation_id, messageCount);

  socket.emit("get_more_messages", { messages });
}
