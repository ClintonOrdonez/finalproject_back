let router = require("express").Router();
let User = require("../models/User");

// Get a list of users
router.get("/", (req, res) => {
  User.find()
    .then(result => res.send(result))
    .catch(error => res.status(500).send(error));
});

router.post("/signup", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let newUser = new User();
  newUser.email = email;
  newUser.password = newUser.generateHash(password);
  newUser
    .save()
    .then(result => res.send(result))
    .catch();
});

router.post("/signin", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email: email })
    .then(result => {
      if (result && result.validPassword(password)) {
        let { password, ...noPassword } = result._doc;
        res.send(noPassword);
      } else {
        console.log(result);
        res.send("Email and/or password incorrect.");
      }
    })
    .catch(error => res.send(error.message));
});

module.exports = router;
