import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ThumbsUp, Search, PlusCircle, User, Send, HeartHandshake, Filter, Info, ChevronDown
} from 'lucide-react';
import { triggerVibration, playClickSound, playRippleSound } from '../utils';
import { useLanguage } from '../LanguageContext';

interface FeatureSuggestionItem {
  id: string;
  titleId: string;
  titleEn: string;
  author: string;
  category: 'digital' | 'amenity' | 'kid_friendly' | 'accessibility' | 'food' | 'other';
  descriptionId: string;
  descriptionEn: string;
  upvotes: number;
  date: string;
  tags: string[];
}

interface BrutalistToast {
  id: string;
  type: 'success' | 'info' | 'upvote';
  titleId: string;
  titleEn: string;
  messageId: string;
  messageEn: string;
}

const SEEDED_SUGGESTIONS: FeatureSuggestionItem[] = [
  {
    id: 'REC-101',
    titleId: 'Audio Panduan Jalur Difabel Mandiri',
    titleEn: 'Independent Disabled Audio Wayfinding Guide',
    author: 'Aulia Rahma',
    category: 'accessibility',
    descriptionId: 'Sediakan earphone jack di setiap unit kiosk KIO agar teman-teman tunanetra bisa mendengarkan navigasi arah peron secara mandiri.',
    descriptionEn: 'Provide physical earphone jacks on every KIO kiosk so visually impaired passengers can hear automated voice routing to their platform.',
    upvotes: 45,
    date: '2 jam lalu',
    tags: ['Aksesibilitas', 'Audio']
  },
  {
    id: 'REC-102',
    titleId: 'Rental Powerbank Otomatis di Peron',
    titleEn: 'Autonomous Powerbank Stations on Platforms',
    author: 'Fajar Pratama',
    category: 'digital',
    descriptionId: 'Layanan peminjaman daya portabel langsung terintegrasi dengan pemindaian barcode tiket penumpang sehingga praktis saat baterai kritis.',
    descriptionEn: 'A smart ticket-integrated powerbank station setup directly inside waiting zones to resolve low battery situations during busy transits.',
    upvotes: 89,
    date: 'Hari ini',
    tags: ['Digital', 'Fasilitas']
  },
  {
    id: 'REC-103',
    titleId: 'Area Taman Bermain Sensory Anak (Kids Zone)',
    titleEn: 'Sensory Nursery and Kids Playground Area',
    author: 'Dewi Lestari',
    category: 'kid_friendly',
    descriptionId: 'Mohon ditambahkan wahana permainan edukatif interaktif mini dekat ruang laktasi lobi keberangkatan agar anak tidak jenuh.',
    descriptionEn: 'We suggest constructing a children playground with active sensory learning blocks near the nursing room inside Departure Lobby.',
    upvotes: 56,
    date: 'Kemarin',
    tags: ['Keluarga', 'Taman']
  }
];

