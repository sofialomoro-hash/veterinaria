// ==========================================
// 1. FUNCIONES DE ALMACENAMIENTO (LOCALSTORAGE)
// ==========================================
const obtenerClientes = () => {
    return JSON.parse(localStorage.getItem('clientes')) || [];
};

const guardarClientes = (lista) => {
    localStorage.setItem('clientes', JSON.stringify(lista));
};

// Función auxiliar segura para leer inputs sin error
const getValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
};


// ==========================================
// 2. RENDERIZAR Y MOSTRAR CLIENTES EN LA TABLA
// ==========================================
const mostrarClientes = () => {
    const tablaClientes = document.getElementById("tabla-clientes");
    if (!tablaClientes) return;

    const clientes = obtenerClientes();
    
    if (clientes.length === 0) {
        tablaClientes.innerHTML = `<tr><td colspan="5" style="text-align: center;">Aún no hay clientes registrados.</td></tr>`;
        return;
    }

    tablaClientes.innerHTML = "";
    
    clientes.forEach(cliente => {
        tablaClientes.innerHTML += `
            <tr>
                <td>${cliente.dni}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.direccion}</td>
                <td>
                    <button class="btn-editar" data-dni="${cliente.dni}" style="margin-right: 5px;">Editar</button>
                    <button class="btn-eliminar" data-dni="${cliente.dni}">Eliminar</button>
                </td>
            </tr>
        `;
    });
};


// ==========================================
// 3. CAPTURAR EL FORMULARIO (ALTA DE CLIENTES)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const formCliente = document.getElementById("form-cliente");
    
    if (formCliente) {
        formCliente.addEventListener("submit", (e) => {
            e.preventDefault();

            const clienteNuevo = {
                dni: Number(getValue("dni")),
                nombre: getValue("nombre"),
                direccion: getValue("direccion"),
                telefono: getValue("telefono"),
                email: getValue("email"),
                localidad: getValue("localidad"),
                provincia: getValue("provincia"),
                observaciones: getValue("observaciones")
            };

            const clientes = obtenerClientes();
            const existe = clientes.some(c => Number(c.dni) === Number(clienteNuevo.dni));
            
            if (existe) {
                Swal.fire({
                    title: "Atención",
                    text: "Ya existe un cliente con ese DNI.",
                    icon: "warning",
                    confirmButtonText: "Aceptar"
                });
                return;
            }

            clientes.push(clienteNuevo);
            guardarClientes(clientes);
            
            Swal.fire({
                title: "¡Éxito!",
                text: "¡Cliente guardado con éxito!",
                icon: "success",
                confirmButtonText: "Aceptar"
            });

            formCliente.reset();
            mostrarClientes(); // Actualiza la tabla automáticamente
        });
    }

    // Dibujar la tabla apenas carga la vista
    mostrarClientes();
});


// ==========================================
// 4. ELIMINAR CLIENTES (BAJA)
// ==========================================
const eliminarCliente = (dni) => {
    let clientes = obtenerClientes();
    clientes = clientes.filter(c => Number(c.dni) !== Number(dni));
    guardarClientes(clientes);
    mostrarClientes();
};


// ==========================================
// 5. GESTIÓN DE ACCIONES (EDITAR Y ELIMINAR)
// ==========================================
const tablaClientesElement = document.getElementById("tabla-clientes");
if (tablaClientesElement) {
    tablaClientesElement.addEventListener("click", (e) => {
        // Si hace clic en Editar
        if (e.target.classList.contains("btn-editar")) {
            const dni = Number(e.target.dataset.dni);
            const clientes = obtenerClientes();
            const clienteAEditar = clientes.find(c => Number(c.dni) === dni);

            if (clienteAEditar) {
                if (document.getElementById("dni")) document.getElementById("dni").value = clienteAEditar.dni;
                if (document.getElementById("nombre")) document.getElementById("nombre").value = clienteAEditar.nombre;
                if (document.getElementById("direccion")) document.getElementById("direccion").value = clienteAEditar.direccion;
                if (document.getElementById("telefono")) document.getElementById("telefono").value = clienteAEditar.telefono;
                if (document.getElementById("email")) document.getElementById("email").value = clienteAEditar.email;
                if (document.getElementById("localidad")) document.getElementById("localidad").value = clienteAEditar.localidad || "";
                if (document.getElementById("provincia")) document.getElementById("provincia").value = clienteAEditar.provincia || "";
                if (document.getElementById("observaciones")) document.getElementById("observaciones").value = clienteAEditar.observaciones || "";

                let clientesActualizados = clientes.filter(c => Number(c.dni) !== dni);
                guardarClientes(clientesActualizados);
                mostrarClientes();
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        
        // Si hace clic en Eliminar
        if (e.target.classList.contains("btn-eliminar")) {
            const dni = Number(e.target.dataset.dni);
            Swal.fire({
                title: "¿Estás segura?",
                text: "¿Querés eliminar este cliente?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    eliminarCliente(dni);
                    Swal.fire("¡Eliminado!", "El cliente ha sido eliminado.", "success");
                }
            });
        }
    });
}