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
  const ethernetAddress = deviceInfo?.addresses
    ?.find(({ interface: interfaceName }) => /^Ethernet(?:\s+\d+)?$/i.test(interfaceName))
    ?.address;

  async function loadDeviceInfo() {
    setLoading(true);
    setError("");

    try {
      let deviceInfo = {};
      if (isRemoteServer) {
        const publicIpResponse = await fetch("https://api.ipify.org?format=json");
        if (!publicIpResponse.ok) {
          throw new Error(`El servicio de IP pública respondió con el estado ${publicIpResponse.status}.`);
        }

        deviceInfo.publicIp = (await publicIpResponse.json()).ip;
      } else {
        const deviceInfoResponse = await fetch("/api/device-info");
        if (!deviceInfoResponse.ok) {
          throw new Error(`El servidor respondió con el estado ${deviceInfoResponse.status}.`);
        }

        deviceInfo = await deviceInfoResponse.json();
      }

      if (typeof deviceInfo.publicIp !== "string" || !isIPv4Address(deviceInfo.publicIp)) {
        throw new Error("No se recibió una dirección IPv4 pública válida.");
      }

      setDeviceInfo(deviceInfo);
    } catch (loadError) {
      setError(
        isRemoteServer
          ? "No se pudo consultar la IP pública. Comprueba tu conexión a Internet e inténtalo de nuevo."
          : loadError.message || "No se pudo obtener la información del equipo.",
      );
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
          {isRemoteServer ? "IP PÚBLICA DE INTERNET" : "DATOS DE ESTA COMPUTADORA"}
        </div>
        <h1 id="page-title">Tu equipo, en un vistazo</h1>
        <p className="intro">
          {isRemoteServer
            ? "La página pública muestra la IP pública de tu conexión. Para consultar el hostname y la IPv4 local Ethernet, abre la aplicación instalada en tu equipo."
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
            {!isRemoteServer && (
              <article className="info-box">
                <span className="label">HOSTNAME DE ESTA COMPUTADORA</span>
                <strong className="value">{deviceInfo.hostname}</strong>
              </article>
            )}
            <article className="info-box public-ip-box">
              <span className="label">IP PÚBLICA DE INTERNET</span>
              <strong className="value">{deviceInfo.publicIp}</strong>
              <p className="box-note">
                IP pública de salida de tu conexión a Internet. Si estás detrás de un router o VPN, puede ser compartida o corresponder a su salida.
              </p>
            </article>
            {!isRemoteServer && (
              <article className="info-box">
                <span className="label">IPv4 LOCAL (ETHERNET)</span>
                {ethernetAddress ? (
                  <strong className="value">{ethernetAddress}</strong>
                ) : (
                  <p className="empty-value">No se encontró una IPv4 en la interfaz Ethernet.</p>
                )}
              </article>
            )}
            <p className="footnote">
              {isRemoteServer
                ? "Por seguridad, el navegador no permite que una página pública lea silenciosamente el hostname o la IP Ethernet. La aplicación local obtiene esos datos sin pedir permiso al navegador."
                : "Las IP locales pertenecen a las interfaces de esta computadora. La IP pública se consulta a través de un servicio externo (ipify); tu solicitud de consulta sale desde tu conexión."}
            </p>
          </div>
        )}

        <button className="refresh-button" onClick={loadDeviceInfo} disabled={loading}>
          {loading ? "Actualizando…" : "Actualizar datos"}
        </button>
      </section>
      <footer>
        {isRemoteServer
          ? "IP pública consultada mediante ipify. Hostname e IPv4 Ethernet disponibles en la aplicación local."
          : "Hostname e IP locales del sistema; IP pública consultada en Internet."}
      </footer>
    </main>
  );
}
