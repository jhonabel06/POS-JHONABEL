import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function NuevaOrden() {
  const [orden, setOrden] = useState({
    mesa_id: null,
    usuario_id: null, // Puedes obtenerlo de la sesión si es necesario
    estado: 'pendiente',
    total: 0.00
  });

  const [items, setItems] = useState([{ producto_id: null, cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar mesas y productos al montar el componente
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const { data: mesasData } = await supabase
        .from('mesas')
        .select('mesa_id, numero')
        .eq('estado', 'disponible');

      const { data: productosData } = await supabase
        .from('productos')
        .select('producto_id, nombre, precio, stock');

      setMesasDisponibles(mesasData || []);
      setProductos(productosData || []);
    };

    cargarDatosIniciales();
  }, []);

  // Actualizar subtotal cuando cambia cantidad o precio
  useEffect(() => {
    const nuevosItems = items.map(item => ({
      ...item,
      subtotal: item.cantidad * item.precio_unitario
    }));
    
    const nuevoTotal = nuevosItems.reduce((sum, item) => sum + item.subtotal, 0);
    
    setItems(nuevosItems);
    setOrden(prev => ({ ...prev, total: nuevoTotal }));
  }, [items]);

  const handleOrdenChange = (e) => {
    setOrden({
      ...orden,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = async (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    
    if (name === 'producto_id') {
      const producto = productos.find(p => p.producto_id === parseInt(value));
      newItems[index] = {
        ...newItems[index],
        producto_id: value,
        precio_unitario: producto?.precio || 0,
        stock_disponible: producto?.stock || 0
      };
    } else {
      newItems[index][name] = name === 'cantidad' ? parseInt(value) : parseFloat(value);
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { producto_id: null, cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar stock
      for (const item of items) {
        const producto = productos.find(p => p.producto_id === item.producto_id);
        if (producto?.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${producto.nombre}`);
        }
      }

      // Insertar orden
      const { data: ordenData, error: ordenError } = await supabase
        .from('ordenes')
        .insert([{ ...orden, total: orden.total.toFixed(2) }])
        .select();

      if (ordenError) throw ordenError;

      // Insertar detalles
      const detalles = items.map(item => ({
        orden_id: ordenData[0].orden_id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal.toFixed(2)
      }));

      const { error: detallesError } = await supabase
        .from('detalles_orden')
        .insert(detalles);

      if (detallesError) throw detallesError;

      // Actualizar estado de la mesa
      await supabase
        .from('mesas')
        .update({ estado: 'ocupada' })
        .eq('mesa_id', orden.mesa_id);

      // Resetear formulario
      setOrden({ mesa_id: null, estado: 'pendiente', total: 0 });
      setItems([{ producto_id: null, cantidad: 1, precio_unitario: 0, subtotal: 0 }]);
      alert('Orden creada exitosamente!');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Nueva Orden</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
                  Mesa {mesa.numero}
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
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="listo">Listo</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Ítems de la Orden</h2>
          
          {items.map((item, index) => {
            const producto = productos.find(p => p.producto_id === item.producto_id);
            
            return (
              <div key={index} className="border p-4 rounded mb-4">
                <div className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block mb-2">Producto:</label>
                    <select
                      name="producto_id"
                      value={item.producto_id || ''}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {productos.map(producto => (
                        <option key={producto.producto_id} value={producto.producto_id}>
                          {producto.nombre} (Stock: {producto.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2">Cantidad:</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border rounded"
                      min="1"
                      max={producto?.stock || 1}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Precio Unitario:</label>
                    <input
                      type="number"
                      value={item.precio_unitario}
                      className="w-full p-2 border rounded bg-gray-100"
                      readOnly
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Subtotal:</label>
                    <input
                      type="number"
                      value={item.subtotal.toFixed(2)}
                      className="w-full p-2 border rounded bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Eliminar Ítem
                  </button>
                )}
              </div>
            )}
          )}

          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Agregar Ítem
          </button>
        </div>

        <div className="text-xl font-bold border-t pt-4">
          Total: ${orden.total.toFixed(2)}
        </div>

        {error && <div className="text-red-500 p-4 bg-red-100 rounded">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-6 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Guardando...' : 'Crear Orden'}
        </button>
      </form>
    </div>
  );
}