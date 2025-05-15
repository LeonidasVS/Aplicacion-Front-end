function isNormalUser() {
  let storage = JSON.parse(localStorage.getItem("user"));
  let fotoPerfil = null;

  if (storage.picture == null) {
    fotoPerfil =
      "https://i.pinimg.com/236x/31/ec/2c/31ec2ce212492e600b8de27f38846ed7.jpg";
  } else {
    fotoPerfil = storage.picture;
  }

  const fechaActual = new Date();
  const fechaISO = fechaActual.toISOString();

  const object = {
    nombre: storage.name,
    correo: storage.email,
    contraseña: "",
    fotoPerfil: fotoPerfil,
    nit: "",
    tipoUsuarioId: 1,
    fechaRegistro: fechaISO,
  };

  fetch("https://localhost:7194/api/Usuario/InsertarUsuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  })
    .then((response) => response.text())
    .then((responseText) => {
      console.log("Respuesta del servidor:", responseText);

      // Guardamos tipo en localStorage
      const tipo = object.tipoUsuarioId;
      localStorage.setItem("tipo", tipo);

      // Enviamos el tipo al backend para la sesión
      return fetch("/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: tipo }),
      });
    })
    .then(() => {
      Swal.fire({
        title: "Agregado con éxito!",
        icon: "success",
        timer: 1500,
        willClose: () => {
          window.location.href = "/home";
        },
      });
    })
    .catch((error) => {
      console.error("Error al agregar el usuario o al enviar el rol:", error);
      alert("Hubo un error al completar el registro.");
    });
}

function isAdvanceUser(nit) {
  let storage = JSON.parse(localStorage.getItem("user"));
  let fotoPerfil = null;

  if (storage.picture == null) {
    fotoPerfil =
      "https://i.pinimg.com/236x/31/ec/2c/31ec2ce212492e600b8de27f38846ed7.jpg";
  } else {
    fotoPerfil = storage.picture;
  }

  const fechaActual = new Date();
  const fechaISO = fechaActual.toISOString();

  const object = {
    nombre: storage.name,
    correo: storage.email,
    contraseña: "",
    fotoPerfil: fotoPerfil,
    nit: nit,
    tipoUsuarioId: 2,
    fechaRegistro: fechaISO,
  };

  fetch("https://localhost:7194/api/Usuario/InsertarUsuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  })
    .then(async (response) => {
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText);
      }

      const tipo = object.tipoUsuarioId;
      localStorage.setItem("tipo", tipo);

      // Enviamos el tipo al backend para guardar en sesión
      return fetch("/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: tipo }),
      });
    })
    .then(() => {
      Swal.fire({
        title: "Agregado con éxito!",
        icon: "success",
        timer: 1500,
        willClose: () => {
          window.location.href = "/home";
        },
      });
    })
    .catch((error) => {
      Swal.fire({
        title: "Error",
        text: error.message || "Hubo un error al agregar el usuario.",
        icon: "error",
      });
    });
}

function openModalValidatedNit() {
  var nit = document.getElementById("nit").value.trim();

  const regex = /^\d{4}-\d{7}-\d{3}-\d$/;
  if (regex.test(nit)) {
    ValidateUniqueNit(nit);
    isAdvanceUser(nit);
  } else {
    alert("NIT inválido. Debe tener el formato ####-#######-###-#");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("myform");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault(); // ¡muy importante!
      openModalValidatedNit();
    });
  }
});
