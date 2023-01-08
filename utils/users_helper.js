const User = require('../models/user');

const usernameValid = async (username) => {
  const exists = await User.exists({ username });
  if (!exists && username.length >= 3) { return true; }
  return false;
};

const passwordValid = (password) => {
  if (password.length >= 3) return true;
  return false;
};

module.exports = {
  usernameValid,
  passwordValid,
};
