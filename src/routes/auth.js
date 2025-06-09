const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  authLimiter, 
  createAccountLimiter, 
  passwordResetLimiter 
} = require('../middleware/rateLimiter');

const router = express.Router();

// Apply auth rate limiter to login endpoint
router.post('/login', authLimiter, AuthController.login);

// Apply create account rate limiter to registration createAccountLimiter
router.post('/register', AuthController.registerNew);

//Apply create Driver_tbl rate limiter to registration
router.post('/driver-registration',authenticateToken, AuthController.registerDriver);   
//vehicle
router.post('/vehicle-new' , AuthController.registerVehicle); // Assuming this is for vehicle registration
// Apply auth rate limiter to token refresh
router.post('/refresh-token', authLimiter, AuthController.refreshToken);
router.post('/driverstatus',authenticateToken,AuthController.driverstatus);

// Apply password reset limiter (if you implement password reset)
// router.post('/forgot-password', passwordResetLimiter, AuthController.forgotPassword);
// router.post('/reset-password', passwordResetLimiter, AuthController.resetPassword);

// No special rate limiting for authenticated routes (uses general limiter)
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/profile', authenticateToken, AuthController.profile);

module.exports = router;