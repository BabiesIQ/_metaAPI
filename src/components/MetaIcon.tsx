export function MetaIcon({ name, size = 32, className = "" }: { name: string; size?: number; className?: string }) {
  return <img src={`/assets/meta/icons/${name}.svg`} alt="" aria-hidden="true" width={size} height={size} draggable={false} className={`shrink-0 object-contain ${className}`} />;
}
export function MetaLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <img src="/assets/meta/music-logo.svg" alt="" aria-hidden="true" width={size} height={size} draggable={false} className={`shrink-0 object-contain ${className}`} />;
}
