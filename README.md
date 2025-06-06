# Reserva Inteligente de Restaurantes

Sistema de gestión de reservas para restaurantes con API RESTful.

## Índice

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso de la API](#uso-de-la-api)
- [Documentación de la API](#documentación-de-la-api)
- [Endpoints](#endpoints)
  - [Autenticación](#autenticación)
  - [Usuarios](#usuarios)
  - [Restaurantes](#restaurantes)
  - [Menús](#menús)
  - [Reservas](#reservas)
  - [Pedidos](#pedidos)
- [Pruebas](#pruebas)

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/Reserva-Inteligente.git
cd Reserva-Inteligente
```

2. Instala las dependencias:

```bash
npm install
```

## Configuración

1. Copiá el archivo de ejemplo y renombralo a `.env`:

```bash
cp .env.example .env
```

2. Configurá tus variables de entorno dentro del `.env`, por ejemplo:

```
PORT=3000
DATABASE_URL=postgresql://usuario:password@localhost:5432/reserva_inteligente
JWT_SECRET=un_secreto_seguro
```

## Uso de la API

Para correr el servidor en modo desarrollo:

```bash
npm run dev
```

Accedé a la API en: [http://localhost:3000](http://localhost:3000)

## Documentación de la API

Una vez el servidor esté corriendo, accedé a:

```
http://localhost:3000/docs
```

Para ver todos los endpoints con Swagger UI.

## Endpoints

### Autenticación

- `POST /auth/register` → Registrar nuevo usuario
- `POST /auth/login` → Iniciar sesión y obtener token

### Usuarios

- `GET /users` (admin)
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id` (admin)

### Restaurantes

- `POST /restaurants` (admin)
- `GET /restaurants`
- `GET /restaurants/:id`
- `PUT /restaurants/:id` (admin)
- `DELETE /restaurants/:id` (admin)

### Menús

- `POST /restaurants/:id/menus` (admin)
- `GET /restaurants/:id/menus`
- `GET /menus/:id`
- `PUT /menus/:id` (admin)
- `DELETE /menus/:id` (admin)

### Reservas

- `POST /reservations` (autenticado)
- `GET /reservations` (autenticado)
- `GET /reservations/:id` (autenticado)
- `DELETE /reservations/:id` (autenticado)

### Pedidos

- `POST /orders` (autenticado)
- `GET /orders` (autenticado)
- `GET /orders/:id` (autenticado)
- `PUT /orders/:id` (autenticado)
- `DELETE /orders/:id` (autenticado)

## Pruebas

Ejecutá las pruebas con:

```bash
npm run test
```

También podés ver la cobertura:

```bash
npm run test:coverage
```

