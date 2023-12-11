const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('books')
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
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user }
        },
        saveBook: async (parent, { authors, description, title, bookId, image, link }) => {
            const book = await Book.create({ authors, description, title, bookId, image, link });
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