const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user');
  response.json(blogs);
});

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, config.SECRET);
  if (!decodedToken.id) {
    response.status(401).json({ error: 'token missing or invalid' });
  } else if (!Object.hasOwn(request.body, 'title') || !Object.hasOwn(request.body, 'url')) { response.status(400).end(); } else {
    // if likes was not provided, set likes to 0
    if (!Object.hasOwn(request.body, 'likes')) { request.body.likes = 0; }

    const blog = new Blog({ ...request.body, user: request.user._id });
    const result = await blog.save();
    request.user.blogs = request.user.blogs.concat(result._id);
    await request.user.save();

    response.status(201).json(result);
  }
});

blogsRouter.put('/:id', async (request, response) => {
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

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blogToDelete = await Blog.findById(request.params.id);

  if (!blogToDelete) {
    response.status(204).end();
  } else if (request.user && blogToDelete.user.toString() === request.user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);

    response.status(204).end();
  } else {
    response.status(401).end();
  }
});

module.exports = blogsRouter;
