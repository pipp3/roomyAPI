import express from "express";
import passport from "passport";
import { authSuccess, authFailure, logout } from "../controllers/AuthController.js";
const router = express.Router();

// Ruta para iniciar sesión con Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback de Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/success",
    failureRedirect: "/auth/failure",
  })
);

router.get("/success", authSuccess);
router.get("/failure", authFailure);
router.get("/logout", logout);

export default router;
