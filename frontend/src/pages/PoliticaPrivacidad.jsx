import "../assets/css/home.css";
import { useNavigate } from "react-router-dom";
import imgTop  from "../assets/img/img1_politica.jpg";
import imgSide from "../assets/img/img2_politica.png";

function PoliticaPrivacidad() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Banner superior */}
      <a
        href="https://api.whatsapp.com/send/?phone=51922446325&text=Informaci%C3%B3n+del%20libro%20de%20reclamaciones"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={imgTop}
          alt="Politica de Privacidad - CERTIA"
          className="policy-banner"
          style={{ cursor: "pointer" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </a>

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

            <h1>Politicas de privacidad</h1>

            <h2>Politica de Privacidad</h2>
            <p>La presente Politica de Privacidad de Datos Personales (en adelante, Politica de Privacidad) tiene como proposito explicarle como INVESTMENTS AND TECHNOLOGY AC S.A.C. (en adelante, I&T), con R.U.C. N 20603209592 y domicilio en Av. Luis Braille 1394, Oficina 908, Lima, lleva a cabo el tratamiento de los datos personales que obtiene de sus usuarios a traves de formularios electronicos disponibles en el sitio web https://certia.com/ (en adelante, Sitio Web), asi como mediante consentimientos expresos otorgados por escrito o en linea.</p>
            <p>En esta Politica de Privacidad, nosotros hace referencia a I&T, mientras que Usuario se refiere a toda persona que navegue, utilice o realice transacciones a traves del Sitio Web. En I&T nos comprometemos a garantizar la maxima seguridad y confidencialidad de los datos personales de nuestros usuarios.</p>
            <p>Le invitamos a leer atentamente esta Politica de Privacidad antes de compartir sus datos personales de manera voluntaria. Si esta de acuerdo, le pedimos que marque la casilla de aceptacion de forma previa y expresa. Estos datos son indispensables para cumplir con los objetivos descritos en este documento; de no autorizar su tratamiento, no podriamos llevar a cabo dichas finalidades.</p>

            <h2>Marco Normativo y Principios</h2>
            <p>Esta Política de Privacidad se rige por la normativa peruana, incluyendo:</p>
            <ul>
              <li>Ley N° 29733 (en adelante, «Ley»).</li>
              <li>Decreto Supremo N° 003-2013-JUS, Reglamento de la Ley N° 29733 (en adelante, «Reglamento»).</li>
              <li>Directiva de Seguridad de la Información, aprobada por Resolución Directoral N° 019-2013-JUS/DGPDP (en adelante, «Directiva»).</li>
              <li>Ley N° 29571, Código de Protección y Defensa del Consumidor.</li>
            </ul>

            <h2>Que datos recopilamos?</h2>
            <p>En I&T recolectamos la siguiente informacion:</p>
            <p>A. Datos personales facilitados por el usuario: Al registrarse, crear una cuenta o realizar compras en el Sitio Web, se solicita: nombre completo, numero de DNI o Carne de Extranjeria, fecha de nacimiento, genero, telefono movil, telefono fijo (si aplica), direccion postal y correo electronico.</p>
            <p>B. Datos de navegacion: Informacion obtenida durante el uso del Sitio Web, como:</p>
            <ul>
              <li>Patrones de navegacion, historial de transacciones y preferencias del usuario.</li>
              <li>Direcciones URL de origen y visitadas (incluso externas al Sitio Web).</li>
              <li>Direccion IP, tipo de navegador y dispositivo utilizado.</li>
              <li>Estadisticas de uso, trafico web y ubicacion aproximada del usuario.</li>
              <li>Datos del sistema operativo y modelo del dispositivo movil (en adelante, Datos de Navegacion).</li>
            </ul>

            <h2>Veracidad de los Datos</h2>
            <p>El usuario asegura que los datos personales proporcionados son veraces, completos y actualizados, siendo responsable de su autenticidad y vigencia. I&T podra validar esta informacion mediante fuentes publicas o servicios especializados. No asumimos responsabilidad por datos inexactos ni por perjuicios derivados de su uso, especialmente si no han sido elaborados por nosotros.</p>

            <h2>Banco de Datos</h2>
            <p>El usuario autoriza expresamente la inclusion de sus datos en el banco de datos "I&T Usuarios", gestionado y protegido en servidores bajo la titularidad de I&T.</p>

            <h2>Con que fines usamos los datos?</h2>
            <p>Los datos se emplean para:</p>
            <ul>
              <li>Gestionar el registro y ofrecer asistencia tecnica al usuario.</li>
              <li>Confirmar y autenticar la identidad del usuario.</li>
              <li>Analizar las actividades del usuario en el Sitio Web para personalizar servicios y contenidos segun sus intereses, como acceso a su historial de transacciones.</li>
              <li>Prestar los servicios ofrecidos por I&T.</li>
              <li>Transferir datos a proveedores de infraestructura en la nube en el extranjero (actualmente Google Cloud, con sede en EE.UU.) para almacenamiento y procesamiento, lo cual es esencial para cumplir con la relacion contractual con el usuario.</li>
            </ul>
            <p>El usuario reconoce haber sido informado de estas finalidades y otorga su consentimiento libre y expreso al aceptar esta Politica. El tratamiento necesario para ejecutar el contrato no requiere autorizacion adicional, solo notificacion.</p>

            <h2>Proteccion de los Datos</h2>
            <p>I&T adopta medidas tecnicas y organizativas alineadas con estandares de la industria para proteger los datos contra accesos no autorizados, perdida o alteracion. Sin embargo, no nos responsabilizamos por vulneraciones ilegales fuera de nuestro control (e.g., ataques ciberneticos) ni por fallos tecnicos causados por terceros o eventos imprevistos que no puedan evitarse con diligencia razonable.</p>

            <h2>Divulgacion</h2>
            <p>I&T no compartira los datos personales sin consentimiento, salvo en:</p>
            <ul>
              <li>Requerimientos de autoridades publicas competentes.</li>
              <li>Ordenes judiciales.</li>
              <li>Obligaciones legales.</li>
            </ul>

            <h2>Uso de Cookies</h2>
            <p>El Sitio Web emplea cookies para optimizar la experiencia de navegacion, analizar patrones de uso y personalizar contenidos. El usuario puede desactivarlas en su navegador sin que ello limite el acceso al sitio. I&T no controla las cookies de sitios de terceros vinculados.</p>

            <h2>Derechos del Usuario</h2>
            <p>El usuario puede ejercer sus derechos de acceso, rectificacion, cancelacion y oposicion enviando un correo a soporte@certia.com. Determinados datos podran conservarse tras una solicitud de baja como evidencia ante posibles reclamaciones, sin realizar mas tratamiento que su almacenamiento seguro, por el plazo legal de prescripcion.</p>

            <h2>Edad Minima</h2>
            <p>El usuario declara tener al menos 18 anos o ser tutor legal de un menor para autorizar el tratamiento de datos. I&T no procesara datos de menores sin el debido consentimiento y eliminara aquellos detectados sin autorizacion.</p>

            <h2>Cesion Contractual</h2>
            <p>El usuario permite la transferencia de esta Politica y sus datos a un nuevo responsable del banco de datos, quien asumira todas las obligaciones aqui establecidas. I&T quedara eximida de responsabilidad tras dicha cesion.</p>

            <h2>Modificaciones</h2>
            <p>I&T podra actualizar esta Politica en cualquier momento, publicando los cambios en el Sitio Web y solicitando nuevo consentimiento al usuario al acceder nuevamente.</p>
            <p><strong>Fecha de ultima actualizacion:</strong> 31 de marzo de 2024.</p>

            <h2>Informacion Adicional</h2>
            <p><strong>I&T - Soluciones Tecnologicas</strong></p>
            <p>Una plataforma innovadora para la gestion eficiente de procesos digitales, alineada con la normativa peruana.</p>
            <p>Menu: Como funciona | Quienes Somos | Planes y Precios | Soporte Tecnico | Blog | Preguntas Frecuentes | Legales | Contacto</p>
            <p>(+51) 944 495 321</p>
            <p>soporte@certia.com</p>
            <p>Av. Luis Braille 1394, Oficina 908 - Lima, Peru</p>
            <p>atencion@certia.com</p>
            <p><strong>INVESTMENTS AND TECHNOLOGY AC S.A.C. | RUC: 20603209592</strong></p>
            <p>Copyright 2025 - I&T Soluciones | Diseno Web por I&T</p>

          </div>

          {/* Columna derecha: imagen lateral */}
          <div className="policy-side">
            <a
              href="https://api.whatsapp.com/send/?phone=51922446325&text=Informaci%C3%B3n+del%20libro%20de%20reclamaciones"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={imgSide}
                alt="CERTIA - Libro de Reclamaciones"
                style={{ cursor: "pointer" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </a>
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
