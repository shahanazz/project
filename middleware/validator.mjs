// import asyncHandler from 'express-async-handler';
import { body,validationResult } from "express-validator";


const signupValidation = [
  body('username').notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('invalid email format'),
  body('mobile').isEmpty().isMobilePhone().withMessage('invalid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[!@#\$%\^&\*]/).withMessage('Password must contain at least one special character')
];

// const loginValidation = [
//   body('email').isEmail().normalizeEmail().withMessage('invalid email format'),
//   body('password').notEmpty().withMessage('Password is required'),
// ]

export default {
       signupValidation ,
    // loginValidation
} 