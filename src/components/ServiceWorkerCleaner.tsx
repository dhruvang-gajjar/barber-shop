"use client";

import { useEffect } from "react";

/**
 * Automatically unregisters any legacy or third-party service workers registered
 * on localhost (e.g. from prior PWA / web projects) and purges stale CacheStorage.
 * This resolves "Failed to fetch at sw.js" and stale asset hydration errors.
 */
export default function ServiceWorkerCleaner() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((unregistered) => {
            if (unregistered) {
              console.info(
                "[ServiceWorkerCleaner] Unregistered legacy service worker:",
                registration.scope
              );
            }
          });
        }
      });
    }

    if ("caches" in window) {
      caches.keys().then((cacheNames) => {
        for (const name of cacheNames) {
          caches.delete(name).then(() => {
            console.info("[ServiceWorkerCleaner] Deleted stale cache:", name);
          });
        }
      });
    }
  }, []);

  return null;
}
