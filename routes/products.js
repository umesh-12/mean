import express from "express";
import parseId from "../middleware/parseId.js";
import * as ctrl from "../controllers/productController.js";

const router = express.Router();

router.get("/", ctrl.getAll);
router.get("/:id", parseId, ctrl.getOne);
router.post("/", ctrl.create);
router.put("/:id", parseId, ctrl.update);
router.delete("/:id", parseId, ctrl.remove);

export default router;