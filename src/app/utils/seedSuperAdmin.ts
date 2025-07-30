import { envVars } from "../config/env";
import { IAuthProvider, IsActive, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs"
import { Wallet } from "../modules/wallet/wallet.model";


export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExit = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });

        if (isSuperAdminExit) {
            console.log("Super Admin already exists");
            return;
        }

        console.log("trying to create superAdmin...");

        const hashPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND));

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL

        }

        const payload: IUser = {
            name: "Super Admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashPassword,
            isVerified: true,
            auths: [authProvider]
        }

        const superAdmin = await User.create(payload);

        const wallet = await Wallet.create({
            userId: superAdmin._id,
            balance: 50,
            status: IsActive.ACTIVE,
        });

        await User.findByIdAndUpdate(superAdmin._id, {
            walletId: wallet._id,
        });

        console.log("superAdmin successfully created");
        console.log(superAdmin);

    } catch (error) {
        console.log(error);
    }
}