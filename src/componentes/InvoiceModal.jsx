import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import { X, Printer } from 'lucide-react';
import Invoice from './Invoice';

const InvoiceModal = ({ order, onClose, onAfterPrint }) => {
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef, // Pasamos invoiceRef directamente
    onAfterPrint: () => onAfterPrint(order.orden_id),
    documentTitle: `Factura_${order.orden_id}`,
    removeAfterPrint: true,
  });
 

  if (!order?.detalles?.length) {
    return <div>Error: Orden inválida</div>;
  }

  return (
    <div className="fixed inset-0 bg-blue-500/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl sm:max-w-lg mx-4 relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        {/* La combinación de max-h-[90vh] con overflow-y-auto permite que el contenido se desplace verticalmente cuando excede la 
        altura disponible, mientras mantiene un margen visual para el fondo difuminado. */}
        <div className="p-3 overflow-y-auto">
          <Invoice ref={invoiceRef} order={order} />

          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Factura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

InvoiceModal.propTypes = {
  order: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onAfterPrint: PropTypes.func.isRequired,
};

export default InvoiceModal;
