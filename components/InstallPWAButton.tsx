import React, { useEffect, useState } from 'react';
import { Download, Share, Smartphone } from 'lucide-react';

const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);
    setIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    const handler = (event: Event) => { event.preventDefault(); setDeferredPrompt(event); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setDeferredPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed) return null;

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (ios) {
      setShowIosHelp(true);
    }
  };

  return <>
    <button type="button" onClick={install} className="install-pwa-button w-full">
      {ios ? <Share size={19} /> : <Download size={19} />}
      <span>INSTALAR STAHL NO CELULAR</span>
    </button>

    {showIosHelp && <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={() => setShowIosHelp(false)}>
      <div className="w-full max-w-sm ui-card p-6 border-[var(--primary-red)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="install-icon"><Smartphone size={22} /></div>
          <div>
            <h3 className="font-heading text-xl text-white">INSTALAR NO IPHONE</h3>
            <p className="text-xs text-gray-400">O STAHL vira um app na sua tela inicial.</p>
          </div>
        </div>
        <ol className="space-y-3 text-sm text-gray-300">
          <li><strong className="text-white">1.</strong> Toque em <Share size={15} className="inline mx-1 text-[var(--primary-red)]" /> Compartilhar no Safari.</li>
          <li><strong className="text-white">2.</strong> Escolha <strong className="text-white">Adicionar à Tela de Início</strong>.</li>
          <li><strong className="text-white">3.</strong> Confirme em <strong className="text-white">Adicionar</strong>.</li>
        </ol>
        <button type="button" onClick={() => setShowIosHelp(false)} className="btn-primary w-full mt-6">ENTENDI</button>
      </div>
    </div>}
  </>;
};

export default InstallPWAButton;
