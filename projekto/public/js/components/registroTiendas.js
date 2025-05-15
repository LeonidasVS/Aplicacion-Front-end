async function guardarTienda() {
  event.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const horarioInicio = document.getElementById("horarioInicio").value;
  const horarioSalida = document.getElementById("horarioSalida").value;
  const fileInput = document.getElementById("fileInput");
  const slogan = document.getElementById("slogan").value.trim();
  const idTipoTiendas = document.getElementById("idTipoTiendas").value;
  const numeroContacto = document.getElementById("numeroContacto").value.trim();
  const facebookContacto = document
    .getElementById("facebookContacto")
    .value.trim();
  const paginaWeb = document.getElementById("paginaWeb").value.trim();
  const tieneEnvio = document.getElementById("tieneEnvio").value;
  const file = fileInput.files[0];

  // 🔎 Validaciones
  if (
    !nombre ||
    !horarioInicio ||
    !horarioSalida ||
    !file ||
    !slogan ||
    !idTipoTiendas ||
    !numeroContacto ||
    !/^[0-9]{8,15}$/.test(numeroContacto) === true ||
    (facebookContacto && !facebookContacto.startsWith("http")) ||
    (paginaWeb && !paginaWeb.startsWith("http"))
  ) {
    let mensaje = "";
    let titulo = "¡Ups, Campos sin completar!";
    let icono = "warning";

    if (!nombre) {
      mensaje = "El Nombre es obligatorio.";
    } else if (!horarioInicio) {
      mensaje = "El Horario de inicio es obligatorio.";
    } else if (!horarioSalida) {
      mensaje = "El Horario de salida es obligatorio.";
    } else if (!file) {
      mensaje = "La Foto de la fachada es obligatoria.";
    } else if (!slogan) {
      mensaje = "El Slogan es obligatorio.";
    } else if (!idTipoTiendas) {
      mensaje = "Debes seleccionar un tipo de tienda.";
    } else if (!numeroContacto || !/^[0-9]{8,15}$/.test(numeroContacto)) {
      mensaje =
        "El número de contacto es inválido. Debe tener entre 8 y 15 dígitos.";
    } else if (facebookContacto && !facebookContacto.startsWith("http")) {
      mensaje = "La URL de Facebook es inválida. Debe comenzar con 'http'.";
    } else if (paginaWeb && !paginaWeb.startsWith("http")) {
      mensaje =
        "La URL de la página web es inválida. Debe comenzar con 'http'.";
    }

    return Swal.fire({
      icon: icono,
      title: titulo,
      text: mensaje,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  try {
    // 1. Subir la imagen
    const formData = new FormData();
    formData.append("image", file);

    const uploadRes = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    const nombreImagen = uploadData.filename;

    const user = JSON.parse(localStorage.getItem("user"));
    const usuarioRes = await fetch(
      `https://localhost:7194/api/Usuario/ObtenerPorEmail/${encodeURIComponent(
        user.email
      )}`
    );
    if (!usuarioRes.ok) throw new Error("No se pudo obtener el usuario");

    const usuarioData = await usuarioRes.json();
    const usuarioIdsearch = usuarioData.id;
    const tienda = {
      nombre,
      horarioInicio,
      horarioSalida,
      fotoFachada: nombreImagen,
      slogan,
      idTipoTiendas: parseInt(idTipoTiendas),
      numeroContacto,
      facebookContacto,
      paginaWeb,
      tieneEnvio: tieneEnvio === "1",
      usuarioId: usuarioIdsearch,
    };

    // Enviar datos de la tienda
    const response = await fetch(
      "https://localhost:7194/api/Tienda/Insertar_Tiendas",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tienda),
      }
    );

    if (!response.ok) throw new Error("Error al guardar la tienda");

    const result = await response.json();
    Swal.fire({
      title: "Tienda Registrada!",
      icon: "success",
      text: "La tienda fue registrada exitosamente",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      window.location.href = "/home";
    });
  } catch (error) {
    const responseText = await error.response?.text?.();
    console.error("Error:", error);
    if (responseText) console.error("Respuesta del servidor:", responseText);
    alert("Ocurrió un error al guardar la tienda.");
  }
}

function storeCategory() {
  fetch("https://localhost:7194/api/TipoTienda/LeerTipoTiendas") // Cambia esta URL por la ruta real de tu API
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener las categorías");
      }
      return response.json();
    })
    .then((categorias) => {
      console.log("Categorías obtenidas:", categorias);
      // Aquí puedes llenar un select o mostrar las categorías en el DOM
      // Ejemplo:
      const lista = document.getElementById("idTipoTiendas");
      lista.innerHTML = ""; // Limpiar lista previa
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        lista.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Hubo un problema al obtener las categorías:", error);
    });
}
// metodo de validacion que el tipotienda ya existe y no se repita por ejemplo Ropa Ropa
async function obtenerTipoTiendaPorNombre(nombre) {
  try {
    const response = await fetch(
      `https://localhost:7194/api/TipoTienda/ObtenerPorName/${encodeURIComponent(
        nombre
      )}`
    );

    if (response.status === 404) {
      return null; // No existe
    }

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json(); // Existe
  } catch (error) {
    console.error("Error al obtener TipoTienda por nombre:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo verificar el tipo de tienda.",
    });
    return null;
  }
}

