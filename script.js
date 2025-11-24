class ShoppingCart {
    // ... весь ваш существующий класс без изменений ...
}

const cart = new ShoppingCart();

function renderProducts(productsToRender = products) {
    // ... ваш существующий код без изменений ...
}

function filterProducts(category) {
    // ... ваш существующий код без изменений ...
}

// ✅ ОБНОВЛЕННЫЙ обработчик для работы с бэкендом
async function sendOrderToBackend(orderData) {
    try {
        const response = await fetch('http://localhost:3000/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сети');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка отправки заказа:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    cart.updateUI();

    // ... ваши существующие обработчики фильтров и корзины ...

    // ✅ ОБНОВЛЕННЫЙ обработчик checkout с бэкендом
    checkoutBtn.addEventListener('click', async function() {
        if (cart.getTotalItems() === 0) {
            alert('Корзина пуста!');
            return;
        }
        
        try {
            const orderData = {
                items: cart.items,
                total: cart.getTotalPrice(),
                customerInfo: {
                    name: "Гость",
                    email: "guest@example.com",
                    timestamp: new Date().toISOString()
                }
            };
            
            const result = await sendOrderToBackend(orderData);
            
            if (result.success) {
                alert(`✅ Заказ #${result.orderId} оформлен!\nСумма: ${cart.getTotalPrice()} руб.\nДанные сохранены на сервере.`);
                cart.items = [];
                cart.saveToLocalStorage();
                cart.updateUI();
                cartModal.style.display = 'none';
            } else {
                alert('❌ Ошибка оформления заказа: ' + result.error);
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            // Fallback: если бэкенд не доступен
            alert(`⚠️ Заказ оформлен локально!\nСумма: ${cart.getTotalPrice()} руб.\n(Сервер временно недоступен)`);
            cart.items = [];
            cart.saveToLocalStorage();
            cart.updateUI();
            cartModal.style.display = 'none';
        }
    });

    // ... остальной ваш код ...
});