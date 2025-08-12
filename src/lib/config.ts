export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("apiBaseUrl");
    if (stored) return stored;
  }
  return "http://49.233.207.217:8000";
}

export function setApiBaseUrl(url: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("apiBaseUrl", url);
  }
}
