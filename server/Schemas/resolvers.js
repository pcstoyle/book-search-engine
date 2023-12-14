const { AuthenticationError } = require("apollo-server-express");
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        // Resolver to get the current user's data
        me: async (_parent, _args, context) => {
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
        login: async (_parent, { email, password }) => {
            // Find user by email
            const user = await User.findOne({ email });

            // Check if the user exists and the password is correct
            if (!user || !(await user.isCorrectPassword(password))) {
                throw new AuthenticationError('Incorrect credentials');
            }

            // Generate a token for the authenticated user
            const token = signToken(user);
            return { token, user };
        },


        addUser: async (_parent, args) => {
            // Create a new user
            const user = await User.create(args);

            // Check if the user was successfully created
            if (!user) {
                // Throw an error if the user creation failed
                throw new AuthenticationError('Failed to create user');
            }

            // Generate a token for the newly created user
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (_parent, { bookData }, context) => {
            // Check if the user is authenticated
            if (context.user) {
                // Find the user by ID and update the savedBooks array
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } }, // Use $addToSet to add the book if it doesn't exist
                    { new: true } // Return the updated user object
                );
                return updatedUser;
            }
            throw new AuthenticationError('Not logged in');
        },

        removeBook: async (_parent, { bookId }, context) => {
            // Check if the user is authenticated
            if (context.user) {
                // Find the user by ID and pull the specified book from savedBooks
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true } // Return the updated user object
                );
                return updatedUser;
            }
            throw new AuthenticationError('Not logged in');
        },
    },
};

module.exports = resolvers;