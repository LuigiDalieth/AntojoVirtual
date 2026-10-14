/**
 * Antojo Virtual — Frontend Interactive Script
 * Manejo de Carrito, Modal de Personalización, Cálculo en Pesos Colombianos (COP) y Checkout AJAX
 */

const STORAGE_KEY = 'antojo_virtual_cart_v2';

let cart = [];
let currentProduct = null;
let currentQuantity = 1;
let selectedToppings = [];

// Formateador de moneda colombiana
function formatCOP(val) {
    return '$' + parseInt(val || 0).toLocaleString('es-CO') + ' COP';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    setupCartDrawer();
    setupModals();
    setupProductCustomization();
    setupCheckout();
});

// Guardar y recuperar del almacenamiento local
function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            cart = JSON.parse(saved);
        }
    } catch (e) {
        cart = [];
    }
    renderCart();
}

function saveCartToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    renderCart();
}

// Carrito lateral Drawer
function setupCartDrawer() {
    const openBtn = document.getElementById('openCartBtn');
    const closeBtn = document.getElementById('closeCartBtn');
    const backdrop = document.getElementById('cartBackdrop');
    const drawer = document.getElementById('cartDrawer');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            drawer.classList.add('active');
            backdrop.classList.add('active');
        });
    }

    const closeCart = () => {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (backdrop) backdrop.addEventListener('click', closeCart);
}

// Renderizado del Carrito
function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('cartBadgeCount');
    const subtotalEl = document.getElementById('cartSubtotalText');
    const totalEl = document.getElementById('cartTotalText');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!container) return;

    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    if (badge) badge.textContent = totalCount;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty-state">
                <i class="fa-solid fa-burger"></i>
                <p>Tu carrito está vacío</p>
                <span>¡Descubre las delicias locales de Neiva y agrégalas!</span>
            </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '$0 COP';
        if (totalEl) totalEl.textContent = '$0 COP';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    let subtotal = 0;
    container.innerHTML = '';

    cart.forEach((item, index) => {
        subtotal += item.line_total;

        const row = document.createElement('div');
        row.className = 'cart-item-row';

        const toppingsText = item.toppings && item.toppings.length > 0 
            ? item.toppings.map(t => `+ ${t.name}`).join(', ') 
            : '';

        row.innerHTML = `
            <div>
                <div class="cart-item-title">${escapeHTML(item.product_name)}</div>
                ${toppingsText ? `<div class="cart-item-toppings">${escapeHTML(toppingsText)}</div>` : ''}
                <div class="cart-item-controls">
                    <button class="btn-qty-mini btn-qty-dec" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty-mini btn-qty-inc" data-index="${index}">+</button>
                    <small style="color: #64748b; margin-left: 0.5rem">${formatCOP(item.unit_price)} c/u</small>
                </div>
            </div>
            <div style="text-align: right">
                <strong>${formatCOP(item.line_total)}</strong>
                <div><button class="btn-remove-item" data-index="${index}" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; margin-top: 0.5rem">Eliminar</button></div>
            </div>
        `;

        container.appendChild(row);
    });

    const deliveryFee = 5500;
    const serviceFee = 1500;
    const total = subtotal + deliveryFee + serviceFee;

    if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
    if (totalEl) totalEl.textContent = formatCOP(total);
    const headerCartTotal = document.getElementById('headerCartTotal');
    if (headerCartTotal) {
        headerCartTotal.textContent = cart.length === 0 ? '$0' : '$' + parseInt(total).toLocaleString('es-CO');
    }
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Listeners para botones de cantidad y eliminar
    container.querySelectorAll('.btn-qty-inc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            cart[idx].quantity += 1;
            cart[idx].line_total = cart[idx].quantity * cart[idx].unit_price;
            saveCartToStorage();
        });
    });

    container.querySelectorAll('.btn-qty-dec').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            if (cart[idx].quantity > 1) {
                cart[idx].quantity -= 1;
                cart[idx].line_total = cart[idx].quantity * cart[idx].unit_price;
            } else {
                cart.splice(idx, 1);
            }
            saveCartToStorage();
        });
    });

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            cart.splice(idx, 1);
            saveCartToStorage();
        });
    });
}

