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

/**
 * Update user's language preference
 */
export const updateUserLanguage = (socketId, language) => {
  for (const roomId in users) {
    const user = users[roomId].find((user) => user.socketId === socketId);
    if (user) {
      user.language = language;
      return true;
    }
  }
  return false;
};

/**
 * Get user by socket ID
 */
export const getUserBySocketId = (socketId) => {
  for (const roomId in users) {
    const user = users[roomId].find((user) => user.socketId === socketId);
    if (user) {
      return user;
    }
  }
  return null;
};

/**
 * Get other user in the room (for 1-to-1 calls)
 */
export const getOtherUserInRoom = (roomId, currentSocketId) => {
  const roomUsers = users[roomId] || [];
  return roomUsers.find((user) => user.socketId !== currentSocketId);
};

export default users;