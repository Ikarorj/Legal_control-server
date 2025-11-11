// server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sistemaRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


const allowedOrigins = [
  'http://192.168.1.6:8080',
  'https://legalcontrol-cris-front.onrender.com'
];


app.use(cors({
   origin: allowedOrigins, 
   // ajuste conforme IP do frontend
  credentials: true
}));
app.use(express.json());

// Aqui importa todas as rotas organizadas
app.use('/sistema', sistemaRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

console.log('servidor odando no ip:', process.env.IP || 'localhost');
console.log('servidor rodando na porta:', PORT);