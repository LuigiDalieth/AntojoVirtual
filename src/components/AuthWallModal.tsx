import React, { useState } from 'react';
import { X, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { NEIVA_NEIGHBORHOODS, UserProfile, UserRole } from '../data/neivaData';

interface AuthWallModalProps {
  isOpen: boolean;
  pendingActionLabel: string;
  onClose: () => void;
  onSuccessAuth: (user: UserProfile) => void;
}

export const AuthWallModal: React.FC<AuthWallModalProps> = ({
  isOpen,
  pendingActionLabel,
  onClose,
  onSuccessAuth,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  const [name, setName] = useState('Valentina Fierro');
  const [email, setEmail] = useState('valentina.neiva@correo.co');
  const [phone, setPhone] = useState('316 482 9104');
  const [password, setPassword] = useState('••••••••••••');
  const [neighborhoodId, setNeighborhoodId] = useState('quirinal');
  const [addressDetails, setAddressDetails] = useState('Calle 21 # 5A-34 Apto 302');
  const [selectedRole, setSelectedRole] = useState<UserRole>('cliente');
  const [recoverySent, setRecoverySent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'recover') {
      setRecoverySent(true);
      return;
    }

    const authenticatedUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim() || 'Cliente Antojo',
      email: email.trim() || 'cliente@antojovirtual.co',
      phone: phone.trim() || '315 000 0000',
      role: selectedRole,
      neighborhoodId,
      addressDetails: addressDetails.trim() || 'Calle 10 # 7-12',
    };

    onSuccessAuth(authenticatedUser);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1B18]/65 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-wall-title"
    >
      <div className="bg-[#FFFFFF] w-full max-w-md rounded-2xl shadow-modal border border-[#EFEBE6] overflow-hidden">
        {/* Top bar */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-[#EFEBE6] bg-[#FFF8F5]">
          <div>
            <span className="text-xs font-semibold text-[#E65100] block mb-1">
              Identificación requerida para continuar
            </span>
            <h2
              id="auth-wall-title"
              className="font-display text-xl font-bold text-[#1F1B18]"
            >
              {mode === 'login' && 'Inicia sesión en Antojo Virtual'}
              {mode === 'register' && 'Crea tu cuenta local en Neiva'}
              {mode === 'recover' && 'Recuperar contraseña'}
            </h2>
            <p className="text-xs text-[#5A4138] mt-1">{pendingActionLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de acceso"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A4138] hover:bg-[#EAE1DB] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F6ECE7] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setRecoverySent(false);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-white text-[#1F1B18] shadow-xs'
                  : 'text-[#5A4138] hover:text-[#1F1B18]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setRecoverySent(false);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-white text-[#1F1B18] shadow-xs'
                  : 'text-[#5A4138] hover:text-[#1F1B18]'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'recover' ? (
            <div className="space-y-4">
              {recoverySent ? (
                <div className="p-4 rounded-xl bg-[#E8F5E9] text-[#186A22] text-xs space-y-2">
                  <p className="font-semibold">
                    Enlace de recuperación enviado a {email}
                  </p>
                  <p>
                    Revisa tu bandeja de entrada o continúa con tu acceso directo de
                    demostración.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#5A4138] mb-1">
                    Correo electrónico registrado
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-[#A43700] hover:underline cursor-pointer"
                >
                  Volver a inicio de sesión
                </button>
                {!recoverySent && (
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-[#E65100] text-white text-xs font-semibold hover:bg-[#CD4700] cursor-pointer"
                  >
                    Enviar enlace
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5A4138] mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4138] mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4138] mb-1">
                    Celular (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4138] mb-1">
                    Barrio en Neiva (Envío Dinámico)
                  </label>
                  <select
                    value={neighborhoodId}
                    onChange={(e) => setNeighborhoodId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                  >
                    {NEIVA_NEIGHBORHOODS.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.commune})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4138] mb-1">
                    Dirección exacta
                  </label>
                  <input
                    type="text"
                    required
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#5A4138]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('recover')}
                    className="text-xs text-[#A43700] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>¿Olvidaste tu clave?</span>
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#E3BFB2] bg-[#FBFBF8] text-[#1F1B18]"
                />
              </div>

              {/* Role selector for RBAC demonstration */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-[#5A4138] mb-1.5">
                  Perfil de acceso (Seguridad RBAC)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'cliente', label: 'Cliente' },
                      { id: 'negocio', label: 'Emprendimiento' },
                      { id: 'domiciliario', label: 'Domiciliario' },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        selectedRole === r.id
                          ? 'bg-[#FFDBCF] border-[#E65100] text-[#380D00]'
                          : 'bg-[#FBFBF8] border-[#EFEBE6] text-[#5A4138]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#E65100] hover:bg-[#CD4700] text-white font-display font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {mode === 'login'
                    ? 'Continuar y guardar mi carrito'
                    : 'Registrarme y agregar pedido'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
