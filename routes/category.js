const express = require('express');
const router = express.Router();

const { isSignedIn, isAuthenticated, isAdmin } = require('../controllers/auth');
const { getUserById } = require('../controllers/user');
const {
  getCategoryById,
  createCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  removeCategory,
} = require('../controllers/category');

//params
router.param('userId', getUserById);
router.param('categoryId', getCategoryById);

//actual routers

//create
router.post(
  '/category/create/:userId',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCategory
);

//read
router.get('/category/:categoryId', getCategory);
router.get('/category/all', getAllCategory);

//update
router.put(
  '/category/:categoryId/:userId',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);

//delete
router.delete(
  '/category/:categoryId/:userId',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  removeCategory
);

module.exports = router;
