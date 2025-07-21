import { Router } from 'express';
import {
  getAllProcesses,
  createProcess,
  updateProcess,
  deleteProcess
} from '../controllers/processesController';

const router = Router();
router.get('/', getAllProcesses);
router.post('/', createProcess);
router.put('/:id', updateProcess);
router.delete('/:id', deleteProcess);
export default router;
