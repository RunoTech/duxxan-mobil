import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';

const router = Router();
const adminController = new AdminController();

// Dashboard and stats
router.get('/stats', adminController.getStats);
router.get('/analytics', adminController.getAnalytics);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.post('/users/action', adminController.userAction);

// Raffle management
router.get('/raffles', adminController.getRaffles);
router.get('/raffles/:raffleId/participants', adminController.getRaffleParticipants);
router.post('/raffles/action', adminController.raffleAction);
router.post('/raffles/select-winner', adminController.selectWinner);
router.post('/raffles/:raffleId/select-winner', adminController.manualSelectWinner);
router.post('/raffles/create', adminController.createManualRaffle);

// Donation management
router.get('/donations', adminController.getDonations);
router.post('/donations/action', adminController.donationAction);
router.post('/donations/create', adminController.createManualDonation);

// Wallet management
router.get('/wallets', adminController.getWallets);

// System management
router.get('/logs', adminController.getLogs);
router.post('/settings', adminController.updateSettings);

export default router;