# -*- coding: utf-8 -*-
"""
NEXUS - Generador de presentacion PDF
python generate_nexus_pdf.py
"""
import os
from fpdf import FPDF

# Paleta de colores
BG        = (8,   8,  18)
CARD      = (22,  22, 40)
CARD2     = (28,  28, 52)
BORDER    = (50,  50, 80)
PURPLE    = (124, 58, 237)
PURPLEM   = (155, 100, 255)
GREEN     = (16,  185, 129)
YELLOW    = (245, 158, 11)
RED       = (220, 60,  60)
BLUE      = (59,  130, 246)
WHITE     = (235, 235, 250)
LGRAY     = (160, 160, 190)
DGRAY     = (90,  90, 120)

W, H = 210, 297   # A4


class PDF(FPDF):
    def bg(self, color=BG):
        self.set_fill_color(*color)
        self.rect(0, 0, W, H, 'F')

    def rect_fill(self, x, y, w, h, color):
        self.set_fill_color(*color)
        self.rect(x, y, w, h, 'F')

    def rr(self, x, y, w, h, r=3, color=CARD, border=BORDER):
        self.set_fill_color(*color)
        self.set_draw_color(*border)
        self.set_line_width(0.25)
        self.rect(x, y, w, h, 'FD')

    def txt(self, x, y, s, sz=9, color=WHITE, bold=False, align='L', cw=None):
        self.set_font('Helvetica', 'B' if bold else '', sz)
        self.set_text_color(*color)
        self.set_xy(x, y)
        self.cell(cw if cw else (W - x), 0, s, align=align)

    def mtxt(self, x, y, w, s, sz=9, color=WHITE, bold=False, align='L', lh=5):
        self.set_font('Helvetica', 'B' if bold else '', sz)
        self.set_text_color(*color)
        self.set_xy(x, y)
        self.multi_cell(w, lh, s, align=align)

    def dot(self, x, y, color=PURPLE, r=1.8):
        self.set_fill_color(*color)
        self.ellipse(x - r, y - r, r * 2, r * 2, 'F')

    def circle(self, cx, cy, r, color=PURPLE):
        self.set_fill_color(*color)
        self.ellipse(cx - r, cy - r, r * 2, r * 2, 'F')

    def hline(self, x, y, w, color=BORDER, t=0.3):
        self.set_draw_color(*color)
        self.set_line_width(t)
        self.line(x, y, x + w, y)

    def section_bar(self, y, title, color=PURPLE, sub=''):
        self.rect_fill(14, y, 3, 8 if not sub else 10, color)
        self.txt(20, y + 0.5, title, 13, WHITE, True)
        if sub:
            self.txt(20, y + 8, sub, 8, LGRAY)
        return y + (18 if sub else 14)

    def progress_bar(self, x, y, w, pct, color=PURPLE, label='', val=''):
        if label:
            self.txt(x, y - 5, label, 7.5, LGRAY)
        if val:
            self.txt(x, y - 5, val, 7.5, color, True, 'R', w)
        self.set_fill_color(*BORDER)
        self.rect(x, y, w, 4, 'F')
        if pct > 0:
            fw = max(5, w * pct / 100)
            self.set_fill_color(*color)
            self.rect(x, y, fw, 4, 'F')

    def footer_pg(self, n):
        self.rect_fill(0, H - 8, W, 8, (10, 10, 22))
        self.txt(0, H - 5.5, str(n), 7, DGRAY, False, 'C', W)

    def topbar(self, title, color=PURPLE):
        self.rect_fill(0, 0, W, 16, (14, 14, 30))
        self.rect_fill(0, 0, W, 2, color)
        self.set_font('Helvetica', 'B', 11)
        self.set_text_color(*color)
        self.set_xy(14, 4.5)
        self.cell(W - 28, 0, title)

    def badge(self, x, y, txt, bg=PURPLE, fg=WHITE, sz=7.5):
        self.set_font('Helvetica', 'B', sz)
        tw = self.get_string_width(txt) + 6
        self.set_fill_color(*bg)
        self.rect(x, y, tw, 6, 'F')
        self.set_text_color(*fg)
        self.set_xy(x, y + 0.8)
        self.cell(tw, 5, txt, align='C')
        return tw


