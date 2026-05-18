"use client";
import { useState } from "react";
import { createClient } from '../Services/supabase/supabase-client'
import { useRouter } from "next/navigation";
import router from "next/dist/shared/lib/router/router";

type AuthMode = "login" | "signup";
 
export default function AuthPage() {

  const supabase = createClient()
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [pressed, setPressed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
 
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (mode === 'signup' && password !== confirmPassword) {
    setError("Passwords do not match")
    return
  }
  if (mode === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
     setError(error.message)
    }
    else {
      router.push('/') // redirect to home on success
    }
  } else {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name:username } } })
    if (error) {
      setError(error.message) 
    }
    else {
      router.push('/') 
    }
  }
}
 
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{
        background: "#1a1a2e",
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, #2a1a4e 0%, #0d0d1a 70%)",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* ── Pokéball Logo ── */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-14 h-14 mb-3">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "4px solid #c00",
              animation: "spin-slow 8s linear infinite",
            }}
          />
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg,#e00 50%,#fff 50%)",
              border: "3px solid #333",
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "#fff", border: "2px solid #555" }}
            />
          </div>
        </div>
 
        <h1
          className="text-3xl font-black tracking-widest uppercase"
          style={{
            color: "#ffe066",
            textShadow: "0 3px 0 #7a5a00, 0 0 20px rgba(255,200,0,0.3)",
          }}
        >
          Champions Sheet
        </h1>
        <p
          className="mt-1 text-xs tracking-widest uppercase"
          style={{ color: "#8888aa" }}
        >
          Battle Calculator &amp; Notes
        </p>
        <div
          className="mt-3 h-0.5 w-32 rounded-full"
          style={{
            background:
              "linear-gradient(to right, transparent, #ffe066, transparent)",
          }}
        />
      </div>
 
      {/* ── Card ── */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1e1e38 0%, #13132a 100%)",
          border: "2px solid #2e2e5a",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px #0a0a1a inset",
        }}
      >
        {/* Tab switcher */}
        <div
          className="grid grid-cols-2"
          style={{ borderBottom: "2px solid #2e2e5a" }}
        >
          {(["login", "signup"] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className="py-3 text-xs font-black tracking-widest uppercase transition-all"
              style={{
                background:
                  mode === tab
                    ? "linear-gradient(180deg, #2a2a50 0%, #1a1a3a 100%)"
                    : "transparent",
                color: mode === tab ? "#ffe066" : "#44445a",
                textShadow:
                  mode === tab
                    ? "0 1px 0 #7a5a00, 0 0 12px rgba(255,200,0,0.2)"
                    : "none",
                borderBottom: mode === tab ? "2px solid #ffe066" : "2px solid transparent",
                marginBottom: "-2px",
                cursor: "pointer",
              }}
            >
              {tab === "login" ? "▶ Login" : "★ Sign Up"}
            </button>
          ))}
        </div>
 
        {/* Form body */}
        <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
          {mode === "signup" && (
            <AuthField
              label="Trainer Name"
              placeholder="AshKetchum99"
              value={username}
              onChange={setUsername}
              type="text"
            />
          )}
          <AuthField
            label="Email"
            placeholder="trainer@pokecenter.com"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <AuthField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            type="password"
          />
          {mode === "signup" && (
            <AuthField
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
            />
          )}
 
          {error && (
            <div
              className="text-xs font-bold tracking-wide px-3 py-2 rounded-lg"
              style={{
                background: "rgba(200,0,0,0.15)",
                border: "1px solid #8b1a1a",
                color: "#ff6666",
                fontFamily: "'Courier New', monospace",
              }}
            >
              ⚠ {error}
            </div>
          )}
          {/* Submit GBA-style button */}
          <div className="mt-2">
            <GbaSubmitButton
              label={mode === "login" ? "▶  ENTER" : "★  SIGN UP"}
              pressed={pressed}
              onPress={() => setPressed(true)}
              onRelease={() => {
                setPressed(false);
                handleSubmit();
              }}
              topColor="#e8b84b"
              bottomColor="#8b6010"
              border="#3a2500"
            />
          </div>
 
          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: "#2e2e5a" }} />
            <span className="text-xs" style={{ color: "#44445a" }}>
              OR
            </span>
            <div className="flex-1 h-px" style={{ background: "#2e2e5a" }} />
          </div>
 
          {/* Google OAuth stub */}
          <button
            className="w-full py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: "linear-gradient(180deg, #252540 0%, #1a1a32 100%)",
              border: "1px solid #3a3a6a",
              color: "#aaaacc",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
 
        {/* Footer toggle */}
        <div
          className="px-6 py-3 text-center text-xs"
          style={{ borderTop: "1px solid #2e2e5a", color: "#55557a" }}
        >
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-bold underline"
                style={{ color: "#ffe066", cursor: "pointer" }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already a trainer?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-bold underline"
                style={{ color: "#ffe066", cursor: "pointer" }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
 
      <footer
        className="mt-6 text-xs tracking-wide uppercase"
        style={{ color: "#44445a" }}
      >
        Champions Sheet · v1.0
      </footer>
 
      <style jsx global>{`
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #44445a; }
        input:focus { outline: none; }
      `}</style>
    </div>
  );
}
 
/* ── Reusable field ── */
function AuthField({
  label,
  placeholder,
  value,
  onChange,
  type,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  const [focused, setFocused] = useState(false);
 
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: focused ? "#ffe066" : "#8888aa" }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-2.5 rounded-lg text-sm transition-all"
        style={{
          background: focused ? "#1a1a38" : "#13132a",
          border: `1.5px solid ${focused ? "#ffe066" : "#2e2e5a"}`,
          color: "#e0e0ff",
          fontFamily: "'Courier New', monospace",
          boxShadow: focused ? "0 0 0 2px rgba(255,224,102,0.1)" : "none",
        }}
      />
    </div>
  );
}
 
/* ── GBA-style submit button ── */
function GbaSubmitButton({
  label,
  pressed,
  onPress,
  onRelease,
  topColor,
  bottomColor,
  border,
}: {
  label: string;
  pressed: boolean;
  onPress: () => void;
  onRelease: () => void;
  topColor: string;
  bottomColor: string;
  border: string;
}) {
  return (
    <div
      className="relative w-full select-none cursor-pointer"
      style={{ userSelect: "none" }}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={() => pressed && onRelease()}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
    >
      {/* Shadow/base layer */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-xl"
        style={{
          height: "calc(100% - 4px)",
          background: border,
          transform: "translateY(4px)",
        }}
      />
      {/* Top face */}
      <div
        className="relative rounded-xl py-3 flex items-center justify-center transition-transform"
        style={{
          background: `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)`,
          border: `2px solid ${border}`,
          transform: pressed ? "translateY(4px)" : "translateY(0)",
          boxShadow: pressed ? "none" : `0 0 20px ${topColor}55`,
        }}
      >
        <span
          className="text-sm font-black tracking-widest uppercase"
          style={{
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}