import './App.css'
import Login from './componentes/login';
import Dashboard from './componentes/dashboard';
import Orders from './componentes/orders';
import Products from './componentes/products';
import Payments from './componentes/HistorialPagos';


// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegistrarUsuario from './componentes/registrarUsuario';
import NuevaOrden from './componentes/nuevaOrden';
import Layout from './componentes/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegistrarUsuario />} />
      
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/HistorialPagos" element={<Payments />} />
          <Route path="/nueva-orden/:ordenId?" element={<NuevaOrden />} />
        </Route>
      </Routes>
    </BrowserRouter>

  );
}
export default App
