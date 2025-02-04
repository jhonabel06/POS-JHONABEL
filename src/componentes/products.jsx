import { useState } from 'react';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const products = [
    { id: 1, name: 'Producto A', price: 20, stock: 5 },
    { id: 2, name: 'Producto B', price: 35, stock: 15 }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Productos</h2>
        <div style={styles.filters}>
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
      
      <table style={styles.table}>
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

const styles = {
  container: { padding: '20px' },
  header: { marginBottom: '20px' },
  filters: { display: 'flex', gap: '20px', margin: '10px 0' },
  table: { width: '100%', borderCollapse: 'collapse' },
};

export default Products;