const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        // Resolver to get the current user's data
        me: async (parent, args, context) => {
            console.log('Context user:', context.user);
          // Check if the user is authenticated
          if (context.user) {
            // Retrieve user data without password, including saved books
            const userData = await User.findById(context.user._id).select('-__v -password').populate('savedBooks');
            return userData;
          }
          throw new AuthenticationError('No user found');
        },
      },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user }
        },

        saveBook: async (parent, { authors, description, title, bookId, image, link }) => {
            const book = { authors, description, title, bookId, image, link };
            const user = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: book } },
                { new: true, runValidators: true }
            );
            return user;
        }, 

        removeBook: async (parent, { bookId }) => {
            const user = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            );
            return user;
        },   
    },
};

module.exports = resolvers; 