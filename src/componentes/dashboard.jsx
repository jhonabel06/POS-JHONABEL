import { Link, Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <nav>
          <Link to="/orders" style={styles.navLink}>Órdenes</Link>
          <Link to="/products" style={styles.navLink}>Productos</Link>
          <Link to="/payments" style={styles.navLink}>Pagos</Link>
        </nav>
      </aside>
      <main style={styles.mainContent}>
        <div style={styles.summaryCards}>
          <div style={styles.card}>Ventas hoy: $1,200</div>
          <div style={styles.card}>Órdenes activas: 5</div>
          <div style={styles.card}>Productos bajos: 3</div>
        </div>
        <div style={styles.quickActions}>
          <Link to="/orders/new" style={styles.actionButton}>Nueva Orden</Link>
          <Link to="/products/new" style={styles.actionButton}>Agregar Producto</Link>
        </div>
        <Outlet /> {/* Para contenido anidado */}
      </main>
    </div>
  );
};

const styles = {
  container: { display: 'flex' },
  sidebar: { width: '200px', backgroundColor: '#f8f9fa', padding: '20px' },
  navLink: { display: 'block', margin: '10px 0' },
  mainContent: { flex: 1, padding: '20px' },
  summaryCards: { display: 'flex', gap: '20px', marginBottom: '30px' },
  card: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', flex: 1 },
  quickActions: { display: 'flex', gap: '10px' },
  actionButton: { backgroundColor: '#28a745', color: 'white', padding: '10px 20px' }
};

export default Dashboard;