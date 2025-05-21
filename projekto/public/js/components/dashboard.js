// Constantes de API
const API_BASE = "https://localhost:7194/api";

/**
 * Realiza una petición GET y devuelve la respuesta JSON o lanza error.
 * @param {string} endpoint - Ruta completa o relativa al recurso.
 * @returns {Promise<any>}
 */
async function fetchJson(endpoint) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}/${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Error en la respuesta: ${res.status}`);
  return res.json();
}

/**
 * Muestra un SweetAlert de error.
 * @param {string} title - Título de la alerta.
 * @param {string} text - Texto descriptivo.
 */
function showErrorAlert(title, text) {
  Swal.fire({
    icon: "error",
    title,
    text,
    timer: 2300,
    timerProgressBar: true,
    showConfirmButton: false,
  });
}

/**
 * Muestra un SweetAlert de confirmación y ejecuta callbacks según la respuesta.
 * @param {string} title
 * @param {string} text
 * @param {function} onConfirm
 * @param {function} onCancel
 */
function showConfirmAlert(title, text, onConfirm, onCancel) {
  Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "No, cancelar",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) onConfirm();
    else if (result.dismiss === Swal.DismissReason.cancel && onCancel)
      onCancel();
  });
}

/**
 * Oculta elementos del menú "Emprendedor" si el usuario es tipo 1.
 */
function hideEmprendedorElements() {
  const tipo = localStorage.getItem("tipo");
  if (tipo === "1") {
    ["emprendedor", "emprendedorbutton"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.visibility = "hidden";
    });
  }
}

/**
 * Carga y renderiza todas las tiendas.
 */
async function loadStore() {
  const container = document.getElementById("tiendas-container");
  const filterList = document.getElementById("filterStore");

  // Loader
  container.innerHTML = `<div class="col-12 text-center py-5">
    <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
    <p class="text-muted mt-2">Cargando tiendas...</p>
  </div>`;

  try {
    const tiendas = await fetchJson("Tienda/LeerTiendas");
    renderFiltersAndStores(tiendas, container, filterList);
    initLightbox();
    initIsotope(container, filterList);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="col-12 text-center py-5">
      <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
      <p class="text-muted">Error al cargar las tiendas. Por favor intenta nuevamente.</p>
      <button class="btn btn-primary mt-3" onclick="loadStore()">Reintentar</button>
    </div>`;
  }
}

/**
 * Genera filtros y tarjetas de tiendas.
 * @param {Array} tiendas
 * @param {HTMLElement} container
 * @param {HTMLElement} filterList
 */
