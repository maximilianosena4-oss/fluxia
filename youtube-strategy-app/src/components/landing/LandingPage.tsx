"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MatrixCanvas } from "./MatrixCanvas";
import "./landing.css";

function IASvg({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "flx-svg-ia"}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -12 150 122"
    >
      <rect x="4"  y="6"  width="46" height="15" fill="#00f0ff" />
      <rect x="4"  y="79" width="46" height="15" fill="#00f0ff" />
      <rect x="19" y="6"  width="16" height="88" fill="#00f0ff" />
      <polyline
        points="64,94 102,6 140,94"
        fill="none"
        stroke="#00f0ff"
        strokeWidth="16"
        strokeLinejoin="miter"
        strokeLinecap="butt"
        strokeMiterlimit="8"
      />
    </svg>
  );
}

export function LandingPage() {
  useEffect(() => {
    // Scroll reveal
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          el.animate(
            [
              { opacity: 0, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 480, delay: Number(el.dataset.i ?? 0) * 80, fill: "forwards", easing: "ease-out" }
          );
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll<HTMLElement>(".flx-card").forEach((el, i) => { el.dataset.i = String(i); io.observe(el); });
    document.querySelectorAll<HTMLElement>(".flx-step").forEach((el, i) => { el.dataset.i = String(i); io.observe(el); });
    document.querySelectorAll<HTMLElement>(".flx-stat").forEach((el, i) => { el.dataset.i = String(i); io.observe(el); });

    // Active nav on scroll
    const navLinks = document.querySelectorAll<HTMLAnchorElement>(".flx-nav-links a");
    const secIds = ["inicio", "features", "how", "stats", "precios"];

    function onScroll() {
      const sy = window.scrollY + 80;
      secIds.forEach((id) => {
        const sec = document.getElementById(id);
        if (!sec) return;
        const href = id === "inicio" ? "#features" : `#${id}`;
        const link = document.querySelector<HTMLAnchorElement>(`.flx-nav-links a[href="${href}"]`);
        if (!link) return;
        if (sy >= sec.offsetTop && sy < sec.offsetTop + sec.offsetHeight) {
          navLinks.forEach((l) => l.classList.remove("flx-active"));
          link.classList.add("flx-active");
        }
      });
    }

    window.addEventListener("scroll", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flx-root">
      <MatrixCanvas />

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="flx-navbar">
        <a href="#inicio" className="flx-nav-brand">
          Flux<span className="flx-nav-ia">IA</span>
        </a>
        <ul className="flx-nav-links">
          <li><a href="#features" className="flx-active">Plataforma</a></li>
          <li><a href="#features">Funciones</a></li>
          <li><a href="#how">¿Cómo Funciona?</a></li>
          <li><a href="#stats">Resultados</a></li>
          <li><a href="#precios">Precios</a></li>
        </ul>
        <Link href="/login" className="flx-nav-btn">Iniciar Sesión</Link>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="flx-hero" id="inicio">
        <div className="flx-hero-content">
          <div className="flx-logo">
            <span className="flx-flux">Flux</span>
            <IASvg />
          </div>
          <p className="flx-hero-sub">Análisis de Contenido · YouTube Intelligence</p>

          <div className="flx-floor-ref" aria-hidden="true">
            <div className="flx-logo">
              <span className="flx-flux">Flux</span>
              <IASvg />
            </div>
            <div className="flx-ref-mask" />
          </div>
        </div>

        <div className="flx-hero-scroll">
          <p className="flx-scroll-label">Explorá el poder de los datos</p>
          <div
            className="flx-scroll-arrow"
            onClick={() => scrollTo("features")}
            role="button"
            aria-label="Ir a funciones"
          />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section className="flx-s-features flx-section" id="features">
        <div className="flx-wrap">
          <p className="flx-sec-tag">// Funciones</p>
          <h2 className="flx-sec-title">
            Todo lo que necesitás para<br />
            <em>dominar YouTube con IA</em>
          </h2>
          <p className="flx-sec-desc">
            FluxIA convierte datos complejos en decisiones simples. Analizá cualquier canal,
            detectá oportunidades antes que la competencia y creá contenido que el algoritmo prioriza.
          </p>

          <div className="flx-cards-grid">
            <div className="flx-card">
              <div className="flx-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="12" width="5" height="10" rx="1" />
                  <rect x="9.5" y="7" width="5" height="15" rx="1" />
                  <rect x="17" y="3" width="5" height="19" rx="1" />
                </svg>
              </div>
              <p className="flx-card-label">Analiza</p>
              <p className="flx-card-head">Métricas que nadie te muestra</p>
              <p className="flx-card-body">
                Accedé a datos profundos de cualquier canal: retención real, engagement por video,
                velocidad de crecimiento y los puntos exactos donde tu competencia falla.
              </p>
            </div>

            <div className="flx-card">
              <div className="flx-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10.5" cy="10.5" r="7.5" />
                  <line x1="16" y1="16" x2="22" y2="22" />
                </svg>
              </div>
              <p className="flx-card-label">Descubrí</p>
              <p className="flx-card-head">Tendencias antes que la competencia</p>
              <p className="flx-card-body">
                Detectá nichos rentables, palabras clave con potencial viral y oportunidades de
                contenido antes de que el algoritmo las haga masivas. Siempre un paso adelante.
              </p>
            </div>

            <div className="flx-card">
              <div className="flx-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A7.5 7.5 0 0 0 4 15.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5A7.5 7.5 0 0 0 14.5 2z" />
                  <line x1="8.5" y1="21" x2="15.5" y2="21" />
                </svg>
              </div>
              <p className="flx-card-label">Inteligencia</p>
              <p className="flx-card-head">IA que analiza, vos que decidís</p>
              <p className="flx-card-body">
                Nuestra IA procesa miles de videos y te entrega solo lo que importa: qué funciona,
                por qué funciona y cómo replicarlo exactamente en tu canal. Sin ruido.
              </p>
            </div>

            <div className="flx-card">
              <div className="flx-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <p className="flx-card-label">Crecé</p>
              <p className="flx-card-head">Estrategia que genera ingresos</p>
              <p className="flx-card-body">
                Convertí datos en decisiones concretas. Optimizá cada video antes de publicarlo y
                escalá tu canal con información real, no intuición. Datos que rentabilizan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section className="flx-s-how flx-section" id="how">
        <div className="flx-wrap">
          <p className="flx-sec-tag">// ¿Cómo Funciona?</p>
          <h2 className="flx-sec-title">De datos a ingresos en <em>3 pasos</em></h2>
          <p className="flx-sec-desc">
            Sin curva de aprendizaje. Sin configuraciones complejas.
            Pegás la URL, FluxIA trabaja, vos accionás.
          </p>

          <div className="flx-steps">
            <div className="flx-step">
              <div className="flx-step-num">01</div>
              <h3 className="flx-step-title">Ingresás el canal</h3>
              <p className="flx-step-body">
                Pegá la URL de cualquier canal de YouTube — el tuyo, el de tu competencia,
                el referente de tu nicho. FluxIA importa todos sus datos históricos en segundos.
              </p>
            </div>
            <div className="flx-step">
              <div className="flx-step-num">02</div>
              <h3 className="flx-step-title">La IA lo analiza todo</h3>
              <p className="flx-step-body">
                Procesamos métricas, patrones de engagement, tendencias de nicho y oportunidades
                que el algoritmo de YouTube esconde. Sin límites, sin filtros pagos.
              </p>
            </div>
            <div className="flx-step">
              <div className="flx-step-num">03</div>
              <h3 className="flx-step-title">Accionás y crecés</h3>
              <p className="flx-step-body">
                Recibís un análisis accionable: qué publicar, cuándo, cómo y por qué.
                Sin datos abrumadores. Solo lo que genera vistas, suscriptores e ingresos reales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="flx-s-stats flx-section" id="stats">
        <div className="flx-stats-row">
          <div className="flx-stat">
            <p className="flx-stat-num">2.400<sup>+</sup></p>
            <p className="flx-stat-label">Canales Analizados</p>
          </div>
          <div className="flx-stat">
            <p className="flx-stat-num">18K<sup>+</sup></p>
            <p className="flx-stat-label">Tendencias Detectadas</p>
          </div>
          <div className="flx-stat">
            <p className="flx-stat-num">87<sup>%</sup></p>
            <p className="flx-stat-label">Mejora en Engagement</p>
          </div>
          <div className="flx-stat">
            <p className="flx-stat-num">40h</p>
            <p className="flx-stat-label">Ahorradas por Mes</p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="flx-s-cta flx-section" id="precios">
        <div className="flx-cta-box">
          <p className="flx-sec-tag" style={{ textAlign: "center" }}>// Empezá Hoy</p>
          <h2 className="flx-cta-title">
            El algoritmo de YouTube<br /><em>no espera.</em>
          </h2>
          <p className="flx-cta-desc">
            Empezá a analizar canales con IA y tomá decisiones que generan ingresos reales.
            Cada día sin datos es un día que tu competencia te saca ventaja.
          </p>
          <Link href="/login" className="flx-cta-btn">Comenzar Ahora →</Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="flx-footer">
        <div className="flx-footer-in">
          <div className="flx-footer-top">
            <div>
              <p className="flx-f-brand">Flux<span>IA</span></p>
              <p className="flx-f-tag">Análisis de Contenido · YouTube Intelligence</p>
            </div>
            <ul className="flx-f-links">
              <li><a href="#features">Funciones</a></li>
              <li><a href="#precios">Precios</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contacto</a></li>
              <li><a href="#">Privacidad</a></li>
            </ul>
          </div>
          <div className="flx-footer-bot">
            <p className="flx-f-copy">© 2026 FluxIA · Todos los derechos reservados.</p>
            <p className="flx-f-powered">Powered by AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
