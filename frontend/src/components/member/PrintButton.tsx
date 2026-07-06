"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider text-sm rounded-sm px-8 py-3 border-2 bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark"
    >
      Print ID Card
    </button>
  );
}