function renderFiltersAndStores(tiendas, container, filterList) {
  container.innerHTML = "";
  filterList.innerHTML = "";

  if (tiendas.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-5">
      <i class="bi bi-shop fs-1 text-muted"></i>
      <p class="text-muted">No se encontraron tiendas disponibles.</p>
    </div>`;
    return;
  }

  // Categorías únicas
  const categorias = [
    ...new Set(tiendas.map((t) => t.tipoTiendaNombre?.trim().toLowerCase())),
  ];
  addFilterItem("Todas", "*", filterList, true);
  categorias.forEach((cat) =>
    addFilterItem(capitalize(cat), `filter-${slugify(cat)}`, filterList)
  );

  // Tarjetas de tienda
  tiendas.forEach((tienda) =>
    container.insertAdjacentHTML("beforeend", createStoreCard(tienda))
  );

  // Eventos de filtro
  filterList.querySelectorAll(".filter-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterList
        .querySelectorAll("li")
        .forEach((li) => li.classList.remove("filter-active"));
      btn.classList.add("filter-active");
      const filtro = btn.getAttribute("data-filter");
      window.iso.arrange({ filter: filtro });
    });
  });
}

/**
 * Añade un elemento de filtro al DOM.
 */
function addFilterItem(text, filter, parent, active = false) {
  const li = document.createElement("li");
  li.textContent = text;
  li.setAttribute(
    "data-filter",
    filter.startsWith("*") ? filter : `.${filter}`
  );
  li.classList.add("filter-button");
  if (active) li.classList.add("filter-active");
  parent.appendChild(li);
}

/**
 * Crea el HTML para la tarjeta de una tienda.
 * @param {object} tienda
 * @returns {string}
 */
function createStoreCard(tienda) {
  const catClass = `filter-${slugify(tienda.tipoTiendaNombre)}`;
  const imgSrc = tienda.fotoFachada
    ? `img/store/${tienda.fotoFachada}`
    : "img/services/services-1.webp";
  const tipoUsuario = localStorage.getItem("tipo");

  // Solo usuarios tipo 2 ven el botón eliminar
  const deleteButton =
    tipoUsuario === "2"
      ? `<button class="btn btn-danger eliminarTienda" onclick="eliminarTienda('${tienda.id}', '${tienda.nombre}')">
         <i class="bi bi-trash3-fill"></i>
       </button>`
      : "";

  return `
    <div class="col-lg-6 col-md-6 portfolio-item isotope-item ${catClass}">
      <div class="portfolio-card">
        <div class="portfolio-image">
          <img src="${imgSrc}" alt="${
    tienda.nombre
  }" loading="lazy" onerror="this.src='img/services/services-1.webp'">
          <div class="portfolio-overlay">
            <div class="portfolio-actions">
              <a href="${imgSrc}" class="glightbox preview-link" data-gallery="portfolio-gallery" data-title="${
    tienda.nombre
  }" data-description="${tienda.slogan || "Descubre nuestros productos"}">
                <i class="bi bi-eye"></i>
              </a>
              <a href="javascript:void(0);" onclick="loadRegistro('${
                tienda.id
              }')" class="details-link">
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        </div>
        <div class="portfolio-content">
          <span class="category">${tienda.tipoTiendaNombre || "General"}</span>
          <h3>${tienda.nombre}</h3>
          <p>${tienda.slogan || "Descubre nuestros productos y servicios"}</p>
          <div class="store-info">
            <small><i class="bi bi-clock"></i> ${tienda.horarioInicio} - ${
    tienda.horarioSalida
  }</small>
            ${
              tienda.tieneEnvio
                ? '<small class="ms-2"><i class="bi bi-truck"></i> Envíos disponibles</small>'
                : ""
            }
          </div>
          ${deleteButton}
        </div>
      </div>
    </div>`;
}

/**
 * Capitaliza la primera letra de un string.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convierte espacios en guiones y pasa a minúsculas.
 */
function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Inicializa GLightbox para las vistas previas de imágenes.
 */
function initLightbox() {
  if (typeof GLightbox !== "undefined") {
    GLightbox({ selector: ".preview-link", touchNavigation: true, loop: true });
  }
}

/**
 * Inicializa Isotope para filtrado y guarda la instancia.
 */
function initIsotope(container, filterList) {
  if (typeof Isotope !== "undefined") {
    window.iso = new Isotope(container, {
      itemSelector: ".portfolio-item",
      layoutMode: "fitRows",
      filter: "*",
    });
  }
}

/**
 * Verifica y redirige a la vista de productos si el usuario pertenece a la tienda.
 * @param {string} idTienda
 */
async function loadRegistro(idTienda) {
  const tipo = localStorage.getItem("tipo");
  if (tipo === "1")
    return (window.location.href = `/ShowProduct?id=${idTienda}`);

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const usuario = await fetchJson(
      `Usuario/ObtenerPorEmail/${encodeURIComponent(user.email)}`
    );
    const tienda = await fetchJson(`Tienda/ObtenerPorId/${idTienda}`);

    if (tienda.usuarioId === usuario.id)
      window.location.href = `/ShowProduct?id=${idTienda}`;
    else
      showErrorAlert(
        "¡Acceso Denegado!",
        "¡No puedes acceder a una tienda que no te pertenece...!"
      );
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al verificar la tienda.");
  }
}

/**
 * Confirma y elimina una tienda si el usuario es propietario.
 * @param {string} idTienda
 * @param {string} nombreTienda
 */
async function eliminarTienda(idTienda, nombreTienda) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const usuario = await fetchJson(
      `Usuario/ObtenerPorEmail/${encodeURIComponent(user.email)}`
    );
    const tienda = await fetchJson(`Tienda/ObtenerPorId/${idTienda}`);

    if (tienda.usuarioId !== usuario.id) {
      return showErrorAlert(
        "¡Acceso Denegado!",
        "¡No puedes eliminar una tienda que no te pertenece...!"
      );
    }

    showConfirmAlert(
      `¿Deseas eliminar la tienda ${nombreTienda}?`,
      "¡La tienda se eliminará completamente!",
      async () => {
        try {
          const response = await fetch(
            `https://localhost:7194/api/Tienda/EliminarTienda/${idTienda}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            // La petición se hizo, pero el servidor respondió con error
            const errorData = await response.json();
            console.error("Error al eliminar la tienda:", errorData);
            alert(
              `No se pudo eliminar la tienda. ${
                errorData.message || "Error desconocido"
              }`
            );
            return;
          }
          Swal.fire({
            icon: "success",
            title: "¡Tienda Eliminada Exitosamente!",
            text: "La Tienda Ha sido Eliminada",
            timer: 2300,
            timerProgressBar: true,
          });
          window.onload();
        } catch (error) {
          console.error("Error en la petición:", error);
          alert(
            "Hubo un error al intentar eliminar la tienda. Verifica la conexión con el servidor."
          );
        }
      }
    );
  } catch (err) {
    console.error(err);
    showErrorAlert("Error", "No se pudo procesar la eliminación");
  }
}

// Inicialización al cargar la página
window.onload = () => {
  hideEmprendedorElements();
  loadStore();
};
