async function guardarProducto() {
  // Obtener los valores del formulario
  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value.trim());
  const fotoInput = document.getElementById("fileInput");
  const descripcion = document.getElementById("descripcion").value.trim();
  const marca = document.getElementById("marca").value.trim();
  const estado = document.getElementById("estado").value === "true";
  const storageTienda = JSON.parse(localStorage.getItem("idTienda"));

  const file = fotoInput.files[0];

  // 🔎 Validaciones
  if (!nombre || !precio || !descripcion || !marca || !file || !storageTienda) {
    let mensaje = "";
    let titulo = "¡Ups, Campos sin completar!";
    let icono = "warning";

    if (!nombre) {
      mensaje = "El Nombre es obligatorio.";
    } else if (!precio || isNaN(precio) || precio <= 0) {
      mensaje = "El Precio debe ser un número mayor a 0.";
    } else if (!descripcion) {
      mensaje = "La Descripción es obligatoria.";
    } else if (!marca) {
      mensaje = "La Marca es obligatoria.";
    } else if (!file) {
      mensaje = "La Foto del producto es obligatoria.";
    }

    return Swal.fire({
      icon: icono,
      title: titulo,
      text: mensaje,
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

    // Enviar los datos del producto
    const producto = {
      nombre,
      precio,
      foto: nombreImagen,
      descripcion,
      marca,
      estado,
      tiendaId: parseInt(storageTienda),
    };

    const response = await fetch(
      "https://localhost:7194/api/Producto/Insertar_Producto",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      }
    );

    if (!response.ok) throw new Error("Error al guardar el producto");

    const result = await response.json();
    Swal.fire({
      title: "¡Producto Registrado!",
      icon: "success",
      text: "El producto fue registrado exitosamente",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then(() => {
      window.location.href = "/ShowProduct"; // O redirige a la página de productos
    });
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error al guardar el producto",
      text: "Ocurrió un error al intentar registrar el producto.",
    });
  }
}
