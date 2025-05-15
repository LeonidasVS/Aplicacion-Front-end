// Definir la función

function hideElementeEmprendedor() {
  const elemento = document.getElementById("emprendedor");
  const elemento2 = document.getElementById("emprendedorbutton");
  //const elemento3 = document.getElementById("buttonLoadRe");

  if (localStorage.getItem("tipo") == 1) {
    elemento.style.visibility = "hidden";
    elemento2.style.visibility = "hidden";
  }
}

//Cargar Tiendas
function loadStore() {
  const API_URL = "https://localhost:7194/api/Tienda/LeerTiendas";
  const container = document.getElementById("tiendas-container");
  const containerfilter = document.getElementById("filterStore");

  // Mostrar loader mientras se cargan los datos
  container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-2">Cargando tiendas...</p>
        </div>
    `;

  fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
      return response.json();
    })
    .then((tiendas) => {
      console.log("Tiendas recibidas:", tiendas);

      // Limpiar contenedores
      container.innerHTML = "";
      containerfilter.innerHTML = "";

      if (tiendas.length === 0) {
        container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-shop fs-1 text-muted"></i>
                    <p class="text-muted">No se encontraron tiendas disponibles.</p>
                </div>
            `;
        return;
      }

      // Obtener categorías únicas
      const categoriasUnicas = [
        ...new Set(
          tiendas.map((t) => t.tipoTiendaNombre?.trim().toLowerCase())
        ),
      ];

      // Agregar botón "Todas"
      const liTodos = document.createElement("li");
      liTodos.textContent = "Todas";
      liTodos.setAttribute("data-filter", "*");
      liTodos.classList.add("filter-active", "filter-button");
      containerfilter.appendChild(liTodos);

      // Agregar filtros por categoría
      categoriasUnicas.forEach((categoria) => {
        const li = document.createElement("li");
        li.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
        const slug = "filter-" + categoria.replace(/\s+/g, "-");
        li.setAttribute("data-filter", `.${slug}`);
        li.classList.add("filter-button");
        containerfilter.appendChild(li);
      });

      // Mostrar cada tienda
      tiendas.forEach((tienda) => {
        const categoriaClase =
          "filter-" +
          tienda.tipoTiendaNombre.toLowerCase().replace(/\s+/g, "-");
        //creo que el error como eliminamos la categoria seria de obtener el id pasarlo a texto
        const tiendaHTML = `
                <div class="col-lg-6 col-md-6 portfolio-item isotope-item ${categoriaClase}">
                    <div class="portfolio-card">
                        <div class="portfolio-image">
                            <img src="${
                              "img/store/" + tienda.fotoFachada ||
                              "img/services/services-1.webp"
                            }" 
                                 class="img-fluid" 
                                 alt="${tienda.nombre}" 
                                 loading="lazy"
                                 onerror="this.src='img/services/services-1.webp'">
                            <div class="portfolio-overlay">
                                <div class="portfolio-actions">
                                    <a href="${
                                      "img/store/" + tienda.fotoFachada ||
                                      "img/services/services-1.webp"
                                    }" 
                                       class="glightbox preview-link"
                                       data-gallery="portfolio-gallery"
                                       data-title="${tienda.nombre}"
                                       data-description="${
                                         tienda.slogan ||
                                         "Descrube nuestros productos"
                                       }">
                                        <i class="bi bi-eye"></i>
                                    </a>
                                    <a id="buttonLoadRe" href="javascript:void(0);" 
                                    onclick="LoadRegistro('${tienda.id}')" 
                                    class="details-link">
                                      <i class="bi bi-arrow-right"></i>
                                  </a>
                                </div>
                            </div>
                            
                        </div>
                        <div class="portfolio-content">
                            <span class="category">${
                              tienda.tipoTiendaNombre || "General"
                            }</span>
                            <h3>${tienda.nombre}</h3>
                            <p>${
                              tienda.slogan ||
                              "Descubre nuestros productos y servicios"
                            }</p>
                            <div class="store-info">
                                <small><i class="bi bi-clock"></i> ${
                                  tienda.horarioInicio
                                } - ${tienda.horarioSalida}</small>
                                ${
                                  tienda.tieneEnvio
                                    ? '<small class="ms-2"><i class="bi bi-truck"></i> Envíos disponibles</small>'
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
        container.insertAdjacentHTML("beforeend", tiendaHTML);
      });

      // Inicializar GLightbox
      if (typeof GLightbox !== "undefined") {
        const lightbox = GLightbox({
          selector: ".preview-link",
          touchNavigation: true,
          loop: true,
        });
      }

      // Inicializar Isotope
      if (typeof Isotope !== "undefined") {
        const iso = new Isotope(container, {
          itemSelector: ".portfolio-item",
          layoutMode: "fitRows",
          filter: "*",
        });

        // Eventos de filtro
        containerfilter.querySelectorAll(".filter-button").forEach((btn) => {
          btn.addEventListener("click", function () {
            containerfilter
              .querySelectorAll("li")
              .forEach((el) => el.classList.remove("filter-active"));
            this.classList.add("filter-active");

            const filtro = this.getAttribute("data-filter");
            iso.arrange({ filter: filtro });
          });
        });
      }
    })
    .catch((error) => {
      console.error("Error obteniendo los datos:", error);
      container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                <p class="text-muted">Error al cargar las tiendas. Por favor intenta nuevamente.</p>
                <button class="btn btn-primary mt-3" onclick="loadStore()">Reintentar</button>
            </div>
        `;
    });
}

//metodo verficacion de tiendas con el usuario

async function LoadRegistro(idTienda) {
  if (localStorage.getItem("tipo") != 1) {
    try {
      // 1. Obtener correo desde localStorage
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user.email) {
        throw new Error(
          "No se encontró el correo del usuario en localStorage."
        );
      }

      // 2. Obtener el usuario por correo
      const resUsuario = await fetch(
        `https://localhost:7194/api/Usuario/ObtenerPorEmail/${encodeURIComponent(
          user.email
        )}`
      );
      if (!resUsuario.ok) throw new Error("No se pudo obtener el usuario.");
      const usuario = await resUsuario.json();

      // 3. Obtener la tienda por ID
      const resTienda = await fetch(
        `https://localhost:7194/api/Tienda/ObtenerPorId/${idTienda}`
      );
      if (!resTienda.ok) throw new Error("No se pudo obtener la tienda.");
      const tienda = await resTienda.json();

      // 4. Comparar el usuarioId de la tienda con el id del usuario actual
      if (tienda.usuarioId === usuario.id) {
        // Redirigir si pertenece al usuario

        window.location.href = `/ShowProduct?id=${idTienda}`;
      } else {
        Swal.fire({
          icon: "error",
          title: "¡Acceso Denegado!",
          text: "Esta tienda no pertenece al usuario actual",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error en LoadRegistro:", error);
      alert("Ocurrió un error al verificar la tienda.");
    }
  }
}

// Llamar a la función cuando la página cargue
window.onload = function () {
  loadStore();
  hideElementeEmprendedor();
};

//********************************* */
//aqui hay un prblemas al mostrar tienda por que desaparecio columna categorias y solo tenemos el id seria de hacer una consultar inner par ados tablas
