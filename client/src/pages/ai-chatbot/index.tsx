import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PaperAirplaneIcon,
    TrashIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import {
    useSendChatMessage,
    useGetChatHistory,
    useClearChatHistory,
    useGetChatStats
} from '../../api/hooks/ai-chatbot/useAIChatbot';

interface Message {
    id: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    createdAt: string;
}

const AIChatbot = () => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();

    // Hooks
    const { data: history = [], isLoading: isLoadingHistory } = useGetChatHistory();
    const { data: stats } = useGetChatStats();
    const sendMessage = useSendChatMessage();
    const clearHistory = useClearChatHistory();

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, sendMessage.isPending]);

    // Handle send message
    const handleSend = async () => {
        if (!inputMessage.trim() || sendMessage.isPending) return;

        const message = inputMessage.trim();
        setInputMessage('');

        // Reset textarea height
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        await sendMessage.mutateAsync(message);
    };

    // Handle textarea auto-resize
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputMessage(e.target.value);

        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Handle clear history
    const handleClearHistory = () => {
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
            clearHistory.mutate();
        }
    };

    // Handle close
    const handleClose = () => {
        navigate('/');
    };

    // Suggestions rapides
    const quickSuggestions = [
        ' Comment progresser au squat ?',
        ' Conseils nutrition prise de masse',
        ' Programme cardio pour débutant',
        ' Importance de la récupération',
    ];

    const showWelcome = history.length === 0 && !sendMessage.isPending;

    return (
        <div className="min-h-screen bg-[#121214]">
            <div className="max-w-4xl mx-auto h-screen flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 bg-[#18181b] border-b border-white/10 px-4 py-4 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            title="Fermer"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        {/* Center - Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#94fbdd] to-[#7de0c4] flex items-center justify-center">
                                <SparklesIcon className="w-6 h-6 text-[#121214]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Myo</h1>
                                <p className="text-xs text-gray-500">Votre expert fitness personnel</p>
                            </div>
                        </div>

                        {/* Right - Clear history */}
                        <div className="w-10">
                            {history.length > 0 && (
                                <button
                                    onClick={handleClearHistory}
                                    disabled={clearHistory.isPending}
                                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                    title="Effacer l'historique"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats bar */}
                    {stats && stats.todayMessages > 0 && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#94fbdd]/10 border border-[#94fbdd]/20">
                            <div className="flex-1">
                                <p className="text-xs text-gray-400">
                                    <span className="font-bold text-[#94fbdd]">{stats.todayMessages}</span> message{stats.todayMessages > 1 ? 's' : ''} aujourd'hui
                                </p>
                            </div>
                            {stats.remainingToday <= 10 && (
                                <div className="flex items-center gap-1 text-orange-400">
                                    <ExclamationTriangleIcon className="w-3 h-3" />
                                    <span className="text-xs font-medium">{stats.remainingToday} restants</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {isLoadingHistory ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#94fbdd]/20 border-t-[#94fbdd]" />
                        </div>
                    ) : showWelcome ? (
                        <WelcomeScreen suggestions={quickSuggestions} onSelectSuggestion={setInputMessage} />
                    ) : (
                        <>
                            {history.map((msg: Message) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}

                            {sendMessage.isPending && (
                                <MessageBubble
                                    message={{
                                        id: 'loading',
                                        role: 'ASSISTANT',
                                        content: '',
                                        createdAt: new Date().toISOString()
                                    }}
                                    isLoading
                                />
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 bg-[#18181b] border-t border-white/10 px-4 py-4">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Posez votre question..."
                                disabled={sendMessage.isPending}
                                className="w-full px-4 py-3 rounded-xl bg-[#252527] border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#94fbdd]/50 focus:border-[#94fbdd] transition-all resize-none disabled:opacity-50"
                                rows={1}
                                style={{ maxHeight: '120px' }}
                            />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!inputMessage.trim() || sendMessage.isPending}
                            className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#94fbdd] hover:bg-[#7de0c4] text-[#121214] flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#94fbdd]/20"
                        >
                            {sendMessage.isPending ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <PaperAirplaneIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <p className="text-[10px] text-gray-600 mt-2 text-center">
                        Myo peut faire des erreurs. Vérifiez les informations importantes.
                    </p>
                </div>
            </div>
        </div>
    );
};

// Component: Welcome Screen
const WelcomeScreen = ({
    suggestions,
    onSelectSuggestion
}: {
    suggestions: string[];
    onSelectSuggestion: (text: string) => void;
}) => (
    <div className="flex flex-col items-center justify-center h-full space-y-6 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#94fbdd] to-[#7de0c4] flex items-center justify-center animate-pulse">
            <SparklesIcon className="w-10 h-10 text-[#121214]" />
        </div>

        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Salut champion ! 💪</h2>
            <p className="text-gray-400 max-w-md">
                Je suis ton coach IA personnel. Pose-moi n'importe quelle question sur l'entraînement, la nutrition ou la récupération !
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {suggestions.map((suggestion, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelectSuggestion(suggestion.replace(/^[^\s]+\s/, ''))}
                    className="p-4 rounded-xl bg-[#252527] border border-white/10 hover:border-[#94fbdd]/50 hover:bg-[#94fbdd]/5 text-left transition-all group"
                >
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {suggestion}
                    </p>
                </button>
            ))}
        </div>
    </div>
);

// Component: Message Bubble
const MessageBubble = ({
    message,
    isLoading = false
}: {
    message: Message;
    isLoading?: boolean;
}) => {
    const isUser = message.role === 'USER';

    if (isUser) {
        // USER MESSAGE - Right side, primary color, NO AVATAR
        return (
            <div className="flex justify-end mb-4 animate-fadeIn">
                <div className="flex flex-col items-end max-w-[80%]">
                    <div className="bg-gradient-to-br from-[#94fbdd] to-[#7de0c4] rounded-[20px] rounded-br-md px-4 py-3 shadow-lg">
                        <p className="text-sm text-[#121214] font-medium whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                        </p>
                    </div>
                    {/* Only timestamp for user messages */}
                    <span className="text-[10px] text-gray-600 mt-1 mr-1">
                        {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>
        );
    }

    // AI MESSAGE - Left side, dark background, WITH LABEL "Myo"
    return (
        <div className="flex justify-start mb-4 animate-fadeIn">
            <div className="flex items-end gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7de0c4] to-[#94fbdd] flex items-center justify-center flex-shrink-0 shadow-md">
                    <SparklesIcon className="w-5 h-5 text-[#121214]" />
                </div>
                <div className="flex flex-col">
                    <div className="bg-[#1e1e20] border border-white/10 rounded-[20px] rounded-bl-md px-4 py-3 shadow-lg">
                        {isLoading ? (
                            <div className="flex items-center gap-2 py-1">
                                <div className="w-2 h-2 rounded-full bg-[#94fbdd] animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#94fbdd] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[#94fbdd] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        ) : (
                            <p className="text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                                {message.content}
                            </p>
                        )}
                    </div>
                    {/* Myo label + timestamp ONLY for AI messages */}
                    {!isLoading && (
                        <div className="flex items-center gap-2 mt-1 ml-1">
                            <span className="text-[10px] font-medium text-[#94fbdd]">Myo</span>
                            <span className="text-[10px] text-gray-600">
                                {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIChatbot;
