import  { useState } from 'react';

const Payments = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const payments = [
    { id: 1, date: '2023-10-01', method: 'Tarjeta', amount: 50, status: 'success' },
    { id: 2, date: '2023-10-02', method: 'Efectivo', amount: 120, status: 'pending' }
  ];

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h2>Pagos</h2>
        <button className="payments-new-payment-button">+ Registrar Pago</button>
      </div>
      
      <div className="payments-content">
        <div className="payments-payment-list">
          {payments.map(payment => (
            <div 
              key={payment.id} 
              onClick={() => setSelectedPayment(payment)}
              className="payments-payment-item"
            >
              <span>{payment.date}</span>
              <span>${payment.amount}</span>
              <span style={{ color: payment.status === 'success' ? 'green' : 'orange' }}>
                {payment.status}
              </span>
            </div>
          ))}
        </div>
        
        {selectedPayment && (
          <div className="payments-payment-details">
            <h3>Detalles del Pago #{selectedPayment.id}</h3>
            <p>Método: {selectedPayment.method}</p>
            <p>Total: ${selectedPayment.amount}</p>
            <button>Reembolsar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;