# ────────────────────────────────────────────────────────────────────────────
#  P1 - PORTADA
# ────────────────────────────────────────────────────────────────────────────
def portada(p: PDF):
    p.add_page()
    p.bg()

    # Franjas decorativas de fondo
    for i in range(H // 3):
        shade = int(8 + i * 0.18)
        p.set_fill_color(shade, shade, min(shade + 14, 40))
        p.rect(0, i * 3, W, 4, 'F')

    # Acento superior
    p.rect_fill(0, 0, W, 2.5, PURPLE)

    # Bloque central del logo
    p.circle(W / 2, 72, 22, PURPLE)
    p.circle(W / 2 - 6, 65, 5, PURPLEM)
    p.set_font('Helvetica', 'B', 26)
    p.set_text_color(*WHITE)
    p.set_xy(W / 2 - 9, 62)
    p.cell(18, 18, 'N', align='C')

    # Titulo principal
    p.set_font('Helvetica', 'B', 54)
    p.set_text_color(*WHITE)
    p.set_xy(0, 99)
    p.cell(W, 0, 'NEXUS', align='C')

    p.set_font('Helvetica', '', 14)
    p.set_text_color(*PURPLEM)
    p.set_xy(0, 115)
    p.cell(W, 0, 'YouTube Strategy Platform', align='C')

    p.set_font('Helvetica', 'B', 11.5)
    p.set_text_color(*WHITE)
    p.set_xy(0, 127)
    p.cell(W, 0, 'Tu asistente estrategico para monetizar YouTube con IA', align='C')

    # Linea decorativa
    p.set_draw_color(*PURPLE)
    p.set_line_width(0.6)
    p.line(52, 140, 158, 140)
    p.dot(52, 140, PURPLE, 1.5)
    p.dot(158, 140, PURPLE, 1.5)

    # Tech badges
    techs = ['Next.js 16', 'TypeScript', 'Prisma', 'Anthropic AI', 'Supabase']
    bgs   = [PURPLE, (40, 40, 75), GREEN, (20, 70, 50), (25, 55, 90)]
    tw_total = sum(p.get_string_width(t) + 10 for t in techs) + (len(techs) - 1) * 3
    bx = (W - tw_total) / 2
    for i, (t, bg) in enumerate(zip(techs, bgs)):
        tw = p.get_string_width(t) + 10
        p.set_fill_color(*bg)
        p.rect(bx, 148, tw, 7.5, 'F')
        p.set_font('Helvetica', 'B', 7.5)
        p.set_text_color(*WHITE)
        p.set_xy(bx, 149.5)
        p.cell(tw, 5, t, align='C')
        bx += tw + 3

    # Stat row
    stats = [('25', 'Rutas'), ('0', 'Errores TS'), ('5', 'Mentores IA'), ('~$2', 'USD/mes')]
    sc    = [PURPLE, GREEN, YELLOW, GREEN]
    sw    = W / len(stats)
    for i, ((num, lbl), col) in enumerate(zip(stats, sc)):
        p.rect_fill(i * sw, 168, sw, 32, (16, 16, 32))
        if i > 0:
            p.set_draw_color(*BORDER)
            p.set_line_width(0.3)
            p.line(i * sw, 172, i * sw, 196)
        p.txt(i * sw, 173, num, 22, col, True, 'C', sw)
        p.txt(i * sw, 187, lbl, 7.5, LGRAY, False, 'C', sw)

    # Descripcion central
    p.rr(16, 206, W - 32, 42, 4, (18, 18, 38), BORDER)
    desc = ('NEXUS es una plataforma web full-stack que actua como consultor personal de YouTube. '
            'Combina Inteligencia Artificial, analisis de datos reales y las metodologias de los 5 mayores '
            'expertos en monetizacion de YouTube (MrBeast, Hormozi, Wolf, Saenz, Alanis) para darte '
            'una hoja de ruta personalizada hacia ingresos pasivos en 90 dias.')
    p.mtxt(24, 212, W - 48, desc, 9, WHITE, False, 'C', 5.5)

    # Costo mensual estimado
    p.rr(55, 254, W - 110, 14, 3, (12, 30, 20), GREEN)
    p.txt(55, 257.5, 'Costo estimado en produccion: ~$2 USD/mes', 8.5, GREEN, True, 'C', W - 110)

    # Footer
    p.rect_fill(0, H - 12, W, 12, (8, 8, 18))
    p.txt(0, H - 8, 'NEXUS  c  2025 - Next.js 16 + Prisma + Anthropic AI + Supabase', 7.5, DGRAY, False, 'C', W)


# ────────────────────────────────────────────────────────────────────────────
#  P2 - QUE ES + PARA QUIEN
# ────────────────────────────────────────────────────────────────────────────
def que_es(p: PDF):
    p.add_page()
    p.bg()
    p.topbar('NEXUS - Descripcion y publico objetivo', PURPLE)

    y = 22
    y = p.section_bar(y, 'QUE ES NEXUS?', PURPLE)

    intro = ('NEXUS es una aplicacion web completa que combina Inteligencia Artificial generativa con '
             'las metodologias probadas de 5 mentores de referencia mundial para guiar a cualquier '
             'persona desde cero hasta monetizar su canal de YouTube en menos de 90 dias. '
             'No necesitas experiencia previa ni aparecer en camara.')
    p.mtxt(14, y, W - 28, intro, 9.5, WHITE, False, 'L', 5.3)
    y += 32

    # Cards de propuesta de valor
    props = [
        ('VALIDACION', 'Evalua tu nicho con sistema de scoring 96pts basado en datos reales de YouTube y patrones de los 5 mentores.', PURPLE),
        ('CONSULTOR IA', 'Chat con IA entrenada en los principios de los 5 mentores. Respuestas con streaming en tiempo real.', GREEN),
        ('ROADMAP', 'Plan de accion en 4 fases generado automaticamente segun tu nicho, nivel y objetivos de monetizacion.', YELLOW),
        ('ANALYTICS', 'Dashboard de progreso con graficos en tiempo real: score del nicho, tareas completadas, proyeccion de ingresos.', BLUE),
    ]
    cw = (W - 28 - 6) / 2
    for i, (title, desc, col) in enumerate(props):
        cx = 14 + (i % 2) * (cw + 6)
        cy = y + (i // 2) * 30
        p.rr(cx, cy, cw, 27, 3, CARD, BORDER)
        p.rect_fill(cx, cy, cw, 2, col)
        p.txt(cx + 5, cy + 5, title, 8.5, col, True)
        p.mtxt(cx + 5, cy + 12, cw - 10, desc, 7.5, LGRAY, False, 'L', 4)
    y += 66

    y = p.section_bar(y, 'PARA QUIEN ES NEXUS?', GREEN)

    audiencias = [
        ('Emprendedores digitales',    'Queres crear un canal de YouTube lucrativo pero no sabes por donde empezar ni que nicho elegir.'),
        ('Creadores sin experiencia',  'Primera vez con YouTube. NEXUS te lleva de la mano paso a paso con un plan concreto.'),
        ('Canales sin rostro (AI)',    'Queres monetizar sin aparecer en camara usando IA para producir contenido escalable.'),
        ('Freelancers y marketers',    'Buscas diversificar ingresos con un canal complementario a tu actividad actual.'),
        ('Creadores estancados',       'Ya tenes canal pero no creces. Necesitas diagnostico, estrategia concreta y herramientas nuevas.'),
        ('Inversores de tiempo libre', 'Queres construir una fuente de ingresos pasivos trabajando pocas horas por semana.'),
    ]
    for title, desc in audiencias:
        p.dot(20, y + 2.8, GREEN, 2)
        p.txt(26, y, title, 9, WHITE, True)
        p.txt(26, y + 5.5, desc, 8, LGRAY)
        y += 13

    p.footer_pg(2)


# ────────────────────────────────────────────────────────────────────────────
#  P3 - LAS 12 FUNCIONALIDADES
# ────────────────────────────────────────────────────────────────────────────
def funcionalidades(p: PDF):
    p.add_page()
    p.bg()
    p.topbar('NEXUS - Las 12 Secciones de la Plataforma', PURPLE)

    y = 22
    y = p.section_bar(y, 'LAS 12 SECCIONES PRINCIPALES', PURPLE)

    features = [
        ('[DASHBOARD]',    'Panel de control',       'Metricas clave en tiempo real: score del nicho, videos publicados, dias para monetizar, ingresos proyectados. Grafico donut del roadmap. Acceso rapido a todas las secciones.',                                PURPLE),
        ('[EVALUADOR]',    'Evaluador de Nicho',      'Wizard de 5 pasos que analiza tu nicho con sistema de 96 puntos: demanda de mercado, competencia, RPM, escalabilidad y viabilidad con IA. Genera reporte descargable en TXT.',                             PURPLE),
        ('[COMPARADOR]',   'Comparador de Nichos',    'Compara hasta 3 nichos lado a lado con el mismo modelo de evaluacion. Tabla comparativa por criterio con ganador destacado y banner de resultado.',                                                         GREEN),
        ('[IA CHAT]',      'Consultor IA',            'Chat con streaming en tiempo real. Usa RAG semantico: busca en base de conocimiento de los 5 mentores antes de responder. Funciona con Anthropic Claude o modo mock inteligente.',                           GREEN),
        ('[ROADMAP]',      'Plan de Accion',          '4 fases (Validacion > Setup > Crecimiento > Monetizacion) con tareas tachables. Se auto-genera al completar la evaluacion. Progreso visible en el dashboard.',                                              YELLOW),
        ('[IDEAS]',        'Content Factory',         'Generador masivo de ideas con Outlier Test: identifica videos con 10x el promedio del canal para replicar el formato ganador segun la metodologia de MrBeast.',                                             YELLOW),
        ('[GUIONES]',      'Generador de Guiones',    'Crea guiones con estructura probada: Gancho (0-30s) > Problema > Solucion > CTA. Personalizable por nicho, tono y duracion. Exportable en TXT.',                                                           BLUE),
        ('[HERRAMIENTAS]', 'Herramientas (3 en 1)',   'Keyword Research: 12 variaciones con volumen/competencia/RPM. Generador de Hooks: 5 tipos con principios de los mentores. Checklist de publicacion: 21 items en 5 categorias (SEO, thumbnail, video, config, promo).', BLUE),
        ('[THUMBNAILS]',   'Biblioteca de Thumbnails','5 estilos (impacto, curiosidad, tutorial, listicle, historia) con prompts listos para Midjourney y DALL-E. Incluye tips de CTR por estilo. Gestion de estado (idea/en-progreso/listo).',                    RED),
        ('[ANALYTICS]',   'Analytics & Graficos',    'Dashboard con charts Recharts: historial de scores de evaluaciones, progreso por fase, distribucion de ideas por estado, metricas de outlier score.',                                                        RED),
        ('[CALENDARIO]',   'Calendario de Contenido', 'Planificador mensual de publicaciones. Visualiza el pipeline de contenido y organizas la frecuencia de publicacion semanal.',                                                                               LGRAY),
        ('[CMD+K]',        'Busqueda Global (Cmd+K)', 'Modal de busqueda rapida con navegacion por teclado (flechas, Enter, ESC). Navega a cualquiera de las 12 secciones escribiendo su nombre.',                                                                 LGRAY),
    ]

    cw = (W - 28 - 6) / 2
    row_h = 29
    for i, (tag, title, desc, col) in enumerate(features):
        cx = 14 + (i % 2) * (cw + 6)
        cy = y + (i // 2) * row_h
        p.rr(cx, cy, cw, row_h - 2, 3, CARD, BORDER)
        p.rect_fill(cx, cy, cw, 1.8, col)
        # Tag pill
        p.set_fill_color(*col)
        tw = p.get_string_width(tag) + 5
        p.rect(cx + cw - tw - 3, cy + 3.5, tw, 5.5, 'F')
        p.set_font('Helvetica', 'B', 6)
        p.set_text_color(*WHITE)
        p.set_xy(cx + cw - tw - 3, cy + 4.5)
        p.cell(tw, 4, tag, align='C')
        # Title + desc
        p.txt(cx + 4, cy + 4, title, 8.5, col, True)
        p.mtxt(cx + 4, cy + 11, cw - 8, desc, 6.8, LGRAY, False, 'L', 3.7)

    p.footer_pg(3)


# ────────────────────────────────────────────────────────────────────────────
#  P4 - FLUJO DE USO + MENTORES
# ────────────────────────────────────────────────────────────────────────────
def flujo(p: PDF):
    p.add_page()
    p.bg()
    p.topbar('NEXUS - Como usarla y metodologia de los mentores', GREEN)

    y = 22
    y = p.section_bar(y, 'COMO USAR NEXUS: 6 PASOS HACIA LA MONETIZACION', GREEN)

    steps = [
        ('01', 'Registrarse con Google',    'Login con un click usando tu cuenta Google. NEXUS crea tu perfil y canal en Supabase automaticamente.',    GREEN),
        ('02', 'Evaluar tu nicho',           'Completa el wizard de 5 pasos. Obtienes score /96, veredicto GO/REFINE/DISCARD y reporte descargable.',   PURPLE),
        ('03', 'Comparar alternativas',      'Si dudas entre varios nichos, usas el Comparador para verlos lado a lado y elegir el mas viable.',        BLUE),
        ('04', 'Ejecutar el Plan de Accion', 'Tu roadmap personalizado de 4 fases se auto-genera. Tacha tareas y seguiras tu progreso en el dashboard.', YELLOW),
        ('05', 'Producir contenido',         'Content Factory para ideas, Guiones para el script, Thumbnails para la imagen, Herramientas para hooks y keywords.', RED),
        ('06', 'Medir y escalar',            'Analytics muestra tu progreso en graficos. El Consultor IA responde dudas. El Calendario organiza la publicacion.', GREEN),
    ]

    cw_step = (W - 28) / 2 - 3
    for i, (num, title, desc, col) in enumerate(steps):
        col_n = i % 2
        row_n = i // 2
        sx = 14 + col_n * (cw_step + 6)
        sy = y + row_n * 30

        # Linea conectora vertical dentro de la misma columna
        if row_n < 2:
            p.set_draw_color(*col)
            p.set_line_width(0.4)
            p.line(sx + 11, sy + 30, sx + 11, sy + 37)

        # Circulo con numero
        p.circle(sx + 11, sy + 11, 9, col)
        p.set_font('Helvetica', 'B', 12)
        p.set_text_color(*WHITE)
        p.set_xy(sx + 2, sy + 5.5)
        p.cell(18, 10, num, align='C')

        # Card de contenido
        p.rr(sx + 24, sy, cw_step - 24, 27, 3, CARD, BORDER)
        p.rect_fill(sx + 24, sy, cw_step - 24, 1.5, col)
        p.txt(sx + 28, sy + 4, title, 8.5, WHITE, True)
        p.mtxt(sx + 28, sy + 11, cw_step - 32, desc, 7.2, LGRAY, False, 'L', 4)

    y += 98

    # ── MENTORES ─────────────────────────────────────────────────────────────
    p.section_bar(y, 'LOS 5 MENTORES DE NEXUS', YELLOW)
    y += 14

    p.mtxt(14, y, W - 28,
           'La IA de NEXUS esta entrenada con las metodologias de 5 referentes mundiales del ecosistema YouTube. '
           'Cada respuesta del Consultor IA cita la fuente del consejo que utiliza.',
           8.5, LGRAY, False, 'L', 4.8)
    y += 18

    mentors = [
        ('MrBeast',      'M', 'Engagement y Packaging', 'El thumbnail vale el 80% del video. Los primeros 30s definen todo. Nunca imites a competidores directos.', PURPLE),
        ('A.Hormozi',    'H', 'Oferta y Monetizacion',  'Disena la oferta ANTES del canal. El contenido son anuncios gratuitos de tu producto o servicio.',          GREEN),
        ('E.Wolf',       'W', 'RPM y Escalabilidad',    'Regla 7-11-4. El dubbing multiidioma multiplica ingresos 3-5x sin crear contenido nuevo.',                  YELLOW),
        ('A.Saenz',      'S', 'Estrategia de Nicho',    '2 metricas clave: CTR mayor a 4% y Retencion mayor a 50%. Todo lo demas es ruido. Valida antes de producir.', BLUE),
        ('E.Alanis',     'A', 'Canales Sin Rostro',     'Monetizacion acelerada con IA. 8 nichos validados con RPM mayor a $4 USD. YouTube penaliza sin valor humano real.', RED),
    ]
    mw = (W - 28) / 5 - 2
    for i, (name, initial, role, quote, col) in enumerate(mentors):
        mx = 14 + i * (mw + 2.5)
        p.rr(mx, y, mw, 56, 3, CARD2, BORDER)
        p.rect_fill(mx, y, mw, 2, col)
        # Avatar
        p.circle(mx + mw / 2, y + 14, 10, col)
        p.set_font('Helvetica', 'B', 13)
        p.set_text_color(*WHITE)
        p.set_xy(mx, y + 8)
        p.cell(mw, 10, initial, align='C')
        # Nombre
        p.set_font('Helvetica', 'B', 7.5)
        p.set_text_color(*col)
        p.set_xy(mx, y + 26)
        p.cell(mw, 0, name, align='C')
        # Rol
        p.set_font('Helvetica', '', 6.5)
        p.set_text_color(*LGRAY)
        p.set_xy(mx + 1, y + 31)
        p.multi_cell(mw - 2, 3.5, role, align='C')
        # Quote
        p.set_font('Helvetica', 'I', 5.8)
        p.set_text_color(80, 80, 110)
        p.set_xy(mx + 1, y + 38)
        p.multi_cell(mw - 2, 3.2, f'"{quote}"', align='C')

    p.footer_pg(4)


# ────────────────────────────────────────────────────────────────────────────
#  P5 - RESULTADOS + STACK TECNICO
# ────────────────────────────────────────────────────────────────────────────
def resultados_stack(p: PDF):
    p.add_page()
    p.bg()
    p.topbar('NEXUS - Resultados esperados y arquitectura tecnica', YELLOW)

    y = 22
    y = p.section_bar(y, 'RESULTADOS ESPERADOS A 90 DIAS', YELLOW)

    metricas = [
        ('Nicho validado con score mayor a 70/96 puntos',    95, PURPLE),
        ('Roadmap de 4 fases completado al 100%',            85, GREEN),
        ('Primeros 10 videos publicados y optimizados',      80, BLUE),
        ('Canal monetizable: 1000 subs + 4000 horas vistas', 72, YELLOW),
        ('Primeros ingresos AdSense + afiliados activos',    60, GREEN),
        ('Sistema de produccion con IA establecido',         92, RED),
    ]
    for label, pct, col in metricas:
        p.progress_bar(14, y + 4, W - 28, pct, col, label, f'{pct}%')
        y += 12
    y += 4

    # Grafico de barras: proyeccion de ingresos
    p.section_bar(y, 'PROYECCION DE INGRESOS (USD/mes) - Canales sin rostro con nicho validado', GREEN)
    y += 14

    income = [
        ('Mes 1-2', 0,    'Validacion'),
        ('Mes 3',   50,   'Setup'),
        ('Mes 4',   150,  'Crecimiento'),
        ('Mes 5',   320,  'Monetizando'),
        ('Mes 6',   500,  'Escalando'),
        ('Mes 9',   1000, 'Consolidado'),
    ]
    bh_max = 34
    bw = (W - 28) / len(income) - 3
    for i, (lbl, val, phase) in enumerate(income):
        bx = 14 + i * (bw + 3)
        fh = max(2, (val / 1000) * bh_max)
        # Fondo de barra
        p.set_fill_color(*BORDER)
        p.rect(bx, y, bw, bh_max, 'F')
        # Relleno
        col = DGRAY if val == 0 else GREEN
        p.set_fill_color(*col)
        p.rect(bx, y + bh_max - fh, bw, fh, 'F')
        # Valor encima
        p.set_font('Helvetica', 'B', 7.5)
        p.set_text_color(*col)
        p.set_xy(bx, y + bh_max - fh - 5.5)
        p.cell(bw, 0, f'${val}' if val > 0 else '$0', align='C')
        # Labels
        p.set_font('Helvetica', '', 6.5)
        p.set_text_color(*LGRAY)
        p.set_xy(bx, y + bh_max + 2)
        p.cell(bw, 0, lbl, align='C')
        p.set_xy(bx, y + bh_max + 7)
        p.cell(bw, 0, phase, align='C')
    y += bh_max + 18

    # ── STACK TECNICO ─────────────────────────────────────────────────────────
    p.section_bar(y, 'STACK TECNICO', BLUE, '100% TypeScript - 0 errores de compilacion - Build limpio')
    y += 18

    cols_tech = [
        ('Frontend', PURPLE, [
            ('Next.js 16.2',        'App Router, Server Components, Streaming SSE'),
            ('TypeScript 5',        '100% tipado estricto, cero errores de compilacion'),
            ('Tailwind CSS 4',      'Design tokens via variables CSS (@theme inline)'),
            ('Framer Motion',       'Animaciones y transiciones en todos los componentes'),
            ('Recharts',            'Graficos interactivos en la seccion Analytics'),
            ('Zustand + TanStack',  'Estado global y cache de datos del servidor'),
        ]),
        ('Backend & Base de datos', GREEN, [
            ('Prisma 5.22',         'ORM type-safe con PostgreSQL + pgvector para RAG'),
            ('Supabase',            'PostgreSQL hosting + extension pgvector semantica'),
            ('NextAuth.js v5',      'Autenticacion JWT puro + Google OAuth 2.0'),
            ('Anthropic SDK',       'Claude Sonnet 4.6 para el Consultor IA con RAG'),
            ('OpenAI SDK',          'Embeddings text-embedding-3-small para RAG semantico'),
            ('Upstash Redis',       'Rate limiting por usuario en rutas de IA'),
        ]),
        ('Infraestructura & QA', YELLOW, [
            ('Vercel (Hobby)',       'Deploy automatico en cada push a main - gratuito'),
            ('RAG + pgvector',       'Busqueda semantica sobre base de conocimiento de mentores'),
            ('Streaming SSE',        'Respuestas del Consultor IA en tiempo real por tokens'),
            ('Zod validation',       'Validacion estricta de todas las entradas de API'),
            ('Security layers',      'Sanitizacion, rate limiting y auditoria integrados'),
            ('Mock automatico',      'Funciona sin API keys para desarrollo y demos'),
        ]),
    ]
    ctw = (W - 28 - 8) / 3
    for ci, (title, col, items) in enumerate(cols_tech):
        cx = 14 + ci * (ctw + 4)
        ch = 10 + len(items) * 13
        p.rr(cx, y, ctw, ch, 3, CARD, BORDER)
        p.rect_fill(cx, y, ctw, 8, col)
        p.txt(cx + 4, y + 2, title, 8, WHITE, True)
        cy2 = y + 10
        for tech, desc in items:
            p.dot(cx + 5, cy2 + 2.5, col, 1.5)
            p.txt(cx + 9, cy2, tech, 7.5, WHITE, True)
            p.txt(cx + 9, cy2 + 4.5, desc, 6.2, DGRAY)
            cy2 += 13

    p.footer_pg(5)


# ────────────────────────────────────────────────────────────────────────────
#  P6 - CIERRE / CTA
# ────────────────────────────────────────────────────────────────────────────
def cierre(p: PDF):
    p.add_page()
    p.bg()

    # Fondo con patron de degradado
    for i in range(H // 4):
        v = i / (H // 4)
        r = int(8  + 18 * v * (1 - v) * 4)
        g = int(8  + 5  * v)
        b = int(18 + 50 * v * (1 - v) * 4)
        p.set_fill_color(min(r, 55), min(g, 20), min(b, 75))
        p.rect(0, i * 4, W, 5, 'F')

    p.rect_fill(0, 0, W, 2.5, PURPLE)

    # Logo grande
    p.circle(W / 2, 62, 24, PURPLE)
    p.circle(W / 2 - 7, 54, 7, PURPLEM)
    p.set_font('Helvetica', 'B', 28)
    p.set_text_color(*WHITE)
    p.set_xy(W / 2 - 11, 52)
    p.cell(22, 20, 'N', align='C')

    # Titulo
    p.set_font('Helvetica', 'B', 40)
    p.set_text_color(*WHITE)
    p.set_xy(0, 93)
    p.cell(W, 0, 'NEXUS', align='C')

    p.set_font('Helvetica', 'B', 13)
    p.set_text_color(*PURPLEM)
    p.set_xy(0, 109)
    p.cell(W, 0, 'YouTube Strategy Platform', align='C')

    # Frase motivacional
    p.rr(22, 124, W - 44, 30, 4, (18, 18, 40), PURPLE)
    p.set_font('Helvetica', 'B', 13)
    p.set_text_color(*WHITE)
    p.set_xy(0, 130)
    p.cell(W, 0, '"90 dias separan a alguien sin audiencia', align='C')
    p.set_text_color(*GREEN)
    p.set_xy(0, 141)
    p.cell(W, 0, 'de su primer ingreso pasivo en YouTube."', align='C')

    # Linea decorativa
    p.set_draw_color(*PURPLE)
    p.set_line_width(0.6)
    p.line(55, 163, 155, 163)
    p.dot(55, 163, PURPLE, 1.5)
    p.dot(155, 163, GREEN, 1.5)

    # Sub motivacion
    p.set_font('Helvetica', 'B', 9.5)
    p.set_text_color(*LGRAY)
    p.set_xy(0, 170)
    p.cell(W, 0, 'Para empezar hoy mismo, solo necesitas:', align='C')

    # 3 pasos
    pasos = [
        ('01', 'Login con Google',     '30 segundos, gratis',    PURPLE),
        ('02', 'Evaluar tu nicho',     'Wizard de 10 minutos',   GREEN),
        ('03', 'Seguir el roadmap',    '90 dias al primer ingreso', YELLOW),
    ]
    pw = 54
    total_w = len(pasos) * pw + (len(pasos) - 1) * 6
    sx = (W - total_w) / 2
    for i, (num, title, sub, col) in enumerate(pasos):
        px = sx + i * (pw + 6)
        py = 180
        p.rr(px, py, pw, 38, 3, CARD, BORDER)
        p.rect_fill(px, py, pw, 2, col)
        p.circle(px + pw / 2, py + 14, 9, col)
        p.set_font('Helvetica', 'B', 12)
        p.set_text_color(*WHITE)
        p.set_xy(px, py + 8.5)
        p.cell(pw, 10, num, align='C')
        p.txt(px, py + 25, title, 8, WHITE, True, 'C', pw)
        p.txt(px, py + 31.5, sub, 7, LGRAY, False, 'C', pw)

    # Costo
    p.rr(45, 226, W - 90, 20, 3, (10, 28, 18), GREEN)
    p.set_font('Helvetica', 'B', 10)
    p.set_text_color(*GREEN)
    p.set_xy(45, 230)
    p.cell(W - 90, 0, 'Costo total en produccion: ~$2 USD/mes', align='C')
    p.set_font('Helvetica', '', 7.5)
    p.set_text_color(*LGRAY)
    p.set_xy(45, 238)
    p.cell(W - 90, 0, 'Vercel + Supabase (gratis) + ~$2 Anthropic', align='C')

    # Feature summary
    p.hline(14, 253, W - 28, BORDER)
    summary_items = ['25 rutas', '12 secciones', '5 mentores IA', 'RAG semantico',
                     'Streaming SSE', 'Auth Google', 'Supabase PostgreSQL', 'TypeScript 100%']
    bx_s = 14
    for item in summary_items:
        tw = p.get_string_width(item) + 6
        if bx_s + tw > W - 14:
            bx_s = 14
        p.set_fill_color(*BORDER)
        p.rect(bx_s, 256, tw, 6, 'F')
        p.set_font('Helvetica', '', 6.5)
        p.set_text_color(*LGRAY)
        p.set_xy(bx_s, 257)
        p.cell(tw, 5, item, align='C')
        bx_s += tw + 3

    # Tech badges fila 2
    tech_list = ['Next.js 16', 'TypeScript', 'Tailwind 4', 'Prisma 5', 'NextAuth v5',
                 'Anthropic SDK', 'OpenAI SDK', 'Supabase', 'Upstash', 'Vercel', 'Recharts', 'Framer Motion']
    bx_t = 14
    by_t = 266
    for tech in tech_list:
        tw = p.get_string_width(tech) + 5
        if bx_t + tw > W - 14:
            bx_t = 14
            by_t += 7
        p.set_fill_color(28, 28, 52)
        p.rect(bx_t, by_t, tw, 5.5, 'F')
        p.set_font('Helvetica', '', 6.2)
        p.set_text_color(*DGRAY)
        p.set_xy(bx_t, by_t + 0.8)
        p.cell(tw, 4.5, tech, align='C')
        bx_t += tw + 2

    # Footer final
    p.rect_fill(0, H - 14, W, 14, (6, 6, 16))
    p.set_font('Helvetica', 'B', 9)
    p.set_text_color(*PURPLEM)
    p.set_xy(0, H - 10)
    p.cell(W, 0, 'NEXUS - YouTube Strategy Platform', align='C')
    p.set_font('Helvetica', '', 7)
    p.set_text_color(*DGRAY)
    p.set_xy(0, H - 5.5)
    p.cell(W, 0, 'Construido con Next.js 16 + TypeScript + Anthropic AI + Supabase  |  c 2025', align='C')


# ────────────────────────────────────────────────────────────────────────────
#  MAIN
# ────────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    output = os.path.join(
        r'C:\Users\Maxi\Documents\Proyecto youtube desde cero\Proyecto Web para contenido',
        'NEXUS_Presentacion.pdf'
    )

    pdf = PDF()
    pdf.set_title('NEXUS - YouTube Strategy Platform')
    pdf.set_author('NEXUS')
    pdf.set_subject('Presentacion publicitaria')

    print('Generando PDF...')
    portada(pdf);           print('  [1/6] Portada OK')
    que_es(pdf);            print('  [2/6] Que es NEXUS OK')
    funcionalidades(pdf);   print('  [3/6] Funcionalidades OK')
    flujo(pdf);             print('  [4/6] Flujo + Mentores OK')
    resultados_stack(pdf);  print('  [5/6] Resultados + Stack OK')
    cierre(pdf);            print('  [6/6] Cierre OK')

    pdf.output(output)
    print(f'\nPDF generado:')
    print(f'  {output}')

