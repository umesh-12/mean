import express from "express";
import parseId from "../middleware/parseId.js";
import { protect, adminOnly } from "../middleware/auth.js";
import * as ctrl from "../controllers/productController.js";

const router = express.Router();

router.get("/", ctrl.getAll);                                  // sabai le herna milxa
router.get("/:id", parseId, ctrl.getOne);                      // sabai le herna milxa
router.post("/", protect, ctrl.create);                        // login chaincha
router.put("/:id", protect, parseId, ctrl.update);             // login chaincha
router.delete("/:id", protect, adminOnly, parseId, ctrl.remove); // admin matra

export default router;