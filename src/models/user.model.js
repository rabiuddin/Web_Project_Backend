import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        {
          validator: function (v) {
            return /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
        {
          validator: function (v) {
            const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
            const domain = v.split("@")[1];
            return allowedDomains.includes(domain);
          },
          message: (props) =>
            `Email domain must be gmail.com, yahoo.com, or outlook.com`,
        },
      ],
    },
    password: {
      type: String,
      required: true,
      min: [8, "Password must be at least 8 characters"],
      max: [15, "Password must be at most 15 characters"],
    },
    profileImage: {
      type: String,
      required: false,
      default: "https://www.w3schools.com/howto/img_avatar.png",
    },
  },
  { timestamps: true }
);

//Method to hash password before saving
userSchema.pre("save", async function (next) {
  //Encrypt the password before saving info in the DB
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Method to check if the password is correct
userSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Method to generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      //adding creds for the tokeno
      id: this._id,
      username: this.username,
      password: this.password,
      email: this.email,
    },
    //adding secret key for the token
    process.env.ACCESS_TOKEN_SECRET,
    {
      //adding expiration time for the token
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Exclude username always when converted to json
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
