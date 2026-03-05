import { motion, AnimatePresence } from 'framer-motion';
import { X, ImagePlus, Trash2, Camera, RotateCcw, Check } from 'lucide-react';
import { useState, useRef } from 'react';

interface ExpenseImageViewerProps {
    images: string[];
    expenseId: string;
    expenseDesc: string;
    onClose: () => void;
    onUpdateImages: (expenseId: string, images: string[]) => void;
}

function compressImage(file: File, maxWidth = 1000): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxWidth / img.width, 1);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.72));
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export default function ExpenseImageViewer({
    images: initialImages,
    expenseId,
    expenseDesc,
    onClose,
    onUpdateImages,
}: ExpenseImageViewerProps) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const galleryRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;
        const toAdd = Math.min(files.length, 5 - images.length);
        const newImgs: string[] = [];
        for (let i = 0; i < toAdd; i++) {
            newImgs.push(await compressImage(files[i]));
        }
        setImages(prev => [...prev, ...newImgs]);
        setIsDirty(true);
    };

    const removeImage = (idx: number) => {
        setImages(prev => {
            const next = prev.filter((_, i) => i !== idx);
            setActiveIdx(prev => Math.min(prev, Math.max(0, next.length - 1)));
            return next;
        });
        setIsDirty(true);
    };

    const handleSave = () => {
        onUpdateImages(expenseId, images);
        setSaved(true);
        setTimeout(() => { setSaved(false); setIsDirty(false); }, 1500);
    };

    const current = images[activeIdx];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-xl flex flex-col"
        >
            {/* Header — hidden in fullscreen */}
            <div className={`flex items-center justify-between px-5 pt-5 pb-3 transition-all duration-200 ${isFullscreen ? 'opacity-0 pointer-events-none absolute' : ''}`}>
                <div>
                    <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest">Attachments</p>
                    <h3 className="text-base font-bold text-foreground font-display truncate max-w-[200px]">{expenseDesc}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={handleSave}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl gradient-gold text-primary-foreground text-xs font-bold shadow-gold"
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                        >
                            {saved ? <Check size={13} /> : <RotateCcw size={13} />}
                            {saved ? 'Saved!' : 'Save Changes'}
                        </motion.button>
                    )}
                    <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                        className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                        <X size={18} className="text-muted-foreground" />
                    </motion.button>
                </div>
            </div>

            {/* Main Image */}
            <div className={`flex items-center justify-center px-5 py-3 min-h-0 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[80] bg-black flex' : 'flex-1'}`}>
                <AnimatePresence mode="wait">
                    {current ? (
                        <motion.div
                            key={activeIdx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`relative flex items-center justify-center ${isFullscreen ? 'w-full h-full' : 'w-full max-h-[55vh]'}`}
                        >
                            {/* Tap image to toggle fullscreen */}
                            <img
                                src={current}
                                alt={`Attachment ${activeIdx + 1}`}
                                onClick={() => setIsFullscreen(v => !v)}
                                className={`object-contain rounded-2xl border border-primary/20 shadow-gold cursor-zoom-in ${
                                    isFullscreen
                                        ? 'max-w-full max-h-full w-full h-full rounded-none border-0 shadow-none cursor-zoom-out'
                                        : 'max-w-full max-h-[55vh]'
                                }`}
                            />
                            {/* Exit fullscreen button */}
                            {isFullscreen && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setIsFullscreen(false)}
                                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center z-10"
                                >
                                    <X size={18} className="text-white" />
                                </motion.button>
                            )}
                            {/* Counter badge */}
                            {images.length > 1 && (
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-background/70 backdrop-blur text-[10px] text-muted-foreground font-bold">
                                    {activeIdx + 1} / {images.length}
                                </div>
                            )}
                            {/* Delete button — hidden in fullscreen */}
                            {!isFullscreen && (
                                <button
                                    onClick={() => removeImage(activeIdx)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/80 backdrop-blur flex items-center justify-center"
                                >
                                    <Trash2 size={14} className="text-white" />
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-3 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-secondary/60 flex items-center justify-center">
                                <ImagePlus size={32} className="text-muted-foreground/40" />
                            </div>
                            <p className="text-sm text-muted-foreground">No images attached</p>
                            <p className="text-xs text-muted-foreground/60">Add receipts, bills or screenshots</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Thumbnails strip — hidden in fullscreen */}
            {images.length > 1 && !isFullscreen && (
                <div className="flex gap-2 px-5 pb-3 overflow-x-auto">
                    {images.map((img, i) => (
                        <motion.button
                            key={i}
                            onClick={() => setActiveIdx(i)}
                            whileTap={{ scale: 0.9 }}
                            className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === activeIdx ? 'border-primary shadow-gold' : 'border-transparent opacity-50'
                                }`}
                        >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Add more images — hidden in fullscreen */}
            {!isFullscreen && (
            <div className="px-5 pb-8 pt-2">
                <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.93 }} onClick={() => cameraRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary/[0.08] border border-primary/[0.15] text-primary text-xs font-semibold"
                        disabled={images.length >= 5}>
                        <Camera size={15} /> Camera
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.93 }} onClick={() => galleryRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-primary/[0.08] border border-primary/[0.15] text-primary text-xs font-semibold"
                        disabled={images.length >= 5}>
                        <ImagePlus size={15} /> Gallery
                    </motion.button>
                </div>
                {images.length >= 5 && (
                    <p className="text-center text-xs text-muted-foreground mt-1.5">Maximum 5 images reached</p>
                )}
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => handleFiles(e.target.files)} />
                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => handleFiles(e.target.files)} />
            </div>
            )}
        </motion.div>
    );
}
