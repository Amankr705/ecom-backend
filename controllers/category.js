const Category = require('../models/category');

exports.getCategoryById = async (req, res, next, id) => {
  try {
    const category = await Category.findById(id).exec();

    if (!category) {
      return res.status(400).json({ error: 'No category found' });
    }

    req.category = category;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();

    if (!savedCategory) {
      return res.status(400).json({ error: 'Failed to create category' });
    }

    res.status(201).json({ category: savedCategory });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({});
    if (!categories) {
      return res.status(404).json({ error: 'No categories found' });
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server Error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = req.category;
    category.name = req.body.name;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update category' });
  }
};

exports.removeCategory = async (req, res) => {
  try {
    const category = req.category;
    await category.deleteOne();
    res.json({ message: `Successfully deleted ${category.name} category` });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete this category' });
  }
};
