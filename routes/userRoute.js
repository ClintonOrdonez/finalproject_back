const router = require("express").Router();
const User = require("../models/User");

// Get a list of users
// router.get("/", (req, res) => {
//   User.find()
//     .then(result => res.send(result))
//     .catch(error => res.status(500).send(error));
// });

router.post("/signup", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let newUser = new User();
  newUser.email = email;
  newUser.password = newUser.encryptPassword(password);
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
      if (result && result.validPassword(password) === true) {
        let { password, ...noPassword } = result._doc;
        res.send(noPassword);
      } else {
        res.send("Invalid email and/or password.");
      }
    })
    .catch(error => res.send(error.message));
});

// Check whether an email is in database and return count:
// 0 email is not present; 1 email is present
router.post("/checkEmail", (req, res) => {
  let email = req.body.email;

  User.find({ email: email })
    .then(result => res.status(200).send({ count: result.length }))
    .catch(error => res.send(error.message));
});

// Check whether an email has a matching password and returns boolean:
// true password is correct, false password is incorrect
router.post("/checkPassword", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email: email })
    .then(result => res.status(200).send(result.validPassword(password)))
    .catch(error => res.send(error.message));
});

// Searches database by email property using currentEmail
// Updates email property with newEmail
router.put("/updateEmail", (req, res) => {
  let currentEmail = req.body.currentEmail;
  let newEmail = req.body.newEmail;

  User.findOneAndUpdate(
    { email: currentEmail },
    { email: newEmail },
    { new: true }
  )
    .then(result => {
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

// Searches database by email property
// Updates password property with encrypted tempUser.password
router.put("/updatePassword", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let tempUser = new User();
  tempUser.password = tempUser.encryptPassword(password);

  User.findOneAndUpdate(
    { email: email },
    { password: tempUser.password, resetPasswordExpiration: null },
    { new: true }
  )
    .then(result => {
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

// Searches database by email property
// Deletes found record from database
router.delete("/deleteAccount", (req, res) => {
  let email = req.body.email;

  User.findOneAndDelete({ email: email })
    .then(result => {
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

// Searches database by email property
// Updates resetPasswordExpiration property with current time plus expirationMinutes
router.put("/resetPassword", (req, res) => {
  let email = req.body.email;
  let date = new Date();
  const expirationMinutes = 15;
  let resetPasswordToken;
  let resetPasswordExpiration = date.setMinutes(
    date.getMinutes() + expirationMinutes
  );

  User.findOneAndUpdate(
    { email: email },
    { resetPasswordExpiration: resetPasswordExpiration },
    { new: true }
  )
    .then(result => {
      resetPasswordToken = result.password;
      result.resetPasswordEmail(email, resetPasswordToken);
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

router.post("/checkResetPasswordToken", (req, res) => {
  let resetPasswordToken = req.body.resetPasswordToken;

  User.findOne({ password: resetPasswordToken })
    .then(result => res.send(result))
    .catch(error => res.status(500).send(error));
});

router.put("/updateTheme", (req, res) => {
  let email = req.body.email;
  let theme = req.body.theme;

  User.findOneAndUpdate({ email: email }, { theme: theme }, { new: true })
    .then(result => {
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

router.put("/updateTicTacToeStats", (req, res) => {
  let email = req.body.email;
  let games = req.body.games;
  let xWins = req.body.xWins;
  let oWins = req.body.oWins;
  let draws = req.body.draws;

  User.findOneAndUpdate(
    { email: email },
    {
      ticTacToeStats: { games: games, xWins: xWins, oWins: oWins, draws: draws }
    },
    { new: true }
  )
    .then(result => {
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

module.exports = router;
