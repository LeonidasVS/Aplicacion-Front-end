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
function loadUserProfile() {
  fetch("/check-auth", { credentials: "include" })
    .then((res) => {
      if (!res.ok) {
        throw new Error("No autenticado");
      }
      return res.json();
    })
    .then((data) => {
      if (data.user) {
        const nameEl = document.getElementById("name-user");
        const pictureEl = document.getElementById("picture-profile");

        if (nameEl) nameEl.textContent = data.user.name;
        if (pictureEl) {
          const img = new Image();
          img.src = data.user.picture;
          img.onload = () => (pictureEl.src = data.user.picture);
          img.onerror = () =>
            (pictureEl.src =
              "https://i.pinimg.com/236x/31/ec/2c/31ec2ce212492e600b8de27f38846ed7.jpg");
        }
      } else {
        localStorage.clear();
        window.location.replace("/login");
      }
    })
    .catch(() => {
      localStorage.clear();
      window.location.replace("/login");
    });
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
        localStorage.setItem("tipo", content.tipoUsuarioId);
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
