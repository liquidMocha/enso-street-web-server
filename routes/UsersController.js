const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/createUser', (req, res, next) => {

  res.status(201);
  res.send();
});

module.exports = router;
