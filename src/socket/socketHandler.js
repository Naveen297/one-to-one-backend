import {
  addUserToRoom,
  getUsersInRoom,
  removeUserFromAllRooms,
  isRoomFull,
  updateUserLanguage,
  getUserBySocketId,
  getOtherUserInRoom,
} from "../utils/users.js";
import { translateText } from "../services/translationService.js";

export const handleSocket = (socket, io) => {
  socket.on("join-room", ({ roomId, userId, language }) => {
    if (isRoomFull(roomId)) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomId);
    addUserToRoom(roomId, {
      socketId: socket.id,
      userId,
      language: language || "en" // Default to English
    });

    console.log(`User ${userId} joined room ${roomId} with language ${language || "en"}`);

    const roomUsers = getUsersInRoom(roomId).filter(
      (user) => user.socketId !== socket.id
    );

    if (roomUsers.length > 0) {
      socket.emit("existing-user", roomUsers[0]);
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
        language: language || "en",
      });
    }
  });

  // Handle language selection/update
  socket.on("set-language", ({ language }) => {
    const success = updateUserLanguage(socket.id, language);
    if (success) {
      console.log(`User ${socket.id} set language to ${language}`);
      socket.emit("language-updated", { language });
    }
  });

  // Handle chat messages with translation
  socket.on("send-message", async ({ roomId, message, timestamp }) => {
    try {
      const sender = getUserBySocketId(socket.id);
      const receiver = getOtherUserInRoom(roomId, socket.id);

      if (!sender || !receiver) {
        console.error("Could not find sender or receiver");
        return;
      }

      console.log(`Message from ${sender.userId} (${sender.language}): ${message}`);
      console.log(`Translating to ${receiver.language}...`);

      // Translate message to receiver's language
      const translatedMessage = await translateText(message, receiver.language);

      console.log(`Translated message: ${translatedMessage}`);

      // Send translated message to receiver
      io.to(receiver.socketId).emit("receive-message", {
        message: translatedMessage,
        originalMessage: message,
        from: sender.userId,
        fromSocketId: socket.id,
        senderLanguage: sender.language,
        timestamp: timestamp || Date.now(),
      });

      // Send confirmation back to sender with their original message
      socket.emit("message-sent", {
        message: message,
        translatedTo: translatedMessage,
        to: receiver.userId,
        receiverLanguage: receiver.language,
        timestamp: timestamp || Date.now(),
      });
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("message-error", { error: "Failed to send message" });
    }
  });

  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", {
      offer,
      from: socket.id,
    });
  });

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", {
      answer,
      from: socket.id,
    });
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    io.to(to).emit("ice-candidate", {
      candidate,
      from: socket.id,
    });
  });

  socket.on("end-call", ({ roomId }) => {
    socket.to(roomId).emit("call-ended");
  });

  socket.on("disconnect", () => {
    removeUserFromAllRooms(socket.id);
    socket.broadcast.emit("user-left", { socketId: socket.id });
    console.log("Socket disconnected:", socket.id);
  });
};