const users = {};

export const addUserToRoom = (roomId, user) => {
  if (!users[roomId]) users[roomId] = [];
  users[roomId].push(user);
};

export const getUsersInRoom = (roomId) => {
  return users[roomId] || [];
};

export const removeUserFromAllRooms = (socketId) => {
  for (const roomId in users) {
    users[roomId] = users[roomId].filter((user) => user.socketId !== socketId);

    if (users[roomId].length === 0) {
      delete users[roomId];
    }
  }
};

export const isRoomFull = (roomId) => {
  return (users[roomId] || []).length >= 2;
};

export default users;