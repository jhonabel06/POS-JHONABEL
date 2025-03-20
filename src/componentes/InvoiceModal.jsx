import { useRef } from 'react';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import { X, Printer } from 'lucide-react';
import Invoice from './Invoice';

const InvoiceModal = ({ order, onClose, onAfterPrint }) => {
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    onAfterPrint: () => onAfterPrint(order.orden_id),
    documentTitle: `Factura_${order.orden_id}`,
    removeAfterPrint: true,
  });

  if (!order?.detalles?.length) {
    return <div>Error: Orden inválida</div>;
  }

  return (
    <div className="fixed inset-0 bg-blue-400 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-4">
          <Invoice ref={invoiceRef} order={order} />
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
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