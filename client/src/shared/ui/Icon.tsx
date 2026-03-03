import type { SVGProps } from 'react';

export type IconName = 'target' | 'check' | 'warning';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
}

const defaultSize = 24;

export const Icon = ({
  name,
  className = '',
  width = defaultSize,
  height = defaultSize,
  ...props
}: IconProps) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    {...props}
  >
    <use href={`#icon-${name}`} />
  </svg>
);
