/*OBTENER LOS ELEMENTOS DEL HTML*/
const explorar = document.getElementById("explorar");
const detallesPais = document.getElementById("detallesPais");
const favoritos = document.getElementById("favoritos");
const comparar = document.getElementById("comparar");

/*NAVEGACION*/
const bExplorar = document.getElementById("bExplorar");
const bFavoritos = document.getElementById("bFavoritos");
const bComparar = document.getElementById("bComparar");

/* BUSQUEDA Y FILTROS*/
const buscarPais = document.getElementById("buscarPais");
const filtroContinente = document.getElementById("filtroContinente");
const ordenarPaises = document.getElementById("ordenarPaises");

/*INFORMACION*/
const contenedorPais = document.getElementById("contenedorPaises");
const contenedorDetalles = document.getElementById("contenedorDetalles");
const contenedorFavoritos = document.getElementById("contenedorFavoritos");
const resultadoComparacion = document.getElementById("resultadoComparacion");

/*COMPARACION*/
const paisUno = document.getElementById("paisUno");
const paisDos = document.getElementById("paisDos");
const bRealizarComparacion = document.getElementById("bRealizarComparacion");

const bRegresarExplorar = document.getElementById("bRegresarExplorar");

/*VARIABLES*/
let paises = [];

let listaFavoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

let paisSeleccionado = null;

let visitaAnterior = null;

/* PRUEBA DE CONEXION CON REST COUNTRIES */
 const API_URL = "https://api.restcountries.com/countries/v5";
 const API_KEY = "rc_live_332760f626dc4f078993c2a852228a0a";

 async function cargarPaises ()
 {
    try 
    {
        let desplazamiento = 0;
        let hayMasPaises = true;
        while (hayMasPaises)
        {
            const respuesta = await fetch
            (
            `${API_URL}?limit=100&offset=${desplazamiento}`,
                {
                    headers:
                    {
                        "Authorization": `Bearer ${API_KEY}`
                    }
                }
            );

            if (!respuesta.ok)
            {
                throw new Error("No pudieron obtenerse los paises");
            }

            const datos = await respuesta.json();

            /*PARA VER ERRORES PORQUE NO FUNCIONA*/
            console.log("Paises recibidos:", datos.data.objects.length);
            console.log("¿Hay mas paises", datos.data.meta.more);

            paises = paises.concat(datos.data.objects);
            hayMasPaises = datos.data.meta.more;
            desplazamiento +=100;
        }

        console.log("Paises cargados:", paises.length);

        document.getElementById("contadorPaises").textContent = `Paises encontrados: ${paises.length}`;
        filtrarPaises();
    
    } catch (error)
    {
        console.error("Error al cargar los paises:", error);
        contenedorPais.innerHTML = "<p>No se pudieron cargar los paises</p>";
    }
 }

 /*MOSTRAR PAISES*/
 function mostrarPaises (lista)
 {
    contenedorPais.innerHTML = "";
    if (lista.length === 0)
    {
        contenedorPais.innerHTML = "<p>No se encontraron paises.</p>";
        return;
    }

    lista.forEach(pais => 
    {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjetaPais");

        const capital = pais.capitals?.[0]?.name || "Sin capital registrada";
        const bandera = pais.flag?.url_png || "";
        const nombre = pais.names.common;

        tarjeta.innerHTML = `<img src="${bandera}" class="banderaPais">
         <h3>${nombre}</h3>
        
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Continente:</strong> ${pais.region || "No disponible"}</p>
        <p><strong>Población:</strong> ${pais.population.toLocaleString("es-MX")}</p>

        <button class="bVerDetalles">Ver detalles</button>
        <button class="bFavorito">Agregar a favoritos</button>
        `;

        /*ABRIR DETALLE*/
        tarjeta.querySelector(".bVerDetalles").addEventListener("click", () =>
        {
            mostrarDetalles(pais);
        });

        /*FAVORITO*/
        tarjeta.querySelector(".bFavorito").addEventListener("click", () =>
        {
            agregarFavorito(pais);
        });

        contenedorPais.appendChild(tarjeta);
    });
 }

 /*FAVORITOS*/
 function agregarFavorito(pais)
 {
    const codigo = pais.codes?.alpha_2;

    if(!codigo)
    {
        alert("No pudo identificarse el pais");
        console.error("Pais sin codigo", pais);
        return;
    }

    const existe = listaFavoritos.includes(codigo);
    if (existe)
    {
        
        alert("Este pais ya esta en favoritos");
        return;
    }

        listaFavoritos.push(codigo);
        localStorage.setItem("favoritos", JSON.stringify(listaFavoritos));
        alert("¡Agregado a favoritos correctamente");
    

    console.log("Favortios guardados", listaFavoritos);
 }

 /*ELIMINAR DE FAVORITOS1*/
 function eliminarFavorito(pais)
 {
    const codigo = pais.codes.alpha_2;
    listaFavoritos = listaFavoritos.filter(c => c !== codigo);
    localStorage.setItem("favoritos", JSON.stringify(listaFavoritos));
    alert("Pais eliminado de favoritos correctamente");
 }

 function mostrarFavoritos()
 {
    contenedorFavoritos.innerHTML = "";

    const paisesFavoritos = paises.filter(pais => listaFavoritos.includes(pais.codes.alpha_2));

    if (paisesFavoritos.length === 0)
    {
        contenedorFavoritos.innerHTML = "<p>No has agregado paises favoritos.</p>";
        return;
    }

    paisesFavoritos.forEach(pais =>
    {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjetaPais");

        const capital = pais.capitals?.[0]?.name || "No hay capital registrada";

        tarjeta.innerHTML = `<img src="${pais.flag?.url_png || ""}" class="banderaPais">
        
        <h3>${pais.names.common}</h3>
        <p><strong>Capital:</strong> ${capital}</p>

        <button class="bVerDetalles">Ver detalles</button>
        <button class="bEliminarFavorito">Eliminar favorito</button>`;
        
        tarjeta.querySelector(".bVerDetalles").addEventListener("click", () =>
            {
                mostrarDetalles(pais);
            });

            tarjeta.querySelector(".bEliminarFavorito").addEventListener("click", () =>
            {
                eliminarFavorito(pais);
                mostrarFavoritos();
            });

            contenedorFavoritos.appendChild(tarjeta);
    });
 }

 /*BUSQUEDA, FILTRO Y ORDENAMIENTM*/
 function filtrarPaises()
 {
    const texto = buscarPais.value.toLowerCase().trim();
    const continente = filtroContinente.value;

    /*CHECAR ERRORES*/
    console.log("Total de paises cargados:", paises.length);
    console.log("Texto de busqueda:", texto);
    console.log("Continente seleccionado:", continente);

    let resultado = paises.filter(pais =>
    {
        const nombre = pais.names.common.toLowerCase();
        const coincideNombre = nombre.includes(texto);
        const coincideContinente = continente === "Todos" || pais.region === continente;
        return coincideNombre && coincideContinente;
    });

    /*POR LETRA*/
    if (ordenarPaises.value === "az")
    {
        resultado.sort((a,b) => a.names.common.localeCompare(b.names.common));
    }
    else
    {
        resultado.sort((a,b) => b.names.common.localeCompare(a.names.common));
    }

    /*ACTUALIZAR CONTADOR*/
    document.getElementById("contadorPaises").textContent = `Paises encontrados: ${resultado.length}`;

    mostrarPaises(resultado);
 }

 buscarPais.addEventListener("input", filtrarPaises);
 filtroContinente.addEventListener("change", filtrarPaises);
 ordenarPaises.addEventListener("change", filtrarPaises);

 /*DETALLES DE PAIS*/
 function mostrarDetalles(pais)
 {

    if(!explorar.hidden)
    {
        visitaAnterior = "explorar";
    }

    else if (!favoritos.hidden)
    {
        visitaAnterior = "favoritos";
    }

    if (visitaAnterior === "favoritos")
    {
        bRegresarExplorar.textContent = "Regresar a favoritos";
    }
    else
    {
        bRegresarExplorar.textContent = "Regresar a explorar";
    }

    paisSeleccionado = pais;

    explorar.hidden = true;
    favoritos.hidden = true;
    comparar.hidden = true;
    detallesPais.hidden = false;

    const capital = pais.capitals?.[0]?.name || "No disponible";
    const moneda = pais.currencies?.map(m => m.name).join(", ") || "No disponible";
    const idiomas = pais.languages?.map(i => i.name).join(", ") || "No disponible";
    const bandera = pais.flag?.url_png || "";

    contenedorDetalles.innerHTML = `<div class="detallePais">
    <img src="${bandera}">
    <h2>${pais.names.common}</h2>
    <p><strong>Nombre oficial:</strong> ${pais.names.official}</p>
    <p><strong>Capital:</strong> ${capital}</p>
    <p><strong>Continente:</strong> ${pais.region}</p>
    <p><strong>Poblacion:</strong> ${pais.population.toLocaleString("es-MX")}</p>
    <p><strong>Superficie:</strong> ${pais.area?.kilometers?.toLocaleString("es-MX") || "No disponible"} km2</p>
    <p><strong>Moneda:</strong> ${moneda}</p>
    <p><strong>Idioma:</strong> ${idiomas}</p>
    <p><strong>Zonas horarias:</strong> ${pais.timezones?.join(", ") || "No disponible"}</p>
    </div>
    `;

    window.scrollTo(0, 0);
}

