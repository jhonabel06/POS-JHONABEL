import OrdersComponent from './OrdersComponent';
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
    }
  }; 

  if (loading) return <div>Cargando órdenes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <OrdersComponent 
        orders={orders} 
        onCompleteOrder={handleCompleteOrder}// Pasamos la función como prop
        onPaymentOrder={handlePaymentOrder}// Pasamos la función como prop
        onGenerateInvoice={handleGenerateInvoice}// Pasamos la función como prop
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