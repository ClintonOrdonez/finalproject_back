const router = require("express").Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

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
      // console.log(result);
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

// Searches database by email property
// Updates password property with encrypted tempUser.password
router.put("/updatePassword", (req, res) => {
  // console.log(req.body);
  let email = req.body.email;
  let password = req.body.password;

  let tempUser = new User();
  tempUser.password = tempUser.encryptPassword(password);

  User.findOneAndUpdate(
    { email: email },
    { password: tempUser.password },
    { new: true }
  )
    .then(result => {
      // console.log(result);
      res.send(result);
    })
    .catch(error => res.status(400).send(error));
});

// Searches database by email property
// Deletes found record from database
router.delete("/deleteAccount", (req, res) => {
  let email = req.body.email;
  // console.log("email: " + email);

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
  let resetPasswordLink = "http://localhost:3000/resetPassword/";
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
      resetPasswordEmail(email, resetPasswordLink, resetPasswordToken);
      res.send(result);
    })
    .catch(error => res.status(400).send(error));

  console.log(resetPasswordToken);
});

function resetPasswordEmail(email, resetPasswordLink, resetPasswordToken) {
  // Create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "teamgestalt.bot@gmail.com", // email
      pass: "raxqUz-dajmag-pensa4" // password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: "team-gestalt@no-reply.com", // sender address
    to: email, // list of receivers
    subject: "Reset Password Request", // Subject line
    text:
      "Please use the following link to reset your password: " +
      resetPasswordLink +
      resetPasswordToken +
      " This is an automated email; please do not respond to this email address.", // plain text body
    html:
      "Please use the following link to reset your password:<br/>" +
      resetPasswordLink +
      resetPasswordToken +
      "<br/>This is an automated email; please do not respond to this email address." // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });
}

module.exports = router;
