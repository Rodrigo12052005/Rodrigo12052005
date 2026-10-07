

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, QrCode as QrCodeIcon, KeyRound, History, ArrowUpCircle, ArrowDownCircle, EyeOff, Copy, ScanLine } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import StahlLogo from '../../components/StahlLogo';
// FIX: Import TransactionType to use for comparisons
import { PixKey, PixKeyType, Transaction, TransactionType } from '../../types';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { QrScanner } from '@yudiel/react-qr-scanner';

type WalletView = 'main' | 'send' | 'receive' | 'keys' | 'history';

const WalletHeader: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center justify-between border-b border-[var(--border-color)]">
        <button onClick={onBack} className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] transition-colors p-2" aria-label="Voltar">
            <ArrowLeft size={24} />
        </button>
        <StahlLogo className="h-10" />
        <div className="w-10"></div>
    </header>
);

const WalletPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, sendDollars, addPixKey, removePixKey } = useAppContext();
    const [view, setView] = useState<WalletView>('main');

    if (!currentUser) {
        // Redirect or show loading
        return <div>Carregando...</div>;
    }

    const goBack = () => {
        if (view === 'main') {
            navigate('/pathfinder');
        } else {
            setView('main');
        }
    };

    return (
        <div className="min-h-screen">
            <WalletHeader onBack={goBack} />
            <main className="p-4">
                {view === 'main' && <MainWalletView user={currentUser} setView={setView} />}
                {view === 'send' && <SendPixView user={currentUser} sendDollars={sendDollars} setView={setView} />}
                {view === 'receive' && <ReceivePixView user={currentUser} />}
                {view === 'keys' && <PixKeysView user={currentUser} addPixKey={addPixKey} removePixKey={removePixKey} />}
                {view === 'history' && <TransactionHistoryView transactions={currentUser.transactions || []} />}
            </main>
        </div>
    );
};

const MainWalletView: React.FC<{ user: any; setView: (view: WalletView) => void }> = ({ user, setView }) => (
    <div className="animate-fade-in space-y-6">
        <div className="ui-card p-6 text-center">
            <p className="text-gray-400 font-body text-sm">Saldo de Dólares</p>
            <p className="text-4xl font-heading text-green-400 my-2">{user.dollars?.toLocaleString() || 0}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <ActionButton icon={<Send size={28} />} label="Enviar Pix" onClick={() => setView('send')} />
            <ActionButton icon={<QrCodeIcon size={28} />} label="Receber Pix" onClick={() => setView('receive')} />
            <ActionButton icon={<KeyRound size={28} />} label="Minhas Chaves" onClick={() => setView('keys')} />
            <ActionButton icon={<History size={28} />} label="Histórico" onClick={() => setView('history')} />
        </div>
    </div>
);

const SendPixView: React.FC<{ user: any, sendDollars: any, setView: (view: WalletView) => void }> = ({ user, sendDollars, setView }) => {
    const [receiverKey, setReceiverKey] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isScanning, setIsScanning] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('idle');
        const numAmount = parseInt(amount, 10);
        if(isNaN(numAmount) || numAmount <= 0) {
            setMessage('Quantia inválida.');
            setStatus('error');
            return;
        }
        
        // Simulating PIN confirmation
        if (!window.confirm(`Você confirma a transferência de ${numAmount} dólares para a chave ${receiverKey}?`)) {
            return;
        }

        const result = sendDollars(user.id, receiverKey, numAmount);
        setMessage(result.message);
        if(result.success) {
            setStatus('success');
            setReceiverKey('');
            setAmount('');
            setTimeout(() => setView('main'), 2000);
        } else {
            setStatus('error');
        }
    };

    const handleScan = (result: string) => {
        if (result) {
            setReceiverKey(result);
            setIsScanning(false);
        }
    };

    const handleError = (err: any) => {
        console.error(err);
        alert('Erro ao acessar a câmera. Verifique as permissões.');
        setIsScanning(false);
    };
    
    return (
        <div className="animate-fade-in">
            <h2 className="font-heading text-2xl text-center mb-6">Enviar Dólares</h2>
            <form onSubmit={handleSend} className="ui-card p-6 space-y-4">
                 <div className="flex items-center gap-2">
                     <input 
                         type="text" 
                         value={receiverKey} 
                         onChange={e => setReceiverKey(e.target.value)} 
                         className="form-input flex-grow" 
                         placeholder="Chave Pix ou ID Stahl" 
                         required 
                     />
                     <button 
                         type="button" 
                         onClick={() => setIsScanning(true)} 
                         className="btn-secondary p-3"
                         aria-label="Escanear QR Code"
                     >
                         <ScanLine size={20} />
                     </button>
                 </div>
                 <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="form-input" placeholder="Quantia" required />
                 {message && (
                    <p className={`text-sm text-center ${status === 'success' ? 'text-green-400' : 'text-red-500'}`}>{message}</p>
                 )}
                 <button type="submit" className="btn-primary w-full !mt-6">Enviar</button>
            </form>
            {isScanning && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
                    <h3 className="text-xl font-heading mb-4 text-[var(--primary-purple)]">Aponte para o QR Code</h3>
                    <div className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-[var(--primary-purple)]">
                        <QrScanner
                            onError={handleError}
                            onDecode={handleScan}
                            videoStyle={{ width: '100%' }}
                        />
                    </div>
                    <button onClick={() => setIsScanning(false)} className="btn-secondary mt-6">Cancelar</button>
                </div>
            )}
        </div>
    );
};

