"use client";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="hover:text-accent transition-colors flex items-center gap-1"
    >
      ↑ Back to top
    </button>
  );
}
