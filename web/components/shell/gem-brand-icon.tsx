type GemBrandIconProps = Readonly<{
  className?: string;
}>;

export function GemBrandIcon({ className }: GemBrandIconProps) {
  return <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 1.5 14.5 9.5 22.5 12l-8 2.5-2.5 8-2.5-8L1.5 12l8-2.5L12 1.5Z" fill="currentColor" />
  </svg>;
}
