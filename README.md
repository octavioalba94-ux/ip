# Información del equipo

Aplicación React con una API Node.js que consulta el hostname y las direcciones IPv4 locales de este equipo.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Aplicación local en Windows

Una página pública no puede leer silenciosamente el hostname ni las interfaces privadas de un equipo: el navegador lo impide por seguridad. La página publicada ofrece un enlace a la aplicación local. La aplicación local muestra directamente la IPv4 Ethernet, no la IP pública.

En Windows, instala Node.js 20.19 o superior, descarga este proyecto y ejecuta `Instalar inicio automatico.bat` una vez. El instalador prepara las dependencias y registra una tarea programada que inicia el servidor local oculto al iniciar sesión. Abre `http://localhost:3000` para consultar la dirección. Cada equipo debe ejecutar el instalador en su propia computadora.

```sh
npm install
npm run dev
```

Abre `http://localhost:3000` en la misma computadora. La IPv4 Ethernet y el hostname se consultan directamente en las interfaces de ese equipo.

La consulta local no requiere conexión a Internet. Si inicias el servidor manualmente con `npm run dev`, mantén abierta la terminal; para detenerlo, pulsa `Ctrl+C`. Cuando está instalado para inicio automático, Windows lo mantiene en segundo plano.

Para iniciar la aplicación manualmente, ejecuta `Iniciar aplicacion local.bat`. Para quitar el inicio automático, elimina la tarea programada **Informacion del equipo - servicio local** desde el Programador de tareas de Windows.

## Desarrollo remoto

Cada computadora necesita su propia instalación local; el servicio consulta el equipo en el que se está ejecutando.

## Producción

```sh
npm run build
npm start
```

El servicio escucha en el puerto `3000` por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

La página pública no puede leer por sí sola las direcciones de red locales. Pulsa **Abrir aplicación local** para ver la IPv4 Ethernet de este equipo; cada equipo debe tener instalada su propia aplicación. El servicio local se inicia automáticamente en segundo plano después de instalarlo.

## Publicar el frontend en GitHub Pages

GitHub Pages solo sirve el frontend estático; no ejecuta la API Node. El workflow `.github/workflows/deploy.yml` publica la página en `https://octavioalba94-ux.github.io/ip/` al hacer push a `main`. En la página pública, el enlace **Abrir aplicación local** lleva a la aplicación de ese mismo equipo.

En el repositorio, selecciona **Settings > Pages > Source > GitHub Actions**.
