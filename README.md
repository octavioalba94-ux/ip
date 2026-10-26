# Información del equipo

Aplicación React con una API Node.js que consulta el hostname y las direcciones IPv4 directamente al sistema operativo de la máquina donde se ejecuta Node.js.

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

Abre `http://localhost:3000` en la misma computadora. El hostname y las direcciones IPv4 mostradas entonces se consultan en ese equipo. Mantén la terminal abierta mientras uses la página; para detener el servicio, pulsa `Ctrl+C` en esa terminal.

Las IPv4 pueden ser privadas de tu red local; no necesariamente son la IP pública de Internet.

## Desarrollo remoto

Para consultar la información del servidor desde otro dispositivo de la misma red, usa la dirección IPv4 del equipo que ejecuta Node.js y permite el puerto 3000 en el firewall si es necesario. La página pública desplegada en Render consulta únicamente el servidor Render.

## Producción

```sh
npm run build
npm start
```

El servicio escucha en el puerto `3000` por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

Las direcciones que se muestran son las IPv4 de las interfaces de red del servidor. Pueden ser direcciones privadas de una red local; no representan necesariamente la IP pública de Internet.

## Publicar el frontend en GitHub Pages

GitHub Pages solo sirve el frontend estático; no ejecuta la API Node. Para que la página muestre datos reales, primero despliega este backend en un servicio compatible con Node.js y configura estas variables de entorno en ese servicio:

- `WEB_ORIGIN`: `https://octavioalba94-ux.github.io`
- `PORT`: Render la configura automáticamente.

### API en Render

El archivo `render.yaml` define el servicio web `ip-device-api`. En Render, crea un **Blueprint** desde este repositorio y acepta la configuración detectada. Render instalará dependencias, compilará y ejecutará el servicio. Al terminar, copia el dominio asignado al servicio, por ejemplo `https://ip-device-api.onrender.com`.

En GitHub, abre **Settings > Secrets and variables > Actions > Variables**, crea la variable de repositorio `VITE_API_BASE_URL` y pega el origen público asignado por Render, sin `/api` al final. Si el dominio asignado difiere del ejemplo, usa el dominio real.

El workflow `.github/workflows/deploy.yml` compila y publica el frontend en `https://octavioalba94-ux.github.io/ip/` al hacer push a `main`. También puede ejecutarse manualmente desde la pestaña Actions.

En el repositorio, selecciona **Settings > Pages > Source > GitHub Actions**. El workflow no se desplegará hasta configurar `VITE_API_BASE_URL`.
