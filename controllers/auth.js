const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.signup = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ erros: errors.array()[0].msg });
  }

  const user = new User(req.body);
  user
    .save()
    .then((user) => {
      res.json({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    })
    .catch((err) => {
      res.status(400).json({
        err: 'Failed to save',
      });
    });
};

exports.signout = (req, res) => {
  return res.send('user signout success');
};
