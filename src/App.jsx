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
        const [publicIpResponse, localDeviceResponse] = await Promise.all([
          fetch("https://api.ipify.org?format=json"),
          fetch("http://localhost:3000/api/device-info"),
        ]);
        if (!publicIpResponse.ok) {
          throw new Error(`El servicio de IP pública respondió con el estado ${publicIpResponse.status}.`);
        }
        if (!localDeviceResponse.ok) {
          throw new Error(`El servicio local respondió con el estado ${localDeviceResponse.status}.`);
        }

        deviceInfo.publicIp = (await publicIpResponse.json()).ip;
        const localDeviceInfo = await localDeviceResponse.json();
        deviceInfo.hostname = localDeviceInfo.hostname;
        deviceInfo.addresses = localDeviceInfo.addresses;
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
          ? "No se pudo leer la red local de esta computadora. Ejecuta “Iniciar aplicacion local.bat” y concede al navegador permiso para acceder a la red local."
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
          {isRemoteServer ? "DATOS DE TU COMPUTADORA" : "DATOS DE ESTA COMPUTADORA"}
        </div>
        <h1 id="page-title">Tu equipo, en un vistazo</h1>
        <p className="intro">
          {isRemoteServer
            ? "Esta página obtiene el hostname y la IP Ethernet del servicio local de tu computadora, y consulta la IP pública de tu conexión."
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
              <span className="label">HOSTNAME DE ESTA COMPUTADORA</span>
              <strong className="value">{deviceInfo.hostname}</strong>
            </article>
            <article className="info-box public-ip-box">
              <span className="label">IP PÚBLICA DE INTERNET</span>
              <strong className="value">{deviceInfo.publicIp}</strong>
              <p className="box-note">
                IP pública de salida de tu conexión a Internet. Si estás detrás de un router o VPN, puede ser compartida o corresponder a su salida.
              </p>
            </article>
            <article className="info-box">
              <span className="label">IPv4 LOCAL (ETHERNET)</span>
              {ethernetAddress ? (
                <strong className="value">{ethernetAddress}</strong>
              ) : (
                <p className="empty-value">No se encontró una IPv4 en la interfaz Ethernet.</p>
              )}
            </article>
            <p className="footnote">
              {isRemoteServer
                ? "El sitio desplegado consulta el equipo local porque iniciaste el servicio en esta computadora. Si no está activo o el navegador bloquea el acceso, inicia “Iniciar aplicacion local.bat” y permite el acceso a la red local."
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
          ? "Hostname e IP Ethernet desde el servicio local; IP pública consultada mediante ipify."
          : "Hostname e IP locales del sistema; IP pública consultada en Internet."}
      </footer>
    </main>
  );
}
