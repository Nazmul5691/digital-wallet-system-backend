import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandlers";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
// import expressSession from 'express-session';



const app = express();


// app.use(expressSession({
//     secret: envVars.EXPRESS_SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }))
// app.use(passport.initialize())
// app.use(passport.session())
app.use(cookieParser())
app.use(express.json());
app.use(cors())


app.use("/api", router)

app.get("/", (req: Request, res: Response) =>{
    res.status(200).json({
        message: "Welcome to Digital Wallet System Backend"
    })
})



app.use(globalErrorHandler);

app.use(notFound);


export default app;
