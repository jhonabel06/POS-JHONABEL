import { NavLink } from 'react-router-dom';
import LogoutButton from './LogoutButton.jsx';

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-screen w-40 bg-gray-800 p-6 text-white shadow-lg">
      <nav>
        <ul className="space-y-4">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => 
                `block rounded-lg p-3 transition-colors hover:bg-gray-700 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                }`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/HistorialPagos"
              className={({ isActive }) => 
                `block rounded-lg p-3 transition-colors hover:bg-gray-700 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                }`
              }
            >
              Pagos
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/orders"
              className={({ isActive }) => 
                `block rounded-lg p-3 transition-colors hover:bg-gray-700 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                }`
              }
            >
              Órdenes
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/products"
              className={({ isActive }) => 
                `block rounded-lg p-3 transition-colors hover:bg-gray-700 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
                }`
              }
            >
              Productos
            </NavLink>
          </li>
          <li>
            <LogoutButton 
              className="block w-full rounded-lg p-3 text-left text-gray-300 transition-colors hover:bg-gray-700"
            >
              Cerrar sesión
            </LogoutButton>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;