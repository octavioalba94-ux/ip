# Información del equipo

Aplicación React con una API Node.js que consulta el hostname y las direcciones IPv4 locales en el sistema operativo, y obtiene la IP pública mediante ipify.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Ver los datos de tu propia computadora

La página pública de GitHub Pages muestra el equipo donde está alojada la API (Render), no la computadora del visitante. Los navegadores no permiten que una página pública lea el hostname ni las interfaces de red privadas del dispositivo que la visita.

Para mostrar los datos reales de tu computadora:

```sh
npm install
npm run dev
```

Abre `http://localhost:3000` en la misma computadora. El hostname y las direcciones IPv4 locales se consultan en ese equipo. La IP pública se obtiene a través de ipify y corresponde a la dirección pública de salida de tu conexión a Internet; si estás detrás de un router o una VPN, puede ser compartida o corresponder a la salida de la VPN.

La consulta de la IP pública requiere conexión a Internet y envía una solicitud a `api.ipify.org`. Si el servicio externo no está disponible, la API informa un error en lugar de mostrar una dirección inventada. Mantén la terminal abierta mientras uses la página; para detener el servicio, pulsa `Ctrl+C` en esa terminal.

En Windows, también puedes ejecutar `Iniciar aplicacion local.bat`: inicia el servicio si hace falta, espera a que responda y abre la página local.

## Desarrollo remoto

Para consultar la información del servidor desde otro dispositivo de la misma red, usa la dirección IPv4 del equipo que ejecuta Node.js y permite el puerto 3000 en el firewall si es necesario. La página pública desplegada en Render consulta únicamente el servidor Render.

## Producción

```sh
npm run build
npm start
```

El servicio escucha en el puerto `3000` por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

La IP pública que muestra una instalación en Render corresponde al servidor Render, no al visitante. Las IP locales pueden ser privadas y los adaptadores virtuales (por ejemplo WSL) aparecen identificados por su nombre de interfaz.

## Publicar el frontend en GitHub Pages

GitHub Pages solo sirve el frontend estático; no ejecuta la API Node. Para que la página muestre datos reales, primero despliega este backend en un servicio compatible con Node.js y configura estas variables de entorno en ese servicio:

- `WEB_ORIGIN`: `https://octavioalba94-ux.github.io`
- `PORT`: Render la configura automáticamente.

### API en Render

El archivo `render.yaml` define el servicio web `ip-device-api`. En Render, crea un **Blueprint** desde este repositorio y acepta la configuración detectada. Render instalará dependencias, compilará y ejecutará el servicio. Al terminar, copia el dominio asignado al servicio, por ejemplo `https://ip-device-api.onrender.com`.

En GitHub, abre **Settings > Secrets and variables > Actions > Variables**, crea la variable de repositorio `VITE_API_BASE_URL` y pega el origen público asignado por Render, sin `/api` al final. Si el dominio asignado difiere del ejemplo, usa el dominio real.

El workflow `.github/workflows/deploy.yml` compila y publica el frontend en `https://octavioalba94-ux.github.io/ip/` al hacer push a `main`. También puede ejecutarse manualmente desde la pestaña Actions.

En el repositorio, selecciona **Settings > Pages > Source > GitHub Actions**. El workflow no se desplegará hasta configurar `VITE_API_BASE_URL`.
