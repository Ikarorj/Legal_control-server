import { Router } from 'express';

import clientsRoutes from './clientsRoutes';
import usersRoutes from './usersRoutes';


const router = Router();

router.use('/clients', clientsRoutes);
router.use('/user', usersRoutes); // ✅ isso é o que garante /sistema/user


export default router;


