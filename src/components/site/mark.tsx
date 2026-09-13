export function Mark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#203B61" />
      <path
        d="M11 32h26M15 32l5-16 5 16 5-16 5 16"
        fill="none"
        stroke="#F4EFE3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="2.6" fill="#A74334" />
    </svg>
  );
}
