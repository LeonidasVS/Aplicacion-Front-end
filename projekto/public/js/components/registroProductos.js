function loadProducts(id) {
  if (!id) {
    console.error("No se proporcionó un ID de tienda válido.");
    document.getElementById("tiendas-container").innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
        <p class="text-muted">No se encontró el ID de la tienda.</p>
      </div>`;
    return;
  }

  const API_URL = `https://localhost:7194/api/Producto/ObtenerPorTienda/${id}`;
  const container = document.getElementById("tiendas-container");
  const containerfilter = document.getElementById("filterStore");

  container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-2">Cargando productos...</p>
        </div>
    `;

  fetch(API_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then((productos) => {
      container.innerHTML = "";
      containerfilter.innerHTML = "";

      if (productos.length === 0) {
        container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-box-seam fs-1 text-muted"></i>
                    <p class="text-muted">No se encontraron productos.</p>
                </div>`;
        return;
      }

      // Filtros por marca
      const marcasUnicas = [
        ...new Set(productos.map((p) => p.marca?.trim().toLowerCase())),
      ];
      const liTodos = document.createElement("li");
      liTodos.textContent = "Todos";
      liTodos.setAttribute("data-filter", "*");
      liTodos.classList.add("filter-active", "filter-button");
      containerfilter.appendChild(liTodos);

      marcasUnicas.forEach((marca) => {
        const li = document.createElement("li");
        li.textContent = marca.charAt(0).toUpperCase() + marca.slice(1);
        const slug = "filter-" + marca.replace(/\s+/g, "-");
        li.setAttribute("data-filter", `.${slug}`);
        li.classList.add("filter-button");
        containerfilter.appendChild(li);
      });

      // Mostrar productos
      productos.forEach((producto) => {
        const marcaClase =
          "filter-" + producto.marca?.toLowerCase().replace(/\s+/g, "-");
        const productoHTML = `
            <div class="col-lg-6 col-md-6 portfolio-item isotope-item ${marcaClase}">
                <div class="portfolio-card">
                    <div class="portfolio-image">
                        <img src="img/store/${
                          producto.foto || "services-3.webp"
                        }"
                             class="img-fluid" alt="${producto.nombre}" 
                             onerror="this.src='img/product/services-3.webp'">
                        <div class="portfolio-overlay">
                            <div class="portfolio-actions">
                                <a href="${
                                  "img/store/" + producto.foto ||
                                  "img/services/services-1.webp"
                                }" 
                                   class="glightbox preview-link" >
                                   <i class="bi bi-eye"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="portfolio-content">
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion || "Sin descripción"}</p>
                        <small><i class="bi bi-tags"></i> Marca: ${
                          producto.marca
                        }</small><br>
                        <small><i class="bi bi-currency-dollar"></i> Precio: $${producto.precio.toFixed(
                          2
                        )}</small><br>
                        <small class="${
                          producto.estado ? "text-success" : "text-danger"
                        }">
                          ${producto.estado ? "Disponible" : "Agotado"}
                        </small>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", productoHTML);
      });

      if (typeof GLightbox !== "undefined") {
        GLightbox({
          selector: ".preview-link",
          touchNavigation: true,
          loop: true,
        });
      }

      if (typeof Isotope !== "undefined") {
        const iso = new Isotope(container, {
          itemSelector: ".portfolio-item",
          layoutMode: "fitRows",
          filter: "*",
        });

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
      console.error("Error cargando productos:", error);
      container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
                <p class="text-muted">Error al cargar los productos. Inténtalo nuevamente.</p>
                <button class="btn btn-primary mt-3" onclick="retryLoadProducts()">Reintentar</button>
            </div>`;
    });
}

// Función auxiliar para reintentar
function retryLoadProducts() {
  const idTienda = localStorage.getItem("idTienda");
  loadProducts(idTienda);
}

// Cuando la página cargue
window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  let idTienda = params.get("id");
  let elemento = document.getElementById("crearProducto");
  let elemento2 = document.getElementById("emprendedor");

  // Si no hay id en la URL, intenta usar localStorage
  if (localStorage.getItem("tipo") == 1) {
    elemento.style.visibility = "hidden";
    elemento2.style.visibility = "hidden";
  }
  if (!idTienda) {
    idTienda = localStorage.getItem("idTienda");
  } else {
    localStorage.setItem("idTienda", idTienda); // Guardar para uso futuro
  }

  loadProducts(idTienda);
};
