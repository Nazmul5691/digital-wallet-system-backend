import { Router } from "express";


export const router = Router();

const modulesRoutes = [
    {
        path: "/user",
        route: "hello world"
    }
]



modulesRoutes.forEach((route) =>{
    router.use(route.path, route.route)
})