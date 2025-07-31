import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";



const router = Router();



// api/user
router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser);

router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);

router.get('/agents', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllAgents);

router.get("/:id", checkAuth(...Object.values(Role)), UserControllers.getSingleUser);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.deleteUser)

router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser);


router.patch('/agents/approval-status/:userId',checkAuth(Role.ADMIN, Role.SUPER_ADMIN),UserControllers.updateAgentApprovalStatus);




export const UserRoutes = router;