const User = require('../models/user');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');

exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const user = new User(req.body);
    const savedUser = await user.save();

    return res.json({
      name: savedUser.name,
      email: savedUser.email,
      id: savedUser._id,
    });
  } catch (error) {
    return res.status(400).json({
      error: 'Failed to save user',
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const errors = validationResult(req);
    const { email, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const user = await User.findOne({ email });

    if (!user || !user.authenticate(password)) {
      return res.status(400).json({ error: 'User Credentials are not valid' });
    }

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);

    //put token in cookie
    res.cookie('token', token, { expire: new Date() + 9999 });

    //send response too frontend
    const { _id, name, role } = user;
    const userEmail = user.email;
    return res.json({ token, user: { _id, name, email: userEmail, role } });
  } catch (error) {
    return res.status(400).json({ error: 'An error occured' });
  }
};

exports.signout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'User signout successfully' });
};

//protected routes  (checker for token)
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET,
  algorithms: ['HS256'],
  userProperty: 'auth',
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  const { profile, auth } = req;
  let checker = profile && auth && profile._id === auth._id;

  if (!checker) {
    return res.status(403).json({ error: 'ACCESS DENIED' });
  }

  next();
};

exports.isAdmin = (req, res, next) => {
  const { profile } = req;

  if(profile.role === 0){
    return res.status(403).json({ error: 'NOT ADMIN ACCESS' });
  }

  next();
};
