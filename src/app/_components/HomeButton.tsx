"use client";

export function HomeButton() {
  return (
    <button
      onClick={() => (window.location.href = "/")}
      className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
    >
      <img src="/icons/home.svg" alt="Home" className="w-6 h-6" />
    </button>
  );
}