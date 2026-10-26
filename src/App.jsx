import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const isRemoteServer = Boolean(API_BASE_URL);

function isIPv4Address(value) {
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => {
    const octet = Number(part);
    return /^\d{1,3}$/.test(part) && octet >= 0 && octet <= 255;
  });
}

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDeviceInfo() {
    setLoading(true);
    setError("");

    try {
      const deviceInfoResponse = await fetch(`${API_BASE_URL}/api/device-info`);
      if (!deviceInfoResponse.ok) {
        throw new Error(`El servidor respondió con el estado ${deviceInfoResponse.status}.`);
      }

      const deviceInfo = await deviceInfoResponse.json();
      let publicIp = deviceInfo.publicIp;
      if (isRemoteServer) {
        const publicIpResponse = await fetch("https://api.ipify.org?format=json");
        if (!publicIpResponse.ok) {
          throw new Error(`El servicio de IP pública respondió con el estado ${publicIpResponse.status}.`);
        }

        publicIp = (await publicIpResponse.json()).ip;
      }

      if (typeof publicIp !== "string" || !isIPv4Address(publicIp)) {
        throw new Error("No se recibió una dirección IPv4 pública válida.");
      }

      setDeviceInfo({ ...deviceInfo, publicIp });
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
            ? "El hostname y las IP locales son del servidor alojado; la IP pública corresponde a tu conexión. Ejecuta la aplicación localmente para ver el hostname de tu equipo."
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
                  ? "IP pública de la conexión desde la que abriste esta página."
                  : "IP pública de salida de tu conexión a Internet. Si estás detrás de un router, puede ser compartida por varios dispositivos."}
              </p>
            </article>
            <article className="info-box">
              <span className="label">DIRECCIONES IPv4 LOCALES</span>
              {deviceInfo.addresses.length > 0 ? (
                <ul className="address-list">
                  {deviceInfo.addresses.map((item) => {
                    const { interface: interfaceName, address } = typeof item === "string"
                      ? { interface: "", address: item }
                      : item;
                    return (
                      <li className="address-item" key={address}>
                        <span className="value">{address}</span>
                        {interfaceName && <span className="interface-name">{interfaceName}</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="empty-value">No se detectaron direcciones IPv4 locales.</p>
              )}
            </article>
            <p className="footnote">
              {isRemoteServer
                ? "El hostname y las direcciones locales pertenecen al servidor alojado. La IP pública se consulta desde tu navegador; si usas una VPN o proxy, se mostrará su IP de salida."
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
