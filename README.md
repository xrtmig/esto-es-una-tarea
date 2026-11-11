# Wayra Perú — Portal de acceso

Login profesional con identidad peruana y fondos exóticos del Perú.
**100 % estático:** HTML + CSS + JavaScript puro. Sin Node.js, sin frameworks,
sin build ni dependencias. Se abre con doble clic o con cualquier servidor estático.

## Archivos

```
index.html          Estructura (login, registro, 2FA, éxito, modal de recuperación)
css/styles.css      Diseño completo, responsive y accesible
js/app.js           Validaciones, carrusel, 2FA simulado, toasts
img/                3 fondos del Perú (Machu Picchu, Amazonía, Vinicunca) + favicon
```

## Cómo verlo

Opción 1 — doble clic en `index.html`.

Opción 2 — servidor estático de Python (no requiere Node):

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

## Cuenta de demostración

| Campo | Valor |
|---|---|
| DNI | `71234567` |
| Correo | `demo@wayra.pe` |
| Contraseña | `Peru2026!` |

Cualquier código de 6 dígitos es válido en el paso de verificación.

## Qué incluye

- **Fondos exóticos del Perú** con carrusel automático, efecto Ken Burns, velo
  duotono y grano fotográfico para que el texto siempre se lea.
- **Diseño en dos paneles**: escena peruana a la izquierda, formulario claro a la
  derecha; en móvil se colapsa a una sola columna.
- **Iniciar sesión / Crear cuenta** con pestañas animadas.
- **Validación peruana real**: DNI de 8 dígitos, celular `9XXXXXXXX`, 25 regiones,
  tipos de documento (DNI, carné de extranjería, pasaporte).
- **Medidor de fortaleza** de contraseña y aviso de **Bloq Mayús**.
- **Verificación 2FA** con 6 casillas (autotab, pegado, flechas, retroceso) y
  reenvío con cuenta atrás.
- **Recuperación de contraseña** en modal con foco atrapado y cierre con `Esc`.
- Toasts, estados de carga, validación en vivo y pantalla de sesión iniciada.
- Paleta inspirada en el Perú: dorado inca, jade andino y papel cálido.
- Accesibilidad: roles ARIA, foco visible, `prefers-reduced-motion` y navegación
  por teclado.

## Notas

Es una maqueta de interfaz: no hay backend ni envío de datos a ningún servidor.
Las credenciales se validan en el navegador solo para demostrar el flujo completo.
