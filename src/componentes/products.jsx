import { useState, useEffect } from 'react';
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  //Modal para categoria
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ nombre: '' });
  const [categoryErrors, setCategoryErrors] = useState({});

  // Obtener productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categorias')
          .select('*');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData);

        const { data: productsData } = await supabase
          .from('productos')
          .select(`
            producto_id,
            nombre,
            descripcion,
            precio,
            stock,
            fecha_creacion,
            imagen_url,
            categorias (nombre)
          `);

        const formattedProducts = productsData.map(p => ({
          id: p.producto_id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          stock: p.stock,
          categoria_nombre: p.categorias.nombre,
          categoria_id: p.categoria_id,
          imagen_url: p.imagen_url
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

  // Función para manejar el envío de categorías
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!categoryFormData.nombre.trim()) {
      newErrors.nombre = 'Nombre es requerido';
    }

    setCategoryErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('categorias')
        .insert([{ nombre: categoryFormData.nombre }])
        .select();

      if (error) throw error;

      // Actualizar lista de categorías
      const { data: newCategories, error: fetchError } = await supabase
        .from('categorias')
        .select('*');

      if (fetchError) throw fetchError;
      setCategories(newCategories);

      setIsCategoryModalOpen(false);
      setCategoryFormData({ nombre: '' });
      setCategoryErrors({});
    } catch (error) {
      if (error.code === '23505') { // Violación de unique constraint
        setCategoryErrors({ nombre: 'Esta categoría ya existe' });
      } else {
        setErrorMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.precio || formData.precio <= 0) newErrors.precio = 'Precio inválido';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Stock inválido';
    if (!formData.categoria_id) newErrors.categoria_id = 'Selecciona una categoría';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Modificar handleSubmit para manejar imágenes
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      let productId;
      let oldImageUrl = null;

      // Si es edición, obtener imagen anterior
      if (editingProduct) {
        const { data: existingProduct, error: fetchError } = await supabase
          .from('productos')
          .select('imagen_url')
          .eq('producto_id', editingProduct)
          .single();

        if (fetchError) throw fetchError;
        oldImageUrl = existingProduct?.imagen_url;
      }

      // Crear/actualizar el producto
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        stock: formData.stock,
        categoria_id: formData.categoria_id
      };

      if (editingProduct) {
        // Actualizar producto existente
        const { error: updateError } = await supabase
          .from('productos')
          .update(productData)
          .eq('producto_id', editingProduct);

        if (updateError) throw updateError;
        productId = editingProduct;
      } else {
        // Crear nuevo producto
        const { data: newProduct, error: insertError } = await supabase
          .from('productos')
          .insert([{ ...productData, fecha_creacion: new Date().toISOString() }])
          .select();

        if (insertError) throw insertError;
        productId = newProduct[0].producto_id;
      }

      // Manejo de la imagen
      if (selectedImage) {
        // 1. Eliminar imagen anterior si existe
        if (oldImageUrl) {
          const fileName = oldImageUrl.split('/').pop();
          const { error: removeError } = await supabase.storage
            .from('imagenes_productos')
            .remove([fileName]);

          if (removeError) console.error('Error eliminando imagen anterior:', removeError);
        }

        // 2. Subir nueva imagen
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${productId}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('imagenes_productos')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        // 3. Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('imagenes_productos')
          .getPublicUrl(fileName);

        // 4. Actualizar producto con nueva URL
        const { error: urlUpdateError } = await supabase
          .from('productos')
          .update({ imagen_url: publicUrl })
          .eq('producto_id', productId);

        if (urlUpdateError) throw urlUpdateError;
      }

      // Actualizar lista de productos
      const { data, error: fetchError } = await supabase
        .from('productos')
        .select(`
          producto_id,
          nombre,
          descripcion,
          precio,
          stock,
          fecha_creacion,
          imagen_url,
          categorias (nombre)
        `);

      if (fetchError) throw fetchError;

      const formattedProducts = data.map(p => ({
        id: p.producto_id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        categoria_nombre: p.categorias.nombre,
        categoria_id: p.categoria_id,
        imagen_url: p.imagen_url
      }));

      setProducts(formattedProducts);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message || 'Error al guardar el producto');
      console.error('Error en handleSubmit:', error);
    } finally {
      setLoading(false);
      setSelectedImage(null);
      setPreviewUrl('');
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


  // Modificar handleCreate para resetear imagen
  const handleCreate = () => {
    setFormData({
      nombre: '',
      precio: '',
      stock: '',
      categoria_id: '',
      descripcion: ''
    });
    setSelectedImage(null);
    setPreviewUrl('');
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
          prev.map(p => p.id === id ? { ...p, stock: newStock } : p)
        );
      }
    } catch (error) {
      setErrorMessage('Error actualizando stock');
      setErrorMessage(error.message);
    }
  };

  // Modificar handleEdit para cargar imagen existente
  const handleEdit = (product) => {
    setFormData(product);
    setEditingProduct(product.id);
    setPreviewUrl(product.imagen_url || '');
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
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.imagen_url && (
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </td>
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
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
         //<div className="fixed inset-0 bg-[url(https://okadhzfrutumdlfrgtaz.supabase.co/storage/v1/object/public/background//restaurant.jpg)] bg-opacity-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-blue-500/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Nuevo campo para imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen del Producto
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedImage(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="mt-2 h-32 w-32 object-contain rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${errors.nombre ? 'border-red-500' : 'border-gray-300'
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
                    className={`mt-1 block w-full rounded-md border ${errors.precio ? 'border-red-500' : 'border-gray-300'
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
                    className={`mt-1 block w-full rounded-md border ${errors.stock ? 'border-red-500' : 'border-gray-300'
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
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        //<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-blue-500/30 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nueva Categoría</h3>

            <form onSubmit={handleCategorySubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la categoría
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={categoryFormData.nombre}
                    onChange={(e) => setCategoryFormData({ nombre: e.target.value })}
                    className={`mt-1 block w-full rounded-md border ${categoryErrors.nombre ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm p-2`}
                  />
                  {categoryErrors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{categoryErrors.nombre}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setCategoryErrors({});
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''
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


