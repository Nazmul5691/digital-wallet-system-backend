import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";



const router = Router();



// api/user
router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser);

router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);

router.get("/:id", UserControllers.getSingleUser)

router.delete("/:id", UserControllers.deleteUser)




export const UserRoutes = router;