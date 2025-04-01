// EditarOrden.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import NuevaOrden from './NuevaOrden';

export default function EditarOrden() {
  const { ordenId } = useParams();
  const navigate = useNavigate();
  const [originalItems, setOriginalItems] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Cargar datos de la orden existente
  useEffect(() => {
    const cargarOrdenExistente = async () => {
      try {
        const [
          { data: ordenData, error: ordenError },
          { data: itemsData, error: itemsError }
        ] = await Promise.all([
          supabase.from('ordenes').select('*').eq('orden_id', ordenId).single(),
          supabase.from('detalles_orden').select('producto_id, cantidad, precio_unitario').eq('orden_id', ordenId)
        ]);

        if (ordenError) throw ordenError;
        if (itemsError) throw itemsError;

        const itemsTransformados = itemsData.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario, // Usar el nombre correcto de columna
            subtotal: item.precio_unitario * item.cantidad
          }));

        setOriginalItems(itemsTransformados);
        setInitialDataLoaded(true);

        return {
          orden: {
            mesa_id: ordenData.mesa_id,
            usuario_id: ordenData.usuario_id,
            estado: 'en_proceso', // Resetear estado para edición
            total: ordenData.total
          },
          items: itemsTransformados
        };

      } catch (error) {
        console.error('Error cargando orden:', error);
        navigate('/orders', { replace: true });
        return null;
      }
    };

    cargarOrdenExistente();
  }, [ordenId, navigate]);

  // Sobreescribir handleSubmit para actualización
  const handleSubmitEdit = async (items, orden) => {
    try {
      // Validar stock
      const stockUpdates = await Promise.all(
        items.map(async (item) => {
          const originalItem = originalItems.find(oi => oi.producto_id === item.producto_id);
          const producto = this.props.productos.find(p => p.producto_id === item.producto_id);
          
          const cantidadOriginal = originalItem ? originalItem.cantidad : 0;
          const diferencia = item.cantidad - cantidadOriginal;
          
          if (diferencia > producto.stock) {
            throw new Error(`Stock insuficiente para ${producto.nombre}. Necesitas ${diferencia}, disponible: ${producto.stock}`);
          }
          
          return { producto_id: item.producto_id, diferencia };
        })
      );

      // Actualizar orden
      const { error: ordenError } = await supabase
        .from('ordenes')
        .update({
          mesa_id: orden.mesa_id,
          total: orden.total,
          estado: 'en_proceso'
        })
        .eq('orden_id', ordenId);

      if (ordenError) throw ordenError;

 // Al eliminar los items anteriores:
await supabase
.from('detalles_orden')
.delete()
.eq('orden_id', ordenId);
      
      // Al insertar los nuevos items:
const { error: itemsError } = await supabase
.from('detalles_orden')
.insert(items.map(item => ({
  orden_id: ordenId,
  producto_id: item.producto_id,
  cantidad: item.cantidad,
  precio_unitario: item.precio_unitario // Nombre de columna correcto
})));


      if (itemsError) throw itemsError;

      // Actualizar stock
      await Promise.all(
        stockUpdates.map(async ({ producto_id, diferencia }) => {
          if (diferencia !== 0) {
            const { error } = await supabase.rpc('ajustar_stock', {
              producto_id,
              cantidad: -diferencia
            });
            if (error) throw error;
          }
        })
      );

      navigate('/orders');
      return true;
    } catch (error) {
      console.error('Error actualizando orden:', error);
      return error.message;
    }
  };

  if (!initialDataLoaded) return <div>Cargando orden...</div>;

  return (
    <NuevaOrden
      isEditing={true}
      ordenId={ordenId}
      onSubmit={handleSubmitEdit}
      initialItems={originalItems}
    />
  );
}