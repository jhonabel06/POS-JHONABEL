import PropTypes from 'prop-types';
import { PlusIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';


const OrdersComponent = ({ 
  orders, 
  onCompleteOrder, 
  onPaymentOrder, 
  onGenerateInvoice , 
  onReimprimirInvoice 
}) => {
  const navigate = useNavigate(); // Añadir hook de navegación
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Órdenes Recientes</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Link to="/dashboard" className="btn-primary flex items-center px-4 py-2 rounded-4xl hover:bg-teal-400">
            <HomeIcon className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link to="/nueva-orden" className="btn-secondary flex items-center px-4 py-2 rounded-4xl hover:bg-teal-400">
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Orden
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        {orders
          .filter((orden) => orden.estado.toLowerCase() !== 'pagado')
          .map((orden) => (
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
                
                {orden.estado === 'listo' && (
                  <button
                  onClick={() => navigate(`/nueva-orden/${orden.orden_id}`)} // modificar orden
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Modifica Orden
                  </button>
                )}
                {orden.estado === 'listo' && (
                  <button
                    onClick={() => onGenerateInvoice(orden)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Generar factura
                  </button>
                )}
                {orden.estado === 'pendiente' && (
                  <button
                    onClick={() => onReimprimirInvoice(orden)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Re-imprimir
                  </button>
                )}
                {orden.estado === 'pendiente' && (
                  <button
                    onClick={() => onPaymentOrder(orden.orden_id)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Pagar
                  </button>
                )}
              </div>
              <div className="border-t border-b border-gray-200 py-4">
                {orden.detalles.map((detalle) => (
                  <div key={detalle.detalle_orden_id} className="flex items-center py-2">
                    {detalle.producto.imagen ? (
                      <img
                        src={detalle.producto.imagen}
                        alt={detalle.producto.nombre}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="ml-4 flex-1">
                      <h3 className="text-gray-800 font-medium">{detalle.producto.nombre}</h3>
                      <p className="text-sm text-gray-500">{detalle.cantidad} x ${detalle.precio_unitario.toFixed(2)}</p>
                    </div>
                    <p className="text-gray-700">${detalle.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

OrdersComponent.propTypes = {
  orders: PropTypes.array.isRequired,
  onCompleteOrder: PropTypes.func.isRequired,
  onPaymentOrder: PropTypes.func.isRequired,
  onGenerateInvoice: PropTypes.func.isRequired,
  onReimprimirInvoice: PropTypes.func.isRequired,
};

export default OrdersComponent;