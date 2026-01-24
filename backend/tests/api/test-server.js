import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Тестовый сервер работает!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API работает!' });
});

app.listen(PORT, () => {
  }); 