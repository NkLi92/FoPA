const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // обслуживаем файлы из текущей папки

// Папка для хранения данных
const dataDir = './data';
const ordersFile = path.join(dataDir, 'orders.json');

// Инициализация файла данных
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
}

// 📊 API для получения данных с сайта

// 1. Получить статистику по заказам
app.get('/api/stats', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        
        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
            popularProducts: getPopularProducts(orders),
            ordersByDate: getOrdersByDate(orders)
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка чтения статистики' });
    }
});

// 2. Получить все заказы
app.get('/api/orders', (req, res) => {
    try {
        const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка чтения заказов' });
    }
});

// 🛒 Endpoint для приема данных о заказах с фронтенда
app.post('/api/order', (req, res) => {
    try {
        const orderData = req.body;
        
        // Валидация данных
        if (!orderData.items || !orderData.total) {
            return res.status(400).json({ error: 'Неверные данные заказа' });
        }
        
        // Читаем существующие заказы
        const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        
        // Добавляем новый заказ
        const newOrder = {
            id: Date.now(),
            ...orderData,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        
        orders.push(newOrder);
        
        // Сохраняем в файл
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
        
        console.log('✅ Новый заказ получен:', {
            id: newOrder.id,
            total: newOrder.total,
            itemsCount: newOrder.items.length
        });
        
        res.json({ 
            success: true, 
            orderId: newOrder.id,
            message: 'Заказ успешно сохранен' 
        });
        
    } catch (error) {
        console.error('❌ Ошибка сохранения заказа:', error);
        res.status(500).json({ error: 'Ошибка сохранения заказа' });
    }
});

// Вспомогательные функции
function getPopularProducts(orders) {
    const productCount = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
        });
    });
    
    return Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
}

function getOrdersByDate(orders) {
    const byDate = {};
    
    orders.forEach(order => {
        const date = order.timestamp.split('T')[0];
        byDate[date] = (byDate[date] || 0) + 1;
    });
    
    return byDate;
}

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📊 API статистики: http://localhost:${PORT}/api/stats`);
    console.log(`📦 API заказов: http://localhost:${PORT}/api/orders`);
});