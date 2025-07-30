import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";
import { WalletRoutes } from "../modules/wallet/wallet.route";
import { TransactionRoutes } from "../modules/transaction/transaction.route";


export const router = Router();

const modulesRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRouters
    },
    {
        path: "/wallets",
        route: WalletRoutes
    },
    {
        path: "/transactions",
        route: TransactionRoutes
    }
]



modulesRoutes.forEach((route) => {
    router.use(route.path, route.route)
})