async function insertarTipoTienda(nombre) {
  try {
    const response = await fetch(
      "https://localhost:7194/api/TipoTienda/Insertar_TipoTienda",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombre,
          Tiendas: [], // Asegúrate de que `Tiendas` tenga un valor válido
        }),
      }
    );
    const responseBody = await response.text(); // usa .text() en vez de .json() si no estás seguro
    console.log("Respuesta del servidor:", response.status, responseBody);

    if (!response.ok) {
      throw new Error(
        `Error al insertar: ${response.status} - ${responseBody}`
      );
    }

    // Mostrar alerta de éxito
    Swal.fire({
      icon: "success",
      title: "¡Registrado con Exito!",
      text: `El Tipo Tienda:"${nombre}" se ha registrado exitosamente`,
      timer: 2000, // Alerta se cerrará automáticamente después de 1.5 segundos
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false, // Muestra una barra de progreso
      willClose: () => {
        // Limpiar el formulario después de que la alerta se cierre
        document.getElementById("myformTipoTiendas").reset();
        // Redirigir a otra página
        window.location.href = "/registroStore";
      },
    });
  } catch (error) {
    console.error("Error al insertar tipo de tienda:", error);
    Swal.fire({
      icon: "error",
      title: "Error al registrar",
      text: "Error al registrar el tipo tienda",
      timer: 2000, // Alerta se cerrará automáticamente después de 1.5 segundos
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  storeCategory();

  const form = document.getElementById("myformTipoTiendas");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const nombreInput = document.getElementById("TipoTienda");
      if (!nombreInput) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontró el campo de nombre.",
          timer: 2000, // Alerta se cerrará automáticamente después de 1.5 segundos
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }

      const nombre = nombreInput.value.toLowerCase().trim();

      if (!nombre) {
        Swal.fire({
          icon: "warning",
          title: "¡Campo Vacio!",
          text: "Ingresa un Tipo de Tienda, es obligatorio.",
          timer: 2000, // Alerta se cerrará automáticamente después de 1.5 segundos
          timerProgressBar: true,
          showConfirmButton: false,
        });
        return;
      }

      const existente = await obtenerTipoTiendaPorNombre(nombre);
      if (existente) {
        Swal.fire({
          icon: "warning",
          title: "¡Tipo de Tienda existente!",
          text: `El tipo de tienda "${nombre}" ya está registrado, ingresa uno nuevo.`,
          timer: 2000, // Alerta se cerrará automáticamente después de 1.5 segundos
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        await insertarTipoTienda(nombre);
      }
    });
  }
});

//document.addEventListener('DOMContentLoaded', storeCategory);
