import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/home.css";
import { API_URL } from "../config/api";

function Register() {
  const navigate = useNavigate();

  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    web: "",
    razon_social: "",
    ruc: "",
    direccion: "",
    logo_url: "",
  });

  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateRegisterForm = () => {
    const { nombre, apellido, correo, password, razon_social, ruc, direccion } = registerForm;
    if (!nombre || !apellido || !correo || !password || !razon_social || !ruc || !direccion) {
      return "Debe completar todos los campos obligatorios marcados con (*)";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return "Debe ingresar un correo electronico valido";
    }
    if (!/^\d{11}$/.test(ruc)) {
      return "El RUC debe tener exactamente 11 digitos";
    }
    if (password.length < 6) {
      return "La contrasena debe tener al menos 6 caracteres";
    }
    return null;
  };

  const handleRegister = async () => {
    try {
      setRegisterError("");
      setRegisterSuccess("");

      const validationError = validateRegisterForm();
      if (validationError) {
        setRegisterError(validationError);
        return;
      }

      setIsRegistering(true);

      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegisterError(data.error || "No se pudo registrar la cuenta");
        return;
      }

      setRegisterSuccess("Cuenta registrada correctamente");
      setTimeout(() => navigate("/login"), 1000);

    } catch (error) {
      console.error("Error registrando usuario:", error);
      setRegisterError("Error al registrar la cuenta. Verifica tu conexion.");
    } finally {
      setIsRegistering(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "5px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#111827",
    background: "#fff",
    boxSizing: "border-box",
    marginBottom: "16px",
    outline: "none",
  };

  const req = <span style={{ color: "#dc2626" }}>*</span>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: "48px",
      paddingBottom: "48px",
    }}>

      <h1 style={{
        fontSize: "26px",
        fontWeight: 700,
        color: "#1e3a8a",
        marginBottom: "24px",
        textAlign: "center",
      }}>
        Crear cuenta
      </h1>

      <div style={{
        width: "100%",
        maxWidth: "480px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        padding: "36px 32px",
      }}>

        <label style={labelStyle} htmlFor="reg-nombre">Nombre {req}</label>
        <input id="reg-nombre" name="nombre" type="text" style={inputStyle}
          placeholder="Juan" value={registerForm.nombre} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-apellido">Apellido {req}</label>
        <input id="reg-apellido" name="apellido" type="text" style={inputStyle}
          placeholder="Perez" value={registerForm.apellido} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-correo">Correo {req}</label>
        <input id="reg-correo" name="correo" type="email" style={inputStyle}
          placeholder="correo@empresa.com" value={registerForm.correo} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-password">Contrasena {req}</label>
        <input id="reg-password" name="password" type="password" style={inputStyle}
          placeholder="Min. 6 caracteres" value={registerForm.password} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-web">Web</label>
        <input id="reg-web" name="web" type="url" style={inputStyle}
          placeholder="https://..." value={registerForm.web} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-razon-social">Razon Social {req}</label>
        <input id="reg-razon-social" name="razon_social" type="text" style={inputStyle}
          placeholder="Mi Empresa S.A.C." value={registerForm.razon_social} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-ruc">RUC {req}</label>
        <input id="reg-ruc" name="ruc" type="text" style={inputStyle}
          placeholder="11 digitos" maxLength={11} value={registerForm.ruc} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-direccion">Direccion {req}</label>
        <input id="reg-direccion" name="direccion" type="text" style={inputStyle}
          placeholder="Av. Ejemplo 123, Lima" value={registerForm.direccion} onChange={handleRegisterChange} />

        <label style={labelStyle} htmlFor="reg-logo">URL del Logo</label>
        <input id="reg-logo" name="logo_url" type="url" style={{ ...inputStyle, marginBottom: "8px" }}
          placeholder="https://..." value={registerForm.logo_url} onChange={handleRegisterChange} />

        {registerError && (
          <p className="error-message" style={{ marginBottom: "12px" }}>{registerError}</p>
        )}
        {registerSuccess && (
          <p className="success-message" style={{ marginBottom: "12px" }}>{registerSuccess}</p>
        )}

        <button
          type="button"
          onClick={handleRegister}
          disabled={isRegistering}
          style={{
            width: "100%",
            background: "#1d4ed8",
            color: "#ffffff",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "15px",
            cursor: isRegistering ? "not-allowed" : "pointer",
            opacity: isRegistering ? 0.75 : 1,
            marginBottom: "16px",
            marginTop: "8px",
          }}
        >
          {isRegistering ? "Registrando..." : "Registrar"}
        </button>

        <button
          className="login-back"
          type="button"
          onClick={() => navigate("/")}
          style={{ display: "block", margin: "0 auto" }}
        >
          ← Volver al inicio
        </button>

      </div>
    </div>
  );
}

export default Register;
