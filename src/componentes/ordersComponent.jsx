import PropTypes from 'prop-types';

const OrdersComponent = ({ orders,onCompleteOrder }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'listo':
        return 'bg-green-100 text-green-800';
      case 'pagado':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Órdenes Recientes</h1>
      <div className="space-y-4">
        {orders.map((orden) => (
          <div key={orden.orden_id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="mb-2 sm:mb-0">
                <h2 className="text-lg font-semibold text-gray-700">
                  Orden #{orden.orden_id}
                  {orden.mesa_id && ` · Mesa ${orden.mesa_id}`}
                  {orden.cliente_id && ` · Cliente ${orden.cliente_id}`}
                </h2>
                <p className="text-sm text-gray-500">{formatDate(orden.fecha_creacion)}</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orden.estado)}`}>
                {orden.estado.replace('_', ' ').toUpperCase()}
              </span>
              {orden.estado === 'en_proceso' && (
                  <button
                    onClick={() => onCompleteOrder(orden.orden_id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Completar
                  </button>
                  )}
            </div>
            <div className="border-t border-b border-gray-200 py-4">
              {orden.detalles.map((detalle) => (
                <div key={detalle.detalle_orden_id} className="flex items-center py-2">
                  <img src={detalle.producto.imagen} alt={detalle.producto.nombre} className="w-16 h-16 object-cover rounded-md" />
                  <div className="ml-4 flex-1">
                    <h3 className="text-gray-800 font-medium">{detalle.producto.nombre}</h3>
                    <p className="text-sm text-gray-500">{detalle.cantidad} x ${detalle.precio_unitario.toFixed(2)}</p>
                  </div>
                  <p className="text-gray-700">${detalle.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end items-center pt-4">
              <p className="text-lg font-semibold text-gray-800">Total: ${orden.total.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

OrdersComponent.propTypes = {
  orders: PropTypes.array.isRequired,
  onCompleteOrder: PropTypes.func.isRequired, // Prop añadida
};

export default OrdersComponent;
