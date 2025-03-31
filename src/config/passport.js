import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: ['profile', 'email']
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('Perfil de Google:', profile);
      return done(null, profile);
    }
  )
);

// Serializar el usuario
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserializar el usuario
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
