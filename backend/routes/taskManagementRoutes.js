// const express = require("express");
// const {
//   getTasks,
//   createTask,
//   toggleTaskStatus,
//   deleteTask,
// } = require("../controllers/taskManagement.controller");

// const router = express.Router();

// router.get("/", getTasks);
// router.post("/", createTask);
// router.put("/:id/toggle", toggleTaskStatus);
// router.delete("/:id", deleteTask);

// module.exports = router;





const express = require("express");

const {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
} = require("../controllers/taskManagement.Controller");

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
