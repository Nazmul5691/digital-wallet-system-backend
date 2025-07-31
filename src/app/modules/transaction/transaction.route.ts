import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionControllers } from "./transaction.controller";


const router = Router();


router.get('/my-history', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), TransactionControllers.viewTransaction);

router.get('/all', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TransactionControllers.getAllTransactions);




export const TransactionRoutes = router;
