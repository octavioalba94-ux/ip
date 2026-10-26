import { useEffect, useState } from "react";

const isPublicSite = import.meta.env.VITE_PUBLIC_SITE === "true";

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isPublicSite);
  const ethernetAddress = deviceInfo?.addresses
    ?.find(({ interface: interfaceName }) => /^Ethernet(?:\s+\d+)?$/i.test(interfaceName))
    ?.address;

  async function loadDeviceInfo() {
    setLoading(true);
    setError("");

    try {
      const endpoint = isPublicSite
        ? "http://localhost:3000/api/device-info"
        : "/api/device-info";
      const deviceInfoResponse = await fetch(endpoint);
      if (!deviceInfoResponse.ok) {
        throw new Error(`El servicio local respondió con el estado ${deviceInfoResponse.status}.`);
      }

      setDeviceInfo(await deviceInfoResponse.json());
    } catch (loadError) {
      setDeviceInfo(null);
      setError(
        isPublicSite
          ? "No se pudo acceder al servicio local. Confirma el permiso de red local del navegador y que el servicio esté instalado y activo en este equipo."
          : loadError.message || "No se pudo obtener la información del equipo.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isPublicSite) loadDeviceInfo();
  }, []);

  return (
    <main className="page">
      <section className="card" aria-labelledby="page-title">
        <div className="eyebrow">
          <span className="status-dot" />
          {isPublicSite ? "IPv4 LOCAL (ETHERNET)" : "DATOS DE ESTA COMPUTADORA"}
        </div>
        <h1 id="page-title">{isPublicSite ? "Consulta tu IPv4 local" : "IPv4 local de Ethernet"}</h1>
        <p className="intro">
          {isPublicSite
            ? "Pulsa el botón para solicitar acceso y consultar directamente la IPv4 Ethernet. Si el servicio no está activo, ejecuta “Iniciar aplicacion local.bat” en este equipo."
            : "Esta es la dirección IPv4 asignada a la interfaz Ethernet de esta computadora."}
        </p>

        {loading ? (
          <p className="message" role="status">Solicitando acceso y consultando el equipo…</p>
        ) : error ? (
          <div className="error" role="alert">
            <p>{error}</p>
            <button className="retry-button" onClick={loadDeviceInfo}>Intentar de nuevo</button>
          </div>
        ) : deviceInfo ? (
          <div className="details">
            {ethernetAddress ? (
              <article className="info-box">
                <span className="label">IPv4 LOCAL (ETHERNET)</span>
                <strong className="value ethernet-value">{ethernetAddress}</strong>
                <p className="box-note">Esta es la dirección local de tu adaptador Ethernet.</p>
              </article>
            ) : (
              <article className="info-box">
                <span className="label">IPv4 LOCAL (ETHERNET)</span>
                <p className="empty-value">No se encontró una IPv4 en la interfaz Ethernet.</p>
              </article>
            )}
            <article className="info-box">
              <span className="label">HOSTNAME DE ESTA COMPUTADORA</span>
              <strong className="value">{deviceInfo.hostname}</strong>
            </article>
            <p className="footnote">
              El dato mostrado es la dirección IPv4 local del adaptador Ethernet; no es la IP pública de Internet.
            </p>
          </div>
        ) : isPublicSite ? (
          <div className="details">
            <button className="refresh-button" onClick={loadDeviceInfo}>
              Consultar IPv4 LOCAL (ETHERNET)
            </button>
            <p className="footnote">
              El navegador puede solicitar permiso de red local. Si el servicio no responde, ejecuta “Iniciar aplicacion local.bat” en esta computadora.
            </p>
          </div>
        ) : (
          <p className="message" role="status">Consultando el equipo…</p>
        )}

        {deviceInfo && (
          <button className="refresh-button" onClick={loadDeviceInfo} disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar datos"}
          </button>
        )}
      </section>
      <footer>
        {isPublicSite
          ? "La página consulta el servicio local de este equipo después de autorizar el acceso en el navegador."
          : "Dirección IPv4 de Ethernet obtenida desde las interfaces de red de este equipo."}
      </footer>
    </main>
  );
}