export default function ServiceComplaints() {
  const { language } = useLanguage();

  const [suggestions, setSuggestions] = useState<FeatureSuggestionItem[]>(() => {
    const saved = localStorage.getItem('kio_suggestions_data');
    return saved ? JSON.parse(saved) : SEEDED_SUGGESTIONS;
  });

  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kio_upvoted_suggestions_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // Brutalist Toasts State
  const [toasts, setToasts] = useState<BrutalistToast[]>([]);

  const addToast = (
    titleId: string, 
    titleEn: string, 
    msgId: string, 
    msgEn: string, 
    type: 'success' | 'info' | 'upvote' = 'success'
  ) => {
    const toastId = Math.random().toString(36).substring(2, 9);
    const newToast = { id: toastId, type, titleId, titleEn, messageId: msgId, messageEn: msgEn };
    setToasts(prev => [...prev, newToast]);
    
    // Auto dismiss after 5.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    }, 5500);
  };

  // Collapsible Form Toggle States
  const [showSuggestionForm, setShowSuggestionForm] = useState(true);

  // Suggestion Form Inputs
  const [sugTitle, setSugTitle] = useState('');
  const [sugAuthor, setSugAuthor] = useState('');
  const [sugCategory, setSugCategory] = useState<FeatureSuggestionItem['category']>('digital');
  const [sugDesc, setSugDesc] = useState('');
  const [sugSuccess, setSugSuccess] = useState<string | null>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Synchronize to storage
  useEffect(() => {
    localStorage.setItem('kio_suggestions_data', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem('kio_upvoted_suggestions_ids', JSON.stringify(upvotedIds));
  }, [upvotedIds]);

  // Handle upvotes increments
  const handleUpvote = (id: string) => {
    triggerVibration([20, 10, 15]);
    playRippleSound();
    
    const item = suggestions.find(s => s.id === id);
    const title = item ? (language === 'id' ? item.titleId : item.titleEn) : 'USULAN';

    if (upvotedIds.includes(id)) {
      // Remove upvote
      setUpvotedIds(prev => prev.filter(x => x !== id));
      setSuggestions(prev => prev.map(sug => {
        if (sug.id === id) {
          return { ...sug, upvotes: Math.max(0, sug.upvotes - 1) };
        }
        return sug;
      }));
      
      addToast(
        'Dukungan Dilepas',
        'Support Recalled',
        `Dukungan untuk "${title}" telah dibatalkan.`,
        `Your vote for "${title}" has been withdrawn.`,
        'info'
      );
    } else {
      // Add upvote
      setUpvotedIds(prev => [...prev, id]);
      setSuggestions(prev => prev.map(sug => {
        if (sug.id === id) {
          return { ...sug, upvotes: sug.upvotes + 1 };
        }
        return sug;
      }));

      addToast(
        'Dukungan Masuk!',
        'Vote Registered!',
        `Terima kasih! Dukungan Anda untuk "${title}" sukses direkam.`,
        `Thank you! Your vote for "${title}" was recorded successfully.`,
        'upvote'
      );
    }
  };

  // Submit Feature Suggestion handler
  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugTitle.trim() || !sugAuthor.trim() || !sugDesc.trim()) {
      triggerVibration([80, 50, 80]);
      alert(
        language === 'id' 
          ? 'Mohon lengkapi judul, nama, dan penjelasan rekomendasi fitur Kakak.' 
          : 'Please complete the title, author name, and description of your recommendation.'
      );
      return;
    }

    triggerVibration([30, 20, 35]);
    playClickSound();

    const tagList: Record<FeatureSuggestionItem['category'], string[]> = {
      digital: ['Smart Kiosk', 'Aplikasi'],
      amenity: ['Fasilitas', 'Ruang Tunggu'],
      kid_friendly: ['Anak-anak', 'Keluarga'],
      accessibility: ['Difabel', 'Ramah'],
      food: ['Kuliner', 'Kafe'],
      other: ['Lain-lain']
    };

    const newSug: FeatureSuggestionItem = {
      id: `REC-${Math.floor(200 + Math.random() * 800)}`,
      titleId: sugTitle.trim(),
      titleEn: sugTitle.trim(), 
      author: sugAuthor.trim(),
      category: sugCategory,
      descriptionId: sugDesc.trim(),
      descriptionEn: sugDesc.trim(),
      upvotes: 1, // Start with self-upvote
      date: language === 'id' ? 'Baru saja' : 'Just now',
      tags: tagList[sugCategory]
    };

    setUpvotedIds(prev => [...prev, newSug.id]);
    setSuggestions([newSug, ...suggestions]);
    
    const savedTitle = sugTitle.trim();
    
    setSugTitle('');
    setSugAuthor('');
    setSugDesc('');

    setSugSuccess(newSug.id);
    
    addToast(
      'Sukses Terkirim!',
      'Idea Uploaded!',
      `Rekomendasi "${savedTitle}" berhasil dipublikasikan di feed pengembangan!`,
      `Your proposal "${savedTitle}" was published to the active community queue!`,
      'success'
    );

    setTimeout(() => {
      setSugSuccess(null);
    }, 6000);
  };

  // Filtering suggestions based on search search text or categories
  const filteredSuggestions = suggestions.filter(sug => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      (sug.titleId.toLowerCase().includes(term) || 
       sug.titleEn.toLowerCase().includes(term) ||
       sug.descriptionId.toLowerCase().includes(term) ||
       sug.descriptionEn.toLowerCase().includes(term) ||
       sug.author.toLowerCase().includes(term) ||
       sug.id.toLowerCase().includes(term));
    
    if (categoryFilter === 'all') return matchesSearch;
    return sug.category === categoryFilter && matchesSearch;
  });

  return (
    <div id="service-complaints-section" className="w-full bg-[#FFF7C5] border-2 border-black p-4 md:p-6 lg:p-8 text-[#4F252E] shadow-[4px_4px_0px_0px_#4F252E] relative transition-all duration-300">
      
      {/* Visual Header Decoration */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-dashed border-[#4F252E]/40 pb-5 mb-6 gap-4">
        <div>
          <span className="font-mono text-[9px] md:text-xs font-black bg-[#4F252E] text-[#FFF7C5] px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-[1.5px_1.5px_0px_#F4AE52]">
            {language === 'id' ? '💡 REKOMENDASI PENGEMBANGAN FITUR KIO' : '💡 KIO FEATURE DEVELOPMENT FEEDBACK'}
          </span>
          <h2 className="font-display font-black text-xl md:text-2xl lg:text-3xl tracking-tight uppercase leading-none mt-2 text-[#4F252E]">
            {language === 'id' ? 'BERIKAN REKOMENDASI PENGEMBANGAN FITUR' : 'PROVIDE SYSTEM DEVELOPMENT RECOMMENDATIONS'}
          </h2>
          <p className="font-mono text-[10px] md:text-xs text-[#4F252E]/75 leading-tight mt-1 uppercase font-bold">
            {language === 'id' 
              ? 'Sampaikan aspirasi teknologi, peningkatan modul digital, atau perbaikan fitur demi meningkatkan kualitas layanan stasiun.' 
              : 'Submit digital concept innovations or custom module requests to enrich passenger transit convenience.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#4F252E] text-[#FFF7C5] font-mono text-[10px] md:text-xs font-black px-3 py-2 border-2 border-black flex items-center gap-1.5 uppercase shadow-[1.5px_1.5px_0px_#000]">
            <HeartHandshake className="w-4.5 h-4.5 text-[#F4AE52]" />
            <span>{language === 'id' ? 'MANDIRI & INOVATIF' : 'PASSENGER DRIVEN'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Suggestion/Recommendation Form */}
        {showSuggestionForm ? (
          <form onSubmit={handleSuggestionSubmit} className="lg:col-span-5 bg-white border-2 border-black p-4 space-y-4 shadow-[3px_3px_0px_#4F252E] relative animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#4F252E]/10">
              <h3 className="font-display font-black text-sm uppercase text-[#4F252E] flex items-center gap-2">
                <PlusCircle className="w-4.5 h-4.5 text-[#F4AE52]" />
                {language === 'id' ? 'REKOMENDASI FITUR BARU' : 'NEW RECOMMENDATION'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  triggerVibration(15);
                  playClickSound();
                  setShowSuggestionForm(false);
                }}
                className="text-slate-400 hover:text-red-500 font-mono text-sm uppercase font-black transition-colors"
              >
                {language === 'id' ? '✕ TUTUP' : '✕ CLOSE'}
              </button>
            </div>

            {sugSuccess && (
              <div className="bg-emerald-100 border border-emerald-500 p-2.5 text-emerald-800 text-xs font-mono">
                🎉 {language === 'id' ? `Rekomendasi '${sugSuccess}' sukses dipublikasikan! Bagikan agar teman-teman lainnya bisa memberikan dukungan.` : `Recommendation '${sugSuccess}' successfully submitted for public voting.`}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase font-black text-slate-500">
                {language === 'id' ? 'Judul Rekomendasi Fitur' : 'Proposed Feature Title'}
              </label>
              <input
                type="text"
                value={sugTitle}
                onChange={e => setSugTitle(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Dispenser air hangat otomatis di peron' : 'Example: Interactive translation speaker'}
                className="w-full bg-[#FFF7C5]/30 border-2 border-black/35 focus:border-[#4F252E] px-3 py-1.5 font-mono text-xs focus:outline-none rounded-none text-[#4F252E]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase font-black text-slate-500">
                {language === 'id' ? 'Nama Pengusul' : 'Your Author Name'}
              </label>
              <input
                type="text"
                value={sugAuthor}
                onChange={e => setSugAuthor(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Amanda Putri' : 'Example: Amanda Putri'}
                className="w-full bg-[#FFF7C5]/30 border-2 border-black/35 focus:border-[#4F252E] px-3 py-1.5 font-mono text-xs focus:outline-none rounded-none text-[#4F252E]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase font-black text-slate-500">
                {language === 'id' ? 'Kategori Rekomendasi' : 'Recommendation Category'}
              </label>
              <select
                value={sugCategory}
                onChange={e => setSugCategory(e.target.value as FeatureSuggestionItem['category'])}
                className="w-full bg-white border-2 border-black px-2.5 py-1.5 font-mono text-xs focus:outline-none rounded-none text-[#4F252E]"
              >
                <option value="digital">{language === 'id' ? '📱 Layanan Digital / Kios / Aplikasi' : '📱 Digital Services & App'}</option>
                <option value="amenity">{language === 'id' ? '🛋️ Fasilitas Gerbong & Ruang Tunggu' : '🛋️ Comfort & Waiting Area'}</option>
                <option value="accessibility">{language === 'id' ? '♿ Fasilitas Difabel / Ramah Disabilitas' : '♿ Accessibility Friendly'}</option>
                <option value="kid_friendly">{language === 'id' ? '🍼 Area Keluarga & Anak-anak' : '🍼 Families & Kiddie Zones'}</option>
                <option value="food">{language === 'id' ? '☕ Aneka Ekstra Kuliner / Kafe' : '☕ Extra Dining Options'}</option>
                <option value="other">{language === 'id' ? '📦 Lain-lain / Opsional' : '📦 Other Custom Feature'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase font-black text-slate-500">
                {language === 'id' ? 'Jelaskan Manfaat & Konsep Ide' : 'Concept Description & Passenger Benefits'}
              </label>
              <textarea
                value={sugDesc}
                onChange={e => setSugDesc(e.target.value)}
                placeholder={language === 'id' ? 'Deskripsikan rekomendasi fitur Kakak secara rinci agar petugas dan penumpang lain memahami kegunaannya...' : 'Describe your innovative proposal details to convince terminal staff and other passengers...'}
                className="w-full bg-[#FFF7C5]/30 border-2 border-black/35 focus:border-[#4F252E] px-3 py-1.5 font-mono text-xs focus:outline-none rounded-none h-24 text-[#4F252E] resize-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerVibration(15);
                  playClickSound();
                  setShowSuggestionForm(false);
                }}
                className="flex-1 bg-slate-205 hover:bg-slate-200 text-[#4F252E] font-mono text-xs font-black py-2.5 rounded-none border-2 border-black shadow-[2px_2px_0px_#000] uppercase transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
              >
                {language === 'id' ? 'BATALKAN' : 'CANCEL'}
              </button>
              <button
                type="submit"
                className="flex-[2] bg-[#4F252E] hover:bg-[#6c3641] text-[#FFF7C5] font-mono text-xs font-black py-2.5 rounded-none border-2 border-black shadow-[2px_2px_0px_#FFF] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
              >
                <Send className="w-4 h-4 text-[#F4AE52]" />
                <span>{language === 'id' ? 'KIRIM REKOMENDASI' : 'SEND RECOMMENDATION'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="lg:col-span-5 bg-[#4F252E] border-2 border-black p-6 text-center space-y-4 shadow-[4px_4px_0px_0px_#F4AE52] relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
            <div className="bg-[#FFF7C5]/10 p-4 rounded-sm border border-[#FFF7C5]/20 animate-pulse text-[#F4AE52]">
              <Sparkles className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-xs">
              <h4 className="font-display font-black text-sm md:text-base text-[#FFF7C5] tracking-tight uppercase leading-snug">
                {language === 'id' ? 'Kirim Rekomendasi Fitur' : 'Suggest a New Idea for KIO?'}
              </h4>
              <p className="font-mono text-[10px] text-[#FFF7C5]/85 leading-relaxed font-semibold">
                {language === 'id' 
                  ? 'Bantu kami menyempurnakan KIO! Berikan rekomendasi fitur digital, fasilitas penunjang ramah anak, atau teknologi stasiun pintar.' 
                  : 'Help us improve! Propose smart digital updates, accessibility features, or family-friendly spaces.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerVibration(25);
                playClickSound();
                setShowSuggestionForm(true);
              }}
              className="w-full bg-[#F4AE52] hover:bg-amber-400 text-[#4F252E] font-mono text-xs font-black py-3 rounded-none border-2 border-black shadow-[2.5px_2.5px_0px_#FFF] uppercase flex items-center justify-center gap-2 transition-all cursor-pointer active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-[1px_1px_0px_#FFF]"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              <span>{language === 'id' ? '✍️ BERIKAN REKOMENDASI' : '✍️ GIVE RECOMMENDATION'}</span>
            </button>
          </div>
        )}

        {/* Right Panel: Searchable suggestion board with upvotes */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display font-black text-sm uppercase text-[#4F252E] flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-[#F4AE52]" />
              {language === 'id' ? 'REKOMENDASI PENGEMBANGAN FITUR PENUMPANG' : 'PASSENGER FEATURE RECOMMENDATION FEED'}
            </h3>
            <span className="font-mono text-[9px] uppercase font-bold text-slate-500 bg-[#4F252E]/10 px-2 py-0.5 border border-black/15">
              {suggestions.length} {language === 'id' ? 'USULAN' : 'PROPOSALS'}
            </span>
          </div>

          {/* Search and Category Filter Panel */}
          <div className="bg-white border-2 border-black p-3 flex flex-col md:flex-row gap-3 shadow-[2px_2px_0px_#4F252E]">
            <div className="flex-1 relative flex items-center">
              <Search className="w-4.5 h-4.5 absolute left-3 text-[#4F252E]/60 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'id' ? 'Cari rekomendasi fitur atau nama pengusul...' : 'Search recommendations or author...'}
                className="w-full bg-slate-50 border-2 border-black/35 focus:border-[#4F252E] pr-3 pl-10 py-1.5 font-mono text-xs focus:outline-none rounded-none text-[#4F252E]"
              />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-white border-2 border-black pl-2.5 pr-8 py-1.5 font-mono text-xs focus:outline-none rounded-none text-[#4F252E] appearance-none cursor-pointer"
              >
                <option value="all">📁 {language === 'id' ? 'Semua Kategori' : 'All Categories'}</option>
                <option value="digital">📱 {language === 'id' ? 'Layanan Digital' : 'Digital Services'}</option>
                <option value="amenity">🛋️ {language === 'id' ? 'Fasilitas' : 'Cozy Amenities'}</option>
                <option value="accessibility">♿ {language === 'id' ? 'Aksesibilitas' : 'Accessibility'}</option>
                <option value="kid_friendly">🍼 {language === 'id' ? 'Ramah Anak' : 'Kids Friendly'}</option>
                <option value="food">☕ {language === 'id' ? 'Ekstra Kuliner' : 'Dining Expansion'}</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#4F252E]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* List Feed of proposals */}
          <div className="space-y-3.5 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
            {filteredSuggestions.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#4F252E]/35 p-6 text-center text-[#4F252E]/70 font-mono text-xs">
                {language === 'id' ? 'Tidak ada rekomendasi yang cocok dengan kriteria pencarian.' : 'No suggestions match your search criteria.'}
              </div>
            ) : (
              filteredSuggestions.map(sug => {
                const hasUpvoted = upvotedIds.includes(sug.id);
                return (
                  <div key={sug.id} className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_#4F252E] flex gap-4 items-start relative transition-all duration-300 hover:scale-[1.012] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#4F252E] hover:border-[#F4AE52]">
                    
                    {/* Left: Upvoting block */}
                    <button
                      onClick={() => handleUpvote(sug.id)}
                      className={`border-2 border-black px-3 py-2 text-center flex flex-col items-center justify-center cursor-pointer transition-all active:translate-y-[1px] ${
                        hasUpvoted 
                          ? 'bg-[#4F252E] text-[#FFF7C5]' 
                          : 'bg-amber-50 hover:bg-[#F4AE52]/20 text-[#4F252E]'
                      }`}
                    >
                      <ThumbsUp className={`w-5.5 h-5.5 ${hasUpvoted ? 'fill-[#FFF7C5] scale-105' : ''} transition-transform`} />
                      <span className="font-mono text-sm font-black mt-1.5 leading-none">
                        {sug.upvotes}
                      </span>
                      <span className="font-mono text-[7px] font-black uppercase mt-1 opacity-70">
                        {hasUpvoted ? 'SUPPORTED' : 'SUPPORT'}
                      </span>
                    </button>

                    {/* Right: Idea Content */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-[#FFF7C5] bg-[#F4AE52] border border-black px-2 py-0.5 shadow-[1px_1px_0px_#000]">
                          {sug.id}
                        </span>
                        <span className="font-mono text-[9px] uppercase font-bold text-slate-400">
                          • {sug.category.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="font-display font-black text-xs sm:text-sm uppercase tracking-tight text-[#4F252E] leading-tight mt-1">
                        {language === 'id' ? sug.titleId : sug.titleEn}
                      </h4>

                      <p className="text-[11px] leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                        {language === 'id' ? sug.descriptionId : sug.descriptionEn}
                      </p>

                      {/* Extra bottom meta info */}
                      <div className="flex flex-wrap items-center justify-between gap-1 border-t border-[#4F252E]/10 pt-2 text-[9px] font-mono text-[#4F252E]/60 uppercase">
                        <span className="flex items-center gap-1 font-bold">
                          <User className="w-3 h-3 text-[#F4AE52]" />
                          {sug.author}
                        </span>
                        <span className="font-semibold text-slate-400">{sug.date}</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          <div className="bg-[#FFF7C5]/40 border-2 border-[#4F252E]/30 p-3 text-[10px] font-mono leading-relaxed text-[#4F252E]/85">
            💡 <strong>{language === 'id' ? 'Ide Terpopuler!' : 'Most Wanted Ideas!'}</strong> {language === 'id' ? 'Setiap bulan kami meninjau usulan dengan dukungan tertinggi bersama Divisi Inovasi Komuter.' : 'Proposals with high passenger support are audited directly with the Commuter Innovation Division.'}
          </div>

        </div>

      </div>

      {/* Neo-Brutalist Toast Notification Area */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map(toast => {
          const badgeBg = toast.type === 'success' ? 'bg-[#F4AE52]' : toast.type === 'upvote' ? 'bg-[#4ECDC4]' : 'bg-[#FF6B6B]';
          const badgeText = toast.type === 'success' ? '✨ SUCCESS' : toast.type === 'upvote' ? '👍 VOTED' : 'ℹ️ INFO';

          return (
            <div 
              key={toast.id} 
              className="bg-white border-4 border-black p-4 relative shadow-[6px_6px_0px_#000] flex gap-3.5 pointer-events-auto select-none transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] animate-brutalistToast text-[#4F252E]"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-black shrink-0" />
              
              <div className="flex-1 pl-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[9px] font-black border-2 border-black px-2 py-0.5 ${badgeBg} text-black uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000]`}>
                    {badgeText}
                  </span>
                  <button 
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-black hover:text-red-600 transition-colors pl-2 text-xs font-mono font-black select-none pointer-events-auto cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <h4 className="font-display font-black text-xs uppercase tracking-tight text-[#4F252E] pt-2">
                  {language === 'id' ? toast.titleId : toast.titleEn}
                </h4>
                <p className="font-mono text-[10px] sm:text-[11px] leading-relaxed text-slate-700 font-bold">
                  {language === 'id' ? toast.messageId : toast.messageEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
