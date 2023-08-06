const Product = require('../models/product');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

exports.getProductById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id).exec();

    if (!product) {
      return res.status(400).json({ error: 'No Product Found' });
    }

    req.product = product;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createProduct = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: 'Problem parsing the form data',
      });
    }

    //destructure the fields
    const { name, description, price, category, stock } = fields;
    // console.log(name);
    // console.log(price);
    // restrictions on fields
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: 'Include all the fields',
      });
    }

    // // console.log(fields);
    let product = new Product({
      name: name[0],
      description: description[0],
      price: price[0],
      category: category[0],
      stock: stock[0],
    });
    // console.log(product);

    // Handle file
    if (file.photo) {
      if (file.photo[0].size > 3000000) {
        // 2*1024*1024  2MB
        return res.status(400).json({
          message: 'File size is too large',
        });
      }
      product.photo.data = fs.readFileSync(file.photo[0].filepath);
      product.photo.contentType = file.photo[0].mimetype;
    }

    //save to DB
    try {
      const savedProduct = await product.save();
      res.json(savedProduct);
    } catch (error) {
      return res.status(400).json({
        error: 'Failed to save the img in DB',
      });
    }
  });
};

exports.getProduct = (req, res) => {
  // const product = req.product;
  req.product.photo = undefined; //optimization: Not showing bulky data(here in binary form)
  return res.json(req.product);
};

//middleware to get photo efficiently & fastly
exports.photo = (req, res, next) => {
  // Check if product photo data exists
  if (req.product.photo && req.product.photo.data) {
    // Set the appropriate content type based on the product's photo contentType
    res.set('Content-Type', req.product.photo.contentType);
    
    // Send the product's photo data as the response
    return res.send(req.product.photo.data);
  }

  // If no product photo data, proceed to the next middleware
  next();
};


exports.updateProduct = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        err: 'Problem parsing the form data',
      });
    }

    // Destructure the fields
    const { name, description, price, category, stock } = fields;

    // // Restrictions on fields   not necessary this time
    // if (!name || !description || !price || !category || !stock) {
    //   return res.status(400).json({
    //     error: 'Include all the fields',
    //   });
    // }

    try {
      let product = await Product.findById(req.params.productId);

      if (!product) {
        return res.status(404).json({
          error: 'Product not found',
        });
      }

      // Update the product fields
      product.name = name[0];
      product.description = description[0];
      product.price = price[0];
      product.category = category[0];
      product.stock = stock[0];

      // Handle file
      if (file.photo) {
        if (file.photo[0].size > 3000000) {
          // 2*1024*1024  2MB
          return res.status(400).json({
            message: 'File size is too large',
          });
        }
        product.photo.data = fs.readFileSync(file.photo[0].filepath);
        product.photo.contentType = file.photo[0].mimetype;
      }

      // Save the updated product to the DB
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (error) {
      return res.status(400).json({
        error: 'Failed to update the product',
      });
    }
  });
};

exports.removeProduct = async (req, res) => {
  try {
    let product = req.product;
    await product.deleteOne();
    res.json({ message: `Successfully deleted the ${product.name} product` });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete this product' });
  }
};

//product listing
exports.getAllProducts = async (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  try {
    const products = await Product.find({})
      .select('-photo')
      .populate('category')
      .sort([[sortBy, 'asc']])
      .limit(limit);
    if (!products) {
      return res.status(400).json({ error: 'No Products Found' });
    }
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

//updating the inventory
exports.updateStock = async (req, res, next) => {
  try {
    const productsToUpdate = req.body.order.products;

    // Prepare the bulk write operations
    const bulkWriteOperations = productsToUpdate.map((prod) => {
      return {
        updateOne: {
          filter: { _id: prod._id },
          update: { $inc: { stock: -prod.count, sold: +prod.count } },
        },
      };
    });

    // Perform the bulk write operation to update stock and sold quantity
    const bulkWriteResult = await Product.bulkWrite(bulkWriteOperations);

    // Check if the operation was successful
    if (bulkWriteResult && bulkWriteResult.ok === 1) {
      // Proceed to the next middleware in the request chain
      next();
    } else {
      return res.status(400).json({
        error: 'Bulk operation failed',
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// all different categories
exports.getAllUniqueCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    return res.status(400).json({
      error: 'No categories found',
    });
  }
};
