import { Link, Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <aside  className="dashboard-sidebar">
        <nav>
          <Link to="orders" className="dashboard-nav-link">Órdenes</Link>
          <Link to="products" className="dashboard-nav-link">Productos</Link>
          <Link to="payments" className="dashboard-nav-link">Pagos</Link>
        </nav>
      </aside>
      <main className="dashboard-main-content">
        <div className="dashboard-summary-cards">
          <div className="dashboard-card">Ventas hoy: $1,200</div>
          <div className="dashboard-card">Órdenes activas: 5</div>
          <div className="dashboard-card">Productos bajos: 3</div>
        </div>
        <div  className="dashboard-quick-actions">
          <Link to="/orders/new" className="dashboard-action-button">Nueva Orden</Link>
          <Link to="/products/new" className="dashboard-action-button">Agregar Producto</Link>
        </div>
        <Outlet /> {/* Para contenido anidado */}
      </main>
    </div>
  );
};

// const styles = {
//   container: { display: 'flex' },
//   sidebar: { width: '200px', backgroundColor: '#f8f9fa', padding: '20px' },
//   navLink: { display: 'block', margin: '10px 0' },
//   mainContent: { flex: 1, padding: '20px' },
//   summaryCards: { display: 'flex', gap: '20px', marginBottom: '30px' },
//   card: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', flex: 1 },
//   quickActions: { display: 'flex', gap: '10px' },
//   actionButton: { backgroundColor: '#28a745', color: 'white', padding: '10px 20px' }
// };

export default Dashboard;