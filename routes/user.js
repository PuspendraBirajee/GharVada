const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

//to save uploaded file in public/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // store inside public/uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/profile/pic", upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.profilePic = "/uploads/" + req.file.filename; // accessible because of express.static("public")
    await user.save();
    req.flash("success", "Your profile updated successfully!");
    res.redirect(req.get("referer")); // stay on same page
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong!");
  }
});

module.exports = router;
