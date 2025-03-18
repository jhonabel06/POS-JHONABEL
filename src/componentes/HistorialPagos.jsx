import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ArrowPathIcon, FunnelIcon , HomeIcon , Square3Stack3DIcon} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function HistorialPagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMetodo, setFiltroMetodo] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [totalPagos, setTotalPagos] = useState(0);

  
  const cargarPagos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('pagos')
        .select(`
          *,
          orden:ordenes(mesa_id)
        `)
        .order('fecha_pago', { ascending: false });

      if (filtroMetodo) {
        query = query.eq('metodo_pago', filtroMetodo);
      }

      if (fechaInicio) {
        query = query.gte('fecha_pago', `${fechaInicio}T00:00:00`);
      }

      if (fechaFin) {
        query = query.lte('fecha_pago', `${fechaFin}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPagos(data || []);
      setTotalPagos(data?.reduce((sum, pago) => sum + Number(pago.total), 0) || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, [filtroMetodo, fechaInicio, fechaFin]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetodoPagoColor = (metodo) => {
    const colors = {
      efectivo: 'bg-green-100 text-green-800',
      tarjeta: 'bg-blue-100 text-blue-800',
      qr: 'bg-purple-100 text-purple-800'
    };
    return colors[metodo] || 'bg-gray-100 text-gray-800';
  };

  const limpiarFiltros = () => {
    setFiltroMetodo('');
    setFechaInicio('');
    setFechaFin('');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Pagos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestiona y visualiza todos los pagos realizados
        </p>
      </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link to="/dashboard" className="btn-primary flex items-center px-4 py-2 rounded-4xl hover:bg-teal-400">
            <HomeIcon className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <Link to="/orders" className="btn-secondary flex items-center px-4 py-2 rounded-4xl hover:bg-teal-400">
            <Square3Stack3DIcon className="w-5 h-5 mr-2" />
            Órdenes
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="qr">QR</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarPagos}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            <button
              onClick={limpiarFiltros}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-900">Total Pagos</h3>
            <p className="text-2xl font-bold text-indigo-600">
              ${totalPagos.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Registros</h3>
            <p className="text-2xl font-bold text-green-600">{pagos.length}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Cargando pagos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron pagos
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => (
                  <tr key={pago.pago_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{pago.pago_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{pago.orden_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Mesa {pago.orden?.mesa_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMetodoPagoColor(pago.metodo_pago)}`}>
                        {pago.metodo_pago.charAt(0).toUpperCase() + pago.metodo_pago.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(pago.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(pago.fecha_pago)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}