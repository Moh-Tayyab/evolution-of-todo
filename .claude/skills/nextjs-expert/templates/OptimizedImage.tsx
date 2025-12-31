import Image from 'next/image';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const { width, height } = sizes[size];

  return (
    <div className={`relative inline-block ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-full object-cover bg-gray-200"
        priority
      />
    </div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function CardImage({
  src,
  alt,
  width = 400,
  height = 250,
  priority = false,
  className = '',
}: CardImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover w-full h-full"
        priority={priority}
      />
    </div>
  );
}
