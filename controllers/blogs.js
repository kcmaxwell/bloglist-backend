const blogRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const { getTokenFrom } = require('../utils/blogs_helper');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user');
  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  console.log(request.body);

  const token = getTokenFrom(request);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    response.status(401).json({ error: 'token missing or invalid' });
  } else if (!Object.hasOwn(request.body, 'title') || !Object.hasOwn(request.body, 'url')) { response.status(400).end(); } else {
    // if likes was not provided, set likes to 0
    if (!Object.hasOwn(request.body, 'likes')) { request.body.likes = 0; }
    const user = await User.findById(decodedToken.id);

    const blog = new Blog({ ...request.body, user: user._id });
    const result = await blog.save();
    user.blogs = user.blogs.concat(result._id);
    await user.save();

    response.status(201).json(result);
  }
});

blogRouter.put('/:id', async (request, response) => {
  const exists = await Blog.exists({ _id: request.params.id });

  if (exists) {
    // if title or url are missing, return with status 400 Bad Request
    if (!Object.hasOwn(request.body, 'title') || !Object.hasOwn(request.body, 'url')) { response.status(400).end(); } else {
    // if likes was not provided, set likes to 0
      if (!Object.hasOwn(request.body, 'likes')) { request.body.likes = 0; }

      const blog = request.body;
      const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });

      response.json(updatedBlog);
    }
  } else {
    response.status(404).end();
  }
});

blogRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);

  response.status(204).end();
});

module.exports = blogRouter;
