import './App.css'
import Login from './componentes/login';
import Dashboard from './componentes/dashboard';
import Orders from './componentes/orders';
import Products from './componentes/products';
import Payments from './componentes/HistorialPagos';


// App.js
import { BrowserRouter, Routes, Route  } from 'react-router-dom';
import RegistrarUsuario from './componentes/registrarUsuario';
import NuevaOrden from './componentes/nuevaOrden';
import Layout from './componentes/Layout';
import { PublicRoute } from './authentication/PublicRoute';
import { ProtectedRoute } from './authentication/ProtectedRoute';


function App() {



  return (
    <BrowserRouter>
      <Routes>


        <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegistrarUsuario />
          </PublicRoute>
        } />

        <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />


      
        <Route element={
          <ProtectedRoute>
          <Layout />
          </ProtectedRoute>
          }>
          <Route path="/dashboard" element={
            <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
            } />
          <Route path="/orders" element={
            <ProtectedRoute>
            <Orders />
            </ProtectedRoute>
            } />
          <Route path="/products" element={
            <ProtectedRoute>
            <Products />
            </ProtectedRoute>
            } />
          <Route path="/HistorialPagos" element={
            <ProtectedRoute>
            <Payments />
            </ProtectedRoute>
            } />
          <Route path="/nueva-orden" element={
            <ProtectedRoute>
            <NuevaOrden />
            </ProtectedRoute>
            } />
          <Route path="/editar-orden/:ordenId?" element={
            <ProtectedRoute>
            <NuevaOrden />
            </ProtectedRoute>
            } />

          <Route path="*" element={
            <PublicRoute>
            <Login />
            </PublicRoute>
            } />
        </Route>
      </Routes>
    </BrowserRouter>

  );
}
export default App
