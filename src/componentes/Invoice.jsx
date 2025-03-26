import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Receipt } from 'lucide-react';

const Invoice = forwardRef(({ order }, ref) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div ref={ref} className="invoice-container bg-white p-8 max-w-2xl mx-auto print:p-0 print:max-w-none">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Receipt className="w-12 h-12 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Factura</h1>
        <p className="text-gray-600">Restaurante Example</p>
      </div>

      {/* Información de la orden */}
      <div className="mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Número de Orden:</p>
            <p className="font-semibold">#{order.orden_id}</p>
          </div>
          {order.mesa_id && (
            <div>
              <p className="text-gray-600">Mesa:</p>
              <p className="font-semibold">{order.mesa_id}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">Fecha:</p>
            <p className="font-semibold">{formatDate(order.fecha_creacion)}</p>
          </div>
        </div>
      </div>

      {/* Detalles de los productos */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2">Producto</th>
            <th className="text-right py-2">Cant.</th>
            <th className="text-right py-2">Precio</th>
            <th className="text-right py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.detalles.map((detalle) => (
            <tr key={detalle.detalle_orden_id} className="border-b border-gray-100">
              <td className="py-2">{detalle.producto.nombre}</td>
              <td className="text-right py-2">{detalle.cantidad}</td>
              <td className="text-right py-2">${detalle.precio_unitario.toFixed(2)}</td>
              <td className="text-right py-2">${detalle.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">Total:</span>
          <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Pie de página */}
      <div className="mt-2 text-center text-gray-500 text-sm">
        <p>¡Gracias por su preferencia!</p>
        <p>Este documento sirve como comprobante de pago</p>
      </div>
    </div>
  );
});

Invoice.displayName = 'Invoice';

Invoice.propTypes = {
  order: PropTypes.shape({
    orden_id: PropTypes.number.isRequired,
    fecha_creacion: PropTypes.string.isRequired,
    mesa_id: PropTypes.number,
    total: PropTypes.number.isRequired,
    detalles: PropTypes.arrayOf(
      PropTypes.shape({
        detalle_orden_id: PropTypes.number.isRequired,
        cantidad: PropTypes.number.isRequired,
        precio_unitario: PropTypes.number.isRequired,
        subtotal: PropTypes.number.isRequired,
        producto: PropTypes.shape({
          nombre: PropTypes.string.isRequired,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default Invoice;