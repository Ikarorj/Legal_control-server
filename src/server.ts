import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import sistemaRoutes from './routes/sistema';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://192.168.42.61:8080', // ajuste conforme IP do frontend
  credentials: true
}));
app.use(express.json());

// Usa a rota base única '/sistema' para todas as rotas
app.use('/sistema', sistemaRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
