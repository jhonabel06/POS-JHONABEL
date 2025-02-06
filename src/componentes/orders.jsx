import OrdersComponent from './ordersComponent';

const Orders = () => {

  const orders = [{
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
  }
];
      // Aquí iría tu lógica para obtener las órdenes (useState + useEffect o API fetch)
    // const orders = []; // Tus órdenes reales vendrían aquí
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <OrdersComponent orders={orders} />
      </div>
    );
  };
export default Orders;