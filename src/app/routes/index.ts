import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRouters } from "../modules/auth/auth.route";
import { WalletRoutes } from "../modules/wallet/wallet.route";


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
        path: "/wallet",
        route: WalletRoutes
    }
]



modulesRoutes.forEach((route) => {
    router.use(route.path, route.route)
})