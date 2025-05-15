const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");

const { OAuth2Client } = require("google-auth-library");

const app = express();
const PORT = 3000;

// Client ID de Google
const client = new OAuth2Client(
  "326302272141-pbtj14l2ercunf73f2hiih84t3hpn63f.apps.googleusercontent.com"
);

// Middleware para sesiones
app.use(
  session({
    secret: "mi_secreto_seguro",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/set-role", (req, res) => {
  const { role } = req.body;
  if (req.session.user) {
    req.session.user.role = role;
    return res.status(200).json({ message: "Rol asignado" });
  }
  res.status(401).json({ error: "Usuario no autenticado" });
});

// Middleware de autenticación general
function checkAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/login");
}

// Middleware especial para controlar acceso único a /dashboard
function checkFirstDashboardVisit(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
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
app.post("/auth/google", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "326302272141-pbtj14l2ercunf73f2hiih84t3hpn63f.apps.googleusercontent.com",
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
app.get("/check-auth", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Cerrar sesión
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Sesión cerrada" });
  });
});

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).send("Acceso denegado");
    }
    next();
  };
}

// Solo emprendedores (tipo 2) pueden acceder a /registroStore
app.get("/registroStore", checkAuth, requireRole([2]), (req, res) => {
  res.sendFile(path.join(__dirname, "public/Pages/regsitroTiendas.html"));
});

app.get("/registroProduct", checkAuth, requireRole([2]), (req, res) => {
  res.sendFile(path.join(__dirname, "public/Pages/registroProductos.html"));
});

app.get("/ShowProduct", checkAuth, requireRole([1, 2]), (req, res) => {
  res.sendFile(path.join(__dirname, "public/Pages/ShowProductos.html"));
});

// Bloqueamos acceso a /dashboard si ya tiene rol asignado
app.get(
  "/dashboard",
  checkAuth,
  (req, res, next) => {
    if (req.session.user.role) {
      return res.status(403).send("Ya no puedes acceder a /dashboard");
    }
    next();
  },
  (req, res) => {
    res.sendFile(path.join(__dirname, "public/Pages/redirec_usuario.html"));
  }
);

//para guardar imagenes
// Configurar dónde guardar las imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/store"); // Carpeta donde guardar
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
  });
});

app.use("/uploads", express.static("uploads"));
//fin guardar imagenes

// Rutas protegidas
app.get("/home", checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/Pages/dashboard.html"));
});

// Rutas públicas
app.get("/registro", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Pages/registroUsuario.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Pages/login.html"));
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
