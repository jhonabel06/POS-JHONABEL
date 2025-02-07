import OrdersComponent from './ordersComponent';
import { useState } from 'react'; // Importar useState

const Orders = () => {
  // Convertir las órdenes a estado para poder modificarlas
  const [orders, setOrders] = useState([{
    orden_id: 1,
    estado: 'en_proceso',
    total: 45.50,
    fecha_creacion: '2024-02-20T15:30:00Z',
    mesa_id: 5,
    detalles: [{
      detalle_orden_id: 1,
      cantidad: 2,
      precio_unitario: 10.00,
      subtotal: 20.00,
      producto: {
        producto_id: 1,
        nombre: 'Hamburguesa Clásica',
        imagen: '/src/utilidades/hamburguesa.jpg',
        precio: 10.00
      }
    }]
  },
  {
    orden_id: 2, // Cambiado a 2 para ID único
    estado: 'en_proceso',
    total: 45.50,
    fecha_creacion: '2024-02-20T15:30:00Z',
    mesa_id: 5,
    detalles: [{
      detalle_orden_id: 1,
      cantidad: 2,
      precio_unitario: 10.00,
      subtotal: 20.00,
      producto: {
        producto_id: 1,
        nombre: 'Hamburguesa Clásica',
        imagen: '/src/utilidades/hamburguesa.jpg',
        precio: 10.00
      }
    }]
  }]);

  // Función para marcar una orden como completada
  const handleCompleteOrder = (orderId) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orden_id === orderId 
          ? { ...order, estado: 'completado' } 
          : order
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <OrdersComponent 
        orders={orders} 
        onCompleteOrder={handleCompleteOrder} // Pasamos la función como prop
      />
    </div>
  );
};

export default Orders;