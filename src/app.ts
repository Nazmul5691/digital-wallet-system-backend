import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandlers";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";


const app = express();


app.use(cookieParser())
app.use(express.json());
app.set("trust proxy", 1);
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use("/api", router)


app.get("/", (req: Request, res: Response) =>{
    res.status(200).json({
        message: "Welcome to Digital Wallet System Backend"
    })
})



app.use(globalErrorHandler);

app.use(notFound);


export default app;
