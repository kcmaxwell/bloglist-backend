require('dotenv').config();

const { PORT } = process.env;
const { MONGODB_URI } = process.env;
const { TEST_MONGODB_URI } = process.env;
const { SECRET } = process.env;

module.exports = {
  MONGODB_URI,
  TEST_MONGODB_URI,
  PORT,
  SECRET,
};
