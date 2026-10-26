# Información del equipo

Aplicación React con una API Node.js que consulta el hostname y las direcciones IPv4 locales de este equipo.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Aplicación local en Windows

Una página pública no puede leer silenciosamente el hostname ni las interfaces privadas de un equipo: el navegador lo impide por seguridad. La página publicada ofrece un enlace a la aplicación local. La aplicación local muestra directamente la IPv4 Ethernet, no la IP pública.

En Windows, instala Node.js 20.19 o superior, descarga este proyecto y ejecuta `Instalar inicio automatico.bat`. El instalador prepara las dependencias, registra el iniciador para que se ejecute al iniciar sesión y abre la aplicación local en `http://localhost:3000`. A partir del siguiente inicio de sesión, se abrirá automáticamente. Cada equipo debe ejecutar este instalador una vez.

```sh
npm install
npm run dev
```

Abre `http://localhost:3000` en la misma computadora. La IPv4 Ethernet y el hostname se consultan directamente en las interfaces de ese equipo.

La consulta local no requiere conexión a Internet. Mantén la terminal abierta mientras uses la página; para detener el servicio, pulsa `Ctrl+C` en esa terminal.

Para iniciar la aplicación manualmente, ejecuta `Iniciar aplicacion local.bat`. El inicio automático se puede quitar eliminando el acceso directo `Informacion del equipo` de la carpeta `shell:startup`.

## Desarrollo remoto

Cada computadora necesita su propia instalación local; el servicio consulta el equipo en el que se está ejecutando.

## Producción

```sh
npm run build
npm start
```

El servicio escucha en el puerto `3000` por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

La página pública no intenta leer direcciones de red ni muestra la IP pública. Pulsa **Abrir aplicación local** para ver la IPv4 Ethernet de este equipo; cada equipo debe tener instalada y en ejecución su propia aplicación.

## Publicar el frontend en GitHub Pages

GitHub Pages solo sirve el frontend estático; no ejecuta la API Node. El workflow `.github/workflows/deploy.yml` publica la página en `https://octavioalba94-ux.github.io/ip/` al hacer push a `main`. En la página pública, el enlace **Abrir aplicación local** lleva a la aplicación de ese mismo equipo.

En el repositorio, selecciona **Settings > Pages > Source > GitHub Actions**.
