# Información del equipo

Aplicación React con una API Node.js que consulta el hostname y las direcciones IPv4 locales en el sistema operativo, y obtiene la IP pública mediante ipify.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Aplicación local en Windows

Una página pública no puede leer silenciosamente el hostname ni las interfaces privadas de un equipo: el navegador lo impide por seguridad. La página publicada muestra la IP pública; para consultar la IPv4 Ethernet sin permisos del navegador, ejecuta la aplicación local en el equipo.

En Windows, instala Node.js 20.19 o superior, descarga este proyecto y ejecuta `Instalar inicio automatico.bat`. El instalador prepara las dependencias, registra el iniciador para que se ejecute al iniciar sesión y abre la aplicación local en `http://localhost:3000`. A partir del siguiente inicio de sesión, se abrirá automáticamente. Cada equipo debe ejecutar este instalador una vez.

```sh
npm install
npm run dev
```

Abre `http://localhost:3000` en la misma computadora. El hostname y las direcciones IPv4 locales se consultan en ese equipo. La IP pública se obtiene a través de ipify y corresponde a la dirección pública de salida de tu conexión a Internet; si estás detrás de un router o una VPN, puede ser compartida o corresponder a la salida de la VPN.

La consulta de la IP pública requiere conexión a Internet y envía una solicitud a `api.ipify.org`. Si el servicio externo no está disponible, la API informa un error en lugar de mostrar una dirección inventada. Mantén la terminal abierta mientras uses la página; para detener el servicio, pulsa `Ctrl+C` en esa terminal.

Para iniciar la aplicación manualmente, ejecuta `Iniciar aplicacion local.bat`. El inicio automático se puede quitar eliminando el acceso directo `Informacion del equipo` de la carpeta `shell:startup`.

## Desarrollo remoto

Cada computadora necesita su propia instalación local; el servicio consulta el equipo en el que se está ejecutando.

## Producción

```sh
npm run build
npm start
```

El servicio escucha en el puerto `3000` por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

La página pública solo muestra la IP pública porque los navegadores no permiten que un sitio web lea el hostname ni la IPv4 Ethernet del visitante. Ejecuta la aplicación local para consultar esos datos en el equipo sin permisos de acceso a la red local del navegador.

## Publicar el frontend en GitHub Pages

GitHub Pages solo sirve el frontend estático; no ejecuta la API Node. Para que la página muestre datos reales, primero despliega este backend en un servicio compatible con Node.js y configura estas variables de entorno en ese servicio:

- `WEB_ORIGIN`: `https://octavioalba94-ux.github.io`
- `PORT`: Render la configura automáticamente.

### API en Render

El archivo `render.yaml` define el servicio web `ip-device-api`. En Render, crea un **Blueprint** desde este repositorio y acepta la configuración detectada. Render instalará dependencias, compilará y ejecutará el servicio. Al terminar, copia el dominio asignado al servicio, por ejemplo `https://ip-device-api.onrender.com`.

En GitHub, abre **Settings > Secrets and variables > Actions > Variables**, crea la variable de repositorio `VITE_API_BASE_URL` y pega el origen público asignado por Render, sin `/api` al final. Si el dominio asignado difiere del ejemplo, usa el dominio real.

El workflow `.github/workflows/deploy.yml` compila y publica el frontend en `https://octavioalba94-ux.github.io/ip/` al hacer push a `main`. También puede ejecutarse manualmente desde la pestaña Actions.

En el repositorio, selecciona **Settings > Pages > Source > GitHub Actions**. El workflow no se desplegará hasta configurar `VITE_API_BASE_URL`.
