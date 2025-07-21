import { Router } from 'express';

import clientsRoutes from './clientsRoutes';
import comarcaVaraRoutes from './comarcaVaraRoutes';
import processesRoutes from './processesRoutes';
import processUpdateRoutes from './processUpdateRoutes';
import situacaoPrisionalRoutes from './situacaoPrisionalRoutes';
import tipoCrimeRoutes from './tipoCrimeRoutes';
import usersRoutes from './usersRoutes';

const router = Router();

router.use('/clients', clientsRoutes);
router.use('/comarcasVaras', comarcaVaraRoutes);
router.use('/processes', processesRoutes);
router.use('/processUpdate', processUpdateRoutes);
router.use('/situacoesPrisionais', situacaoPrisionalRoutes);
router.use('/tiposCrime', tipoCrimeRoutes);
router.use('/user', usersRoutes); // aqui é onde o login deve funcionar


export default router;


