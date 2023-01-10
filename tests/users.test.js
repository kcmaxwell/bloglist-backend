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

describe('HTTP GET /api/users', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('returns the correct number of users', async () => {
    const response = await api.get('/api/users');
    expect(response.body).toHaveLength(initialUsers.length);
  });
});

describe('HTTP POST /api/users', () => {
  test('successfully creates a new user', async () => {
    const newUser = {
      username: 'newuser',
      password: 'password123',
      name: 'New User',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/users');
    const users = response.body.map((user) => {
      const { id, blogs, ...obj } = user;
      return obj;
    });
    delete newUser.password;

    expect(response.body).toHaveLength(initialUsers.length + 1);
    expect(users).toContainEqual(newUser);
  });

  test('when given an invalid username, returns 400', async () => {
    const invalidUser = {
      username: 'a',
      password: 'password123',
      name: 'New User',
    };

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400);
  });

  test('when given an invalid password, returns 400', async () => {
    const invalidUser = {
      username: 'newuser',
      password: 'p',
      name: 'New User',
    };

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
