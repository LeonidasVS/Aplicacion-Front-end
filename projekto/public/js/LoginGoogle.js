// ==============================
// Autenticación con Google
// ==============================
function handleCredentialResponse(response) {
  fetch("/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: response.credential }),
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("user", JSON.stringify(data.user));
      verificarPrimeraVez(data);
    })
    .catch((err) => {
      console.error("Error al autenticar:", err);
      alert("Error al iniciar sesión. Intenta de nuevo.");
    });
}

// ==============================
// Cargar perfil del usuario
// ==============================
async function loadUserProfile() {
  const DEFAULT_PICTURE =
    "https://i.pinimg.com/236x/31/ec/2c/31ec2ce212492e600b8de27f38846ed7.jpg";

  try {
    const response = await fetch("/check-auth", {
      credentials: "include",
    });

    if (!response.ok) {
      // No está autenticado
      throw new Error("Usuario no autenticado");
    }

    const { user } = await response.json();

    if (!user) {
      // Respuesta OK pero sin user
      throw new Error("Usuario no encontrado en la respuesta");
    }

    // Actualizar nombre
    const nameEl = document.getElementById("name-user");
    if (nameEl) {
      nameEl.textContent = user.name ?? "Usuario";
    }

    // Actualizar foto de perfil
    const pictureEl = document.getElementById("picture-profile");
    if (pictureEl) {
      // Usa la foto de Google si existe y carga correctamente,
      // o bien la imagen por defecto.
      const candidateSrc = user.picture?.trim() || DEFAULT_PICTURE;
      const imgTest = new Image();

      imgTest.src = candidateSrc;
      imgTest.onload = () => {
        pictureEl.src = candidateSrc;
      };
      imgTest.onerror = () => {
        pictureEl.src = DEFAULT_PICTURE;
      };
    }
  } catch (err) {
    console.warn(err.message);
    // Limpiar cualquier rastro de sesión y forzar login
    localStorage.clear();
    window.location.replace("/login");
  }
}

// ==============================
// Cierre de sesión
// ==============================
function signOut() {
  if (typeof google !== "undefined" && google.accounts) {
    google.accounts.id.disableAutoSelect();
    google.accounts.id.revoke(localStorage.getItem("user")?.email || "", () => {
      console.log("Sesión de Google revocada");
    });
  }

  // Opcional: invalidar sesión en backend
  fetch("/logout", { method: "POST", credentials: "include" }).finally(() => {
    localStorage.clear();
    window.location.replace("/login");
  });
}

// ==============================
// Verificar si es primera vez
// ==============================
function verificarPrimeraVez(data) {
  const email = data.user.email;
  const url = `https://localhost:7194/api/Usuario/ObtenerPorEmail/${email}`;

  fetch(url)
    .then(async (res) => {
      let content;
      try {
        content = await res.clone().json();
      } catch {
        content = await res.text();
      }

      if (res.ok) {
        const tipo = content.tipoUsuarioId;
        localStorage.setItem("tipo", tipo);

        // ✅ Enviar tipo al backend para guardarlo en la sesión
        fetch("/set-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: tipo }),
        });

        window.location.href = "/home";
      } else if (res.status === 404) {
        window.location.href = "/dashboard"; // Registro nuevo
      } else {
        console.error("Error al verificar usuario:", content);
      }
    })
    .catch((err) => {
      console.error("Error en la solicitud:", err.message);
    });
}

// ==============================
// Verificación centralizada
// ==============================
function redirigirSiNoAutenticado() {
  const user = JSON.parse(localStorage.getItem("user"));
  const path = window.location.pathname;

  if (!user && (path.includes("/home") || path.includes("/dashboard"))) {
    localStorage.clear();
    window.location.replace("/login");
  } else if (user) {
    loadUserProfile();
  }
}

// ==============================
// Eventos globales
// ==============================
window.addEventListener("DOMContentLoaded", redirigirSiNoAutenticado);
window.addEventListener("popstate", redirigirSiNoAutenticado);
