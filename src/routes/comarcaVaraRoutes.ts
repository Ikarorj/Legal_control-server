import { Router } from 'express';
import {
  getAllComarcasVaras,
  createComarcaVara,
  updateComarcaVara,
  deleteComarcaVara
} from '../controllers/comarcaVaraController';

const router = Router();
router.get('/', getAllComarcasVaras);
router.post('/', createComarcaVara);
router.put('/:id', updateComarcaVara);
router.delete('/:id', deleteComarcaVara);
export default router;
