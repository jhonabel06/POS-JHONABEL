import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Square3Stack3DIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function NuevaOrden() {
  // Estados iniciales
  const [orden, setOrden] = useState({
    mesa_id: null,
    usuario_id: null,
    estado: 'en_proceso',
    total: 0.00
  });

  const [items, setItems] = useState([]);
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar productos
  const filteredProducts = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agregar producto con click
  const handleAddProduct = (producto) => {
    if (producto.stock < 1) return;

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.producto_id === producto.producto_id);
      
      if (existingIndex !== -1) {
        const updatedItems = [...prevItems];
        if (updatedItems[existingIndex].cantidad >= producto.stock) return prevItems;
        
        updatedItems[existingIndex].cantidad += 1;
        updatedItems[existingIndex].subtotal = updatedItems[existingIndex].cantidad * producto.precio;
        return updatedItems;
      }
      
      return [...prevItems, {
        producto_id: producto.producto_id,
        cantidad: 1,
        precio_unitario: producto.precio,
        subtotal: producto.precio
      }];
    });
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [mesasRes, productosRes] = await Promise.all([
          supabase.from('mesas').select('mesa_id').eq('estado', 'disponible'),
          supabase.from('productos').select('producto_id, nombre, precio, stock, imagen_url')
        ]);

        if (mesasRes.error) throw mesasRes.error;
        if (productosRes.error) throw productosRes.error;

        setMesasDisponibles(mesasRes.data);
        setProductos(productosRes.data);
      } catch (error) {
        setError(error.message);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Actualizar total
  useEffect(() => {
    const nuevoTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    setOrden(prev => ({ ...prev, total: nuevoTotal }));
  }, [items]);

  // Eliminar item
  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Ajustar cantidad
  const adjustQuantity = (index, adjustment) => {
    setItems(prev => {
      const newItems = [...prev];
      const product = productos.find(p => p.producto_id === newItems[index].producto_id);
      
      if (!product) return prev;
      
      const newQuantity = newItems[index].cantidad + adjustment;
      
      if (newQuantity < 1 || newQuantity > product.stock) return prev;
      
      newItems[index].cantidad = newQuantity;
      newItems[index].subtotal = newQuantity * newItems[index].precio_unitario;
      return newItems;
    });
  };
// 1. Corrige el reset del formulario en handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Validación mejorada de stock
    const stockErrors = items.reduce((errors, item) => {
      const producto = productos.find(p => p.producto_id === item.producto_id);
      if (!producto) {
        errors.push(`Producto no encontrado`);
      } else if (producto.stock < item.cantidad) {
        errors.push(`Stock insuficiente para ${producto.nombre} (disponible: ${producto.stock})`);
      }
      return errors;
    }, []);

    if (stockErrors.length > 0) {
      throw new Error(stockErrors.join('\n'));
    }

    // Insertar orden con transacción
    const { data: ordenData, error: ordenError } = await supabase
      .from('ordenes')
      .insert([{ 
        ...orden, 
        total: parseFloat(orden.total.toFixed(2)) 
      }])
      .select();

    if (ordenError) throw ordenError;

    // Insertar detalles y actualizar stock
    const updates = await supabase.rpc('crear_orden_completa', {
      orden_id: ordenData[0].orden_id,
      items: items.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio: item.precio_unitario
      })),
      mesa_id: orden.mesa_id
    });

    if (updates.error) throw updates.error;

    // Resetear formulario correctamente
    setOrden({
      mesa_id: null,
      usuario_id: null,
      estado: 'en_proceso',
      total: 0.00
    });
    setItems([]);
    //setNecesitaActualizar(true);
    
    alert('Orden creada exitosamente!');

  } catch (err) {
    setError(err.message);
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

return (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Nueva Orden</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <Link to="/dashboard" className="btn-primary flex items-center">
            <HomeIcon className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link to="/orders" className="btn-secondary flex items-center">
            <Square3Stack3DIcon className="w-5 h-5 mr-2" />
            Órdenes
          </Link>
        </div>
      </div>

      {/* Layout principal */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sección de productos */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full p-3 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-300px)] overflow-y-auto">
            {filteredProducts.map(producto => (
              <button
                key={producto.producto_id}
                onClick={() => handleAddProduct(producto)}
                disabled={producto.stock < 1}
                className={`p-3 rounded-lg transition-all ${
                  producto.stock < 1 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'hover:bg-blue-50 hover:shadow-md active:scale-95'
                }`}
              >
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
                <h4 className="font-semibold truncate">{producto.nombre}</h4>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="text-gray-600">${producto.precio}</span>
                  <span className={`${
                    producto.stock < 1 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    Stock: {producto.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sección de la orden */}
        <div className="bg-white p-4 rounded-xl shadow-sm sticky top-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="block mb-2 font-medium">Mesa:</label>
                <select
                  name="mesa_id"
                  value={orden.mesa_id || ''}
                  onChange={(e) => setOrden({...orden, mesa_id: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Seleccionar mesa</option>
                  {mesasDisponibles.map(mesa => (
                    <option key={mesa.mesa_id} value={mesa.mesa_id}>
                      Mesa {mesa.mesa_id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items seleccionados */}
            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold mb-4">Productos en la orden</h2>
              {items.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Toca los productos para agregarlos
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const producto = productos.find(p => p.producto_id === item.producto_id);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {producto?.imagen_url && (
                            <img
                              src={producto.imagen_url}
                              alt={producto.nombre}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{producto?.nombre}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => adjustQuantity(index, -1)}
                                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-8 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => adjustQuantity(index, 1)}
                                disabled={item.cantidad >= producto?.stock}
                                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">${item.subtotal?.toFixed(2)}</span>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total y enviar */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-xl font-bold">${orden.total.toFixed(2)}</span>
              </div>
              
              {error && <div className="text-red-500 p-3 bg-red-100 rounded">{error}</div>}
              
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Procesando...' : 'Confirmar Orden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
);
}