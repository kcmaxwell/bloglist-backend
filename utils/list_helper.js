const _ = require('lodash');

const dummy = () => 1;

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0);

const favoriteBlog = ((blogs) => {
  if (!blogs || blogs.length === 0) { return {}; }

  return blogs.reduce(
    (max, blog) => (blog.likes >= max.likes ? blog : max),
    { likes: Number.MIN_SAFE_INTEGER },
  );
});

const mostBlogs = (blogs) => {
  const count = _.countBy(blogs, (blog) => blog.author);
  return {
    author: _.maxBy(_.keys(count), (o) => count[o]),
    blogs: _.maxBy(_.values(count), (o) => o),
  };
};

const mostLikes = (blogs) => {
  const grouped = _.groupBy(blogs, (blog) => blog.author);

  const likeCount = {};
  _.forEach(grouped, (authorBlogs, author) => {
    likeCount[author] = _.reduce(authorBlogs, (result, value) => result + value.likes, 0);
  });

  return {
    author: _.maxBy(_.keys(likeCount), (o) => likeCount[o]),
    likes: _.maxBy(_.values(likeCount), (o) => o),
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
