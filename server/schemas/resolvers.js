const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async ({ user = null, params }, res) => {
            const foundUser = await User.findOne({
                $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
            });

            if (!foundUser) {
                return res.status(400).json({ message: 'Cannot find a user with this id!' });
            }

            res.json(foundUser);
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
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
       
        saveBook: async (parent, { bookData }, context) => {
          if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
              { _id: context.user._id },
              { $push: { savedBooks: bookData } },
              { new: true }
            );
    
            return updatedUser;
          }
    
          throw new AuthenticationError('You need to be logged in!');
        },
    

        removeBook:  async ({ user, params }, res) => {
            const updatedUser = await User.findOneAndUpdate(
              { _id: user._id },
              { $pull: { savedBooks: { bookId: params.bookId } } },
              { new: true }
            );
            if (!updatedUser) {
              return res.status(404).json({ message: "Couldn't find user with this id!" });
            }
            return res.json(updatedUser);
          } 
    }
}



module.exports = resolvers;