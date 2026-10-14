# Antojo Virtual — Gastronomía Local de Neiva (PHP + MySQL + XAMPP)

Plataforma web desarrollada en **PHP 8** y **MySQL** para la comercialización de comidas rápidas tradicionales de Neiva (Huila), con cálculo de envíos, personalización de pedidos (toppings) y seguimiento en tiempo real.

---

## 🏛️ Patrones de Diseño de Software Aplicados

1. **MVC (Modelo - Vista - Controlador)**:
   - **Modelos (`app/models/`)**: Abstracción y acceso a datos (`ProductRepository`, `BusinessRepository`, `OrderRepository`).
   - **Vistas (`app/views/`)**: Separadas en módulos (`home/index.php`, `orders/tracking.php`, `auth/login.php`, `partials/`).
   - **Controladores (`app/controllers/`)**: Manejo del flujo y peticiones (`HomeController`, `OrderController`, `AuthController`).

2. **Singleton (`app/config/Database.php`)**:
   - Garantiza una única instancia compartida del objeto `PDO` para optimizar el uso de conexiones a MySQL.

3. **Repository / DAO (Data Access Object)**:
   - Desacopla la lógica de negocio de las consultas SQL mediante repositorios especializados.

4. **Front Controller (`index.php`)**:
   - Enrutador centralizado con autoloader PSR-4 para gestionar todas las solicitudes a través de un único punto de entrada.

---

## 🚀 Despliegue en XAMPP

El proyecto está instalado en:
`C:\xampp\htdocs\antojovirtual`

### 1. Iniciar los servicios en XAMPP
Abre el panel de control de XAMPP (`C:\xampp\xampp-control.exe`) y haz clic en **Start** en:
- **Apache**
- **MySQL**

### 2. Importar la Base de Datos
Puedes importarla desde la terminal o desde phpMyAdmin:

#### Opción A (Línea de comandos):
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root < "C:\xampp\htdocs\antojovirtual\database\schema.sql"
```

#### Opción B (phpMyAdmin):
1. Entra a `http://localhost/phpmyadmin/`
2. Ve a la pestaña **Importar** (Import).
3. Selecciona el archivo `database/schema.sql`.
4. Haz clic en **Continuar** (Go).

---

## 🌐 Enlaces de Acceso Local
Una vez iniciado Apache:
- **Página Principal (Menú y Pedidos):** [http://localhost/antojovirtual/](http://localhost/antojovirtual/)
- **Rastreo de Domicilios:** [http://localhost/antojovirtual/index.php?action=tracking](http://localhost/antojovirtual/index.php?action=tracking)
- **Inicio de Sesión:** [http://localhost/antojovirtual/index.php?action=login](http://localhost/antojovirtual/index.php?action=login)

### 🔑 Credenciales de Prueba:
- **Cliente:** `cliente@antojovirtual.com` | Contraseña: `123456`
- **Administrador:** `admin@antojovirtual.com` | Contraseña: `123456`
