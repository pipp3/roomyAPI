import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://roomyapp.duckdns.org/api/auth/google/callback",
      proxy: true // Esto es crucial cuando estás detrás de Nginx
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('Perfil de Google:', profile);
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
