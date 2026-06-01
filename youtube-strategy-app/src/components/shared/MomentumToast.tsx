"use client";

import { toast } from "sonner";

// Mensajes motivacionales por hito — estilo Momentum UI del brief
const MOTIVATIONAL_MESSAGES = {
  taskComplete: [
    "¡Paso completado! Cada acción te acerca al canal monetizado. 💪",
    "¡Hecho! Esto es exactamente lo que hace la diferencia. 🚀",
    "Tarea completada. Consistencia > talento (MrBeast). ✅",
    "¡Excelente! El progreso constante supera al perfeccionismo. ⚡",
    "¡Un paso más hacia el YPP! Lo estás logrando. 🎯",
  ],
  nicheApproved: [
    "¡Nicho aprobado! Este nicho tiene todo para funcionar. 🎉",
    "¡Score excelente! El 80% del trabajo ya está hecho. 💰",
    "¡GO! Tenés luz verde — hora de construir el canal. 🚀",
  ],
  ideaSaved: [
    "Idea guardada en tu biblioteca. Cada idea es un activo. 💡",
    "¡Guardada! MrBeast diría: nunca desperdicies una buena idea. ⭐",
  ],
  ideaPublished: [
    "¡Publicada! Cada video que sube es dinero que puede generar. 🎬",
    "¡Contenido live! El algoritmo te está mirando. 📈",
  ],
};

type ToastType = keyof typeof MOTIVATIONAL_MESSAGES;

export function showMomentumToast(type: ToastType) {
  const messages = MOTIVATIONAL_MESSAGES[type];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  toast.success(msg, { duration: 4000 });
}
