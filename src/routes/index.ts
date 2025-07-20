import { Router } from 'express';

import clientsRoutes from './clientsRoutes';
import usersRoutes from './usersRoutes';
import processesRoutes from './processesRoutes';
import processUpdatesRoutes from './processUpdateRoutes';
import tiposCrimeRoutes from './tipoCrimeRoutes';
import comarcasVarasRoutes from './comarcaVaraRoutes';
import situacoesPrisionaisRoutes from './situacaoPrisionalRoutes';

const router = Router();

router.use('/clients', clientsRoutes);
router.use('/user', usersRoutes); // ✅ isso é o que garante /sistema/user
router.use('/processes', processesRoutes);
router.use('/processUpdate', processUpdatesRoutes);
router.use('/tiposCrime', tiposCrimeRoutes);
router.use('/comarcasVaras', comarcasVarasRoutes);
router.use('/situacoesPrisionais', situacoesPrisionaisRoutes);

export default router;


