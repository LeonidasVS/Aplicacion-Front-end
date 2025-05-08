const express = require('express');
const session = require('express-session');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3000;

// Client ID de Google
const client = new OAuth2Client("326302272141-pbtj14l2ercunf73f2hiih84t3hpn63f.apps.googleusercontent.com");

// Middleware para sesiones
app.use(session({
  secret: 'mi_secreto_seguro',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticación general
function checkAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Middleware especial para controlar acceso único a /dashboard
function checkFirstDashboardVisit(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  // Si ya visitó dashboard antes
  if (req.session.hasVisitedDashboard) {
    return res.status(403).send("Acceso denegado: ya accediste a /dashboard.");
  }

  // Primera vez, se permite y se marca
  req.session.hasVisitedDashboard = true;
  next();
}

// Ruta de autenticación con Google
app.post('/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "326302272141-pbtj14l2ercunf73f2hiih84t3hpn63f.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    req.session.user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    res.json({ user: req.session.user });
  } catch (error) {
    console.error("Error verificando token de Google:", error);
    res.status(401).json({ error: "Token inválido" });
  }
});

// Verifica si el usuario está autenticado (desde frontend)
app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Cerrar sesión
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(200).json({ message: "Sesión cerrada" });
  });
});

// Rutas protegidas
app.get('/home', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Pages/dashboard.html'));
});




// Ruta protegida que solo se puede acceder una vez por sesión
app.get('/dashboard', checkFirstDashboardVisit, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Pages/redirec_usuario.html'));
});

// Rutas públicas
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Pages/registroUsuario.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/Pages/login.html'));
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
