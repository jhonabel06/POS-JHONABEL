import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function NuevaOrden() {
  const [orden, setOrden] = useState({
    mesa_id: null,
    usuario_id: null, // Puedes obtenerlo de la sesión si es necesario
    estado: 'pendiente',
    total: 0.00
  });

  const [items, setItems] = useState([]);
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState(1);
  

  const filteredProducts = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    if (!selectedProduct || quantity < 1) return;
    
    const newItem = {
      producto_id: selectedProduct.producto_id,
      cantidad: quantity,
      precio_unitario: selectedProduct.precio,
      subtotal: quantity * selectedProduct.precio 
    };
  
    setItems([...items, newItem]);
    setShowProductSelector(false);
    setSelectedProduct(null);
    setQuantity(1);
  };
  const [necesitaActualizar, setNecesitaActualizar] = useState(false);

  // 3. Corrige el useEffect de carga inicial
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
      setNecesitaActualizar(false);
    } catch (error) {
      setError(error.message);
    }
  };

  cargarDatosIniciales();
}, [necesitaActualizar]);

  // Actualizar subtotal cuando cambia cantidad o precio
  useEffect(() => {
    const nuevoTotal = items.reduce((sum, item) => 
      sum + (item.cantidad * item.precio_unitario), 0
    );
    setOrden(prev => ({ ...prev, total: nuevoTotal }));
  }, [items]);

  const handleOrdenChange = (e) => {
    setOrden({
      ...orden,
      [e.target.name]: e.target.value
    });
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
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
      estado: 'pendiente',
      total: 0.00
    });
    setItems([]);
    setNecesitaActualizar(true);
    
    alert('Orden creada exitosamente!');

  } catch (err) {
    setError(err.message);
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      <h1 className="text-2xl font-bold mb-6">Nueva Orden</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sección de información de la orden */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Mesa:</label>
            <select
              name="mesa_id"
              value={orden.mesa_id || ''}
              onChange={handleOrdenChange}
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
  
          <div>
            <label className="block mb-2">Estado:</label>
            <select
              name="estado"
              value={orden.estado}
              onChange={handleOrdenChange}
              className="w-full p-2 border rounded"
            >
              {/*<option value="pendiente">Pendiente</option>*/}
              <option value="en_proceso">En Proceso</option>
              {/*<option value="listo">Listo</option>*/}
              {/*<option value="pagado">Pagado</option>*/}
            </select>
          </div>
        </div>
  
        {/* Sección de productos */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Productos Seleccionados</h2>
            <button
              type="button"
              onClick={() => setShowProductSelector(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Agregar Productos
            </button>
          </div>
  
          {/* Lista de productos agregados */}
          {items.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay productos agregados
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const producto = productos.find(p => p.producto_id === item.producto_id);
                if (!producto) return null; // Evita errores con productos no encontrados
                
                return (
                  <div key={`${item.producto_id}-${index}`} className="border p-4 rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {producto?.imagen_url ? (
                          <img 
                            src={producto.imagen_url} 
                            alt={producto.nombre}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-semibold">{producto?.nombre || 'Producto no disponible'}</h4>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>Cantidad: {item.cantidad}</span>
                            <span>Precio unitario: ${item.precio_unitario.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right min-w-[120px]">
                        <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 text-sm mt-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
  
        {/* Total y botón de enviar */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-xl font-bold">${orden.total.toFixed(2)}</span>
          </div>
          
          {error && <div className="text-red-500 p-3 bg-red-100 rounded mt-4">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded mt-4 hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Procesando orden...' : 'Confirmar Orden'}
          </button>
        </div>
      </form>
  
      {/* Modal de selección de productos */}
      {showProductSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Seleccionar Productos</h3>
              <button
                onClick={() => {
                  setShowProductSelector(false);
                  setSelectedProduct(null);
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
  
            {/* Barra de búsqueda */}
            <input
              type="text"
              placeholder="Buscar productos..."
              className="w-full p-3 border rounded-lg mb-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
  
            {/* Grid de productos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-1">
              {filteredProducts.map((producto) => (
                <div
                  key={producto.producto_id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedProduct?.producto_id === producto.producto_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedProduct(producto)}
                >
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <h4 className="font-semibold truncate">{producto.nombre}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">${producto.precio}</span>
                    <span className="text-xs text-gray-500">Stock: {producto.stock}</span>
                  </div>
                </div>
              ))}
            </div>
  
            {/* Panel de selección de cantidad */}
            {selectedProduct && (
              <div className="border-t pt-4 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    {selectedProduct.imagen_url && (
                      <img
                        src={selectedProduct.imagen_url}
                        alt={selectedProduct.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{selectedProduct.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        Stock disponible: {selectedProduct.stock}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex-1">
                      <label className="block text-sm mb-1">Cantidad:</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct.stock}
                        value={quantity}
                        onChange={(e) => {
                          const value = Math.max(1, parseInt(e.target.value) || 1);
                          setQuantity(Math.min(value, selectedProduct.stock));
                        }}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <button
                      onClick={handleAddProduct}
                      className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 mt-2 md:mt-0"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

}