// Local: http://127.0.0.1:8000/membresias
// Producción: URL de Render
const API = "https://ironfitness-michell-edwin-p0xm.onrender.com/membresias";

const contenedor = document.getElementById("contenedor");
const contador = document.getElementById("contador");
const tituloVista = document.getElementById("tituloVista");
const buscador = document.getElementById("buscador");
const modal = document.getElementById("seccion-formulario");
const camposForm = document.getElementById("camposForm");
const formSocio = document.getElementById("formSocio");
const inputImg = document.getElementById("imagen-url");
const preview = document.getElementById("preview");
const menu = document.getElementById("menu");

let socios = [];
let filtro = "todos";
let busqueda = "";

const titulos = {
  todos: "Todos los socios",
  activas: "Membresías activas",
  vencidas: "Membresías vencidas",
};

const SIN_IMAGEN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180"><rect width="100%" height="100%" fill="#2a2a33"/><text x="50%" y="50%" fill="#aaa" font-family="Arial" font-size="18" text-anchor="middle" dominant-baseline="middle">Sin Imagen</text></svg>'
  );

const moneda = (n) => "$" + Number(n).toLocaleString("es-CO");

const escapar = (t) =>
  String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Cargar datos ---------- */
async function cargar() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Error " + res.status);
    socios = await res.json();
    render();
  } catch (e) {
    console.error(e);
    contenedor.innerHTML = `<div class="vacio"><i class="fa-solid fa-triangle-exclamation"></i>
      <p>No se pudo conectar con la API. Espera un momento y recarga la página.</p></div>`;
  }
}

function actualizarStats() {
  const activas = socios.filter((s) => s.activa);
  const ingresos = activas.reduce((t, s) => t + Number(s.valor_mensual), 0);
  contador.textContent = `${socios.length} socios`;
  document.getElementById("statTotal").textContent = socios.length;
  document.getElementById("statActivas").textContent = activas.length;
  document.getElementById("statVencidas").textContent = socios.length - activas.length;
  document.getElementById("statIngresos").textContent = moneda(ingresos);
}

/* ---------- Render + filtros ---------- */
function render() {
  actualizarStats();
  tituloVista.textContent = titulos[filtro];

  let lista = socios;
  if (filtro === "activas") lista = lista.filter((s) => s.activa);
  if (filtro === "vencidas") lista = lista.filter((s) => !s.activa);
  if (busqueda) lista = lista.filter((s) => s.cliente.toLowerCase().includes(busqueda));

  if (lista.length === 0) {
    contenedor.innerHTML = `<div class="vacio"><i class="fa-solid fa-dumbbell"></i>
      <p>No hay socios para mostrar. Usa "Afiliar socio" para registrar el primero.</p></div>`;
    return;
  }

  contenedor.innerHTML = lista
    .map((s) => {
      const claseEstado = s.activa ? "activa" : "vencida";
      const clasePlan = s.plan.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return `
      <article class="card">
        <img class="card-img" src="${escapar(s.imagen_url)}" alt="${escapar(s.cliente)}"
             onerror="this.onerror=null;this.src=SIN_IMAGEN">
        <div class="card-top">
          <div class="avatar">${escapar(s.cliente.charAt(0).toUpperCase())}</div>
          <div>
            <h3>${escapar(s.cliente)}</h3>
            <small>Socio de Iron Fitness</small>
          </div>
        </div>
        <div class="card-body">
          <div class="fila">
            <span class="plan ${escapar(clasePlan)}">Plan ${escapar(s.plan)}</span>
            <span class="etiqueta ${claseEstado}">${s.activa ? "Activa" : "Vencida"}</span>
          </div>
          <div class="precio">${moneda(s.valor_mensual)} <small>/ mes</small></div>
        </div>
        <div class="acciones">
          <button class="btn ${s.activa ? "naranja" : "verde"}" onclick="cambiarEstado('${s._id}', ${!s.activa})">
            <i class="fa-solid fa-rotate"></i> ${s.activa ? "Vencer" : "Activar"}
          </button>
          <button class="btn rojo" onclick="eliminar('${s._id}')">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </div>
      </article>`;
    })
    .join("");
}

/* ---------- Guardar (POST) ---------- */
formSocio.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nuevo = {
    cliente: document.getElementById("cliente").value.trim(),
    plan: document.getElementById("plan").value,
    valor_mensual: parseFloat(document.getElementById("valor").value),
    activa: document.getElementById("estado").value === "true",
    imagen_url: inputImg.value.trim(),
  };
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });
    if (!res.ok) throw new Error("Error " + res.status);
    cerrarModal();
    cargar();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el socio. Revisa los datos e intenta de nuevo.");
  }
});

/* ---------- Cambiar estado (PUT) ---------- */
async function cambiarEstado(id, estado) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activa: estado }),
    });
    if (!res.ok) throw new Error("Error " + res.status);
    cargar();
  } catch (err) {
    console.error(err);
    alert("No se pudo cambiar el estado.");
  }
}

/* ---------- Eliminar (DELETE) ---------- */
async function eliminar(id) {
  if (!confirm("¿Eliminar este socio?")) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error " + res.status);
    cargar();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar el socio.");
  }
}

/* ---------- Filtros del navbar ---------- */
document.querySelectorAll("[data-filtro]").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    filtro = a.dataset.filtro;
    document.querySelectorAll(".menu [data-filtro]").forEach((x) => x.classList.remove("activo"));
    document.querySelector(`.menu [data-filtro="${filtro}"]`).classList.add("activo");
    menu.classList.remove("abierto");
    cerrarModal();
    render();
  });
});

buscador.addEventListener("input", () => {
  busqueda = buscador.value.trim().toLowerCase();
  render();
});

/* ---------- Control de vistas del formulario ---------- */
function abrirModal() {
  camposForm.disabled = false;
  modal.classList.add("abierto");
  modal.setAttribute("aria-hidden", "false");
  menu.classList.remove("abierto");
  document.getElementById("cliente").focus();
}

function cerrarModal() {
  formSocio.reset();
  preview.hidden = true;
  preview.removeAttribute("src");
  camposForm.disabled = true;
  modal.classList.remove("abierto");
  modal.setAttribute("aria-hidden", "true");
}

document.getElementById("btnAfiliar").addEventListener("click", (e) => {
  e.preventDefault();
  abrirModal();
});
document.getElementById("cerrarModal").addEventListener("click", cerrarModal);
document.getElementById("btnCancelar").addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarModal(); });

/* ---------- Vista previa de imagen ---------- */
inputImg.addEventListener("input", () => {
  const url = inputImg.value.trim();
  if (url) {
    preview.src = url;
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }
});
preview.addEventListener("error", () => { preview.hidden = true; });

/* ---------- Menú móvil ---------- */
document.getElementById("burger").addEventListener("click", () => menu.classList.toggle("abierto"));

/* ---------- Inicio ---------- */
document.addEventListener("DOMContentLoaded", () => {
  cerrarModal();
  cargar();
});