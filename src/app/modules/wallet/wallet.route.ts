import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { WalletControllers } from './wallet.controller';

const router = express.Router();



// // User-only routes
router.post('/deposit', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), WalletControllers.deposit);
// router.post('/withdraw', auth(Role.USER), WalletController.withdraw);
// router.post('/send', auth(Role.USER), WalletController.sendMoney);

// // Agent-only routes
// router.post('/cash-in', auth(Role.AGENT), WalletController.cashIn);
// router.post('/cash-out', auth(Role.AGENT), WalletController.cashOut);

// // Admin-only routes
// router.patch('/block/:userId', auth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.blockWallet);
// router.patch('/unblock/:userId', auth(Role.ADMIN, Role.SUPER_ADMIN), WalletController.unblockWallet);

export const WalletRoutes = router;
