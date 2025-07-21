import { Router } from 'express';
import {
  getAllTiposCrime,
  createTipoCrime,
  updateTipoCrime,
  deleteTipoCrime
} from '../controllers/tipoCrimeController';

const router = Router();
router.get('/', getAllTiposCrime);
router.post('/', createTipoCrime);
router.put('/:id', updateTipoCrime);
router.delete('/:id', deleteTipoCrime);
export default router;
