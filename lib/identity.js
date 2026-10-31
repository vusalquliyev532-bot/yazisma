export function saveLocalProfile(profile) {
  localStorage.setItem("yazisma_profile", JSON.stringify(profile));
}

export function getLocalProfile() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("yazisma_profile");
  return raw ? JSON.parse(raw) : null;
}

export function clearLocalProfile() {
  localStorage.removeItem("yazisma_profile");
}
