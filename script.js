
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadFromLocalStorage();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveToLocalStorage();
        this.updateUI();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToLocalStorage();
        this.updateUI();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToLocalStorage();
            this.updateUI();
        }
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    saveToLocalStorage() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    }

    updateUI() {
        // Обновляем счетчик корзины
        document.querySelector('.cart-count').textContent = this.getTotalItems();
        
        // Обновляем модальное окно корзины, если оно открыто
        if (document.getElementById('cartModal').style.display === 'block') {
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p>Корзина пуста</p>';
            cartTotalElement.textContent = '0';
            return;
        }

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price} руб. × ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="cart.removeItem(${item.id})">Удалить</button>
                </div>
            </div>
        `).join('');

        cartTotalElement.textContent = this.getTotalPrice();
    }
}

// Инициализация корзины
const cart = new ShoppingCart();

// Функции для работы с DOM
function renderProducts(productsToRender = products) {
    const productsGrid = document.getElementById('productsGrid');
    
    productsGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="product-image" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${product.price} руб.</div>
            <button class="add-to-cart" onclick="cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                Добавить в корзину
            </button>
        </div>
    `).join('');
}

function filterProducts(category) {
    if (category === 'all') {
        renderProducts();
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        renderProducts(filteredProducts);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Рендерим товары
    renderProducts();

    // Обновляем UI корзины
    cart.updateUI();

    // Обработчики для фильтров
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Фильтруем товары
            filterProducts(this.dataset.category);
        });
    });

    // Обработчики для корзины
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeBtn = document.querySelector('.close');
    const checkoutBtn = document.getElementById('checkoutBtn');

    cartIcon.addEventListener('click', function() {
        cart.renderCartItems();
        cartModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    checkoutBtn.addEventListener('click', function() {
        if (cart.getTotalItems() === 0) {
            alert('Корзина пуста!');
            return;
        }
        
        alert(`Заказ оформлен! Сумма: ${cart.getTotalPrice()} руб.\nСпасибо за покупку!`);
        cart.items = [];
        cart.saveToLocalStorage();
        cart.updateUI();
        cartModal.style.display = 'none';
    });

    // Плавная прокрутка для навигации
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});