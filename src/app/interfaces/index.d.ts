import { JwtPayload } from "jsonwebtoken";


//create custom type for express.js
declare global {
    namespace Express {
        interface Request {
            user: JwtPayload
        }
    }
}
