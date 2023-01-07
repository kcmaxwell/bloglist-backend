const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  console.log(request.body);

  // if title or url are missing, return with status 400 Bad Request
  if (!Object.hasOwn(request.body, 'title') || !Object.hasOwn(request.body, 'url')) { response.status(400).end(); } else {
    // if likes was not provided, set likes to 0
    if (!Object.hasOwn(request.body, 'likes')) { request.body.likes = 0; }

    const blog = new Blog(request.body);
    const result = await blog.save();

    response.status(201).json(result);
  }
});

module.exports = blogRouter;