// Modal de personalización y toppings
function setupProductCustomization() {
    const toppingModal = document.getElementById('toppingModal');
    const closeBtn = document.getElementById('closeToppingModal');
    const addToCartBtn = document.getElementById('confirmAddToCartBtn');
    const qtyMinus = document.getElementById('qtyMinusBtn');
    const qtyPlus = document.getElementById('qtyPlusBtn');
    const qtyDisplay = document.getElementById('itemQuantity');

    // Botones de cada tarjeta de producto
    document.querySelectorAll('.btn-customize-item').forEach(btn => {
        btn.addEventListener('click', async () => {
            const prodId = btn.dataset.id;
            const prodName = btn.dataset.name;
            const prodPrice = parseInt(btn.dataset.price);
            const prodImg = btn.dataset.image;
            const prodDesc = btn.dataset.desc;

            currentProduct = {
                id: prodId,
                name: prodName,
                price: prodPrice,
                image: prodImg,
                desc: prodDesc
            };

            currentQuantity = 1;
            selectedToppings = [];
            if (qtyDisplay) qtyDisplay.textContent = '1';

            // Cargar datos en el modal
            document.getElementById('modalProductName').textContent = prodName;
            document.getElementById('modalProductDesc').textContent = prodDesc;
            document.getElementById('modalProductImg').src = prodImg;
            document.getElementById('modalProductBasePrice').textContent = formatCOP(prodPrice);
            document.getElementById('modalProductNotes').value = '';

            // Cargar toppings disponibles vía AJAX
            try {
                const res = await fetch(`index.php?action=product_modal&id=${prodId}`);
                const data = await res.json();
                renderToppingsList(data.toppings || []);
            } catch (e) {
                renderToppingsList([]);
            }

            updateModalPrice();
            toppingModal.classList.add('active');
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toppingModal.classList.remove('active');
        });
    }

    if (qtyMinus) {
        qtyMinus.addEventListener('click', () => {
            if (currentQuantity > 1) {
                currentQuantity--;
                qtyDisplay.textContent = currentQuantity;
                updateModalPrice();
            }
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener('click', () => {
            currentQuantity++;
            qtyDisplay.textContent = currentQuantity;
            updateModalPrice();
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (!currentProduct) return;

            const toppingsPrice = selectedToppings.reduce((acc, t) => acc + t.price, 0);
            const unitPrice = currentProduct.price + toppingsPrice;
            const notes = document.getElementById('modalProductNotes').value.trim();

            cart.push({
                product_id: currentProduct.id,
                product_name: currentProduct.name,
                unit_price: unitPrice,
                quantity: currentQuantity,
                line_total: unitPrice * currentQuantity,
                toppings: [...selectedToppings],
                notes: notes
            });

            saveCartToStorage();
            toppingModal.classList.remove('active');

            // Abrir Drawer de Carrito para confirmar visualmente
            const drawer = document.getElementById('cartDrawer');
            const backdrop = document.getElementById('cartBackdrop');
            if (drawer) drawer.classList.add('active');
            if (backdrop) backdrop.classList.add('active');
        });
    }
}

function renderToppingsList(toppings) {
    const list = document.getElementById('modalToppingsList');
    if (!list) return;

    if (!toppings || toppings.length === 0) {
        list.innerHTML = `<p style="font-size: 0.85rem; color: #64748b;">No hay adicionales disponibles por el momento.</p>`;
        return;
    }

    list.innerHTML = toppings.map(t => `
        <label class="topping-checkbox-row">
            <div style="display: flex; align-items: center; gap: 0.6rem">
                <input type="checkbox" class="topping-check" data-id="${t.id}" data-name="${escapeHTML(t.name)}" data-price="${t.price}">
                <span>${escapeHTML(t.name)}</span>
            </div>
            <strong style="color: #f97316">+${formatCOP(t.price)}</strong>
        </label>
    `).join('');

    list.querySelectorAll('.topping-check').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const topId = e.target.dataset.id;
            const topName = e.target.dataset.name;
            const topPrice = parseInt(e.target.dataset.price);

            if (e.target.checked) {
                selectedToppings.push({ id: topId, name: topName, price: topPrice });
            } else {
                selectedToppings = selectedToppings.filter(t => t.id !== topId);
            }
            updateModalPrice();
        });
    });
}

function updateModalPrice() {
    if (!currentProduct) return;
    const toppingsPrice = selectedToppings.reduce((acc, t) => acc + t.price, 0);
    const unitPrice = currentProduct.price + toppingsPrice;
    const total = unitPrice * currentQuantity;

    const priceLabel = document.getElementById('modalFinalPrice');
    if (priceLabel) priceLabel.textContent = formatCOP(total);
}

// Configuración general de Modales y Checkout
function setupModals() {
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckoutBtn = document.getElementById('closeCheckoutModal');
    const openCheckoutBtn = document.getElementById('checkoutBtn');

    if (openCheckoutBtn) {
        openCheckoutBtn.addEventListener('click', () => {
            // Cerrar drawer
            document.getElementById('cartDrawer').classList.remove('active');
            document.getElementById('cartBackdrop').classList.remove('active');

            // Calcular total en modal
            const subtotal = cart.reduce((acc, item) => acc + item.line_total, 0);
            const deliveryFee = 5500;
            const serviceFee = 1500;
            const total = subtotal + deliveryFee + serviceFee;

            const totalEl = document.getElementById('finalCheckoutTotal');
            if (totalEl) totalEl.textContent = formatCOP(total);

            checkoutModal.classList.add('active');
        });
    }

    if (closeCheckoutBtn) {
        closeCheckoutBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }
}

// Envío del Checkout
function setupCheckout() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        const submitBtn = document.getElementById('confirmOrderBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registrando Pedido...`;

        const subtotal = cart.reduce((acc, item) => acc + item.line_total, 0);
        const deliveryFee = 5500;
        const serviceFee = 1500;
        const total = subtotal + deliveryFee + serviceFee;

        const formData = new FormData(form);
        const orderPayload = {
            customer_name: formData.get('customer_name'),
            customer_phone: formData.get('customer_phone'),
            neighborhood_id: formData.get('neighborhood_id'),
            delivery_address: formData.get('delivery_address'),
            payment_method: formData.get('payment_method'),
            cash_change_for: formData.get('cash_change_for'),
            subtotal_cop: subtotal,
            service_fee_cop: serviceFee,
            delivery_fee_cop: deliveryFee,
            total_cop: total,
            distance_km: 2.8,
            items: cart
        };

        try {
            const res = await fetch('index.php?action=checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            const result = await res.json();

            if (result.success) {
                // Limpiar carrito
                cart = [];
                saveCartToStorage();

                // Redirigir al rastreo del pedido
                window.location.href = `index.php?action=tracking&id=${encodeURIComponent(result.order_id)}`;
            } else {
                alert(result.message || 'Error al procesar el pedido');
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Confirmar Pedido Ahora`;
            }
        } catch (err) {
            alert('Error de conexión con el servidor XAMPP. Revisa que Apache y MySQL estén corriendo.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Confirmar Pedido Ahora`;
        }
    });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
