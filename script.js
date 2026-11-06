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
const fitroContinente = document.getElementById("filtroContinente");
const ordenarPais = document.getElementById("ordenarPais");

/*INFORMACION*/
const contenedorPais = document.getElementById("contenedorPaises");
const contenedorDetalles = document.getElementById("contenedorDetalles");
const contenedorFavoritos = document.getElementById("contenedorFavoritos");
const resultadosComparacion = document.getElementById("resultadosComparacion");

/*COMPARACION*/
const paisUno = document.getElementById("paisUno");
const paisDos = document.getElementById("paisDos");
const bRealizarComparacion = document.getElementById("bRealizarComparacion");

const bRegresarExplorar = document.getElementById("bRegresarExplorar");

/*VARIABLES*/
let paises = [];

let listaFavoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

let paisSeleccionado = null;

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
            paises = paises.concat(datos.data.objects);
            hayMasPaises = datos.data.meta.more;
            desplazamiento +=100;
        }

        console.log("Paises cargados:", paises.length);
        console.log("Lista de paises:", paises);

        document.getElementById("contadorPaises").textContent = `Paises encontrados: ${paises.length}`;
        mostrarPaises(paises);
    
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
    lista.forEach(pais => 
    {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjetaPais");
        const capital = pais.capitals?.[0] || "Sin capital registrada";

        tarjeta.innerHTML = `<div class="banderaEmoji">${pais.flag?.emoji || ""}</div>
        <h3>${pais.names.common}</h3>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Continente:</strong> ${pais.region || "No disponible"}</p>
        <p><strong>Población:</strong> ${pais.population.toLocaleString("es-MX")}</p>
        `;
        

        contenedorPais.appendChild(tarjeta);
    });
 }

 /*INICIO*/
 cargarPaises();