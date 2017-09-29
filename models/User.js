var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 10
  },
  password: {
  	type: String,
  	required: true,
    minlength: 6,
    maxlength: 15
  },
  picUrl: {
    type: String,
    required: true
  },
  email: {
  	type: String,
  	required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  story: {
  	type: Schema.Types.ObjectId,
  	ref: "Story"
  }
});

var User = mongoose.model("User", UserSchema);
module.exports = User;