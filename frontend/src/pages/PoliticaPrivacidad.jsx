import "../assets/css/home.css";
import { useNavigate } from "react-router-dom";

function PoliticaPrivacidad() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Boton de regreso */}
      <div style={{ maxWidth: "1100px", margin: "24px auto 0", padding: "0 20px", width: "100%" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "1.5px solid #1e3a8a",
            color: "#1e3a8a",
            padding: "8px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Volver al inicio
        </button>
      </div>

      {/* Contenido principal */}
      <div style={{ padding: "28px 20px 60px", flexGrow: 1 }}>
        <div className="policy-container">

          {/* Columna izquierda: texto legal */}
          <div className="policy-text">

            <h1>Política de Privacidad</h1>

            <h2>Política de Privacidad</h2>

              <p>La presente Política de Privacidad de Datos Personales (en adelante, Política de Privacidad) tiene como propuesta explicarle como SOTTER EXPRESS.S.A.C (en adelante, CERTIA), con RUC N 10720773169 y domicilio en Mz “ñ” lote 22 urb El Pacifico, S.M.P, Lima, lleva a cabo el tratamiento de los datos personales que obtiene de sus usuarios a través de formularios electrónicos disponibles en el sitio web https://certia.pe/ (en adelante, Sitio Web), así como mediante consentimientos expresos otorgados por escrito o en línea.</p>

              <p>En esta Política de Privacidad, hacemos referencia a CERTIA, mientras que Usuario se refiere a toda persona que navegue, utilice o realice transacciones a través del Sitio Web. En CERTIA nos comprometemos a garantizar la máxima seguridad y confidencialidad de los datos personales de nuestros usuarios.</p>

              <p>Le invitamos a leer atentamente esta Política de Privacidad antes de compartir sus datos personales de manera voluntaria. Si esto de acuerdo, le pedimos que marque la casilla de aceptación de forma previa y expresa. Estos datos son indispensables para cumplir con los objetivos descritos en este documento; De no autorizar su tratamiento, no podremos llevar a cabo dichos fines.</p>

              <h2>Marco Normativo y Principios</h2>

              <p>Esta Política de Privacidad se rige por la normativa peruana, incluyendo:</p>

            <ul>
              <li>Ley N° 29733 (en adelante, «Ley»).</li>
              <li>Decreto Supremo N° 003-2013-JUS, Reglamento de la Ley N° 29733 (en adelante, «Reglamento»).</li>
              <li>Directiva de Seguridad de la Información, aprobada por Resolución Directoral N° 019-2013-JUS/DGPDP (en adelante, «Directiva»).</li>
              <li>Ley N° 29571, Código de Protección y Defensa del Consumidor.</li>
            </ul>

            <h2>¿Qué datos recopilamos?</h2>

              <p>En CERTIA recolectamos la siguiente información:</p>

              <p><strong>A. Datos personales facilitados por el usuario:</strong> Al registrarse, crear una cuenta o realizar compras en el Sitio Web, se solicita: nombre completo, número de DNI o Carne de Extranjeria, fecha de nacimiento, género, teléfono movil, teléfono fijo (si aplica), dirección postal y correo electrónico.</p>

              <p><strong>B. Datos de navegación:</strong> Información obtenida durante el uso del Sitio Web, como:</p>

            <ul>
              <li>Patrones de navegación, historial de transacciones y preferencias del usuario.</li>
              <li>Direcciones URL de origen y visitadas (incluso externas al Sitio Web).</li>
              <li>Dirección IP, tipo de navegador y dispositivo utilizado.</li>
              <li>Estadísticas de uso, tráfico web y ubicación aproximada del usuario.</li>
              <li>Datos del sistema operativo y modelo del dispositivo móvil (en adelante, Datos de Navegación).</li>
            </ul>

            <h2>Veracidad de los Datos</h2>

              <p>El usuario asegura que los datos personales proporcionados son veraces, completos y actualizados, siendo responsable de su autenticidad y vigencia. CERTIA podrá validar esta información mediante fuentes públicas o servicios especializados. No asumimos responsabilidad por datos inexactos ni por perjuicios derivados de su uso, especialmente si no han sido elaborados por nosotros.</p>

            <h2>Banco de Datos</h2>

              <p>El usuario autoriza expresamente la inclusión de sus datos en el banco de datos "CERTIA Usuarios", gestionado y protegido en servidores bajo la titularidad de CERTIA.</p>

            <h2>¿Con qué fines utilizamos los datos?</h2>

              <p>Los datos se emplean para:</p>

            <ul>
              <li>Gestionar el registro y ofrecer asistencia técnica al usuario.</li>
              <li>Confirmar y autenticar la identidad del usuario.</li>
              <li>Analizar las actividades del usuario en el Sitio Web para personalizar servicios y contenidos según sus intereses, como acceso a su historial de transacciones.</li>
              <li>Prestar los servicios ofrecidos por CERTIA.</li>
              <li>Transferir datos a proveedores de infraestructura en la nube en el extranjero (actualmente Hostinger, con sede Lituania (Vilna).) para almacenamiento y procesamiento, lo cual es esencial para cumplir con la relación contractual con el usuario.</li>
            </ul>

             <p>El usuario reconoce haber sido informado de estas finalidades y otorga su consentimiento libre y expreso al aceptar esta Política. El tratamiento necesario para ejecutar el contrato no requiere autorización adicional, solo notificación.</p>

            <h2>Protección de los Datos</h2>

              <p>CERTIA adopta medidas técnicas y organizativas alineadas con estándares de la industria para proteger los datos contra accesos no autorizados, pérdida o alteración. Sin embargo, no nos responsabilizamos por vulnerabilidades ilegales fuera de nuestro control (por ejemplo, ataques cibernéticos) ni por fallos técnicos causados por terceros o eventos imprevistos que no puedan evitarse con diligencia razonable.</p>

            <h2>Divulgación</h2>

              <p>CERTIA no compartirá los datos personales sin consentimiento, salvo en:</p>

            <ul>
              <li>Requerimientos de autoridades públicas competentes.</li>
              <li>Órdenes judiciales.</li>
              <li>Obligaciones legales.</li>
            </ul>

            <h2>Uso de Cookies</h2>

              <p>El Sitio Web emplea cookies para optimizar la experiencia de navegación, analizar patrones de uso y personalizar contenidos. El usuario puede desactivarlas en su navegador sin que ello limite el acceso al sitio. CERTIA no controla las cookies de sitios de terceros vinculados.</p>

            <h2>Derechos del Usuario</h2>

              <p>El usuario puede ejercer sus derechos de acceso, rectificación, cancelación y oposición enviando un correo a certiaperu@certia.pe. Determinados datos podrán conservarse tras una solicitud de baja como evidencia ante posibles reclamaciones, sin realizar más tratamiento que su almacenamiento seguro, por el plazo legal de prescripción.</p>

            <h2>Edad Mínima</h2>

              <p>El usuario declara tener al menos 18 años o ser tutor legal de un menor para autorizar el tratamiento de datos. CERTIA no procesará datos de menores sin el debido consentimiento y eliminará aquellos detectados sin autorización.</p>

            <h2>Cesión contractual</h2>

              <p>El usuario permite la transferencia de esta Política y sus datos a un nuevo responsable del banco de datos, quien asumirá todas las obligaciones aquí establecidas. CERTIA quedará eximida de responsabilidad tras dicha cesión.</p>

            <h2>Modificaciones</h2>

              <p>CERTIA podrá actualizar esta Política en cualquier momento, publicando los cambios en el Sitio Web y solicitando nuevo consentimiento al usuario al acceder nuevamente.</p>

              <p><strong>Fecha de última actualización:</strong> 05 de Junio de 2024.</p>

            <h2>Información Adicional</h2>

              <p><strong>CERTIA - Soluciones Tecnológicas</strong></p>

              <p>Una plataforma innovadora para la gestión eficiente de procesos digitales, alineada con la normativa peruana.</p>

              <p><strong>Menú:</strong> Como funciona | Quienes Somos | Soporte Técnico | Blog | Preguntas Frecuentes | Legales | contacto</p>

              <p><strong>Teléfono:</strong> (+51) 940810288</p>

              <p><strong>Correo:</strong> certiaperu@certia.pe</p>

              <p><strong>Dirección:</strong> Mz “ñ” lote 22 urb El Pacifico, S.M.P, Lima, Perú</p>

              <p><strong>Correo de contacto:</strong> certiaperu@certia.pe</p>

              <p><strong>SOTTER EXPRESS.S.A.C | RUC:</strong> 10720773169</p>

              <p><strong>Copyright 2026 - CERTIA | Diseño Web por CERTIA</strong></p>




          </div>

          {/* Columna derecha: sin contenido por ahora */}
          <div className="policy-side">
          </div>

        </div>
      </div>

      {/* Pie de pagina azul */}
      <footer style={{ backgroundColor: "#1e3a8a", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: 0 }}>
          {new Date().getFullYear()} CERTIA. Todos los derechos reservados.
        </p>
      </footer>

    </div>
  );
}

export default PoliticaPrivacidad;
