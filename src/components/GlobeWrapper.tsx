import dynamic from 'next/dynamic';

const GlobeComponent = dynamic(() => import('./Globe'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#090e1c]">
      <div className="text-[#ff3131]/50 font-mono text-xs animate-pulse tracking-[0.3em]">
        INITIALIZING SPATIAL MESH...
      </div>
    </div>
  ),
});

export default GlobeComponent;
