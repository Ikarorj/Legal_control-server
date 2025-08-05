// server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sistemaRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
   origin: 'http://192.168.1.9:8080', // ajuste conforme IP do frontend
  credentials: true
}));
app.use(express.json());

// Aqui importa todas as rotas organizadas
app.use('/sistema', sistemaRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
