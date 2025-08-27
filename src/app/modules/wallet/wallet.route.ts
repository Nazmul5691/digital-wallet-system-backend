import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { WalletControllers } from './wallet.controller';

const router = express.Router();



// // Users-only routes     -->(admin, super-admin is also as a user)
router.post('/deposit', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), WalletControllers.deposit);
router.post('/withdraw', checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.withdraw);
router.post('/send-money', checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.sendMoney);
router.patch('/deactivate', checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.deactivateMyWallet);
router.get(
  '/my-wallet',
  checkAuth(Role.USER, Role.AGENT, Role.ADMIN, Role.SUPER_ADMIN),
  WalletControllers.getMyWallet
);



// // Agent-only routes
router.post('/cash-in', checkAuth(Role.AGENT), WalletControllers.cashIn);
router.post('/cash-out', checkAuth(Role.AGENT), WalletControllers.cashOut);



// Admin-only routes
router.get('/', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.getAllWallets);
router.patch('/block/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.blockWallet);
router.patch('/unblock/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), WalletControllers.unblockWallet);





export const WalletRoutes = router;
