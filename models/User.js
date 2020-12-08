let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

let UserSchema = new mongoose.Schema(
  {
    signUpDate: { type: Date, default: Date.now() },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    theme: { type: Number, default: 1 },
    ticTacToeStats: {
      games: { type: Number, default: 0 },
      xWins: { type: Number, default: 0 },
      oWins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 }
    },
    resetPasswordExpiration: { type: Date, default: null }
  },
  { collection: "finalProjectUsers" }
);

UserSchema.methods.encryptPassword = password =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.resetPasswordEmail = function(email, resetPasswordToken) {
  // let resetPasswordLink = "http://localhost:3000/resetPassword/";
  let resetPasswordLink = "https://team-gestalt-app.herokuapp.com/resetPassword/";

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "teamgestalt.bot@gmail.com", // email
      pass: "raxqUz-dajmag-pensa4" // password
    }
  });

  // Setup email data with unicode symbols
  let mailOptions = {
    from: "teamgestalt.bot@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Reset Password Request", // Subject line
    text:
      "Please use the following link to reset your password: " +
      resetPasswordLink +
      resetPasswordToken +
      " This link will expire in 15 minutes. This is an automated email; please do not respond to this email address.", // plain text body
    html:
      "Please use the following link to reset your password:<br/>" +
      resetPasswordLink +
      resetPasswordToken +
      "<br/>This link will expire in 15 minutes.<br/>This is an automated email; please do not respond to this email address." // html body
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};

module.exports = mongoose.model("User", UserSchema);
