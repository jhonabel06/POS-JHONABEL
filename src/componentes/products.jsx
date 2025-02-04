import { useState } from 'react';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const products = [
    { id: 1, name: 'Producto A', price: 20, stock: 5 },
    { id: 2, name: 'Producto B', price: 35, stock: 15 }
  ];

  return (
    <div className="products-container">
      <div className="product-header">
        <h2>Productos</h2>
        <div className= "product-table">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {/* Agregar más opciones */}
          </select>
        </div>
      </div>
      
      <table className= "product-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td style={{ color: product.stock < 10 ? 'red' : 'inherit' }}>
                {product.stock}
              </td>
              <td>
                <button>Editar</button>
                <button>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;