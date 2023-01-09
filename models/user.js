const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const {
      _id, __v, passwordHash, ...obj
    } = returnedObject;
    return { ...obj, id: _id.toString() };
  },
});

module.exports = mongoose.model('User', userSchema);
