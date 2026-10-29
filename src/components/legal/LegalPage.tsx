/**
 * loomisuite.net/privacidad y loomisuite.net/terminos.
 * Texto revisado por la abogada (29/10/2026). Si cambia un proveedor, un precio o un plazo, actualizarlo acá
 * y la fecha de UPDATED. Página liviana: no carga la app.
 */
import React, { useEffect } from 'react';

export type LegalDoc = 'privacidad' | 'terminos';

const UPDATED = '29 de octubre de 2026';
const OWNER = 'María Gabriela Piccini';
const CUIT = '27-17515982-4';
const ADDRESS = 'General Pinto 1525, San Fernando (1646), provincia de Buenos Aires, Argentina';
const MAIL = 'contacto@loomisuite.net';

const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-xl font-bold text-white mt-10 mb-3">{children}</h2>
);
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-base font-normal leading-relaxed text-stone-100 mb-3">{children}</p>
);
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="list-disc pl-6 space-y-2 text-base font-normal leading-relaxed text-stone-100 mb-3">{children}</ul>
);
const Mail = () => (
  <a href={`mailto:${MAIL}`} className="font-semibold text-[#F5A35C] underline underline-offset-4">
    {MAIL}
  </a>
);

const Privacy: React.FC = () => (
  <>
    <H3>1. Quiénes somos</H3>
    <P>
      Loomi Suite es un servicio de {OWNER}, CUIT {CUIT}, con domicilio en {ADDRESS} ("Loomi", "nosotros"). Para cualquier
      consulta sobre tus datos, escribinos a <Mail />.
    </P>

    <H3>2. A quién se aplica</H3>
    <UL>
      <li>
        <strong className="text-white">Clientes:</strong> personas o empresas que contratan Loomi para gestionar su alojamiento, y las
        personas de su equipo que usan la app (Recepción, Limpieza).
      </li>
      <li>
        <strong className="text-white">Huéspedes:</strong> personas que se alojan en los alojamientos de nuestros clientes y cuyos datos
        el cliente carga en Loomi o que completan el pre check-in.
      </li>
      <li>
        <strong className="text-white">Visitantes y contactos:</strong> personas que navegan loomisuite.net, descargan nuestros
        manuales o nos escriben.
      </li>
    </UL>

    <H3>3. Qué datos recolectamos</H3>
    <div className="overflow-x-auto mb-3 rounded-2xl border border-zinc-700">
      <table className="w-full text-left text-sm sm:text-base font-normal text-stone-100">
        <thead className="bg-zinc-800 text-white">
          <tr>
            <th className="p-3 font-bold">Quién</th>
            <th className="p-3 font-bold">Datos</th>
            <th className="p-3 font-bold">Para qué</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700 align-top">
          <tr>
            <td className="p-3 font-semibold text-white">Clientes y su equipo</td>
            <td className="p-3">
              Nombre, email, cuenta de Google si inician sesión con ella, datos del alojamiento, tarifas, datos de cobro que el
              cliente decida cargar (alias, CBU)
            </td>
            <td className="p-3">Prestar el servicio, dar acceso a cada persona según su rol, soporte y facturación</td>
          </tr>
          <tr>
            <td className="p-3 font-semibold text-white">Huéspedes (cargados por el cliente)</td>
            <td className="p-3">Nombre, teléfono, email, fechas, unidad, importes y pagos, notas, datos de llegada</td>
            <td className="p-3">Que el cliente gestione sus reservas, cobros, limpiezas y mensajes</td>
          </tr>
          <tr>
            <td className="p-3 font-semibold text-white">Huéspedes (pre check-in)</td>
            <td className="p-3">
              Nombre completo, tipo y número de documento, nacionalidad, cantidad de personas y acompañantes, hora estimada de
              llegada, teléfono, comentarios, aceptación de las normas de la casa
            </td>
            <td className="p-3">Que el cliente registre el ingreso sin papeles. No pedimos foto del documento</td>
          </tr>
          <tr>
            <td className="p-3 font-semibold text-white">Visitantes y contactos</td>
            <td className="p-3">Nombre, email y WhatsApp si los dejan en un formulario, y los mensajes que nos mandan</td>
            <td className="p-3">Responder consultas, enviar los manuales pedidos y novedades de Loomi</td>
          </tr>
        </tbody>
      </table>
    </div>
    <P>No recolectamos datos sensibles (salud, religión, etc.) ni datos de tarjetas de crédito.</P>

    <H3>4. Rol de Loomi con los datos de huéspedes</H3>
    <P>
      Los datos de huéspedes pertenecen al cliente, que es el responsable de ellos. Loomi los guarda y procesa solo por su cuenta
      y para prestarle el servicio, sin usarlos para fines propios ni venderlos. Si sos huésped y querés ejercer tus derechos,
      podés dirigirte al alojamiento o a nosotros, y lo vamos a canalizar.
    </P>

    <H3>5. Con quién compartimos datos</H3>
    <P>No vendemos ni alquilamos datos. Usamos proveedores que los procesan por nuestra cuenta:</P>
    <UL>
      <li>
        <strong className="text-white">Google (Firebase y Google Cloud):</strong> inicio de sesión, base de datos y tareas automáticas.
      </li>
      <li>
        <strong className="text-white">Cloudflare:</strong> alojamiento de la web.
      </li>
      <li>
        <strong className="text-white">Anthropic (Claude), y Google (Gemini) como respaldo:</strong> responden las consultas que se le
        hacen a la asistente Xenia, con los datos necesarios para cada respuesta.
      </li>
      <li>
        <strong className="text-white">Zernio y Meta (WhatsApp):</strong> reciben y envían los mensajes que nos escriben al WhatsApp de
        Loomi. Xenia puede contestarlos de forma automática.
      </li>
      <li>
        <strong className="text-white">Web3Forms y EmailJS:</strong> avisos y mails cuando alguien se registra o completa un formulario
        de la web.
      </li>
    </UL>
    <P>
      Algunos de estos proveedores guardan los datos fuera de Argentina. Los mensajes de WhatsApp a los huéspedes los envía el
      propio cliente desde su teléfono: Loomi solo arma el texto.
    </P>

    <H3>6. Cuánto tiempo los guardamos</H3>
    <UL>
      <li>Datos de clientes: mientras la cuenta esté activa y hasta 30 días después de darla de baja, para permitir la exportación.</li>
      <li>
        Datos de huéspedes, incluido el pre check-in: mientras el cliente los mantenga en su cuenta. Si el cliente da de baja la
        cuenta, se borran a los 30 días.
      </li>
      <li>Contactos de la web: hasta que pidan la baja.</li>
    </UL>

    <H3>7. Seguridad</H3>
    <P>
      Cada cuenta solo accede a sus propios datos. El personal de Limpieza no ve teléfonos ni importes. Los datos viajan cifrados
      y la base de datos tiene reglas de acceso por rol.
    </P>

    <H3>8. Tus derechos</H3>
    <P>
      Podés pedir acceso, rectificación, actualización o supresión de tus datos escribiendo a <Mail />. Respondemos dentro de los
      plazos de la Ley 25.326 (10 días corridos para acceso, 5 días hábiles para rectificación o supresión).
    </P>
    <P>
      La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, atiende las denuncias y reclamos
      relacionados con el incumplimiento de las normas de protección de datos personales.
    </P>

    <H3>9. Cookies y almacenamiento local</H3>
    <P>
      La web guarda en tu navegador preferencias como el modo oscuro y datos de la demo. No usamos cookies de publicidad ni de
      seguimiento.
    </P>

    <H3>10. Cambios</H3>
    <P>Si cambiamos esta política, publicamos la nueva versión con su fecha y avisamos a los clientes por email.</P>
  </>
);

