const dummy = () => 1;

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0);

const favoriteBlog = ((blogs) => {
  if (!blogs || blogs.length === 0) { return {}; }

  return blogs.reduce(
    (max, blog) => (blog.likes >= max.likes ? blog : max),
    { likes: Number.MIN_SAFE_INTEGER },
  );
});

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
