import { Router } from 'express';
import {
  getAllProcessUpdates,
  createProcessUpdate,
  updateProcessUpdate,
  deleteProcessUpdate
} from '../controllers/processesUpdateController';

const router = Router();
router.get('/', getAllProcessUpdates);
router.post('/', createProcessUpdate);
router.put('/:id', updateProcessUpdate);
router.delete('/:id', deleteProcessUpdate);
export default router;