const ReceivePixView: React.FC<{ user: any }> = ({ user }) => {
    const primaryKey = user.pixKeys?.find((k: PixKey) => !k.isDeleted)?.key || user.qrCodeValue;
    const handleCopy = () => {
        navigator.clipboard.writeText(primaryKey);
        alert('Chave Pix copiada!');
    }
    return (
        <div className="animate-fade-in ui-card p-6 flex flex-col items-center">
            <h2 className="font-heading text-2xl text-center mb-4">Receber Dólares</h2>
            <div className="bg-white p-4 rounded-md">
              <QRCode value={primaryKey} size={256} bgColor="#FFFFFF" fgColor="#0d0d0d" />
            </div>
            <p className="text-white text-center mt-4 font-heading">{user.fullName}</p>
            <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-black/30">
                <span className="text-gray-300 text-sm truncate">{primaryKey}</span>
                <button onClick={handleCopy} className="text-[var(--primary-purple)] hover:text-[var(--primary-purple-hover)]"><Copy size={18} /></button>
            </div>
        </div>
    );
};

const PixKeysView: React.FC<{ user: any, addPixKey: any, removePixKey: any }> = ({ user, addPixKey, removePixKey }) => {
    const [keyType, setKeyType] = useState<PixKeyType>(PixKeyType.Email);
    const [keyValue, setKeyValue] = useState('');
    
    const handleAddKey = () => {
        if(!keyValue) {
            alert('Por favor, insira um valor para a chave.');
            return;
        }
        const newKey: PixKey = { type: keyType, key: keyValue };
        addPixKey(user.id, newKey);
        setKeyValue('');
    };
    
    const handleRemoveKey = (keyToRemove: string) => {
        if (window.confirm(`Tem certeza que deseja mover a chave "${keyToRemove}" para a lixeira?`)) {
            removePixKey(user.id, keyToRemove);
        }
    };

    const activeKeys = user.pixKeys?.filter((k: PixKey) => !k.isDeleted) || [];

    return (
        <div className="animate-fade-in space-y-6">
            <h2 className="font-heading text-2xl text-center">Minhas Chaves Pix</h2>
            <div className="ui-card p-4 space-y-2">
                {activeKeys.map((k: PixKey) => (
                    <div key={k.key} className="flex justify-between items-center p-3 bg-black/40 rounded-md">
                        <div>
                            <p className="font-semibold">{k.key}</p>
                            <p className="text-xs text-gray-400">{k.type}</p>
                        </div>
                        <button onClick={() => handleRemoveKey(k.key)} className="p-2 text-gray-500 hover:text-red-500" aria-label={`Ocultar chave ${k.key}`}><EyeOff size={18}/></button>
                    </div>
                ))}
                {activeKeys.length === 0 && <p className="text-center text-gray-400 py-4">Nenhuma chave cadastrada.</p>}
            </div>
             <div className="ui-card p-4 space-y-3">
                 <h3 className="font-heading text-lg">Adicionar Nova Chave</h3>
                 <select value={keyType} onChange={e => setKeyType(e.target.value as PixKeyType)} className="form-input">
                     {Object.values(PixKeyType).filter(type => type !== PixKeyType.ID).map(type => <option key={type} value={type}>{type}</option>)}
                 </select>
                 <input type="text" value={keyValue} onChange={e => setKeyValue(e.target.value)} className="form-input" placeholder="Valor da Chave" />
                 <button onClick={handleAddKey} className="btn-secondary w-full">Adicionar Chave</button>
             </div>
        </div>
    );
};

// FIX: Compare transaction type with TransactionType enum instead of string literals.
const TransactionHistoryView: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="animate-fade-in">
        <h2 className="font-heading text-2xl text-center mb-4">Histórico de Transações</h2>
        <div className="space-y-3">
            {transactions.map(tx => (
                <div key={tx.id} className="ui-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                         {tx.type === TransactionType.Sent ? <ArrowUpCircle size={28} className="text-red-500" /> : <ArrowDownCircle size={28} className="text-green-400" />}
                        <div>
                            <p className="font-semibold">{tx.type === TransactionType.Sent ? tx.receiverName : tx.senderName}</p>
                            <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                    <p className={`font-heading text-lg text-green-400`}>
                        {tx.type === TransactionType.Sent ? '-' : '+'} {tx.amount}
                    </p>
                </div>
            ))}
            {transactions.length === 0 && <p className="text-center text-gray-400 py-8">Nenhuma transação encontrada.</p>}
        </div>
    </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 space-y-2 ui-card transition-all text-[var(--primary-purple)]">
        {icon}
        <span className="font-heading text-center text-white mt-2">{label}</span>
    </button>
);


export default WalletPage;