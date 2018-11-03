let router = require("express").Router();

// router.use("/secrets", require("./secretRoute"));
router.use("/user", require("./userRoute"));

module.exports = router;
