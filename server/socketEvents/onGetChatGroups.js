import getGroupList from "../utils/getGroupList.js";

export default async function onGetChatGroups(socket, user_id) {
  const { friendConvos, groupConvos } = await getGroupList(user_id);

  const allGroups = [...groupConvos, ...friendConvos];

  allGroups
    .map(convo => convo.conversation_id)
    .forEach(convo_id => {
      socket.join(convo_id);
    });

  socket.emit("receive_chat_groups", {
    groupConvos,
    friendConvos,
  });
}
