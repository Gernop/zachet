import express from 'express';
import cors from 'cors';
import { initDatabase, getDb, saveDb } from './database.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// ==================== AUTH ====================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = getDb();
    
    const result = db.exec(`SELECT * FROM users WHERE username = '${username}' AND status = 'Активен'`);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const user = result[0].values[0];
    const columns = result[0].columns;
    const userObj = {};
    columns.forEach((col, i) => userObj[col] = user[i]);

    const passwordMatch = bcrypt.compareSync(password, userObj.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    }

    // Обновляем lastLogin
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.run(`UPDATE users SET lastLogin = '${now}' WHERE id = ${userObj.id}`);
    saveDb();

    const { password: _, ...userWithoutPassword } = userObj;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ==================== USERS ====================
app.get('/api/users', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT id, username, name, email, role, lastLogin, status FROM users');
    
    if (result.length === 0) {
      return res.json([]);
    }

    const columns = result[0].columns;
    const users = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const { username, password, name, email, role, status } = req.body;
    
    if (!password || password.length < 3) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 3 символа' });
    }
    
    const db = getDb();
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run(`INSERT INTO users (username, password, name, email, role, status) VALUES
      ('${username}', '${hashedPassword}', '${name}', '${email || ''}', '${role}', '${status || 'Активен'}')`);
    saveDb();

    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];

    res.json({ id, username, name, email, role, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, email, role, status } = req.body;
    const db = getDb();

    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.run(`UPDATE users SET username='${username}', password='${hashedPassword}', name='${name}', email='${email}', role='${role}', status='${status}' WHERE id=${id}`);
    } else {
      db.run(`UPDATE users SET username='${username}', name='${name}', email='${email}', role='${role}', status='${status}' WHERE id=${id}`);
    }
    saveDb();

    res.json({ id: parseInt(id), username, name, email, role, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.run(`DELETE FROM users WHERE id = ${id}`);
    saveDb();
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BOOKINGS ====================
app.get('/api/bookings', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM bookings');
    
    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const bookings = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const { passengerName, route, date, time, seats, phone, status, totalPrice } = req.body;
    const db = getDb();
    
    db.run(`INSERT INTO bookings (passengerName, route, date, time, seats, phone, status, totalPrice) VALUES
      ('${passengerName}', '${route}', '${date || ''}', '${time || ''}', ${seats || 1}, '${phone || ''}', '${status || 'Ожидание'}', ${totalPrice || 0})`);
    saveDb();

    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];

    res.json({ id, passengerName, route, date, time, seats, phone, status, totalPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bookings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { passengerName, route, date, time, seats, phone, status, totalPrice } = req.body;
    const db = getDb();

    db.run(`UPDATE bookings SET 
      passengerName='${passengerName}', 
      route='${route}', 
      date='${date}', 
      time='${time}', 
      seats=${seats}, 
      phone='${phone}', 
      status='${status}', 
      totalPrice=${totalPrice} 
      WHERE id=${id}`);
    saveDb();

    res.json({ id: parseInt(id), passengerName, route, date, time, seats, phone, status, totalPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.run(`DELETE FROM bookings WHERE id = ${id}`);
    saveDb();
    res.json({ message: 'Бронирование удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TARIFFS ====================
app.get('/api/tariffs', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM tariffs');
    
    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const tariffs = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });

    res.json(tariffs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tariffs', (req, res) => {
  try {
    const { name, pricePerKm, minPrice, description, validFrom, validTo, status } = req.body;
    const db = getDb();
    
    db.run(`INSERT INTO tariffs (name, pricePerKm, minPrice, description, validFrom, validTo, status) VALUES
      ('${name}', ${pricePerKm}, ${minPrice}, '${description || ''}', '${validFrom || ''}', '${validTo || ''}', '${status || 'Активен'}')`);
    saveDb();

    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];

    res.json({ id, name, pricePerKm, minPrice, description, validFrom, validTo, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tariffs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, pricePerKm, minPrice, description, validFrom, validTo, status } = req.body;
    const db = getDb();

    db.run(`UPDATE tariffs SET 
      name='${name}', 
      pricePerKm=${pricePerKm}, 
      minPrice=${minPrice}, 
      description='${description}', 
      validFrom='${validFrom}', 
      validTo='${validTo}', 
      status='${status}' 
      WHERE id=${id}`);
    saveDb();

    res.json({ id: parseInt(id), name, pricePerKm, minPrice, description, validFrom, validTo, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tariffs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.run(`DELETE FROM tariffs WHERE id = ${id}`);
    saveDb();
    res.json({ message: 'Тариф удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BUSES ====================
app.get('/api/buses', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM buses');
    
    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const buses = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });

    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/buses', (req, res) => {
  try {
    const { model, plateNumber, capacity, year, status } = req.body;
    const db = getDb();
    
    db.run(`INSERT INTO buses (model, plateNumber, capacity, year, status) VALUES
      ('${model}', '${plateNumber}', ${capacity}, ${year}, '${status || 'В гараже'}')`);
    saveDb();

    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];

    res.json({ id, model, plateNumber, capacity, year, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/buses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { model, plateNumber, capacity, year, status } = req.body;
    const db = getDb();

    db.run(`UPDATE buses SET 
      model='${model}', 
      plateNumber='${plateNumber}', 
      capacity=${capacity}, 
      year=${year}, 
      status='${status}' 
      WHERE id=${id}`);
    saveDb();

    res.json({ id: parseInt(id), model, plateNumber, capacity, year, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/buses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.run(`DELETE FROM buses WHERE id = ${id}`);
    saveDb();
    res.json({ message: 'Автобус удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTES ====================
app.get('/api/routes', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM routes');
    
    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const routes = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });

    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/routes', (req, res) => {
  try {
    const { number, name, length, stops, travelTime, type } = req.body;
    const db = getDb();
    
    db.run(`INSERT INTO routes (number, name, length, stops, travelTime, type) VALUES
      ('${number}', '${name}', ${length}, ${stops}, ${travelTime}, '${type || 'Городской'}')`);
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    
    saveDb();

    res.json({ id, number, name, length, stops, travelTime, type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/routes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { number, name, length, stops, travelTime, type } = req.body;
    const db = getDb();

    db.run(`UPDATE routes SET 
      number='${number}', 
      name='${name}', 
      length=${length}, 
      stops=${stops}, 
      travelTime=${travelTime}, 
      type='${type}' 
      WHERE id=${id}`);
    saveDb();

    res.json({ id: parseInt(id), number, name, length, stops, travelTime, type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/routes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.run(`DELETE FROM routes WHERE id = ${id}`);
    saveDb();
    res.json({ message: 'Маршрут удалён' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== START SERVER ====================
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
      console.log(`📊 API доступно на http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

start();
