export default function LoadingSpinner({ size = 'lg', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className={`${sizes[size]} border-3 border-cream-200 border-t-terracotta-500 rounded-full animate-spin`} style={{ borderWidth: '3px' }} />
      {text && <p className="text-sm text-gray-500 font-body">{text}</p>}
    </div>
  );
}
