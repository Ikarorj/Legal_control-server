import { Router } from 'express';
import { getAllSituacoesPrisionais } from '../controllers/situacaoPrisionalController';

const router = Router();
router.get('/', getAllSituacoesPrisionais);
export default router;
