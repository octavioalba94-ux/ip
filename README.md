# Información del equipo

Aplicación web en React que muestra el hostname y las direcciones IPv4 no internas del equipo donde se ejecuta el servicio. La API de Node.js consulta los datos directamente al sistema operativo; no usa valores de ejemplo ni servicios externos.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Desarrollo

```sh
npm install
npm run dev
```

Abre `http://localhost:3000`. Para entrar desde otro dispositivo de la misma red, usa la dirección IPv4 del equipo servidor y permite el puerto 3000 en el firewall si es necesario.

## Producción

```sh
npm run build
npm start
```

El servicio escucha en el puerto `3000` por defecto. Puedes cambiarlo con la variable de entorno `PORT`.

Las direcciones que se muestran son las IPv4 de las interfaces de red del servidor. Pueden ser direcciones privadas de una red local; no representan necesariamente la IP pública de Internet.
