import { Producto } from './producto.model.js';

export const CANTIDAD_DATOS_PRUEBA = 10_000;

// Generador determinista (LCG): mismos precios en cada arranque, para poder comparar resultados.
function generarProductos(cantidad: number): Producto[] {
  let semilla = 42;
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296;
    return semilla / 4294967296;
  };

  return Array.from({ length: cantidad }, (_, i) => ({
    id: i + 1,
    nombre: `Producto de prueba ${i + 1}`,
    precio: Math.round((1 + siguiente() * 4999) * 100) / 100,
  }));
}

export const DATOS_PRUEBA: Producto[] = generarProductos(CANTIDAD_DATOS_PRUEBA);
