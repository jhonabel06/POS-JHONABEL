import OrdersComponent from './ordersComponent';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import InvoiceModal from './InvoiceModal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('ordenes')
        .select(`
          orden_id,
          mesa_id,
          estado,
          total,
          fecha_creacion,
          detalles_orden (
            detalle_orden_id,
            cantidad,
            precio_unitario,
            subtotal,
            productos:producto_id (nombre,imagen_url)
          )
        `)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      // Mapear datos a la estructura que espera el componente
      const formattedOrders = data.map(order => ({
        orden_id: order.orden_id,
        estado: order.estado,
        total: order.total,
        fecha_creacion: order.fecha_creacion,
        mesa_id: order.mesa_id,
        detalles: order.detalles_orden.map(detail => ({
          detalle_orden_id: detail.detalle_orden_id,
          cantidad: detail.cantidad,
          precio_unitario: detail.precio_unitario,
          subtotal: detail.subtotal,
          producto: {
            producto_id: detail.productos.producto_id,
            nombre: detail.productos.nombre,
            imagen: detail.productos.imagen_url,
            precio: detail.precio_unitario
          }
        }))
      }));
      setOrders(formattedOrders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Actualizar estado en Supabase y localmente
  const handleCompleteOrder = async (orderId) => {
    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('ordenes')
        .update({ estado: 'listo' })
        .eq('orden_id', orderId);

      if (error) throw error;

      // Actualizar estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orden_id === orderId 
            ? { ...order, estado: 'listo' } 
            : order
        )
      );
    } catch (err) {
      console.error('Error al completar orden:', err);
      setError(err.message);
    }
  };

  // Función para manejar el pago
  const handlePaymentOrder = async (orderId) => {
    try {
      const {dataOrder,error:errorTotal} = await supabase
      .from('ordenes')
      .select(`
      orden_id,
      total
    `)
    .eq('orden_id', orderId)
    .single(); // Usamos .single() porque esperamos un solo resultado
    if (errorTotal) {
      console.error('Error obteniendo Total de la orden:', errorTotal);
      return;
    }
    if (!data) {
      console.error('No se encontró Total para el orderId:', orderId);
      return;
    }


      const {dataInsert, error: insertError} = await supabase
      .from('pagos')
      .insert(
      [
        {
          orden_id: orderId,
          metodo_pago: 'efectivo',
          total: parseFloat(dataOrder.total.toFixed(2)) 
        }
      ]);
      setLoading(false);

      if (insertError) {
        console.error('Error insertando pago:', insertError);
        alert('Error al registrar el pago');
      } else {
        console.log('Pago registrado:', dataInsert);
        alert('Pago registrado exitosamente');
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from('ordenes')
        .update({ estado: 'pagado' })
        .eq('orden_id', orderId);

      if (error) throw error;

      // Actualizar estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orden_id === orderId 
            ? { ...order, estado: 'pagado' } 
            : order
        )
      );

      // Actualizar estado de mesa
      const { data, error: selectError } = await supabase
        .from('ordenes')
        .select('mesa_id')
        .eq('orden_id', orderId)
        .single(); // Usamos .single() porque esperamos un solo resultado
        if (selectError) {
          console.error('Error obteniendo mesa_id:', selectError);
          return;
        }
        if (!data) {
          console.error('No se encontró una mesa para el orderId:', orderId);
          return;
        }
        // Ahora actualizamos el estado de la mesa
        const { error: updateError } = await supabase
          .from('mesas')
          .update({ estado: 'disponible' })
          .eq('mesa_id', data.mesa_id);
        if (updateError) {
          console.error('Error actualizando el estado de la mesa:', updateError);
        }
        else {
          console.log('Mesa actualizada correctamente');
        }

    } catch (err) {
      console.error('Error al completar orden:', err);
      setError(err.message);
    }



  };

  // Función para manejar la generación de factura
  const handleGenerateInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };
  //Funcion para reimprimir la factura
  const handleReimprimirInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };
// función para manejar el evento onAfterPrint
  const handleAfterPrint = async (orderId) => {
    try {
      const { error } = await supabase
        .from('ordenes')
        .update({ estado: 'pendiente' })
        .eq('orden_id', orderId);

      if (error) throw error;

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orden_id === orderId 
            ? { ...order, estado: 'pendiente' } 
            : order
        )
      );
      setShowInvoice(false);
    } catch (err) {
      console.error('Error al actualizar estado después de imprimir:', err);
      setError(err.message);
      // Actualizar estado de mesa
    }
    try {
      const { data, error: selectError } = await supabase
      .from('ordenes')
      .select('mesa_id')
      .eq('orden_id', orderId)
      .single(); // Usamos .single() porque esperamos un solo resultado
    
    if (selectError) {
      console.error('Error obteniendo mesa_id:', selectError);
      return;
    }
    
    if (!data) {
      console.error('No se encontró una mesa para el orderId:', orderId);
      return;
    }
    
    // Ahora actualizamos el estado de la mesa
    const { error: updateError } = await supabase
      .from('mesas')
      .update({ estado: 'pendiente_pago' })
      .eq('mesa_id', data.mesa_id);
    
    if (updateError) {
      console.error('Error actualizando el estado de la mesa:', updateError);
    } else {
      console.log('Mesa actualizada correctamente');
    }
        

      if (error) throw error;
      setShowInvoice(false);
    } catch (err) {
      console.error('Problema con la mesa:', err);
      setError(err.message);
    }


  }; 

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-gray-500">Cargando datos...</div>
      </div>
    );
  }
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <OrdersComponent 
        orders={orders} 
        onCompleteOrder={handleCompleteOrder}// Pasamos la función como prop
        onPaymentOrder={handlePaymentOrder}// Pasamos la función como prop
        onGenerateInvoice={handleGenerateInvoice}// Pasamos la función como prop
        onReimprimirInvoice={handleReimprimirInvoice}// Pasamos la función como prop
      />
      
      {showInvoice && selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          onClose={() => setShowInvoice(false)}
          onAfterPrint={handleAfterPrint}// Pasamos la función como prop
        />
      )}
    </div>
  );
};

export default Orders;