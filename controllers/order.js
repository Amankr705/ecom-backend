const { Order, ProductCart } = require('../models/order');

exports.getOrderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById(id)
      .populate('products.product', 'name price')
      .exec();

    if (!order) {
      return res.status(400).json({ error: 'No Order found in DB' });
    }
    req.order = order;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    // Associate the user profile with the order
    req.body.order.user = req.profile;

    // Create a new order instance
    const order = new Order(req.body.order);

    // Save the order to the database
    const savedOrder = await order.save();

    res.json(savedOrder);
  } catch (error) {
    return res.status(400).json({
      error: 'Unable to save order in DB',
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', '-id name');
    res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getOrderStatus = async (req, res) => {
  // Access the "status" field's enum values from the Order schema
  const statusEnumValues = Order.schema.path('status').enumValues;

  // Respond with the enum values as a JSON array
  res.json(statusEnumValues);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Find the order by orderId and update the status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    return res.status(400).json({
      error: 'Status update failed',
    });
  }
};
