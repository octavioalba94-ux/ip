import { useEffect, useState } from "react";

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDeviceInfo() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/device-info");
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
        <div className="eyebrow"><span className="status-dot" /> INFORMACIÓN DEL SERVIDOR</div>
        <h1 id="page-title">Tu equipo, en un vistazo</h1>
        <p className="intro">
          Datos actuales del equipo donde se está ejecutando este servicio web.
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
            <article className="info-box">
              <span className="label">DIRECCIONES IPv4</span>
              {deviceInfo.addresses.length > 0 ? (
                <ul className="address-list">
                  {deviceInfo.addresses.map((address) => (
                    <li className="value" key={address}>{address}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-value">No se detectaron direcciones IPv4 externas.</p>
              )}
            </article>
            <p className="footnote">
              Las direcciones mostradas pertenecen a las interfaces de red del servidor;
              pueden ser privadas y no necesariamente son la IP pública de Internet.
            </p>
          </div>
        )}

        <button className="refresh-button" onClick={loadDeviceInfo} disabled={loading}>
          {loading ? "Actualizando…" : "Actualizar datos"}
        </button>
      </section>
      <footer>Información obtenida en tiempo real desde el sistema operativo.</footer>
    </main>
  );
}
