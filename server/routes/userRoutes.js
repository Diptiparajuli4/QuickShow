
import express from "express";

import {
    loginUser,
    signupUser
} from "../controllers/userController.js";


const router = express.Router();


// =====================================================
// SIGNUP
// =====================================================

router.post(
    "/signup",
    signupUser
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    loginUser
);


// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;
