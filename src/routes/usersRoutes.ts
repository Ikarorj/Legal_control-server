import { Router } from 'express';
import { getAllUsers, loginUser } from '../controllers/usersController';

const router = Router();

router.get('/', getAllUsers);
router.post('/login', loginUser); // ✅ /user/login

export default router;