const Terms: React.FC = () => (
  <>
    <H3>1. El servicio</H3>
    <P>
      Loomi Suite es un sistema en la web para gestionar alojamientos: reservas, calendario, cobros, limpiezas, mensajes a
      huéspedes, guía digital, pre check-in y página de reservas directas (Tu Web). Lo presta {OWNER}, CUIT {CUIT}, con domicilio
      en {ADDRESS}. Al crear una cuenta, el cliente acepta estos términos y la{' '}
      <a href="/privacidad" className="font-semibold text-[#F5A35C] underline underline-offset-4">
        Política de privacidad
      </a>
      .
    </P>

    <H3>2. Cuenta y acceso</H3>
    <UL>
      <li>El cliente es responsable de la cuenta y de las personas de su equipo a las que invita.</li>
      <li>Cada persona entra con su propio usuario. Compartir usuarios no está permitido.</li>
      <li>El cliente debe avisarnos si sospecha un acceso indebido.</li>
    </UL>

    <H3>3. Prueba gratis, planes y pago</H3>
    <UL>
      <li>La prueba gratis dura 7 días, sin compromiso.</li>
      <li>
        Después, el servicio se paga por mes adelantado, según el plan elegido. Los precios están en dólares y se pagan por
        transferencia en pesos al dólar MEP del día, o en dólares por Payoneer. Los precios vigentes figuran en loomisuite.net y
        en Mi plan, dentro de la app.
      </li>
      <li>Los diseños especiales de Tu Web se pagan aparte, una sola vez.</li>
      <li>Si cambiamos los precios, avisamos con 30 días de anticipación.</li>
      <li>
        Si el pago no se acredita dentro de los 5 días del vencimiento, avisamos y podemos suspender el acceso hasta regularizarlo.
        Los datos no se borran por la suspensión.
      </li>
    </UL>

    <H3>4. Baja</H3>
    <P>
      El cliente puede dar de baja la suscripción cuando quiera, sin penalidad; el mes pagado no se reintegra. Antes de la baja
      puede pedir una copia de sus datos. Pasados 30 días de la baja, los datos se borran.
    </P>

    <H3>5. Qué hace y qué no hace Loomi</H3>
    <UL>
      <li>
        <strong className="text-white">Sincronización de calendarios:</strong> Loomi lee los calendarios de Airbnb, Booking y otros
        portales por iCal aproximadamente cada 15 minutos. No es instantáneo: puede haber un desfasaje y el cliente debe controlar
        sus reservas en cada portal. Loomi no responde por reservas superpuestas causadas por ese desfasaje o por fallas de los
        portales.
      </li>
      <li>
        <strong className="text-white">Tu Web:</strong> muestra disponibilidad y precio, y arma el pedido de reserva por WhatsApp. No
        cobra ni confirma reservas sola: el cliente confirma cada pedido.
      </li>
      <li>
        <strong className="text-white">Mensajes:</strong> Loomi prepara los mensajes; el envío lo hace el cliente desde su WhatsApp.
      </li>
      <li>
        <strong className="text-white">Asistente Xenia:</strong> da orientación general y puede equivocarse. No reemplaza el criterio
        del cliente.
      </li>
      <li>
        <strong className="text-white">Tarifas y cobros:</strong> Loomi calcula según lo que configura el cliente. No procesa pagos ni
        retiene dinero.
      </li>
      <li>
        Loomi no emite comprobantes fiscales ni reemplaza obligaciones impositivas o registros que exija la autoridad turística
        local.
      </li>
    </UL>

    <H3>6. Obligaciones del cliente</H3>
    <UL>
      <li>Cargar datos correctos y tener derecho a cargarlos, incluidos los de sus huéspedes.</li>
      <li>Informar a sus huéspedes sobre el uso de sus datos, como responsable de ellos.</li>
      <li>No usar Loomi para fines ilícitos ni intentar acceder a datos de otras cuentas.</li>
    </UL>

    <H3>7. Disponibilidad</H3>
    <P>
      Hacemos lo posible para que el servicio funcione siempre, pero no garantizamos que esté libre de interrupciones o errores.
      Las tareas de mantenimiento se avisan cuando es posible. Soporte por WhatsApp de 8 a 22 hs.
    </P>

    <H3>8. Responsabilidad</H3>
    <P>
      En la máxima medida permitida por la ley, la responsabilidad de Loomi frente al cliente se limita al monto pagado en los
      últimos 3 meses. Loomi no responde por lucro cesante ni por daños causados por portales, proveedores externos o datos mal
      cargados.
    </P>

    <H3>9. Propiedad intelectual</H3>
    <P>El software, la marca Loomi Suite y los manuales son de {OWNER}. Los datos que carga el cliente son del cliente.</P>

    <H3>10. Cambios a estos términos</H3>
    <P>
      Podemos actualizar estos términos y avisaremos por email con 15 días de anticipación. Si el cliente no está de acuerdo,
      puede darse de baja.
    </P>

    <H3>11. Ley y jurisdicción</H3>
    <P>
      Se aplica la ley argentina. Ante cualquier conflicto, son competentes los tribunales ordinarios del Departamento Judicial de
      San Isidro, provincia de Buenos Aires. Si el cliente es consumidor, puede reclamar también ante los tribunales de su
      domicilio.
    </P>
  </>
);

export const LegalPage: React.FC<{ doc: LegalDoc }> = ({ doc }) => {
  const title = doc === 'privacidad' ? 'Política de privacidad' : 'Términos y condiciones';
  useEffect(() => {
    document.title = `${title} · Loomi Suite`;
    document.documentElement.classList.add('dark');
  }, [title]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-stone-100 font-normal">
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-2 flex items-center justify-between gap-4">
        <a href="/" className="text-xl font-light tracking-widest text-white">
          loomi<span className="font-semibold text-[#E67E22]">suite</span>
        </a>
        <nav className="flex gap-4 text-sm font-semibold">
          <a href="/privacidad" className={doc === 'privacidad' ? 'text-white underline underline-offset-4' : 'text-stone-200 hover:text-white'}>
            Privacidad
          </a>
          <a href="/terminos" className={doc === 'terminos' ? 'text-white underline underline-offset-4' : 'text-stone-200 hover:text-white'}>
            Términos
          </a>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm font-semibold text-stone-200">Última actualización: {UPDATED}</p>
        {doc === 'privacidad' ? <Privacy /> : <Terms />}
        <p className="mt-12 text-base text-stone-100">
          ¿Dudas? Escribinos a <Mail />.
        </p>
      </main>
    </div>
  );
};
