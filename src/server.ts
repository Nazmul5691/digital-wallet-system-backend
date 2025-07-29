
import mongoose from "mongoose"
import { Server } from 'http'
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";


let server: Server;


const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL)

        console.log('connected to DB');

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listing on port ${envVars.PORT}`);
        })

    } catch (error) {
        console.log(error);
    }
}



(async () => {
    await startServer();
    await seedSuperAdmin();
})()




process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection detected... Server shutting down...", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }

    process.exit(1)
})

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception detected... Server shutting down...", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }

    process.exit(1)
})

process.on("SIGTERM", () => {
    console.log("SIGTERM Signal received... Server shutting down...");

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }

    process.exit(1)
})
