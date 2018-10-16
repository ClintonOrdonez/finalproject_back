let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");

let UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    signUpDate: { type: Date, default: Date.now() }
  },
  { collection: "finalProjectUsers" }
);

UserSchema.methods.generateHash = password =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
