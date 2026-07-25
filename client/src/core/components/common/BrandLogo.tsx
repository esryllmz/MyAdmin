import { Link } from 'react-router-dom';

type BrandLogoVariant = 'full' | 'mark' | 'footer' | 'icon' | 'wordmark';
type BrandLogoSize = 'sm' | 'md' | 'lg';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  linkTo?: string | null;
  className?: string;
}

const MARK_SIZE: Record<BrandLogoSize, string> = {
  sm: 'w-7 h-7 text-xs rounded-md',
  md: 'w-9 h-9 text-sm rounded-md',
  lg: 'w-10 h-10 text-base rounded-md',
};

const WORDMARK_SIZE: Record<BrandLogoSize, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
};

const Monogram = ({ size }: { size: BrandLogoSize }) => (
  <div
    className={`${MARK_SIZE[size]} bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface flex items-center justify-center font-bold tracking-tight shrink-0 select-none`}
    aria-hidden="true"
  >
    M
  </div>
);

/**
 * Sidebar, TopBar, PublicLayout ve Footer'daki logo kullanımlarının tek kanonik kaynağı.
 * `full` = monogram + wordmark + tagline (Sidebar açık), `mark`/`icon` = yalnızca monogram
 * (Sidebar kapalı, TopBar mobil), `wordmark` = yalnızca metin, `footer` = küçük monogram + metin.
 */
export const BrandLogo = ({ variant = 'full', size = 'md', linkTo = '/', className = '' }: BrandLogoProps) => {
  const showMark = variant === 'full' || variant === 'mark' || variant === 'icon' || variant === 'footer';
  const showWordmark = variant === 'full' || variant === 'wordmark' || variant === 'footer';

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showMark && <Monogram size={variant === 'footer' ? 'sm' : size} />}

      {showWordmark && (
        <div className="leading-none">
          <p
            className={`${WORDMARK_SIZE[variant === 'footer' ? 'sm' : size]} font-bold tracking-tight text-on-surface dark:text-dark-on-surface leading-none`}
          >
            MyAdmin
          </p>
          {variant === 'full' && (
            <p className="text-[10px] text-on-surface-variant dark:text-dark-on-surface-variant font-medium uppercase tracking-widest mt-1">
              Control Center
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
