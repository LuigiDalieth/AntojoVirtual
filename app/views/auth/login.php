<div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
            <span class="auth-logo"><i class="fa-solid fa-burger"></i></span>
            <h2>Iniciar Sesión</h2>
            <p>Accede a Antojo Virtual Neiva</p>
        </div>

        <?php if (!empty($error)): ?>
            <div class="auth-alert error">
                <i class="fa-solid fa-circle-exclamation"></i> <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form action="index.php?action=login" method="POST" class="auth-form">
            <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" name="email" required placeholder="tu@email.com" value="cliente@antojovirtual.com">
            </div>

            <div class="form-group">
                <label>Contraseña</label>
                <input type="password" name="password" required placeholder="••••••••" value="123456">
            </div>

            <button type="submit" class="btn-auth-submit">
                Entrar a mi cuenta <i class="fa-solid fa-arrow-right"></i>
            </button>
        </form>

        <div class="auth-quick-creds">
            <strong>Cuentas de demostración rápida:</strong>
            <p>• <strong>Cliente:</strong> cliente@antojovirtual.com | clave: <code>123456</code></p>
            <p>• <strong>Administrador:</strong> admin@antojovirtual.com | clave: <code>123456</code></p>
        </div>
    </div>
</div>
