import  { useState } from 'react';

const Payments = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const payments = [
    { id: 1, date: '2023-10-01', method: 'Tarjeta', amount: 50, status: 'success' },
    { id: 2, date: '2023-10-02', method: 'Efectivo', amount: 120, status: 'pending' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Pagos</h2>
        <button style={styles.newPaymentButton}>+ Registrar Pago</button>
      </div>
      
      <div style={styles.content}>
        <div style={styles.paymentList}>
          {payments.map(payment => (
            <div 
              key={payment.id} 
              onClick={() => setSelectedPayment(payment)}
              style={styles.paymentItem}
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
          <div style={styles.paymentDetails}>
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

const styles = {
  container: { padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  newPaymentButton: { backgroundColor: '#28a745', color: 'white', padding: '10px' },
  content: { display: 'flex', gap: '30px' },
  paymentList: { flex: 1 },
  paymentItem: { 
    display: 'flex', 
    justifyContent: 'space-between',
    border: '1px solid #ddd', 
    padding: '10px', 
    marginBottom: '10px',
    cursor: 'pointer'
  },
  paymentDetails: { flex: 1, border: '1px solid #ddd', padding: '20px' }
};

export default Payments;