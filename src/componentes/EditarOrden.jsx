import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { NuevaOrden } from './nuevaOrden';

export default function EditarOrden() {
  const { ordenId } = useParams();
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState({
    items: [],
    mesa_id: null,
    estado: 'en_proceso'
  });
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales mejorado
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [
          { data: ordenData, error: ordenError },
          { data: itemsData, error: itemsError },
          { data: productosData, error: productosError },
          { data: mesasData, error: mesasError }
        ] = await Promise.all([
          supabase.from('ordenes').select('*').eq('orden_id', ordenId).single(),
          supabase.from('detalles_orden').select('*').eq('orden_id', ordenId),
          supabase.from('productos').select('*'),
          supabase.from('mesas').select('mesa_id, estado')
        ]);

        if (ordenError || itemsError || productosError || mesasError) {
          throw new Error(ordenError?.message || itemsError?.message || productosError?.message || mesasError?.message);
        }

        const itemsTransformados = itemsData.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.precio_unitario * item.cantidad
        }));

        setOriginalData({
          items: itemsTransformados,
          mesa_id: ordenData.mesa_id,
          estado: ordenData.estado
        });

        setInitialData({
          orden: {
            mesa_id: ordenData.mesa_id,
            estado: ordenData.estado,
            total: ordenData.total
          },
          items: itemsTransformados,
          productos: productosData,
          mesas: mesasData
        });

      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(`Error al cargar la orden: ${error.message}`);
        navigate('/orders', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, [ordenId, navigate]);

  // Manejo de actualización mejorado
  const handleSubmitEdit = async (items, orden) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validación de stock mejorada
      const stockUpdates = items.map(item => {
        const originalItem = originalData.items.find(oi => oi.producto_id === item.producto_id);
        const diferencia = item.cantidad - (originalItem?.cantidad || 0);
        return { producto_id: item.producto_id, diferencia };
      });

      const { error: stockError } = await supabase.rpc('verificar_stock', {
        cambios: stockUpdates
      });

      if (stockError) throw stockError;

      // Transacción de actualización
      const { error: updateError } = await supabase.rpc('actualizar_orden_completa', {
        orden_id: ordenId,
        items: items.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        })),
        nueva_mesa_id: orden.mesa_id
      });      

      if (updateError) throw updateError;

      navigate('/orders', { state: { success: '¡Orden actualizada correctamente!' } });
    } catch (error) {
      console.error('Error actualizando orden:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Cargando orden...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto mt-8">
        <p className="font-bold">Error:</p>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => navigate('/orders')}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Volver a órdenes
        </button>
      </div>
    );
  }

  return initialData ? (
    <NuevaOrden
      isEditing={true}
      ordenId={ordenId}
      onSubmit={handleSubmitEdit}
      initialItems={initialData.items}
      initialOrden={initialData.orden}
      productosIniciales={initialData.productos}
      mesasDisponibles={initialData.mesas.filter(m => 
        m.estado === 'disponible' || m.mesa_id === initialData.orden.mesa_id
      )}
    />
  ) : null;
}