// En tu archivo ../tipos
export interface Producto { // <-- Añade export
    producto_id: number;
    nombre: string;
    imagen: string;
    precio: number;
}
  
export interface DetalleOrden { // <-- Añade export
    detalle_orden_id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    producto: Producto;
}
  
export interface OrdenConDetalles { // <-- Añade export
    orden_id: number;
    estado: 'pendiente' | 'en_proceso' | 'listo' | 'pagado';
    total: number;
    fecha_creacion: string;
    cliente_id?: number | null;
    mesa_id?: number | null;
    detalles: DetalleOrden[];
}
