import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from "web-vitals";

const vitalsUrl = "https://vitals.vercel-analytics.com/v1/vitals";

// Define NetworkInformation interface for TypeScript
interface NetworkInformation {
  effectiveType?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

function getConnectionSpeed(): string {
  if (typeof navigator === "undefined") {
    return "";
  }

  const nav = navigator as NavigatorWithConnection;
  return nav.connection?.effectiveType || "";
}

/**
 * Send vitals metrics to Vercel Analytics
 */
export function reportWebVitals(
  metric: any,
  options: { path: string } = { path: "" }
) {
  const body = {
    dsn: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || "", // Analytics ID goes here if available
    id: metric.id,
    page: options.path || window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[Web Vitals]:", body);
    return;
  }

  const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: JSON.stringify(body),
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Track all web vitals
 */
export function trackWebVitals(path: string) {
  try {
    const reportOptions = { path };
    const reportAll = (metric: any) => reportWebVitals(metric, reportOptions);

    onCLS(reportAll);
    onFCP(reportAll);
    onFID(reportAll);
    onINP(reportAll);
    onLCP(reportAll);
    onTTFB(reportAll);
  } catch (err) {
    console.error("[Web Vitals Error]:", err);
  }
}

/**
 * Track custom events using Vercel Analytics
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Use optional chaining and check if window.va is a function
    if (typeof (window as any).va === "function") {
      (window as any).va("event", {
        name: eventName,
        ...properties,
      });
    }
  } catch (err) {
    console.error("[Analytics Error]:", err);
  }
}
