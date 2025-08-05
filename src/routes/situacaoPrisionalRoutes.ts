import { Router } from 'express';
import { createSituacaoPrisional, 
         getAllSituacoesPrisionais, 
         updateSituacaoPrisional, 
         deleteSituacaoPrisional } 
         from '../controllers/situacaoPrisionalController';

const router = Router();
router.get('/', getAllSituacoesPrisionais);
router.post('/', createSituacaoPrisional);
router.put('/:id', updateSituacaoPrisional);
router.delete('/:id', deleteSituacaoPrisional);

export default router;
