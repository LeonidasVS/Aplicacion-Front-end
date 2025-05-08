function isNormalUser() {
  let storage = JSON.parse(localStorage.getItem("user"));
  let fotoPerfil = null;

  if (storage.picture == null) {
    fotoPerfil =
      "https://i.pinimg.com/236x/31/ec/2c/31ec2ce212492e600b8de27f38846ed7.jpg";
  } else {
    fotoPerfil = storage.picture;
  }
  //obtenemos los valores de la autenticacion de google por que los vamos a ocupar
  //Creacion de fecha hora de creacion
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
  //buscamo la url
  fetch("https://localhost:7194/api/Usuario/InsertarUsuarios", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  })
    .then((response) => response.text())
    .then((responseText) => {
      console.log("Respuesta del servidor:", responseText);
      Swal.fire({
        title: "Agregado con exito!",
        icon: "success",
        draggable: true,
        timer: 1500,
        willClose: () => {
          localStorage.setItem("tipo", object.tipoUsuarioId);
          window.location.href = "/home";
        },
      });
    })
    .catch((error) => {
      console.error("Error al agregar el usuario:", error);
      alert("Hubo un error al agregar el usuario");
    });
}

function isAdvanceUser(nit) {
  //primero debemo verificar si en verdad es una tienda o empresa la que quiere ingresar como verficiamos el nit de empresa que es una
  // identificacion que deben
  //tener las tiendas o empresas por que se paga al gobierno lo hacemo con un modal
  let storage = JSON.parse(localStorage.getItem("user")); //obtenemos los valores de la autenticacion de google por que los vamos a ocupar
  //Creacion de fecha hora de creacion
  const fechaActual = new Date();
  const fechaISO = fechaActual.toISOString();
  const object = {
    nombre: storage.name,
    correo: storage.email,
    contraseña: "",
    fotoPerfil: storage.picture,
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
        // La respuesta fue un error HTTP (como 400), mostramos el mensaje de error
        throw new Error(responseText); // Esto irá directo al catch
      }

      // Si no hubo error
      Swal.fire({
        title: "Agregado con éxito!",
        icon: "success",
        timer: 1500,
        willClose: () => {
          localStorage.setItem("tipo", JSON.stringify(object.tipoUsuarioId));
          //window.location.href = "/home";
        },
      });
    })
    .catch((error) => {
      // Aquí capturamos el mensaje de error enviado por el backend
      Swal.fire({
        title: "Error",
        text: error.message || "Hubo un error al agregar el usuario.",
        icon: "error",
      });
    });
}

function ValidateUniqueNit() {}
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
