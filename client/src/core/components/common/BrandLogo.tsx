import { Link } from 'react-router-dom';

type BrandLogoVariant = 'full' | 'icon' | 'wordmark';
type BrandLogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  linkTo?: string | null;
  className?: string;
}

const ICON_SIZE: Record<BrandLogoSize, string> = {
  sm: 'w-8 h-8 text-base rounded-md',
  md: 'w-10 h-10 text-xl rounded-lg',
  lg: 'w-11 h-11 text-xl rounded-lg',
};

const WORDMARK_SIZE: Record<BrandLogoSize, string> = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

const IconMark = ({ size }: { size: BrandLogoSize }) => (
  <div
    className={`${ICON_SIZE[size]} bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center font-bold shadow-sm shrink-0`}
  >
    M
  </div>
);

/**
 * Sidebar, TopBar (mobil), PublicLayout ve Footer'daki dağınık "MyAdmin" logo/wordmark
 * implementasyonlarının tek kanonik kaynağı. `full` = ikon + wordmark + tagline (Sidebar),
 * `icon` = sadece kare ikon (TopBar mobil), `wordmark` = sadece metin (Public header/Footer).
 */
export const BrandLogo = ({ variant = 'full', size = 'md', linkTo = '/', className = '' }: BrandLogoProps) => {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      {(variant === 'full' || variant === 'icon') && <IconMark size={size} />}

      {(variant === 'full' || variant === 'wordmark') && (
        <div>
          <p className={`${WORDMARK_SIZE[size]} font-black tracking-tighter text-on-surface dark:text-dark-on-surface leading-none`}>
            MyAdmin
          </p>
          {variant === 'full' && (
            <p className="text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant font-medium uppercase tracking-widest mt-1">
              Command Center
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (!linkTo) return content;

  return (
    <Link to={linkTo} className="inline-flex">
      {content}
    </Link>
  );
};
