    </main>

    <!-- Slide-over Cart Drawer -->
    <div class="cart-drawer-backdrop" id="cartBackdrop"></div>
    <aside class="cart-drawer" id="cartDrawer">
        <div class="cart-header">
            <h3><i class="fa-solid fa-basket-shopping"></i> Tu Pedido en Neiva</h3>
            <button class="btn-close-cart" id="closeCartBtn">&times;</button>
        </div>

        <div class="cart-body" id="cartItemsContainer">
            <!-- Renderizado dinámicamente con JS -->
            <div class="cart-empty-state">
                <i class="fa-solid fa-burger"></i>
                <p>Tu carrito está vacío</p>
                <span>¡Descubre las delicias locales de Neiva y agrégalas!</span>
            </div>
        </div>

        <div class="cart-footer">
            <div class="summary-line">
                <span>Subtotal:</span>
                <strong id="cartSubtotalText">$0 COP</strong>
            </div>
            <div class="summary-line">
                <span>Tarifa de servicio:</span>
                <span>$1.500 COP</span>
            </div>
            <div class="summary-line highlight">
                <span>Total Estimado:</span>
                <strong id="cartTotalText">$0 COP</strong>
            </div>

            <button type="button" class="btn-checkout" id="checkoutBtn" disabled>
                Continuar al Pago <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    </aside>

    <!-- Modal de Checkout & Dirección de Entrega -->
    <div class="modal-backdrop" id="checkoutModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3><i class="fa-solid fa-location-crosshairs"></i> Finalizar Pedido en Neiva</h3>
                <button class="btn-close-modal" id="closeCheckoutModal">&times;</button>
            </div>
            <form id="checkoutForm" class="checkout-form">
                <div class="form-group">
                    <label>Tu Nombre Completo</label>
                    <input type="text" name="customer_name" required placeholder="Ej: Juan Camilo Perdomo" value="<?= htmlspecialchars($_SESSION['user']['name'] ?? '') ?>">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Teléfono Celular / WhatsApp</label>
                        <input type="tel" name="customer_phone" required placeholder="Ej: 312 345 6789" value="<?= htmlspecialchars($_SESSION['user']['phone'] ?? '') ?>">
                    </div>
                    <div class="form-group">
                        <label>Barrio de Neiva</label>
                        <select name="neighborhood_id" id="deliveryNeighborhood" required>
                            <option value="quirinal">El Quirinal (Comuna 2)</option>
                            <option value="altico" selected>El Altico (Comuna 3)</option>
                            <option value="ico">Ipanema / Santa Inés (Comuna 1)</option>
                            <option value="canaima">Canaima (Comuna 6 · Sur)</option>
                            <option value="la-rioja">La Rioja (Comuna 5 · Oriente)</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Dirección exacta y detalles</label>
                    <input type="text" name="delivery_address" required placeholder="Ej: Calle 8 # 14-32 Apto 201" value="<?= htmlspecialchars($_SESSION['user']['address_details'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label>Método de Pago</label>
                    <select name="payment_method" id="paymentMethod">
                        <option value="Efectivo">Efectivo contra entrega</option>
                        <option value="Transferencia Nequi / Daviplata">Transferencia (Nequi / Daviplata)</option>
                    </select>
                </div>

                <div class="form-group" id="cashChangeGroup">
                    <label>¿Con cuánto vas a pagar? (Para cambio)</label>
                    <input type="number" name="cash_change_for" placeholder="Ej: 50000">
                </div>

                <div class="checkout-breakdown">
                    <div class="breakdown-row"><span>Costo Domicilio:</span><span id="deliveryCostLabel">$5.500 COP</span></div>
                    <div class="breakdown-row total-highlight"><span>Total a Pagar:</span><span id="finalCheckoutTotal">$0 COP</span></div>
                </div>

                <button type="submit" class="btn-confirm-order" id="confirmOrderBtn">
                    <i class="fa-solid fa-check"></i> Confirmar Pedido Ahora
                </button>
            </form>
        </div>
    </div>

    <!-- Modal de Selección de Toppings / Personalización -->
    <div class="modal-backdrop" id="toppingModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3 id="modalProductName">Personaliza tu Antojo</h3>
                <button class="btn-close-modal" id="closeToppingModal">&times;</button>
            </div>
            <div class="modal-product-preview">
                <img id="modalProductImg" src="" alt="">
                <div>
                    <p id="modalProductDesc"></p>
                    <strong class="modal-price" id="modalProductBasePrice">$0 COP</strong>
                </div>
            </div>

            <div class="modal-toppings-section">
                <h4>Adicionales y salsas artesanales</h4>
                <div class="toppings-list" id="modalToppingsList">
                    <!-- Se llena con JS -->
                </div>
            </div>

            <div class="modal-notes-section">
                <label>Instrucciones de cocina (sin cebolla, salsa aparte, etc.):</label>
                <textarea id="modalProductNotes" placeholder="Escribe tus notas para el chef..."></textarea>
            </div>

            <div class="modal-footer">
                <div class="quantity-picker">
                    <button type="button" id="qtyMinusBtn">-</button>
                    <span id="itemQuantity">1</span>
                    <button type="button" id="qtyPlusBtn">+</button>
                </div>
                <button type="button" class="btn-add-to-cart" id="confirmAddToCartBtn">
                    Agregar al Pedido — <span id="modalFinalPrice">$0 COP</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="app-footer">
        <div class="footer-container">
            <div class="footer-col">
                <div class="brand-text">
                    <h3>Antojo Virtual</h3>
                    <p>Sabores auténticos, emprendedores locales y la mejor gastronomía rápida de Neiva al alcance de tu mano.</p>
                </div>
            </div>
            <div class="footer-col">
                <h4>Horarios de Cobertura</h4>
                <p><i class="fa-solid fa-clock"></i> Martes a Domingo: 4:30 PM - 12:00 AM</p>
                <p><i class="fa-solid fa-motorcycle"></i> Despachos rápidos en comunas 1, 2, 3, 5 y 6.</p>
            </div>
            <div class="footer-col">
                <h4>Plataforma Local</h4>
                <p>Desarrollada en PHP 8 + MySQL (XAMPP)</p>
                <p>Patrones: MVC, Singleton, DAO / Repository</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <?= date('Y') ?> Antojo Virtual Neiva. Todos los derechos reservados.</p>
        </div>
    </footer>

    <!-- App JavaScript Logic -->
    <script src="public/js/app.js"></script>
</body>
</html>