/*ACTUALIZAR*/
function actualizarBotonActivo(boton)
{
    bExplorar.classList.remove("activo");
    bFavoritos.classList.remove("activo");
    bComparar.classList.remove("activo");
    boton.classList.add("activo");
}

/*REGRESAR*/
bRegresarExplorar.addEventListener("click", () => 
{
    detallesPais.hidden = true;

    if(visitaAnterior === "favoritos")
    {
        explorar.hidden = true;
        favoritos.hidden = false;
        comparar.hidden = true;
        
        actualizarBotonActivo(bFavoritos);
        mostrarFavoritos();
    }

    else
    {
        explorar.hidden = false;
        favoritos.hidden = true;
        comparar.hidden = true;

        actualizarBotonActivo(bExplorar);
        filtrarPaises();
    }

    window.scrollTo(0, 0);
});

/*EXPLORAR*/
bExplorar.addEventListener("click", () =>
{
    explorar.hidden = false;
    detallesPais.hidden = true;
    favoritos.hidden = true;
    comparar.hidden = true;

    actualizarBotonActivo(bExplorar);

    filtrarPaises();
    window.scrollTo(0, 0);
});

/*FAVORITOS*/
bFavoritos.addEventListener("click", () => 
{
    explorar.hidden = true;
    detallesPais.hidden = true;
    favoritos.hidden = false;
    comparar.hidden = true;

    actualizarBotonActivo(bFavoritos);

    mostrarFavoritos();
    window.scrollTo(0, 0);
});

 /*INICIO*/
 cargarPaises();