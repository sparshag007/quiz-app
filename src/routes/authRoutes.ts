import { Router } from 'express';
import { registerUser, loginUser, checkToken } from '../controllers/authController';
import { authenticateToken, authorizeRole } from '../middlewares/auth';

const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/checkToken', checkToken)

export default router;
