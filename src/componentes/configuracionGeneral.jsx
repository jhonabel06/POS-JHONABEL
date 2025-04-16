import { useState, useEffect } from 'react';
import { Settings, Mail, Phone, MapPin, Globe, DollarSign } from 'lucide-react';
import { supabase } from '../supabaseClient';




export function ConfiguracionGeneral() {

    const [selectedLogo, setSelectedLogo] = useState(null);
    const [oldLogoUrl, setOldLogoUrl] = useState(null);
    const [config, setConfig] = useState({
        nombre_empresa: '',
        color_primario: '#000000',
        color_secundario: '#ffffff',
        color_terciario: null,
        itbis_porcentaje: 18,
        logo_url: null,
        direccion: null,
        telefono: null,
        email_contacto: null,
        moneda: 'DOP',
        idioma: 'es',
        modo_mantenimiento: false
    });

  // Efecto para cargar la configuración inicial
  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('configuracion_general')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setConfig(data);
        setOldLogoUrl(data.logo_url); // Guardar URL del logo existente
      }
    };
    fetchConfig();
  }, []);

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setSelectedLogo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

    

      // Manejo del logo primero
      let logoUrl = config.logo_url;
      
      if (selectedLogo) {
        // 1. Eliminar logo anterior si existe
        if (oldLogoUrl) {
          const fileName = oldLogoUrl.split('/').pop();
          const { error: removeError } = await supabase.storage
            .from('logos_empresa') // Cambiar al bucket correcto
            .remove([fileName]);
          
          if (removeError) console.error('Error eliminando logo anterior:', removeError);
        }

        // 2. Subir nuevo logo
        const fileExt = selectedLogo.name.split('.').pop();
        const fileName = `logo_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(fileName, selectedLogo, {
                cacheControl: '3600',
                upsert: false
            });

            if (uploadError) {
            console.error('Detalles del error:', {
                message: uploadError.message,
                code: uploadError.statusCode,
                error: uploadError.error
            });
            throw uploadError;
        }

        // 3. Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Preparar datos para guardar
      const configData = {
        ...config,
        logo_url: selectedLogo ? logoUrl : config.logo_url
      };

    // Eliminar el ID si es 0 antes de enviar
    if (configData.id === 0) {
        delete configData.id;
     }
      

      // Operación de guardado en la tabla configuracion_general
    //   let query;
    //   if (config.id === 0) {
    //     const { ...insertData } = configData;
    //     query = supabase.from('configuracion_general').insert([insertData]);
    //   } else {
    //     query = supabase
    //       .from('configuracion_general')
    //       .update(configData)
    //       .eq('id', config.id);
    //   }

    //   const { data, error } = await query.single();

    //   if (error) throw error;
    let query;
    if (config.id === 0) {
      query = supabase
        .from('configuracion_general')
        .insert([configData])
        .select();
    } else {
      query = supabase
        .from('configuracion_general')
        .update(configData)
        .eq('id', config.id)
        .select();
    }

    const { data, error } = await query.single();

    if (error) throw error;
      
      // Actualizar estados
      setConfig(prev => ({ ...prev, ...data, id: data.id }));
      setOldLogoUrl(data.logo_url);
      setSelectedLogo(null);
      alert('Configuración guardada correctamente!');

    } catch (error) {
        console.error('Detalles del error:', {
            message: error.message,
            code: error.code,
            details: error.details
          });
          alert('Error al guardar: ' + error.details);
    }
    
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Settings className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Configuración General</h2>
          <p className="mt-2 text-sm text-gray-600">Configure los parámetros generales del sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                  <input
                    type="text"
                    name="nombre_empresa"
                    value={config.nombre_empresa}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Logo de la Empresa */}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {config.logo_url && (
                        <div className="mt-2">
                        <span className="text-sm text-gray-500">Logo actual:</span>
                        <img 
                            src={config.logo_url} 
                            alt="Logo actual" 
                            className="h-20 mt-1 object-contain"
                        />
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* Colores */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Colores</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Primario</label>
                  <input
                    type="color"
                    name="color_primario"
                    value={config.color_primario}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Secundario</label>
                  <input
                    type="color"
                    name="color_secundario"
                    value={config.color_secundario}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Terciario</label>
                  <input
                    type="color"
                    name="color_terciario"
                    value={config.color_terciario || '#000000'}
                    onChange={handleChange}
                    className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email de Contacto
                  </label>
                  <input
                    type="email"
                    name="email_contacto"
                    value={config.email_contacto || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={config.telefono || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Dirección
                  </label>
                  <textarea
                    name="direccion"
                    value={config.direccion || ''}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Configuración Regional */}
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Configuración Regional</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Idioma
                  </label>
                  <select
                    name="idioma"
                    value={config.idioma}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Moneda
                  </label>
                  <select
                    name="moneda"
                    value={config.moneda}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="DOP">DOP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ITBIS (%)</label>
                  <input
                    type="number"
                    name="itbis_porcentaje"
                    value={config.itbis_porcentaje}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Modo Mantenimiento */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="modo_mantenimiento"
                checked={config.modo_mantenimiento}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Activar modo mantenimiento
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfiguracionGeneral;