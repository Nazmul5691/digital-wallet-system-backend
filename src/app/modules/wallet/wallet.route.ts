import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { WalletControllers } from './wallet.controller';

const router = express.Router();



// // Users-only routes     -->(admin, super-admin is also as a user)
router.post('/deposit', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), WalletControllers.deposit);
router.post('/withdraw', checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.withdraw);
router.post('/send-money', checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.sendMoney);



// // Agent-only routes
router.post('/cash-in', checkAuth(Role.AGENT), WalletControllers.cashIn); 
router.post('/cash-out', checkAuth(Role.AGENT), WalletControllers.cashOut);



// Admin-only routes
router.get('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.getAllWallets
);
// router.patch(
//     '/:walletId/status',
//     checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
//     WalletControllers.updateWalletStatus
// );


router.patch(
    '/block/:id',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    WalletControllers.blockWallet
);

// ওয়ালেট আনব্লক করার জন্য অতিরিক্ত রাউট (ব্লক করলে আনব্লকও করতে হবে)
router.patch(
    '/unblock/:id',
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    WalletControllers.unblockWallet
);


// // Admin-only routes
// router.patch('/block/:userId', auth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.blockWallet);
// router.patch('/unblock/:userId', auth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.unblockWallet);

export const WalletRoutes = router;
