const User = require('../models/user');
const Order = require('../models/order');

exports.getUserById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id).exec();

    if (!user) {
      return res.status(400).json({ error: 'No User Found' });
    }

    req.profile = user; //copying the user info from db
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUser = (req, res) => {
  //TODO: get back here for password

  req.profile.salt = undefined; //hide sensitive user info
  req.profile.passwordHash = undefined;
  //   delete req.profile.createdAt;
  req.profile.updatedAt = '';

  return res.json(req.profile);
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true, useFindAndModify: false }
    ).exec();

    if (!updatedUser) {
      return res
        .status(400)
        .json({ error: 'You are not authorized to update' });
    }

    updatedUser.salt = undefined;
    updatedUser.passwordHash = undefined;

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.userPurchaseList = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.profile._id })
      .populate('user', '_id name')
      .exec();

    if (!orders) {
      return res.status(404).json({ error: 'No orders inthis user account' });
    }

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// middleware to update user purchases
exports.pushOrderInPurchaseList = async (req, res, next) => {
  try {
    const purchases = req.body.order.products.map((product) => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id,
    }));

    //store the upddated purchases in db
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $push: { purchases: purchases } },
      { new: true }
    ).exec();

    if (!updatedUser) {
      return res.status(400).json({
        error: 'Unable to save purchase list',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({});
//     if (!users) {
//       return res.status(404).json({ error: 'No Users Found' });
//     }
//     return res.json(users);
//   } catch (error) {
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
