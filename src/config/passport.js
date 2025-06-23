import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email']
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('🔍 Passport - Perfil recibido de Google:', JSON.stringify(profile, null, 2));
      console.log('🔍 Passport - ID:', profile.id);
      console.log('🔍 Passport - Emails:', profile.emails);
      console.log('🔍 Passport - DisplayName:', profile.displayName);
      return done(null, profile);
    }
  )
);

// Serializar el usuario
passport.serializeUser((user, done) => {
  console.log('🔍 Passport - Serializando usuario:', user?.id || 'usuario sin ID');
  done(null, user);
});

// Deserializar el usuario
passport.deserializeUser((obj, done) => {
  console.log('🔍 Passport - Deserializando usuario:', obj?.id || 'objeto sin ID');
  done(null, obj);
});
