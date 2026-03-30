import {
  addUserToRoom,
  getUsersInRoom,
  removeUserFromAllRooms,
  isRoomFull,
} from "../utils/users.js";

export const handleSocket = (socket, io) => {
  socket.on("join-room", ({ roomId, userId }) => {
    if (isRoomFull(roomId)) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomId);
    addUserToRoom(roomId, { socketId: socket.id, userId });

    console.log(`User ${userId} joined room ${roomId}`);

    const roomUsers = getUsersInRoom(roomId).filter(
      (user) => user.socketId !== socket.id
    );

    if (roomUsers.length > 0) {
      socket.emit("existing-user", roomUsers[0]);
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
      });
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