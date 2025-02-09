import './App.css'
import Login from './componentes/login';
import Dashboard from './componentes/dashboard';
import Orders from './componentes/orders';
import Products from './componentes/products';
import Payments from './componentes/payments';

// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegistrarUsuario from './componentes/registrarUsuario';

function App() {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Login />} />
    //     <Route path="/dashboard" element={<Dashboard2 />}>
    //     <Route path="/orders" element={<Orders />} />
    //     <Route path="/products" element={<Products />} />
    //     <Route path="/payments" element={<Payments />} />
    //     </Route>
    //   </Routes>
    // </BrowserRouter>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/register" element={<RegistrarUsuario/>} />
        
      </Routes>
    </BrowserRouter>

  );
}
export default App
