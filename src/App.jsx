import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const isRemoteServer = Boolean(API_BASE_URL);

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDeviceInfo() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/device-info`);
      if (!response.ok) {
        throw new Error(`El servidor respondió con el estado ${response.status}.`);
      }
      setDeviceInfo(await response.json());
    } catch (loadError) {
      setError(loadError.message || "No se pudo obtener la información del equipo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  return (
    <main className="page">
      <section className="card" aria-labelledby="page-title">
        <div className="eyebrow">
          <span className="status-dot" />
          {isRemoteServer ? "DATOS DEL SERVIDOR" : "DATOS DE ESTA COMPUTADORA"}
        </div>
        <h1 id="page-title">Tu equipo, en un vistazo</h1>
        <p className="intro">
          {isRemoteServer
            ? "La página pública muestra el servidor alojado, no la computadora desde la que navegas. Ejecuta la aplicación localmente para ver los datos de tu equipo."
            : "Hostname e IP locales de esta computadora; IP pública de salida de su conexión a Internet."}
        </p>

        {loading ? (
          <p className="message" role="status">Consultando el equipo…</p>
        ) : error ? (
          <div className="error" role="alert">
            <p>{error}</p>
            <button className="retry-button" onClick={loadDeviceInfo}>Intentar de nuevo</button>
          </div>
        ) : (
          <div className="details">
            <article className="info-box">
              <span className="label">HOSTNAME</span>
              <strong className="value">{deviceInfo.hostname}</strong>
            </article>
            <article className="info-box public-ip-box">
              <span className="label">IP PÚBLICA DE INTERNET</span>
              <strong className="value">{deviceInfo.publicIp}</strong>
              <p className="box-note">
                {isRemoteServer
                  ? "IP pública de salida del servidor alojado."
                  : "IP pública de salida de tu conexión a Internet. Si estás detrás de un router, puede ser compartida por varios dispositivos."}
              </p>
            </article>
            <article className="info-box">
              <span className="label">DIRECCIONES IPv4 LOCALES</span>
              {deviceInfo.addresses.length > 0 ? (
                <ul className="address-list">
                  {deviceInfo.addresses.map(({ interface: interfaceName, address }) => (
                    <li className="address-item" key={address}>
                      <span className="value">{address}</span>
                      <span className="interface-name">{interfaceName}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-value">No se detectaron direcciones IPv4 locales.</p>
              )}
            </article>
            <p className="footnote">
              {isRemoteServer
                ? "Las direcciones locales pertenecen al servidor alojado. La IP pública se consulta desde ese servidor, no desde la computadora que visita la página."
                : "Las IP locales pertenecen a las interfaces de esta computadora. La IP pública se consulta a través de un servicio externo (ipify); tu solicitud de consulta sale desde tu conexión."}
            </p>
          </div>
        )}

        <button className="refresh-button" onClick={loadDeviceInfo} disabled={loading}>
          {loading ? "Actualizando…" : "Actualizar datos"}
        </button>
      </section>
      <footer>Hostname e IP locales del sistema; IP pública consultada en Internet.</footer>
    </main>
  );
}
