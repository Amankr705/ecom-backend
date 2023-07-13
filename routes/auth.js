const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const controller = require('../controllers/auth.js');

router.post(
  '/signup',
  [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid unique email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
  ],
  controller.signup
);

router.post(
  '/signin',
  [
    body('email', 'Enter a valid unique email').isEmail(),
    body('password', 'Password is required').isLength({ min: 1 }),
  ],
  controller.signin
);

router.get('/signout', controller.signout);

// router.get('/testroute', controller.isSignedIn, (req, res)=>{
//   res.send('Protected Route')
//   res.json(req.auth)
// })

module.exports = router;
