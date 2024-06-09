import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

import jwtAuthentication from "./routes/jwtAuthentication.js";
import searchRoutes from "./routes/search.js";
import requestsRoutes from "./routes/requests.js";

import onEnterChat from "./socketEvents/onEnterChat.js";
import onConnected from "./socketEvents/onConnected.js";
import onUpdateProfile from "./socketEvents/onUpdateProfile.js";
import onSendMessage from "./socketEvents/onSendMessage.js";
import onAddMember from "./socketEvents/onAddMember.js";
import onRemoveMember from "./socketEvents/onRemoveMember.js";
import onMakeAdmin from "./socketEvents/onMakeAdmin.js";
import onUpdateChatName from "./socketEvents/onUpdateChatName.js";
import onUpdateChatIcon from "./socketEvents/onUpdateChatIcon.js";
import onUpdateChatDesc from "./socketEvents/onUpdateChatDesc.js";
import onCreateGroup from "./socketEvents/onCreateGroup.js";
import onIncreaseMessageCount from "./socketEvents/onIncreaseMessageCount.js";
import onGetChatGroups from "./socketEvents/onGetChatGroups.js";

const app = express();
const httpServer = createServer(app);

//middleware
app.use(cors());
app.use(express.json());

//socket.io
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
  },
});

io.on("connection", socket => {
  console.log(`User ${socket.id} connected`);
  socket.join("globalNotificationChannel");
  socket.emit("authenticate");

  socket.on("connected", user_id => {
    onConnected(socket, user_id);
  });

  socket.on("get_chat_groups", user_id => {
    onGetChatGroups(socket, user_id);
  });

  socket.on("enter_chat", ({ user_id, conversation_id, messageCount }) => {
    onEnterChat(socket, user_id, conversation_id, messageCount);
  });

  socket.on(
    "create_group",
    ({ groupName, groupIconURL, user_id, friend_ids }) => {
      onCreateGroup(socket, io, groupName, groupIconURL, user_id, friend_ids);
    }
  );

  socket.on("make_admin", ({ memberUserId, user_id, conversation_id }) => {
    onMakeAdmin(io, memberUserId, user_id, conversation_id);
  });

  socket.on("update_chat_name", ({ new_name, user_id, conversation_id }) => {
    onUpdateChatName(io, new_name, user_id, conversation_id);
  });

  socket.on("update_chat_icon", ({ new_icon, user_id, conversation_id }) => {
    onUpdateChatIcon(io, new_icon, user_id, conversation_id);
  });

  socket.on("update_chat_desc", ({ desc, user_id, conversation_id }) => {
    onUpdateChatDesc(io, desc, user_id, conversation_id);
  });

  socket.on("add_member", ({ member_id, user_id, conversation_id }) => {
    onAddMember(socket, io, member_id, user_id, conversation_id);
  });

  socket.on("remove_member", ({ member_id, user_id, conversation_id }) => {
    onRemoveMember(io, member_id, user_id, conversation_id);
  });

  socket.on("leave_chat_group", conversation_id =>
    socket.leave(conversation_id)
  );

  socket.on("show_more_messages", ({ conversation_id, messageCount }) =>
    onIncreaseMessageCount(socket, conversation_id, messageCount)
  );

  socket.on(
    "update_profile",
    ({ user_id, newProfilePic, newDescription, newDisplayedName }) => {
      onUpdateProfile(
        socket,
        user_id,
        newProfilePic,
        newDescription,
        newDisplayedName
      );
    }
  );

  socket.on(
    "send_message",
    ({ from_user_id, conversation_id, message_text, message_type }) => {
      onSendMessage(
        socket,
        io,
        from_user_id,
        conversation_id,
        message_text,
        message_type
      );
    }
  );

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

//routes
app.use("/auth", jwtAuthentication);
app.use("/search", searchRoutes);
app.use("/requests", requestsRoutes);

app.get("/", (_, res) => {
  res.send("This is an express app");
});
app.all("*", (_, res) => {
  res.send("Route does not exist");
});

httpServer.listen(5000, () => console.log("listening on port 5000"));
