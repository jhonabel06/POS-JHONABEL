import { useState } from 'react';

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos de ejemplo
  const orders = [
    { id: 1, client: 'Cliente A', total: 50, status: 'Pendiente' },
    { id: 2, client: 'Cliente B', total: 120, status: 'Completado' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Órdenes</h2>
        <input
          type="text"
          placeholder="Buscar órdenes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      
      <div style={styles.content}>
        <div style={styles.orderList}>
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              style={styles.orderItem}
            >
              #{order.id} - {order.client} - ${order.total}
            </div>
          ))}
        </div>
        
        {selectedOrder && (
          <div style={styles.orderDetails}>
            <h3>Detalle de Orden #{selectedOrder.id}</h3>
            <p>Cliente: {selectedOrder.client}</p>
            <p>Total: ${selectedOrder.total}</p>
            <div style={styles.buttons}>
              <button>Editar</button>
              <button>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  searchInput: { padding: '8px', width: '300px' },
  content: { display: 'flex', gap: '30px' },
  orderList: { flex: 1 },
  orderItem: { 
    border: '1px solid #ddd', 
    padding: '10px', 
    marginBottom: '10px',
    cursor: 'pointer'
  },
  orderDetails: { flex: 1, border: '1px solid #ddd', padding: '20px' },
  buttons: { display: 'flex', gap: '10px', marginTop: '20px' }
};

export default Orders;