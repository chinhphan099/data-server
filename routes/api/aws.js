const route = require('express').Router();

const {
  getsimages
} = require('../../controllers/api').aws

// GET -> /api/aws/getsimages
// Get all user information
route.get('/getsimages', getsimages)

module.exports = route
