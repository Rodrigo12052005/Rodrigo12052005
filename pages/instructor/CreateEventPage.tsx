import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Video } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Event } from '../../types';

const CreateEventPage: React.FC = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId?: string }>();
    const { addEvent, events, updateEvent } = useAppContext();
    
    const isEditMode = Boolean(eventId);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditMode && eventId) {
            const eventToEdit = events.find(e => e.id === parseInt(eventId, 10));
            if (eventToEdit) {
                setTitle(eventToEdit.title);
                setDescription(eventToEdit.description);
                setDate(eventToEdit.date);
                setImageUrl(eventToEdit.imageUrl || null);
                setVideoUrl(eventToEdit.videoUrl || null);
            }
        }
    }, [isEditMode, eventId, events]);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>, 
        setter: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setter(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !date || !imageUrl) {
            setError('Por favor, preencha todos os campos obrigatórios e adicione uma imagem.');
            return;
        }
        setError('');
        
        const eventData: Omit<Event, 'id'> = {
            title,
            description,
            date,
            imageUrl: imageUrl ?? undefined,
            videoUrl: videoUrl ?? undefined,
        };

        if (isEditMode && eventId) {
            updateEvent({ ...eventData, id: parseInt(eventId, 10) });
            alert('Evento atualizado com sucesso!');
        } else {
            addEvent({ ...eventData, id: Date.now() });
            alert('Evento criado com sucesso!');
        }
        
        navigate('/instructor/manage-events');
    };

    return (
        <div className="min-h-screen font-body">
            <header className="bg-black/30 backdrop-blur-sm sticky top-0 z-50 p-4 flex items-center justify-between border-b border-[var(--border-color)]">
                <button 
                    onClick={() => navigate(-1)} 
                    className="text-[var(--accent-gray)] hover:text-[var(--primary-purple)] transition-colors p-2"
                    aria-label="Voltar"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-heading">{isEditMode ? 'Editar Evento' : 'Criar Novo Evento'}</h1>
                <div className="w-10"></div>
            </header>

            <main className="p-4 md:p-6 max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6 ui-card p-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Título do Evento</label>
                        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" placeholder="Ex: Acampamento de Verão" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="form-input min-h-[100px]" placeholder="Descreva os detalhes do evento..." required ></textarea>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Data do Evento</label>
                        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" required />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Imagem de Capa (Obrigatório)</label>
                        <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, setImageUrl)} className="hidden" />
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full btn-secondary flex items-center justify-center gap-2">
                           <UploadCloud size={18}/> Selecionar Imagem
                        </button>
                        {imageUrl && <img src={imageUrl} alt="Preview" className="mt-4 rounded-lg w-full object-cover" />}
                    </div>

                    {/* Video Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vídeo (Opcional)</label>
                        <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, setVideoUrl)} className="hidden" />
                        <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full btn-secondary flex items-center justify-center gap-2">
                           <Video size={18}/> Selecionar Vídeo
                        </button>
                        {videoUrl && <video src={videoUrl} controls className="mt-4 rounded-lg w-full" />}
                    </div>


                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button type="submit" className="btn-primary w-full text-lg py-3 !mt-8">
                        {isEditMode ? 'Salvar Alterações' : 'Salvar Evento'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CreateEventPage;