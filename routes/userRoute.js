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

router.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email: email })
    .then(result => {
      if (result && result.validPassword(password)) {
        let { password, ...noPassword } = result._doc;
        res.send(noPassword);
      } else {
        console.log(result);
        res.send("Invalid email and/or password.");
      }
    })
    .catch(error => res.send(error.message));
});

// Check whether an email is in database and return count:
// 0 email is not present; 1 email is present
router.post("/checkEmail", (req, res) => {
  let email = req.body.email;

  User.find({ email: email }).then(result =>
    res
      .status(200)
      .send({ count: result.length })
      .catch(error => res.send(error.message))
  );
});

// Check whether an email has a matching password and returns boolean:
// true password is correct, false password is incorrect
router.post("/checkPassword", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email: email }).then(result =>
    res
      .status(200)
      .send(result.validPassword(password))
      .catch(error => res.send(error.message))
  );
});

router.put("/updateEmail", (req, res) => {
  let oldEmail = req.body.oldEmail;
  let newEmail = req.body.newEmail;

  User.findOneAndUpdate({ email: oldEmail }, { email: newEmail }, { new: true })
    .then(result => res.send(result))
    .catch(error => res.status(400).send(error));
});

router.put("/updatePassword", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let tempUser = new User();
  tempUser.password = tempUser.generateHash(password);

  User.findOneAndUpdate(
    { email: email },
    { password: tempUser.password },
    { new: true }
  )
    .then(result => res.send(result))
    .catch(error => res.status(400).send(error));
});

// router.post("/change", (req, res) => {
//   let password = req.body.password;
//   let password = req.body.password;

//   let newPassword = new Password();
//   newPassword.password = password;
//   newPassword.password = newPassword.generateHash(password);
//   newUser
//     .save()
//     .then(result => res.send(result))
//     .catch();
// });

module.exports = router;
