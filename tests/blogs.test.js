const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');

const api = supertest(app);

const loginUser = {
  username: 'kcmaxwell',
  password: 'password123',
  name: 'Kristopher Maxwell',
};

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
];

let token;

beforeAll(async () => {
  await User.deleteMany({});

  const user = new User(loginUser);
  await user.save();

  const response = await api
    .post('/api/login')
    .send(loginUser);

  token = response.body.token;
});

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe('HTTP GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('returns the correct number of blogs', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(initialBlogs.length);
  });

  test('there is a property called id in each blog', async () => {
    const response = await api.get('/api/blogs');
    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined();
    });
  });
});

describe('HTTP POST /api/blogs', () => {
  test('successfully creates a new blog post', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'Kristopher Maxwell',
      url: 'http://newblog.com',
      likes: 6,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    const blogsNoId = response.body.map((blog) => {
      const { id, user, ...obj } = blog;
      return obj;
    });

    expect(response.body).toHaveLength(initialBlogs.length + 1);
    expect(blogsNoId).toContainEqual(newBlog);
  });

  test('defaults likes to 0 if not provided', async () => {
    const newBlogNoLikes = {
      title: 'New blog',
      author: 'Kristopher Maxwell',
      url: 'http://newblog.com',
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlogNoLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    const blogsNoId = response.body.map((blog) => {
      const { id, user, ...obj } = blog;
      return obj;
    });

    expect(blogsNoId).toContainEqual({ ...newBlogNoLikes, likes: 0 });
  });

  test('if title or url are missing, respond with 400 Bad Request', async () => {
    const badBlog = {
      author: 'Kristopher Maxwell',
      likes: 10,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(badBlog)
      .expect(400);
  });

  test('if a token is not provided, respond with 401 Unauthorized', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'Kristopher Maxwell',
      url: 'http://newblog.com',
      likes: 6,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401);
  });
});

describe('HTTP PUT /api/blogs/:id', () => {
  test('successfully updates the given blog', async () => {
    const { _id } = initialBlogs[0];

    const update = {
      title: 'New Blog',
      author: 'Kristopher Maxwell',
      url: 'http://newblog.com',
      likes: 20,
    };

    const result = await api
      .put(`/api/blogs/${_id.toString()}`)
      .send(update)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    delete result.body.id;

    expect(result.body).toEqual(JSON.parse(JSON.stringify(update)));
  });

  test('if id is invalid, respond with 404', async () => {
    const falseId = new mongoose.Types.ObjectId();

    const update = {
      title: 'New Blog',
      author: 'Kristopher Maxwell',
      url: 'http://newblog.com',
      likes: 20,
    };

    await api
      .put(`/api/blogs/${falseId}`)
      .send(update)
      .expect(404);
  });

  test('if new blog info sent is invalid, respond with 400', async () => {
    const { _id } = initialBlogs[0];

    const update = {
      title: 'New Blog',
      author: 'Kristopher Maxwell',
      likes: 20,
      badAttribute: 'bad',
    };

    await api
      .put(`/api/blogs/${_id.toString()}`)
      .send(update)
      .expect(400);
  });
});

describe('HTTP DELETE /api/blogs/:id', () => {
  const newBlog = {
    title: 'New Blog',
    author: 'Kristopher Maxwell',
    url: 'http://newblog.com',
    likes: 2,
  };

  test('successfully deletes the given blog and returns 204', async () => {
    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog);

    const blogId = blogResponse.body.id;

    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(initialBlogs.length);
  });

  test('if id is invalid, change nothing and respond with 204', async () => {
    const falseId = new mongoose.Types.ObjectId();

    await api
      .delete(`/api/blogs/${falseId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(initialBlogs.length);
  });

  test('if a token is not provided, respond with 401 Unauthorized', async () => {
    const blogResponse = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog);

    const blogId = blogResponse.body.id;

    await api
      .delete(`/api/blogs/${blogId}`)
      .expect(401);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
