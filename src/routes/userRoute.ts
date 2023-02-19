import express from 'express';
import {
  Register,
  VerifyUser,
  Login,
  ResendOtp,
  getAllUser,
  userProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  updateEmailRequest, updateEmail, updatePasswordRequest, updatePassword
} from '../controller/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/signup', Register);
router.post('/login', Login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:id', resetPassword);
router.post('/verify/:signature', VerifyUser);
router.get('/resend-otp/:signature', ResendOtp);
router.get('/get-all-user', getAllUser);
router.get('/user-profile', auth, userProfile);
router.patch('/update-profile', auth, updateUserProfile);
router.patch('/email-update', auth, updateEmailRequest);
router.patch('/email-verification/:email', auth, updateEmail);
router.patch('/password-update', auth, updatePasswordRequest);
router.patch('/password-verification/:password', auth, updatePassword);

export default router;
