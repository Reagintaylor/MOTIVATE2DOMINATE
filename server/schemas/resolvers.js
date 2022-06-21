const { Post, User } = require('../models');


const resolvers = {
  Query: {
    posts: async () => {
      return Thought.find().sort({ createdAt: -1 });
    },

    post: async (parent, { thoughtId }) => {
      return Thought.findOne({ _id: thoughtId });
    },

    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('posts')
          .populate({
              path: 'posts',
              populate: ['comments']
          })
  },
  },

  Mutation: {
    login: async (parent, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) {
          throw new AuthenticationError('No user with this username found!');
      }


      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
          throw new AuthenticationError('Incorrect password!');
      }

      const token = signToken(user);
      return { token, user };
    },
    addPost: async (parent, { postText, postAuthor }) => {
      return Post.create({ postText, postAuthor });
    },
    addComment: async (parent, { postId, commentText }) => {
      return Post.findOneAndUpdate(
        { _id: postId },
        {
          $addToSet: { comments: { commentText } },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },
    removePost: async (parent, { postId }) => {
      return Post.findOneAndDelete({ _id: postId });
    },
    removeComment: async (parent, { postId, commentId }) => {
      return Post.findOneAndUpdate(
        { _id: postId },
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;
