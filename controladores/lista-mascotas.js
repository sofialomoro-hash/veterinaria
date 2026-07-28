// ==========================================
// 1. FUNCIONES DE ALMACENAMIENTO (LOCALSTORAGE)
// ==========================================
const obtenerMascotas = () => {
    return JSON.parse(localStorage.getItem('mascotas')) || [];
};

const guardarMascotas = (lista) => {
    localStorage.setItem('mascotas', JSON.stringify(lista));
};

const obtenerClientes = () => {
    return JSON.parse(localStorage.getItem('clientes')) || [];
};

// Función auxiliar segura para leer inputs sin error
const getValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
};


// ==========================================
// 2. CARGAR EL SELECT DE DUEÑOS DINÁMICAMENTE
// ==========================================
const cargarSelectDuenos = () => {
    const selectDueno = document.getElementById("dueno"); // <- Apunta exactamente a id="dueno" de tu HTML
    if (!selectDueno) return;

    const clientes = obtenerClientes();
    selectDueno.innerHTML = '<option value="">Seleccione un dueño...</option>';

    if (clientes.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "⚠️ No hay clientes registrados (¡Registrá uno primero!)";
        option.disabled = true;
        selectDueno.appendChild(option);
        return;
    }

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.dni; // Usamos el DNI como referencia del dueño
        option.textContent = `${cliente.nombre} (DNI: ${cliente.dni})`;
        selectDueno.appendChild(option);
    });
};


// Variable para controlar si estamos editando una mascota existente
let idMascotaEditando = null;


// ==========================================
// 3. RENDERIZAR Y MOSTRAR MASCOTAS EN LA TABLA
// ==========================================
const mostrarMascotas = () => {
    const tablaMascotas = document.getElementById("tabla-mascotas");
    if (!tablaMascotas) return;

    const mascotas = obtenerMascotas();
    const clientes = obtenerClientes();
    
    if (mascotas.length === 0) {
        tablaMascotas.innerHTML = `<tr><td colspan="6" style="text-align: center;">Aún no hay mascotas registradas.</td></tr>`;
        return;
    }

    tablaMascotas.innerHTML = "";
    
    mascotas.forEach(mascota => {
        // Buscar el nombre del cliente dueño usando su DNI
        const clienteDueno = clientes.find(c => String(c.dni) === String(mascota.dueno));
        const nombreDueno = clienteDueno ? clienteDueno.nombre : "Dueño no encontrado";

        tablaMascotas.innerHTML += `
            <tr>
                <td>${mascota.nombre}</td>
                <td>${nombreDueno}</td>
                <td>${mascota.especie}</td>
                <td>${mascota.raza || 'Sin raza'}</td>
                <td>${mascota.sexo}</td>
                <td>
                    <button class="btn-editar" data-id="${mascota.id}" style="margin-right: 5px;">Editar</button>
                    <button class="btn-eliminar" data-id="${mascota.id}">Eliminar</button>
                </td>
            </tr>
        `;
    });
};


// ==========================================
// 4. CAPTURAR EL FORMULARIO (ALTA Y EDICIÓN)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    cargarSelectDuenos();
    mostrarMascotas();

    const formMascota = document.getElementById("formulario-mascota");
    
    if (formMascota) {
        formMascota.addEventListener("submit", (e) => {
            e.preventDefault();

            // Capturar el sexo seleccionado de los radio buttons
            const sexoSeleccionado = document.querySelector('input[name="sexo"]:checked')?.value || "No especificado";

            const mascotaData = {
                id: idMascotaEditando ? idMascotaEditando : Date.now(), // ID único
                nombre: getValue("nombre"),
                dueno: getValue("dueno"),
                especie: getValue("especie"),
                raza: getValue("raza"),
                sexo: sexoSeleccionado,
                edad: getValue("edad"),
                salud: getValue("salud")
            };

            let mascotas = obtenerMascotas();

            if (idMascotaEditando) {
                // Modificar / Actualizar mascota existente
                mascotas = mascotas.map(m => m.id === idMascotaEditando ? mascotaData : m);
                idMascotaEditando = null;
                Swal.fire({
                    title: "¡Éxito!",
                    text: "¡Mascota modificada con éxito!",
                    icon: "success",
                    confirmButtonText: "Aceptar"
                });
            } else {
                // Alta de nueva mascota
                mascotas.push(mascotaData);
                Swal.fire({
                    title: "¡Éxito!",
                    text: "¡Mascota guardada con éxito!",
                    icon: "success",
                    confirmButtonText: "Aceptar"
                });
            }

            guardarMascotas(mascotas);
            formMascota.reset();
            mostrarMascotas();
        });
    }
});


// ==========================================
// 5. ELIMINAR Y EDITAR MASCOTAS (ACCIONES)
// ==========================================
const eliminarMascota = (id) => {
    let mascotas = obtenerMascotas();
    mascotas = mascotas.filter(m => m.id !== id);
    guardarMascotas(mascotas);
    mostrarMascotas();
};

const tablaMascotasElement = document.getElementById("tabla-mascotas");
if (tablaMascotasElement) {
    tablaMascotasElement.addEventListener("click", (e) => {
        // Si hace clic en Editar
        if (e.target.classList.contains("btn-editar")) {
            const id = Number(e.target.dataset.id);
            const mascotas = obtenerMascotas();
            const mascotaAEditar = mascotas.find(m => m.id === id);

            if (mascotaAEditar) {
                if (document.getElementById("nombre")) document.getElementById("nombre").value = mascotaAEditar.nombre;
                if (document.getElementById("dueno")) document.getElementById("dueno").value = mascotaAEditar.dueno;
                if (document.getElementById("especie")) document.getElementById("especie").value = mascotaAEditar.especie;
                if (document.getElementById("raza")) document.getElementById("raza").value = mascotaAEditar.raza;

                // Marcar el radio button correspondiente al sexo
                const radiosSexo = document.querySelectorAll('input[name="sexo"]');
                radiosSexo.forEach(radio => {
                    if (radio.value === mascotaAEditar.sexo) {
                        radio.checked = true;
                    }
                });

                if (document.getElementById("edad")) document.getElementById("edad").value = mascotaAEditar.edad;
                if (document.getElementById("salud")) document.getElementById("salud").value = mascotaAEditar.salud;

                idMascotaEditando = id; // Guardamos el ID en modo edición
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        
        // Si hace clic en Eliminar
        if (e.target.classList.contains("btn-eliminar")) {
            const id = Number(e.target.dataset.id);
            Swal.fire({
                title: "¿Estás segura?",
                text: "¿Querés eliminar esta mascota?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    eliminarMascota(id);
                    Swal.fire("¡Eliminado!", "La mascota ha sido eliminada.", "success");
                }
            });
        }
    });
}