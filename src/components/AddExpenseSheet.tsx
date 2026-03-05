import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Camera as CameraIcon, ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface AddExpenseSheetProps {
  open: boolean;
  onClose: () => void;
  preselectedGroupId?: string;
}

type SplitType = 'equal' | 'unequal' | 'percentage';

function compressImage(blob: Blob, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(blob);
  });
}

export default function AddExpenseSheet({ open, onClose, preselectedGroupId }: AddExpenseSheetProps) {
  const { groups, users, addExpense } = useApp();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState(preselectedGroupId || groups[0]?.id || '');
  const [paidBy, setPaidBy] = useState('u1');
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const group = groups.find(g => g.id === groupId);
  const groupMembers = group ? users.filter(u => group.members.includes(u.id)) : [];

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const processImage = async (webPath: string) => {
    try {
      const response = await fetch(webPath);
      const blob = await response.blob();
      const compressed = await compressImage(blob);
      setImages(prev => [...prev, compressed]);
    } catch (e) { console.error("Image processing error", e); }
  };

  const handleCamera = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      if (image.webPath) await processImage(image.webPath);
    } catch (e) { console.error("Camera fail", e); }
  };

  const handleGallery = async () => {
    const remaining = 5 - images.length;
    if (remaining <= 0) return;
    try {
      const gallery = await Camera.pickImages({
        quality: 60,
        limit: remaining
      });
      for (const photo of gallery.photos) {
        if (photo.webPath) await processImage(photo.webPath);
      }
    } catch (e) { console.error("Gallery fail", e); }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!amount || !description || !groupId) return;
    const members = selectedMembers.length > 0 ? selectedMembers : group?.members || [];
    setLoading(true);

    let uploadedImageUrls: string[] = [];

    try {
      // 1. Upload images if any exist
      if (images.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
          // Convert base64 back to blob
          const res = await fetch(images[i]);
          const blob = await res.blob();
          formData.append('images', blob, `upload-${i}.jpg`);
        }

        const token = localStorage.getItem('splitx_token');
        const baseUrl = import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api';

        const uploadRes = await fetch(`${baseUrl}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.imageUrls) {
          // Convert relative /uploads/xxx to absolute URLs so the Android app can render them from the Azure server
          const baseServerUrl = baseUrl.replace('/api', '');
          uploadedImageUrls = uploadData.imageUrls.map((url: string) => `${baseServerUrl}${url}`);
        }
      }

      // 2. Submit expense JSON data
      await addExpense({
        groupId,
        description,
        amount: parseFloat(amount),
        paidBy,
        splitBetween: members,
        splitType,
        date: new Date().toISOString().split('T')[0],
        category: 'other',
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAmount('');
        setDescription('');
        setImages([]);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const splitPreview = () => {
    if (!amount) return null;
    const members = selectedMembers.length > 0 ? selectedMembers : (group?.members || []);
    if (members.length === 0) return null;
    const perPerson = parseFloat(amount) / members.length;
    return members.filter(id => id !== paidBy).map(id => {
      const user = users.find(u => u.id === id);
      if (!user) return null;
      return `${user.name} owes ₹${Math.round(perPerson).toLocaleString('en-IN')}`;
    }).filter(Boolean);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[90vh] overflow-y-auto safe-bottom"
            style={{ background: 'hsl(0 0% 6% / 0.97)', backdropFilter: 'blur(40px)', borderTop: '1px solid hsl(42 100% 50% / 0.1)' }}
          >
            {showSuccess ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center py-16 px-5">
                <motion.div className="w-20 h-20 rounded-full bg-neon-green/20 border-2 border-neon-green flex items-center justify-center mb-4"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}>
                  <Check size={40} className="text-neon-green" />
                </motion.div>
                <p className="text-xl font-bold text-foreground font-display">Expense Added!</p>
                <p className="text-sm text-muted-foreground mt-1">Balances updated ⚡</p>
              </motion.div>
            ) : (
              <div className="px-5 pt-4 pb-8">
                <div className="flex justify-center mb-4"><div className="w-10 h-1 rounded-full bg-primary/20" /></div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground font-display">Add Expense</h2>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <X size={16} className="text-muted-foreground" />
                  </motion.button>
                </div>

                {/* Amount */}
                <div className="text-center mb-6">
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Amount</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-primary/40">₹</span>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
                      className="bg-transparent text-5xl font-extrabold text-foreground text-center w-48 outline-none placeholder:text-muted font-display" />
                  </div>
                </div>

                {/* Description */}
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this for?"
                  className="w-full bg-secondary/60 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none mb-4 border border-border/30" />

                {/* Image Attachments */}
                <div className="mb-4">
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Attachments</p>
                  <div className="flex gap-2 mb-3">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={handleCamera}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/[0.08] border border-primary/[0.15] text-primary text-xs font-semibold"
                    >
                      <CameraIcon size={16} />
                      Capture Photo
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={handleGallery}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary/[0.08] border border-primary/[0.15] text-primary text-xs font-semibold"
                    >
                      <ImagePlus size={16} />
                      From Gallery
                    </motion.button>
                  </div>

                  {/* Image Thumbnails */}
                  {images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {images.map((img, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-primary/20 group"
                        >
                          <img
                            src={img}
                            alt={`Attachment ${i + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setPreviewImage(img)}
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={10} className="text-foreground" />
                          </button>
                        </motion.div>
                      ))}
                      {images.length < 5 && (
                        <button
                          onClick={handleGallery}
                          className="w-16 h-16 rounded-xl border border-dashed border-primary/20 flex items-center justify-center text-primary/40"
                        >
                          <ImagePlus size={18} />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-[9px] text-muted-foreground mt-1.5">Max 5 images • Bills, receipts, screenshots</p>
                </div>

                {/* Group */}
                <div className="mb-4">
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Group</p>
                  <div className="flex gap-2 flex-wrap">
                    {groups.map(g => (
                      <button key={g.id} onClick={() => { setGroupId(g.id); setSelectedMembers([]); }}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${groupId === g.id ? 'gradient-gold text-primary-foreground' : 'bg-secondary/60 text-muted-foreground border border-border/30'}`}>
                        {g.icon} {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Paid by */}
                <div className="mb-4">
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Paid by</p>
                  <div className="flex gap-2 flex-wrap">
                    {groupMembers.map(u => (
                      <button key={u.id} onClick={() => setPaidBy(u.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${paidBy === u.id ? 'gradient-gold text-primary-foreground' : 'bg-secondary/60 text-muted-foreground border border-border/30'}`}>
                        {u.avatar} {u.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split type */}
                <div className="mb-4">
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Split type</p>
                  <div className="flex gap-2">
                    {(['equal', 'unequal', 'percentage'] as SplitType[]).map(t => (
                      <button key={t} onClick={() => setSplitType(t)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${splitType === t ? 'gradient-gold text-primary-foreground' : 'bg-secondary/60 text-muted-foreground border border-border/30'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split between */}
                <div className="mb-6">
                  <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Split between</p>
                  <div className="flex gap-2 flex-wrap">
                    {groupMembers.map(u => {
                      const isSelected = selectedMembers.length === 0 || selectedMembers.includes(u.id);
                      return (
                        <button key={u.id} onClick={() => toggleMember(u.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isSelected ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-secondary/60 text-muted-foreground border border-border/30'}`}>
                          {u.avatar} {u.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Split Preview */}
                {amount && (
                  <div className="glass-gold rounded-2xl p-3.5 mb-6">
                    <p className="text-[10px] text-primary/50 font-bold uppercase tracking-widest mb-2">Split Preview</p>
                    {splitPreview()?.map((line, i) => (
                      <p key={i} className="text-sm text-neon-green font-medium">{line}</p>
                    ))}
                  </div>
                )}

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={!amount || !description || loading}
                  className="w-full gradient-gold rounded-2xl py-4 text-base font-bold text-primary-foreground disabled:opacity-40 shadow-gold flex justify-center items-center gap-2">
                  {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : 'Add Expense'}
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Full Image Preview Overlay */}
          <AnimatePresence>
            {previewImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6"
                onClick={() => setPreviewImage(null)}
              >
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  src={previewImage}
                  alt="Preview"
                  className="max-w-full max-h-[80vh] rounded-2xl border border-primary/20 shadow-gold"
                />
                <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <X size={20} className="text-foreground" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
