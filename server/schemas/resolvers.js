const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
     
      me: async (parent, args, context) => {
            const foundUser = await User.findOne({
              _id: context.user._id
            });

            if (!foundUser) {
                throw new AuthenticationError('Need to log in for this query')
            }
            console.log('foundUserMeQuery', foundUser)
            return foundUser;
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
       
        saveBook: async (parent, { input }, context) => {
          
          console.log('SaveBookMutate args:', input)
          if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
              { _id: context.user._id },
              { $push: { savedBooks: input } },
              { new: true }
            );
    
            return updatedUser;
          }
    
          throw new AuthenticationError('You need to be logged in!');
        },
    

        removeBook:  async (parent, args, context ) => {
          console.log('removedBook Fired:', args)
            const updatedUser = await User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId: bookId } } },
              { new: true }
            );
            if (!updatedUser) {
              throw new AuthenticationError('Need to login')
            }
            return updatedUser;
          } 
    }
}



module.exports = resolvers;