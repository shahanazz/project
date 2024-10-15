import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.mjs';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://elegent.online/auth/google/callback',
  },
  async (accessToken, tokenSecret, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // User exists, proceed
        return done(null, user);
      }

      // Check if a user with the same email exists
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // If email exists but different Google ID, update Google ID
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // Create a new user
      user = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
      });
      await user.save();

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err, null);
    });
});

export default passport;
