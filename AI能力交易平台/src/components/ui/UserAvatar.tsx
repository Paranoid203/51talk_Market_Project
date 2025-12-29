// ✅ 用户头像组件 - 取首字母显示
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 根据名字生成固定的渐变颜色
const getGradientColor = (name: string): string => {
  const colors = [
    'from-purple-400 to-blue-400',
    'from-amber-400 to-orange-400',
    'from-emerald-400 to-teal-400',
    'from-pink-400 to-rose-400',
    'from-cyan-400 to-blue-400',
    'from-violet-400 to-purple-400',
    'from-red-400 to-pink-400',
    'from-green-400 to-emerald-400',
    'from-blue-400 to-indigo-400',
    'from-orange-400 to-red-400',
  ];
  
  // 根据名字计算hash，确保同样的名字总是得到同样的颜色
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// 尺寸映射
const sizeMap = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

export function UserAvatar({ name, className = '', size = 'md' }: UserAvatarProps) {
  // 取名字的第一个字
  const firstChar = name && name.length > 0 ? name.charAt(0) : '?';
  const gradient = getGradientColor(name);
  
  return (
    <div 
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center text-white font-medium flex-shrink-0',
        gradient,
        sizeMap[size],
        className
      )}
      title={name}
    >
      {firstChar}
    </div>
  );
}

