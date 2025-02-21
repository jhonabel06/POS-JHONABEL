import { useState, useEffect  } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient'; // Asegúrate de usar la misma importación que en tu login

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    nombre: '', 
    precio: '', 
    stock: '', 
    categoria_id: '',
    descripcion: '' 
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Obtener productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categorias')
          .select('*');
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);

        // Obtener productos con join de categorías
        const { data: productsData, error: productsError } = await supabase
          .from('productos')
          .select(`
            producto_id,
            nombre,
            descripcion,
            precio,
            stock,
            fecha_creacion,
            categorias (nombre)
          `);

          if (productsError) {
            console.error('Error fetching products:', productsError);
            throw productsError;
          }
        
        const formattedProducts = productsData.map(p => ({
          id: p.producto_id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          stock: p.stock,
          categoria_nombre: p.categorias.nombre,
          categoria_id: p.categoria_id
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);




  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.precio || formData.precio <= 0) newErrors.precio = 'Precio inválido';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Stock inválido';
    if (!formData.categoria_id) newErrors.categoria_id = 'Selecciona una categoría';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        stock: formData.stock,
        categoria_id: formData.categoria_id
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('productos')
          .update(productData)
          .eq('producto_id', editingProduct);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([{ 
            ...productData, 
            fecha_creacion: new Date().toISOString() 
          }]);

        if (error) throw error;
      }

      // Refrescar datos
      const { data } = await supabase
        .from('productos')
        .select(`
          producto_id,
          nombre,
          descripcion,
          precio,
          stock,
          fecha_creacion,
          categorias (nombre)
        `);
      
      const formatted = data.map(p => ({
        id: p.producto_id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        categoria_nombre: p.categorias.nombre,
        categoria_id: p.categoria_id
      }));
      
      setProducts(formatted);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('producto_id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleCreate = () => {
  setFormData({ 
    nombre: '', 
    precio: '', 
    stock: '', 
    categoria_id: '', 
    descripcion: '' 
  });
  setEditingProduct(null);
  setIsModalOpen(true);
};
  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockChange = async (id, newStock) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ stock: newStock })
        .eq('producto_id', id);
  
      if (!error) {
        setProducts(prev =>
          prev.map(p => p.id === id ? {...p, stock: newStock} : p)
        );
      }
    } catch (error) {
      setErrorMessage('Error actualizando stock');
      setErrorMessage(error.message);
    }
  };

  const handleEdit = (product) => {
    setFormData(product);
    setEditingProduct(product.id);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
        {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
                <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Buscar por descripción"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Nuevo Producto
                </button>
            </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
  {filteredProducts.map(product => ( // Cambiar filteredProducts por products temporalmente
    <tr key={product.id}>
      <td className="px-6 py-4 whitespace-nowrap">{product.nombre}</td>
      <td className="px-6 py-4 whitespace-nowrap">${product.precio.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="number"
          value={product.stock}
          onChange={(e) => handleStockChange(product.id, parseInt(e.target.value))}
          className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500"
          min="0"
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{product.categoria_nombre}</td>
      <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody> 
            </table>
        </div>

        {/* Modal de edición/creación */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border ${
                                        errors.nombre ? 'border-red-500' : 'border-gray-300'
                                    } shadow-sm p-2`}
                                />
                                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Precio</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border ${
                                        errors.precio ? 'border-red-500' : 'border-gray-300'
                                    } shadow-sm p-2`}
                                />
                                {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md border ${
                                        errors.stock ? 'border-red-500' : 'border-gray-300'
                                    } shadow-sm p-2`}
                                />
                                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                <select
                                    name="categoria_id"
                                    value={formData.categoria_id}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.categoria_id} value={cat.categoria_id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoria_id && <p className="text-red-500 text-sm mt-1">{errors.categoria_id}</p>}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
export default Products;


