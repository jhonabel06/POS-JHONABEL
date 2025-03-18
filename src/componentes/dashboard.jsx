import { Link } from 'react-router-dom';
import { 
    BarChart, 
    Bar, 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip 
  } from 'recharts';

const Dashboard = () => {
  // Datos de ejemplo
  const dailySales = [
    { hora: '9 AM', ventas: 20 },
    { hora: '1 PM', ventas: 45 },
    { hora: '3 PM', ventas: 30 },
    { hora: '6 PM', ventas: 60 },
    { hora: '9 PM', ventas: 40 },
  ];

  const activeOrders = [
    { status: 'En preparación', value: 5 },
    { status: 'Listo para servir', value: 3 },
    { status: 'En camino', value: 2 },
  ];

  const lowStockProducts = [
    { nombre: 'Pizza', stock: 3 },
    { nombre: 'Hamburguesa', stock: 5 },
    { nombre: 'Ensalada', stock: 2 },
  ];

  const COLORS = ['#FF8042', '#00C49F', '#0088FE'];

  return (
<div className="p-6 bg-gray-100 min-h-screen">
  <div className="max-w-7xl mx-auto"> {/* Contenedor principal centrado */}
    <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center md:text-left">
      Dashboard Restaurante
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 justify-center">
        {/* Tarjeta Ventas Hoy */}
        <Link to="/HistorialPagos">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Ventas hoy</h3>
                <p className="text-2xl font-bold text-gray-700">$25000.00</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Tarjeta Órdenes Activas */}
        <Link to="/orders">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Órdenes activas</h3>
                <p className="text-2xl font-bold text-gray-700">8</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Tarjeta Productos Bajos */}
        <Link to="/products">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Productos bajos</h3>
                <p className="text-2xl font-bold text-gray-700">3</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

    {/* Sección Gráficos */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
      {/* Gráfico de Ventas */}
      <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Ventas por hora</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hora"
                  tick={{ fill: "#6B7280" }}
                  axisLine={{ stroke: "#D1D5DB" }}
                />
                <YAxis
                  tick={{ fill: "#6B7280" }}
                  axisLine={{ stroke: "#D1D5DB" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="ventas"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                  name="Ventas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Órdenes */}
        {/* Gráfico de Órdenes */}
        <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Estado de órdenes</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeOrders}
                  dataKey="value"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius =
                      25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={COLORS[index % COLORS.length]}
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        className="text-sm font-medium"
                      >
                        {activeOrders[index].status} (
                        {`${(percent * 100).toFixed(0)}%`})
                      </text>
                    );
                  }}
                >
                  {activeOrders.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Productos Bajos */}
        <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-4xl lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Productos con stock bajo</h3>
        <div className="space-y-4">
            {lowStockProducts.map((producto, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-red-50 p-4 rounded"
              >
                <span className="font-medium">{producto.nombre}</span>
                <span className="text-red-600 font-semibold">
                  {producto.stock} unidades
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;