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
    if (isPublicSite) return;

    setLoading(true);
    setError("");

    try {
      const deviceInfoResponse = await fetch("/api/device-info");
      if (!deviceInfoResponse.ok) {
        throw new Error(`El servidor respondió con el estado ${deviceInfoResponse.status}.`);
      }

      setDeviceInfo(await deviceInfoResponse.json());
    } catch (loadError) {
      setError(loadError.message || "No se pudo obtener la información del equipo.");
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
            ? "Para proteger tu privacidad, el navegador no permite que esta página lea la red local. Abre la aplicación local en este mismo equipo para ver la IPv4 real de Ethernet."
            : "Esta es la dirección IPv4 asignada a la interfaz Ethernet de esta computadora."}
        </p>

        {isPublicSite ? (
          <div className="details">
            <a className="refresh-button local-app-link" href="http://localhost:3000">
              Abrir aplicación local
            </a>
            <p className="footnote">
              Si no abre, instala la aplicación en este equipo y ejecuta “Instalar inicio automatico.bat” una vez.
            </p>
          </div>
        ) : loading ? (
          <p className="message" role="status">Consultando el equipo…</p>
        ) : error ? (
          <div className="error" role="alert">
            <p>{error}</p>
            <button className="retry-button" onClick={loadDeviceInfo}>Intentar de nuevo</button>
          </div>
        ) : (
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
        )}

        {!isPublicSite && (
          <button className="refresh-button" onClick={loadDeviceInfo} disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar datos"}
          </button>
        )}
      </section>
      <footer>
        {isPublicSite
          ? "La aplicación local muestra la IPv4 Ethernet de este equipo."
          : "Dirección IPv4 de Ethernet obtenida desde las interfaces de red de este equipo."}
      </footer>
    </main>
  );
}
