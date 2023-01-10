const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');

const api = supertest(app);

const initialUsers = [
  {
    username: 'kcmaxwell',
    password: 'hunter2',
    name: 'Kristopher Maxwell',
  },
  {
    username: 'jdoe',
    password: 'password123',
    name: 'John Doe',
  },
];

beforeEach(async () => {
  await User.deleteMany({});

  const userObjects = initialUsers.map((user) => new User(user));
  const promiseArray = userObjects.map((user) => user.save());
  await Promise.all(promiseArray);
});

describe('HTTP POST /api/login', () => {
  test('login returns a json web token', async () => {
    await api
      .post('/api/login')
      .send(initialUsers[0])
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
