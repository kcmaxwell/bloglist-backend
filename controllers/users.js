const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const { usernameValid, passwordValid } = require('../utils/users_helper');

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs');
  response.json(users);
});

usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body;

  if (await usernameValid(username) && passwordValid(password)) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      passwordHash,
      name,
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
  } else {
    response.status(400).send({
      error: 'invalid username or password',
    });
  }
});

module.exports = usersRouter;
