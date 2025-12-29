export function LoadingAvatar() {
  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: '128px', height: '72px' }}>
      <img
        src="/images/可爱猫咪动漫角色GIF_transparent.webp"
        alt="加载动画"
        className="w-full h-full object-contain"
        style={{
          pointerEvents: 'none',
          aspectRatio: '16 / 9',
          width: '100%',
          height: '100%'
        }}
        draggable={false}
      />
    </div>
  );
}
