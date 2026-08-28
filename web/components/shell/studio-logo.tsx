import { GemMark } from "./gem-brand-icon";

type StudioLogoProps = Readonly<{
  studioName: string;
  logoUrl?: string | null;
  size?: number;
}>;

export function StudioLogo({ logoUrl, size = 28 }: StudioLogoProps) {
  // ponytail: fixed box reserves space; Gem fallback until workspace logo filled
  if (logoUrl) {
    return (
      <span className="studio-logo" style={{ width: size, height: size }} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: "cover", borderRadius: 6 }}
        />
      </span>
    );
  }
  return (
    <span className="studio-logo studio-logo--placeholder" style={{ width: size, height: size }} aria-hidden="true">
      <GemMark size={Math.round(size * 0.64)} />
    </span>
  );
}


