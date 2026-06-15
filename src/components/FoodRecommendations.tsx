import React, { useState, useEffect } from 'react';
import { Coffee, UtensilsCrossed, Moon, Clock, Flame, ShoppingBag, Check, Award, QrCode, Search, User, CreditCard, Sparkles, CheckCircle2, Ticket, Train, Undo2, X } from 'lucide-react';
import { FoodItem, TrainSchedule } from '../types';
import { triggerVibration, playClickSound, playRippleSound } from '../utils';
import { useLanguage } from '../LanguageContext';

interface FoodRecommendationsProps {
  currentSeat?: string;
}

const FOOD_ITEMS: FoodItem[] = [
  // Makanan Berat (Heavy Meals / Main Dishes)
  { id: 'm1', name: 'Bubur Ayam Spesial KAI', nameEn: 'KAI Special Chicken Porridge', price: 'Rp 25.000', category: 'makanan_berat', rating: 4.8, description: 'Bubur lezat hangat dengan limpahan suwiran ayam, cakwe, tongcay, dan kuah kuning gurih.', descriptionEn: 'Savory warm rice porridge generously topped with shredded chicken, cakwe, tongcay, and rich yellow broth.', prepTime: '4 mnt' },
  { id: 'm2', name: 'Elbiru Nasi Ayam Komplit', nameEn: 'Elbiru Complete Chicken Rice', price: 'Rp 28.000', category: 'makanan_berat', rating: 4.9, description: 'Sarapan pagi komplit dengan nasi hangat, ayam gurih bumbu rempah spesial Elbiru.', descriptionEn: 'A complete breakfast serving warm rice with savory herb-spiced chicken, an Elbiru specialty.', prepTime: '5 mnt' },
  { id: 'm3', name: 'Reska Nasi Sapi Lada', nameEn: 'Reska Beef Pepper Rice', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.8, description: 'Sarapan kenyang nasi putih dengan tumisan daging sapi lada manis wangi khas Reska.', descriptionEn: 'A satisfying breakfast of steamed white rice served with aromatic sweet pepper-sauteed beef.', prepTime: '5 mnt' },
  { id: 'm4', name: 'Nasi Kuning Cakalang', nameEn: 'Cakalang Yellow Rice', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.8, description: 'Nasi kuning harum gurih dengan suwiran cakalang bumbu pedas khas nusantara.', descriptionEn: 'Aromatic yellow rice served with shredded skipjack tuna cooked in traditional spicy spices.', prepTime: '4 mnt' },
  { id: 'm5', name: 'Nasi Goreng Legenda KAI', nameEn: 'KAI Legendary Fried Rice', price: 'Rp 45.000', category: 'makanan_berat', rating: 4.9, description: 'Kuliner ikonik gerbong restorasi dengan telur mata sapi, ayam goreng, dan kerupuk udang.', descriptionEn: 'The iconic culinary star of the dining car, served with a sunny-side-up egg, fried chicken, and shrimp crackers.', prepTime: '5 mnt' },
  { id: 'm6', name: 'Bakso Solo Premium Stasiun', nameEn: 'Premium Solo Beef Meatballs', price: 'Rp 38.000', category: 'makanan_berat', rating: 4.8, description: 'Bakso urat sapi empuk dengan kuah kaldu pekat pedas, mie kuning, tahu, dan pangsit renyah.', descriptionEn: 'Tender beef tendon meatballs in a rich, slightly spicy broth, served with yellow noodles, tofu, and crispy wontons.', prepTime: '6 mnt' },
  { id: 'm7', name: 'Nasi Ayam Geprek Sambal Korek', nameEn: 'Geprek Chicken with Korek Chili', price: 'Rp 30.000', category: 'makanan_berat', rating: 4.6, description: 'Ayam krispi panas yang digeprek dengan sambal bawang segar penambah semangat perjalanan.', descriptionEn: 'Hot crispy fried chicken smashed with fresh garlic chili paste, perfect to energize your journey.', prepTime: '3 mnt' },
  { id: 'm8', name: 'Reska Nasi Goreng Bakso', nameEn: 'Reska Meatball Fried Rice', price: 'Rp 35.000', category: 'makanan_berat', rating: 4.8, description: 'Nasi goreng racikan khas Reska KRL dengan irisan bakso sapi melimpah dan bumbu gurih.', descriptionEn: 'Specialty fried rice from Reska KRL with generous slices of savory beef meatballs and robust seasoning.', prepTime: '5 mnt' },
  { id: 'm9', name: 'Nasi Ayam Serundeng Komersial', nameEn: 'Fried Chicken with Serundeng', price: 'Rp 35.000', category: 'makanan_berat', rating: 4.8, description: 'Nasi ayam goreng renyah bertabur serundeng kelapa manis gurih dan sambal khas stasiun.', descriptionEn: 'Crispy fried chicken topped with sweet-savory toasted grated coconut and signature station chili paste.', prepTime: '4 mnt' },
  { id: 'm10', name: 'Reska Nasi Padang Rendang', nameEn: 'Reska Authentic Nasi Padang Beef Rendang', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.9, description: 'Nasi Padang otentik lauk rendang daging sapi tebal bumbu rempah pekat kreasi Reska.', descriptionEn: 'Authentic West Sumatran rice plate served with thick beef slow-cooked in rich coconuty spices.', prepTime: '4 mnt' },
  { id: 'm11', name: 'Bakso Enak', nameEn: 'Yummy Meatballs', price: 'Rp 25.000', category: 'makanan_berat', rating: 4.8, description: 'Sajian semangkuk bakso kuah kaldu hangat yang sederhana namun sangat lezat dan nagih.', descriptionEn: 'A simple bowl of comforting warm beef meatballs in savory clear broth, delicious and addictive.', prepTime: '4 mnt' },
  { id: 'm12', name: 'Nasi Goreng Parahyangan Legend', nameEn: 'Legendary Parahyangan Fried Rice', price: 'Rp 40.000', category: 'makanan_berat', rating: 5.0, description: 'Citarasa legendaris nasi goreng kereta api Parahyangan yang selalu dirindukan penumpang.', descriptionEn: 'The legendary taste of the Argo Parahyangan dining car fried rice, forever missed by travelers.', prepTime: '5 mnt' },
  { id: 'm13', name: 'Nasi Rames Nusantara', nameEn: 'Nusantara Mixed Rice (Nasi Rames)', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.9, description: 'Nasi rames bercita rasa nusantara pilihan dengan aneka lauk tradisional bergizi tinggi.', descriptionEn: 'Traditional Indonesian mixed rice served with a colorful variety of nutritious and flavorful side dishes.', prepTime: '5 mnt' },
  { id: 'm14', name: 'Indomie Goreng Katsu Geprek', nameEn: 'Indomie Fried Noodles with Chicken Katsu', price: 'Rp 36.000', category: 'makanan_berat', rating: 4.9, description: 'Mi goreng instan favorit disajikan dengan chicken katsu renyah dan taburan sambal pedas.', descriptionEn: 'The all-time favorite instant dry noodles served with crispy chicken katsu and fiery hot chili sauce.', prepTime: '5 mnt' },
  { id: 'm15', name: 'Train Chicken Double', nameEn: 'Double Train Fried Chicken', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.8, description: 'Dua potong ayam goreng krispi tanpa tulang berukuran ganda dengan cita rasa bumbu wangi.', descriptionEn: 'Two pieces of double-sized aromatic, crispy boneless fried chicken seasoned with signature spices.', prepTime: '6 mnt' },
  { id: 'm16', name: 'Nasi Bali', nameEn: 'Balinese Mixed Rice', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.7, description: 'Nasi campur ala Bali lengkap dengan ayam suwir, sate lilit mini, sayur kacang, dan sambal matah.', descriptionEn: 'Balinese specialty rice served with shredded spicy chicken, miniature sate lilit, green beans, and fresh sambal matah.', prepTime: '5 mnt' },
  { id: 'm17', name: 'Sate Maranggi Purwakarta', nameEn: 'Purwakarta Maranggi Beef Satay', price: 'Rp 50.000', category: 'makanan_berat', rating: 5.0, description: 'Sate daging sapi empuk berbumbu ketumbar manis khas Jawa Barat dengan sambal tomat segar.', descriptionEn: 'Tender beef skewers marinated in sweet coriander glaze, grilled and served with zesty tomato chili relish.', prepTime: '8 mnt' },
  { id: 'm18', name: 'Soto Betawi Kuah Susu', nameEn: 'Soto Betawi Creamy Milk Broth', price: 'Rp 42.000', category: 'makanan_berat', rating: 4.9, description: 'Daging sapi lembut dengan kuah santan-susu gurih wangi jeruk limau, pas buat malam berangin.', descriptionEn: 'Slow-cooked tender beef in an aromatic coconut-milk broth, enhanced with kaffir lime, perfect for breezy nights.', prepTime: '7 mnt' },
  { id: 'm19', name: 'Sei Sapi', nameEn: 'Smoked Beef Sei', price: 'Rp 50.000', category: 'makanan_berat', rating: 4.9, description: 'Daging sapi asap beraroma kayu khas Kupang lengkap dengan sambal pedas autentik menggugah selera.', descriptionEn: 'Indonesian wood-smoked beef slices from Kupang, served with highly aromatic and spicy sambal.', prepTime: '7 mnt' },
  { id: 'm20', name: 'Nasi Sapi Lada Hitam', nameEn: 'Black Pepper Beef Rice', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.8, description: 'Nasi putih hangat dengan tumis daging sapi tipis lada hitam pedas manis gurih berlimpah.', descriptionEn: 'Warm steamed white rice with rich, savory, and spicy black pepper-sauteed beef slices.', prepTime: '6 mnt' },
  { id: 'm21', name: 'Nasi Daun Jeruk Dori', nameEn: 'Lime Leaf Rice with Crispy Dory', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.8, description: 'Nasi gurih wangi irisan daun jeruk disajikan dengan krispi fillet dori dan saus cocolan.', descriptionEn: 'Fragrant and savory lime-leaf jasmine rice paired with a crispy dory fish fillet and tasty dipping sauce.', prepTime: '6 mnt' },
  { id: 'm22', name: 'Bistik Legend', nameEn: 'Legendary Beef Steak Bistik', price: 'Rp 50.000', category: 'makanan_berat', rating: 5.0, description: 'Bistik daging sapi tebal premium dengan siraman saus cokelat harum butter porsi mantap malam.', descriptionEn: 'A premium thick-cut beef steak glazed in rich, buttery brown gravy, an indulgence for late-night journeys.', prepTime: '8 mnt' },
  { id: 'm23', name: 'Mie Godog', nameEn: 'Javanese Boiled Noodles (Mie Godog)', price: 'Rp 40.000', category: 'makanan_berat', rating: 4.8, description: 'Mie rebus hangat bumbu Jawa kuah telur kental gurih, sangat pas dinikmati di malam yang dingin.', descriptionEn: 'A steaming bowl of Javanese-style comfort noodles, cooked in a thick egg-drop broth, perfect for cool evenings.', prepTime: '7 mnt' },

  // Snack & Desserts (Camilan / Pastries)
  { id: 's1', name: 'Roti O Premium KAI', nameEn: 'Premium KAI Coffee Bun (Roti O)', price: 'Rp 14.000', category: 'snack_dessert', rating: 4.9, description: 'Roti mentega legendaris beraroma moka harum semerbak, garing di luar bermentega meleleh di dalam.', descriptionEn: 'The legendary coffee bun with a fragrant golden mocha crust, crispy on the outer shell and filled with buttery goodness.', prepTime: '2 mnt' },
  { id: 's2', name: 'Risol Mayo Sachet', nameEn: 'Creamy Mayo Risolle', price: 'Rp 10.000', category: 'snack_dessert', rating: 4.7, description: 'Jajanan sarapan sandai stasiun yang renyah di luar, lumer mayo di dalam.', descriptionEn: 'A satisfying, classic station snack that is ultra-crispy on the outside and filled with melt-in-the-mouth mayonnaise.', prepTime: '2 mnt' },
  { id: 's3', name: 'Chicken Salad Wrap', nameEn: 'Fresh Chicken Salad Wrap', price: 'Rp 40.000', category: 'snack_dessert', rating: 4.8, description: 'Kombinasi dada ayam pilihan, sayuran segar organik, dan saus sehat dalam balutan tortilla.', descriptionEn: 'A healthy and smart combination of tender chicken breast, organic greens, and light dressing wrapped snugly in a tortilla.', prepTime: '3 mnt' },
  { id: 's4', name: 'Odeng', nameEn: 'Korean Odeng Fishcake', price: 'Rp 30.000', category: 'snack_dessert', rating: 4.7, description: 'Sate kue ikan tebal khas Korea yang disajikan dengan kuah kaldu ikan gurih hangat murni.', descriptionEn: 'Skewered thick ribbon fishcakes served in a steaming cup of deeply savory and warm fish broth.', prepTime: '3 mnt' },
  { id: 's5', name: 'Tekwan Cup', nameEn: 'Palembang Tekwan Cup', price: 'Rp 25.000', category: 'snack_dessert', rating: 4.8, description: 'Butiran tekwan sagu ikan tenggiri kenyal gurih berkuah udang hangat praktis dalam cup porsi pas.', descriptionEn: 'Handmade chewy fishballs in hot, flavorful shrimp stock, served conveniently in a travel-friendly cup.', prepTime: '3 mnt' },
  { id: 's6', name: 'Chicken Strip Wedges Potato', nameEn: 'Chicken Strips & Potato Wedges', price: 'Rp 40.000', category: 'snack_dessert', rating: 4.7, description: 'Kombinasi stik dada ayam berlapis tepung renyah dengan kentang wedges gurih empuk di dalam.', descriptionEn: 'Crispy seasoned chicken tenders paired side-by-side with seasoned potato wedges, soft on the inside.', prepTime: '5 mnt' },
  { id: 's7', name: 'French Fries Katsu', nameEn: 'Golden Fries with Chicken Katsu', price: 'Rp 38.000', category: 'snack_dessert', rating: 4.7, description: 'Kentang goreng renyah dipadankan dengan katsu ayam krispi saus barbeque favorit keluarga.', descriptionEn: 'Crunchy french fries paired with a golden chicken katsu cutlet, drizzled with sweet, tangy barbecue sauce.', prepTime: '5 mnt' },
  { id: 's8', name: 'Platters', nameEn: 'Cozy Snack Platter', price: 'Rp 38.000', category: 'snack_dessert', rating: 4.8, description: 'Piring camilan seru berisi nugget ayam, sosis bakar renyah, dan kentang goreng saus mayones.', descriptionEn: 'A fun finger-food sharing platter loaded with crispy chicken nuggets, grilled sausages, and fries.', prepTime: '6 mnt' },
  { id: 's9', name: 'Pop Mie Rasa Ayam', nameEn: 'Pop Mie Chicken Instant Cup', price: 'Rp 10.000', category: 'snack_dessert', rating: 4.6, description: 'Mi instan cup praktis penghangat perjalanan malam berkuah kaldu ayam gurih harum.', descriptionEn: 'The absolute travel staple: hot instant cup noodles in a comforting, aromatic chicken soup.', prepTime: '3 mnt' },

  // Minuman (Drinks & Beverages)
  { id: 'd1', name: 'Es Kopi Susu Aren Kenangan', nameEn: 'Iced Coffee Latte with Palm Sugar', price: 'Rp 18.000', category: 'minuman', rating: 4.9, description: 'Es kopi susu gula aren cita rasa mantap wangi dan konsisten menemani perjalanan Anda.', descriptionEn: 'A rich iced milk coffee sweetened with authentic palm sugar, a perfect companion for your journey.', prepTime: '2 mnt' },
  { id: 'd2', name: 'Hot Chocolate', nameEn: 'Classic Hot Chocolate', price: 'Rp 13.000', category: 'minuman', rating: 4.9, description: 'Camilan minuman coklat hangat manis krimi lembut untuk menemani suasana syahdu fajar.', descriptionEn: 'A smooth, sweet, and comforting warm cocoa drink, beautiful to enjoy under the dawn sky.', prepTime: '2 mnt' },
  { id: 'd3', name: 'Es Teh Manis Selasih', nameEn: 'Iced Sweet Tea with Basil Seeds', price: 'Rp 8.000', category: 'minuman', rating: 4.7, description: 'Es teh manis seduh segar berkualitas dengan taburan biji selasih berkhasiat tinggi.', descriptionEn: 'Freshly brewed high-quality sweet jasmine tea sprinkled with nutritious, plump basil seeds.', prepTime: '1 mnt' },
  { id: 'd4', name: 'Fruit Tea Apel', nameEn: 'Iced Apple Fruit Tea', price: 'Rp 12.000', category: 'minuman', rating: 4.8, description: 'Es teh premium botol rasa buah apel manis dingin menyegarkan di sela perjalanan siang hari.', descriptionEn: 'Refreshing premium bottled tea infused with sweet, crisp apple flavor to beat the midday warmth.', prepTime: '1 mnt' },
  { id: 'd5', name: 'Wedang Ronde Jahe Hangat', nameEn: 'Warm Wedang Ronde Gingerbread', price: 'Rp 18.000', category: 'minuman', rating: 4.8, description: 'Minuman jahe hangat dengan bola ketan isi kacang tanah lumer, bikin badan rileks.', descriptionEn: 'Traditional ginger soup with soft, chewy glutinous rice balls filled with sweet, crushed peanuts.', prepTime: '2 mnt' },
  { id: 'd6', name: 'Wedang Uwuh', nameEn: 'Wedang Uwuh Herbal Tea', price: 'Rp 15.000', category: 'minuman', rating: 4.9, description: 'Wedang tradisional hangat rempah secang merah, cengkeh wangi, sereh hangat mengembalikan vitalitas tubuh.', descriptionEn: 'Traditional crimson herbal tea brewed with secang wood, cloves, and lemongrass to rejuvenate and energize.', prepTime: '2 mnt' },
  { id: 'd7', name: 'Wedang Teh Jahe', nameEn: 'Warm Ginger Infused Tea', price: 'Rp 15.000', category: 'minuman', rating: 4.8, description: 'Minuman teh seduh wangi melati berpadu rimpang jahe membakar hangat relaksasi tubuh.', descriptionEn: 'A fragrant jasmine tea infusion with freshly sliced ginger root, bringing instant relaxing warmth.', prepTime: '2 mnt' },
  { id: 'd8', name: 'Teh Premium Chamomile', nameEn: 'Premium Chamomile Tea', price: 'Rp 15.000', category: 'minuman', rating: 4.8, description: 'Cangkir teh premium pilihan beraroma tenang eksklusif untuk keheningan malam stasiun.', descriptionEn: 'A selective premium herbal tea with calming notes, perfect for a peaceful journey.', prepTime: '2 mnt' },
  { id: 'd9', name: 'Air Mineral', nameEn: 'Pure Mineral Water', price: 'Rp 8.000', category: 'minuman', rating: 4.9, description: 'Air mineral murni dalam kemasan botol siap menyegarkan tenggorokan Anda kapan pun.', descriptionEn: 'A chilled bottle of crisp, clean spring mineral water to hydrate you at any moment.', prepTime: '1 mnt' }
];

export default function FoodRecommendations({ currentSeat }: FoodRecommendationsProps) {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'makanan_berat' | 'snack_dessert' | 'minuman'>('makanan_berat');
  const [orderedItemId, setOrderedItemId] = useState<string | null>(null);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  // Advanced order checkout flow state
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [ticketNo, setTicketNo] = useState<string>('');
  const [resolvedPassenger, setResolvedPassenger] = useState<{name: string, carriage: string, seat: string} | null>(null);
  const [liveTrains, setLiveTrains] = useState<TrainSchedule[]>([]);
  const [selectedTrainId, setSelectedTrainId] = useState<string>('');
  const [paymentInProgress, setPaymentInProgress] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [showQrisCode, setShowQrisCode] = useState<boolean>(false);

  const filteredItems = FOOD_ITEMS.filter(item => item.category === activeCategory);

  const getFallbackTrains = (): TrainSchedule[] => {
    const fallback: TrainSchedule[] = [];
    const trains = [
      { name: "KA Argo Wilis", dest: "Surabaya Gubeng", platform: "3" },
      { name: "KA Argo Lawu", dest: "Solo Balapan", platform: "1" },
      { name: "KA Gajayana", dest: "Malang", platform: "4" },
      { name: "KA Taksaka", dest: "Yogyakarta", platform: "2" },
      { name: "KA Argo Bromo Anggrek", dest: "Surabaya Pasarturi", platform: "1" },
      { name: "KA Turangga", dest: "Surabaya Gubeng", platform: "3" },
      { name: "KA Lodaya", dest: "Solo Balapan", platform: "2" },
      { name: "KA Argo Parahyangan", dest: "Bandung (Hall)", platform: "5" },
      { name: "KA Bima", dest: "Surabaya Gubeng", platform: "4" },
      { name: "KA Argo Dwipangga", dest: "Solo Balapan", platform: "1" }
    ];
    const now = new Date();
    
    for (let i = 0; i < trains.length; i++) {
      const schTime = new Date(now.getTime() + (8 + i * 18) * 60 * 1000);
      const timeStr = schTime.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });
      fallback.push({
        id: `fld-train-${i}`,
        trainNo: trains[i].name,
        destination: trains[i].dest,
        time: timeStr,
        platform: trains[i].platform,
        status: i === 0 ? "Boarding" : i === 1 ? "Arriving" : "On Time",
        type: "Rapid",
        lineColor: "#4F252E"
      });
    }
    return fallback;
  };

  // Load upcoming real-time schedules when food checkout is triggered
  useEffect(() => {
    if (selectedFood) {
      // Use curated long-distance trains (KA Jarak Jauh) as they feature food delivery to seat.
      const trains = getFallbackTrains();
      setLiveTrains(trains);
      if (trains.length > 0) {
        setSelectedTrainId(trains[0].id);
      }
    }
  }, [selectedFood]);

  // Handle live ticket resolution as user types
  const getMockPassenger = (num: string) => {
    const cleaned = num.trim();
    if (!cleaned) return null;
    
    const carriages = [
      "Gerbong Eksekutif 2", "Gerbong Premium 4", 
      "Gerbong Eksekutif 1", "Gerbong Sleeper 1", 
      "Gerbong Ekonomi Premium 3", "Gerbong Eksekutif 3"
    ];
    const seats = ["12A", "5B", "8C", "14D", "3F", "11E", "9B", "15A", "2C", "7A"];
    
    let codeSum = 0;
    for (let i = 0; i < cleaned.length; i++) {
      codeSum += cleaned.charCodeAt(i);
    }
    
    const carriageIdx = (codeSum + 2) % carriages.length;
    const seatIdx = (codeSum + 4) % seats.length;
    
    return {
      name: cleaned.toUpperCase(),
      carriage: carriages[carriageIdx],
      seat: `Kursi ${seats[seatIdx]}`
    };
  };

  useEffect(() => {
    if (ticketNo.trim().length >= 2) {
      setResolvedPassenger(getMockPassenger(ticketNo));
    } else {
      setResolvedPassenger(null);
    }
  }, [ticketNo]);

  // QRIS simulated countdown timer of exactly 10 seconds
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (paymentInProgress && countdown > 0) {
      timerId = setTimeout(() => {
        setCountdown(prev => prev - 1);
        triggerVibration(15);
      }, 1000);
    } else if (paymentInProgress && countdown === 0) {
      setPaymentInProgress(false);
      setPaymentCompleted(true);
      playRippleSound();
      triggerVibration([80, 40, 80, 40, 100]);
    }
    return () => clearTimeout(timerId);
  }, [paymentInProgress, countdown]);

  const handleOpenCheckout = (item: FoodItem) => {
    triggerVibration([25, 10, 25]);
    playClickSound();
    setSelectedFood(item);
    setTicketNo('');
    setResolvedPassenger(null);
    setPaymentInProgress(false);
    setPaymentCompleted(false);
    setCountdown(10);
    setShowQrisCode(false);
  };

  const handleStartPayment = () => {
    if (!resolvedPassenger || !selectedTrainId) return;
    triggerVibration([30, 15, 30]);
    playClickSound();
    setShowQrisCode(true);
    setCountdown(10);
    setPaymentInProgress(true);
  };

  const handleCloseModal = () => {
    triggerVibration(15);
    playClickSound();
    setSelectedFood(null);
  };

  const handleDone = () => {
    triggerVibration([40, 20, 45]);
    playRippleSound();
    
    const trainObj = liveTrains.find(t => t.id === selectedTrainId);
    const trainText = trainObj 
      ? (language === 'id' ? `${trainObj.trainNo} (Tujuan ${trainObj.destination})` : `${trainObj.trainNo} (Dest. ${trainObj.destination})`) 
      : (language === 'id' ? "Kereta Pilihan" : "Selected Train");
    
    const foodName = language === 'id' ? selectedFood?.name : (selectedFood?.nameEn || selectedFood?.name);
    const successMsg = language === 'id'
      ? `🎉 Sukses! Pesanan "${foodName}" dikonfirmasi untuk ${resolvedPassenger?.name} di ${resolvedPassenger?.carriage} / ${resolvedPassenger?.seat} perjalanan ${trainText}. Makanan segera diantar!`
      : `🎉 Success! Order "${foodName}" confirmed for ${resolvedPassenger?.name} at ${resolvedPassenger?.carriage} / ${resolvedPassenger?.seat} on ${trainText}. Your meal is on the way!`;
    
    setOrderNotification(successMsg);
    
    setSelectedFood(null);
    
    // Hide notification after 8 seconds
    setTimeout(() => {
      setOrderNotification(null);
    }, 8000);
  };

  const handleOrderAhead = (item: FoodItem) => {
    handleOpenCheckout(item);
  };

  return (
    <div 
      onMouseEnter={() => triggerVibration(5)}
      className="bg-[#FFF7C5] border-3 border-[#4F252E] rounded-none p-6 md:p-8 shadow-[6px_6px_0px_0px_#C1EBE9] flex flex-col h-auto text-[#4F252E] transition-all duration-300 hover:scale-[1.01] hover:-translate-y-2 hover:shadow-[14px_14px_0px_0px_#C1EBE9] hover:bg-[#FFFBE5] hover:z-10"
    >
      
      {/* Header with Title and Seat link indicators */}
      <div className="border-b-2 border-[#4F252E]/20 pb-4 mb-4 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-display font-black text-3xl md:text-4xl text-[#4F252E] tracking-tight flex items-center gap-2.5">
            <UtensilsCrossed className="w-9 h-9 text-[#F4AE52]" />
            {t('culinaryTitle')}
          </h3>
          <p className="font-mono text-sm text-[#4F252E]/80 uppercase tracking-widest leading-none font-bold mt-1.5">
            {t('culinaryDesc')}
          </p>
        </div>

        {/* Seat Badge tracking */}
        <div className="bg-[#4F252E] text-[#FFF7C5] border-2 border-[#4F252E] rounded-none px-4 py-2.5 text-[11px] font-mono flex items-center gap-2 font-black uppercase leading-none shadow-[2px_2px_0px_#F4AE52]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F4AE52] select-none animate-pulse" />
          <span>{language === 'id' ? 'BISA DIANTAR KE KURSI KAMU!' : 'DELIVERABLE DIRECT TO SEAT!'}</span>
        </div>
      </div>

      {/* Category selector loops */}
      <div className="grid grid-cols-3 gap-3 pb-4 shrink-0">
        <button
          onClick={() => {
            triggerVibration(15);
            playClickSound();
            setActiveCategory('makanan_berat');
          }}
          onMouseEnter={() => triggerVibration(6)}
          className={`flex items-center justify-center space-x-2 py-3.5 rounded-none border-2 font-mono text-xs sm:text-sm md:text-base font-black tracking-tight transition-all leading-none cursor-pointer ${
            activeCategory === 'makanan_berat'
              ? 'bg-[#4F252E] text-[#FFF7C5] border-[#4F252E] shadow-[3px_3px_0px_0px_#F4AE52]'
              : 'bg-white/60 text-[#4F252E]/80 border-[#4F252E]/25 hover:border-[#4F252E]'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <span className="truncate">
            {language === 'id' ? 'Makanan Berat' : 'Main Dishes'}
          </span>
        </button>

        <button
          onClick={() => {
            triggerVibration(15);
            playClickSound();
            setActiveCategory('snack_dessert');
          }}
          onMouseEnter={() => triggerVibration(6)}
          className={`flex items-center justify-center space-x-2 py-3.5 rounded-none border-2 font-mono text-xs sm:text-sm md:text-base font-black tracking-tight transition-all leading-none cursor-pointer ${
            activeCategory === 'snack_dessert'
              ? 'bg-[#4F252E] text-[#FFF7C5] border-[#4F252E] shadow-[3px_3px_0px_0px_#F4AE52]'
              : 'bg-white/60 text-[#4F252E]/80 border-[#4F252E]/25 hover:border-[#4F252E]'
          }`}
        >
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <span className="truncate">
            {language === 'id' ? 'Snack & Desserts' : 'Snacks & Desserts'}
          </span>
        </button>

        <button
          onClick={() => {
            triggerVibration(15);
            playClickSound();
            setActiveCategory('minuman');
          }}
          onMouseEnter={() => triggerVibration(6)}
          className={`flex items-center justify-center space-x-2 py-3.5 rounded-none border-2 font-mono text-xs sm:text-sm md:text-base font-black tracking-tight transition-all leading-none cursor-pointer ${
            activeCategory === 'minuman'
              ? 'bg-[#4F252E] text-[#FFF7C5] border-[#4F252E] shadow-[3px_3px_0px_0px_#F4AE52]'
              : 'bg-white/60 text-[#4F252E]/80 border-[#4F252E]/25 hover:border-[#4F252E]'
          }`}
        >
          <Coffee className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <span className="truncate">
            {language === 'id' ? 'Minuman' : 'Drinks & Beverages'}
          </span>
        </button>
      </div>

      {orderNotification && (
        <div className="mb-4 p-4 bg-[#F4AE52]/10 border-2 border-[#4F252E] text-[#4F252E] rounded-none font-mono text-xs leading-snug flex items-start space-x-2 animate-bounce shrink-0 font-bold">
          <Award className="w-5 h-5 text-[#4F252E] shrink-0" />
          <span>{orderNotification}</span>
        </div>
      )}

      {/* Grid displaying matching culinary cards in beautiful side-by-side layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-white/45 border-2 border-dashed border-[#4F252E]/15 rounded-none">
        {filteredItems.map(item => {
          const isOrdered = orderedItemId === item.id;
          
          return (
            <div
              key={item.id}
              onMouseEnter={() => triggerVibration(5)}
              className="bg-white border-2 border-[#4F252E] rounded-none p-5 shadow-[3.5px_3.5px_0px_0px_#C1EBE9] flex flex-col justify-between items-stretch gap-4 transition-all duration-300 hover:scale-[1.015] hover:-translate-y-2 hover:translate-x-[-1px] hover:shadow-[7px_7px_0px_0px_#C1EBE9] hover:border-[#4F252E]"
            >
              <div className="space-y-2 text-[#4F252E]">
                <div className="flex items-start justify-between gap-1.5 matches-align">
                  <span className="font-display font-black text-base md:text-lg lg:text-xl text-[#4F252E] leading-tight">
                    {language === 'id' ? item.name : (item.nameEn || item.name)}
                  </span>
                  <div className="flex items-center space-x-1 bg-[#C1EBE9] border border-[#4F252E]/30 px-2.5 py-1 rounded-none text-xs font-mono font-black text-[#4F252E] leading-none shrink-0 shadow-[1px_1px_0px_#4F252E]">
                    <span className="text-[#F4AE52]">★</span>
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <p className="text-sm md:text-base font-sans text-[#4F252E] leading-relaxed font-bold min-h-[46px]">
                  {language === 'id' ? item.description : (item.descriptionEn || item.description)}
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                  <span className="font-mono text-[11px] sm:text-xs text-[#4F252E] font-black flex items-center gap-1.5 bg-[#C1EBE9]/40 border border-[#4F252E]/25 px-2.5 py-1 rounded-none shrink-0 shadow-[1px_1px_0px_#4F252E]">
                    <Clock className="w-3.5 h-3.5 text-[#F4AE52]" /> {language === 'id' ? 'SAJI:' : 'PREP:'} {item.prepTime}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-[#4F252E] font-black bg-[#F4AE52]/30 border border-[#4F252E]/25 px-2.5 py-1 rounded-none shrink-0 shadow-[1px_1px_0px_#4F252E]">
                    {item.price}
                  </span>
                </div>
              </div>

              {/* Order action */}
              <button
                onClick={() => handleOrderAhead(item)}
                onMouseEnter={() => {
                  if (orderedItemId === null) {
                    triggerVibration(6);
                  }
                }}
                disabled={orderedItemId !== null}
                className="w-full px-5 py-2.5 font-display font-black text-xs border-2 border-black rounded-none flex items-center justify-center space-x-1.5 transition-all shadow-[2.5px_2.5px_0px_0px_#4F252E] shrink-0 cursor-pointer bg-[#F4AE52] text-[#4F252E] hover:bg-[#C1EBE9] hover:text-[#4F252E]"
              >
                <ShoppingBag className="w-4 h-4 text-[#4F252E]" />
                <span>{language === 'id' ? 'ANTAR KE KURSI' : 'DELIVER TO SEAT'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* CHECKOUT MODAL WITH VERIFICATION & QRIS COUNTDOWN TIMER */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4E232E]/70 backdrop-blur-xs select-text">
          <div className="bg-[#FFF7C5] border-4 border-[#4F252E] rounded-none w-full max-w-lg shadow-[8px_8px_0px_0px_#C1EBE9] relative p-5 md:p-6 text-[#4F252E] animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] no-scrollbar">
            
            {/* Modal Heading Header */}
            <div className="flex justify-between items-center border-b-2 border-[#4F252E]/20 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-[#F4AE52] animate-spin-slow" />
                <h4 className="font-display font-black text-lg md:text-xl tracking-tight">
                  {language === 'id' ? 'PENGANTARAN MAKANAN' : 'DELIVER FOOD MEAL'}
                </h4>
              </div>
              <button 
                onClick={handleCloseModal}
                className="border-2 border-[#4F252E] p-1 bg-white hover:bg-[#F4AE52] text-[#4F252E] rounded-none transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 font-black" />
              </button>
            </div>

            {/* Selected Item Summary Card */}
            <div className="bg-white border-2 border-[#4F252E] p-3 mb-4 flex justify-between items-center shadow-[3px_3px_0px_0px_#4F252E]">
              <div>
                <span className="font-mono text-[9px] uppercase font-black text-gray-500 block">
                  {language === 'id' ? 'Item Pesanan' : 'Ordered Item'}
                </span>
                <span className="font-display font-black text-sm">{language === 'id' ? selectedFood.name : (selectedFood.nameEn || selectedFood.name)}</span>
              </div>
              <div className="bg-[#F4AE52]/20 border border-[#4F252E]/30 px-3 py-1 text-xs font-mono font-black">
                {selectedFood.price}
              </div>
            </div>

            {!showQrisCode ? (
              // STEP 1: Verifikasi Tiket & Pilih Jadwal Kereta
              <div className="space-y-4">
                
                {/* 1. Select Scheduled Trip */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] font-black uppercase tracking-wider block">
                    {language === 'id' ? '1. Pilih Jadwal Kereta Yang Sesuai (Real-time)' : '1. Choose Corresponding Train Schedule (Real-time)'}
                  </label>
                  <p className="font-sans text-xs text-slate-500 leading-tight mb-2">
                    {language === 'id' ? 'Jadwal perjalanan saat ini beberapa menit ke depan:' : 'Current trip schedules in the next few minutes:'}
                  </p>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                    {liveTrains.map((tr) => {
                      const isSelected = selectedTrainId === tr.id;
                      return (
                        <div
                          key={tr.id}
                          onClick={() => {
                            triggerVibration(10);
                            playClickSound();
                            setSelectedTrainId(tr.id);
                          }}
                          className={`border-2 p-2 px-3 rounded-none flex justify-between items-center cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#4F252E] border-[#4F252E] text-[#FFF7C5] shadow-[2.5px_2.5px_0px_0px_#F4AE52]'
                              : 'bg-white border-[#4F252E]/40 hover:bg-white/80 text-[#4F252E]'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Train className={`w-4 h-4 ${isSelected ? 'text-[#F4AE52]' : 'text-[#4F252E]'}`} />
                            <div>
                              <span className="font-display font-black text-xs block leading-none">{tr.trainNo}</span>
                              <span className="font-mono text-[9px] block opacity-75 mt-0.5">
                                {language === 'id' ? 'Tujuan' : 'Dest.'} {tr.destination}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-xs block">{tr.time}</span>
                            <span className="font-mono text-[8px] uppercase tracking-wider font-bold">PLATFORM {tr.platform}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Entrance E-Ticket Identifier */}
                <div className="space-y-2 pt-2 border-t border-[#4F252E]/10">
                  <div className="flex justify-between items-center">
                    <label className="font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5 text-[#F4AE52]" /> 
                      {language === 'id' ? '2. Masukkan Nomor Tiket Elektronik' : '2. Enter Electronic Ticket Code'}
                    </label>
                    <span className="font-mono text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {language === 'id' ? 'Verifikasi KA' : 'Verify Train'}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={ticketNo}
                      onChange={(e) => {
                        setTicketNo(e.target.value);
                        triggerVibration(5);
                      }}
                      placeholder={language === 'id' ? "Ketik no tiket e.g: KAI-1209 atau namamu..." : "Type ticket no e.g. KAI-1209 or your name..."}
                      className="bg-white border-2 border-[#4F252E] w-full px-3 py-2.5 pl-9 font-mono text-xs font-black text-[#4F252E] rounded-none outline-none focus:ring-2 focus:ring-[#F4AE52] shadow-[2px_2px_0px_#4F252E] uppercase placeholder:text-gray-400"
                    />
                    <Search className="w-4 h-4 text-[#4F252E]/60 absolute left-3 top-3.5" />
                  </div>

                  {/* Resolved Seat & Passenger Metadata */}
                  <div className="bg-white/80 border-2 border-[#4F252E] border-dashed p-3 min-h-[85px] flex items-center justify-center border-slate-300">
                    {resolvedPassenger ? (
                      <div className="w-full flex items-start gap-3">
                        <div className="bg-[#4F252E]/15 p-2 border border-[#4F252E]/30 rounded-none shrink-0 self-center">
                          <User className="w-5 h-5 text-[#4F252E]" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[8px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-none leading-none select-none tracking-wider uppercase">VERIFIED</span>
                            <span className="font-mono text-[9px] text-[#4F252E]/70 font-black uppercase">
                              {language === 'id' ? 'Data Penumpang Sesuai' : 'Passenger Details Match'}
                            </span>
                          </div>
                          <p className="font-display font-black text-sm text-[#4F252E] mt-1">{resolvedPassenger.name}</p>
                          <div className="flex gap-4 mt-0.5">
                            <span className="font-mono text-[10px] font-medium text-slate-600">
                              {language === 'id' ? 'Gerbong' : 'Carriage'}: <strong className="font-black text-[#4F252E]">{resolvedPassenger.carriage}</strong>
                            </span>
                            <span className="font-mono text-[10px] font-medium text-slate-600">
                              {language === 'id' ? 'Kursi' : 'Seat'}: <strong className="font-black text-[#4F252E]">{resolvedPassenger.seat}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-1">
                        <p className="font-mono text-[10px] uppercase font-black text-[#4F252E]/60 tracking-wider">
                          {language === 'id' ? 'MASUKKAN NO TIKET ELEKTRONIK ANDA' : 'ENTER YOUR E-TICKET CODE'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {language === 'id' ? 'Nama, Gerbong, dan Nomor Kursi akan terverifikasi secara otomatis saat diketik.' : 'Passenger name, carriage number, and seat will be verified automatically as you type.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm Action Button */}
                <button
                  disabled={!resolvedPassenger || !selectedTrainId}
                  onClick={handleStartPayment}
                  className={`w-full py-4.5 text-center font-display font-black text-sm border-2 border-black rounded-none shadow-[4px_4px_0px_#4F252E] relative transition-transform duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    resolvedPassenger && selectedTrainId
                      ? 'bg-[#F4AE52] text-[#4F252E] hover:bg-[#C1EBE9]'
                      : 'bg-[#4F252E]/10 text-[#4F252E]/30 border-[#4F252E]/20 cursor-not-allowed shadow-[0px_0px_0px_transparent]'
                  }`}
                >
                  <CreditCard className="w-4.5 h-4.5 text-current" />
                  <span>{language === 'id' ? 'LANJUT KE PEMBAYARAN QRIS' : 'PROCEED TO QRIS PAY'}</span>
                </button>
              </div>
            ) : (
              // STEP 2: MULTI-STAGE QRIS SIMULATED PAYMENT TIMER
              <div className="space-y-4 pt-1">
                {!paymentCompleted ? (
                  <div className="space-y-4 text-center">
                    <p className="font-mono text-[10px] font-black uppercase tracking-widest text-[#4F252E]/75">
                      {language === 'id' ? 'SCAN UNTUK MENYELESAIKAN ORDER' : 'SCAN TO COMPLETE ORDER'}
                    </p>
                    
                    {/* QRIS Header branding */}
                    <div className="bg-white border-2 border-[#4F252E] p-4 flex flex-col items-center justify-center max-w-[280px] mx-auto shadow-[4px_4px_0px_0px_#4F252E]">
                      <div className="bg-[#4F252E] text-white font-mono text-[10px] font-black py-1 px-3 mb-2 tracking-widest rounded-none leading-none select-none uppercase">
                        QRIS NEGARA INDONESIA
                      </div>
                      
                      {/* Stylized high contrast Vector QR code mockup */}
                      <div className="relative w-44 h-44 border-2 border-[#4F252E] bg-white p-2 flex flex-col justify-between items-center">
                        <div className="w-full h-full border border-[#4F252E]/25 p-1 flex flex-col justify-between select-none opacity-90">
                          {/* Inside patterned lines imitating QR layout */}
                          <div className="flex justify-between w-full">
                            <div className="w-10 h-10 border-4 border-[#4F252E]" />
                            <div className="w-10 h-10 border-4 border-[#4F252E]" />
                          </div>
                          
                          {/* Inner blocks decoration */}
                          <div className="flex-1 flex flex-col items-center justify-center py-2 space-y-1">
                            <div className="w-full flex justify-around px-8">
                              <div className="w-2.5 h-2.5 bg-[#4F252E]" />
                              <div className="w-1.5 h-1.5 bg-[#4F252E]" />
                              <div className="w-2 h-2 bg-[#4F252E]" />
                            </div>
                            <div className="w-full flex justify-around px-4">
                              <div className="w-1.5 h-1.5 bg-[#4F252E]" />
                              <div className="w-3.5 h-3.5 bg-[#4F252E] self-center" />
                              <div className="w-1.5 h-1.5 bg-[#4F252E]" />
                              <div className="w-2 h-2 bg-[#4F252E]" />
                            </div>
                            <div className="w-full flex justify-between px-10">
                              <div className="w-2 h-2 bg-[#F4AE52]" />
                              <div className="w-2.5 h-2.5 bg-[#4F252E]" />
                            </div>
                          </div>

                          <div className="flex justify-between w-full">
                            <div className="w-10 h-10 border-4 border-[#4F252E]" />
                            <div className="w-10 h-10 border-4 border-[#4F252E]/35 flex items-center justify-center">
                              <div className="w-4 h-4 bg-[#4F252E]" />
                            </div>
                          </div>
                        </div>
                        {/* Centered logo */}
                        <div className="absolute inset-0 m-auto w-8 h-8 bg-[#FFF7C5] border-2 border-[#4F252E] flex items-center justify-center font-mono font-black text-[9px] text-[#4F252E] leading-none select-none">
                          KAI
                        </div>
                      </div>

                      <div className="font-mono text-center mt-2.5 font-bold uppercase text-[10px] tracking-wide text-[#4F252E]">
                        {language === 'id' ? 'Khas: Stasiun Nyantai' : 'Specialty: Cozy Station'}
                      </div>
                    </div>

                    {/* Receipt information details */}
                    <div className="bg-[#4F252E]/5 border border-[#4F252E]/20 p-3 max-w-[320px] mx-auto text-left font-mono text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{language === 'id' ? 'PENERIMA:' : 'RECIPIENT:'}</span>
                        <span className="font-black text-[#4F252E]">{resolvedPassenger?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">{language === 'id' ? 'ANTAR KE:' : 'DELIVER TO:'}</span>
                        <span className="font-black text-[#4F252E]">{resolvedPassenger?.carriage} - {resolvedPassenger?.seat}</span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-[#4F252E]/10">
                        <span className="text-gray-500">TRIP:</span>
                        <span className="font-black text-[#4F252E] truncate max-w-[160px]">{liveTrains.find(t=>t.id===selectedTrainId)?.trainNo}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="font-black">{language === 'id' ? 'TOTAL HARGA:' : 'TOTAL PRICE:'}</span>
                        <span className="font-black text-[#4F252E] bg-[#F4AE52]/20 px-1 border border-[#4F252E]/10">{selectedFood.price}</span>
                      </div>
                    </div>

                    {/* Timer progress screen */}
                    <div className="space-y-2 pt-2 border-t border-[#4F252E]/15">
                      <div className="flex justify-between items-center font-mono text-[11px] font-black">
                        <span className="text-[#4F252E]/80 animate-pulse">
                          {language === 'id' ? 'Menghubungkan Gate QRIS...' : 'Connecting QRIS Gate...'}
                        </span>
                        <span className="bg-[#4F252E] text-[#FFF7C5] px-2.5 py-0.5 rounded-none text-xs">
                          {countdown} {language === 'id' ? 'DETIK' : 'SECONDS'}
                        </span>
                      </div>

                      {/* Cool retro ticking progress bar */}
                      <div className="w-full bg-[#4F252E]/10 h-3 border border-[#4F252E] rounded-none overflow-hidden relative">
                        <div 
                          className="bg-[#F4AE52] h-full transition-all duration-1000 ease-linear border-r border-[#4F252E]"
                          style={{ width: `${(10 - countdown) * 10}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 italic mt-1 font-bold">
                        {language === 'id' 
                          ? 'Sistem sedang memindai dan menunggu pembayaran QRIS (Menunggu 10 detik)...' 
                          : 'System is scanning and waiting for QRIS confirmation (Waiting 10 seconds)...'}
                      </p>
                    </div>

                  </div>
                ) : (
                  // FINISHED SUCCESS SCREEN WITH RECEIPT AND "DONE" BUTTON
                  <div className="text-center py-4 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
                    <div className="flex justify-center">
                      <div className="bg-[#C1EBE9] border-3 border-[#4F252E] p-4 rounded-none shadow-[3px_3px_0px_#4F252E] animate-bounce">
                        <CheckCircle2 className="w-12 h-12 text-emerald-800" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-black text-xl text-emerald-800 tracking-tight">
                        {language === 'id' ? 'PEMBAYARAN QRIS BERHASIL!' : 'QRIS PAYMENT SUCCESSFUL!'}
                      </h4>
                      <p className="font-mono text-[10px] uppercase font-bold text-slate-500">
                        {language === 'id' ? 'E-Receipt / Resi Pengantaran Makanan Ke Kursi' : 'E-Receipt / In-Seat Meal Delivery Receipt'}
                      </p>
                    </div>

                    {/* Receipt Details Box structured nicely */}
                    <div className="bg-white border-2 border-[#4F252E] p-4 text-left font-mono text-[11px] space-y-1.5 shadow-[4px_4px_0px_0px_#C1EBE9] max-w-sm mx-auto">
                      <div className="text-center border-b-2 border-dashed border-[#4F252E]/20 pb-2 mb-2">
                        <span className="font-black text-xs text-[#4F252E] uppercase block tracking-wider">RESTREKA INTERCITY INTER-SEAT</span>
                        <span className="text-[9px] text-[#4F252E]/60">{language === 'id' ? 'NO RESI:' : 'RECEIPT NO:'} KAI-FOD-{Math.floor(100000 + Math.random() * 900000)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'id' ? 'PEMESAN:' : 'PASSENGER:'}</span>
                        <span className="font-black text-[#4F252E]">{resolvedPassenger?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'id' ? 'NO TIKET:' : 'TICKET NO:'}</span>
                        <span className="font-black text-[#4F252E] uppercase">{ticketNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'id' ? 'GERBONG:' : 'CARRIAGE:'}</span>
                        <span className="font-black text-[#4F252E]">{resolvedPassenger?.carriage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'id' ? 'KURSI:' : 'SEAT:'}</span>
                        <span className="font-black text-[#4F252E]">{resolvedPassenger?.seat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'id' ? 'KERETA:' : 'TRAIN:'}</span>
                        <span className="font-black text-[#4F252E]">{liveTrains.find(t=>t.id===selectedTrainId)?.trainNo}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#4F252E]/10">
                        <span className="text-slate-500">{language === 'id' ? 'MENU PESANAN:' : 'ORDERED MENU:'}</span>
                        <span className="font-black text-[#4F252E] truncate max-w-[170px]">{language === 'id' ? selectedFood.name : (selectedFood.nameEn || selectedFood.name)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'id' ? 'METODE BAYAR:' : 'PAY METHOD:'}</span>
                        <span className="font-black text-emerald-800">QRIS</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t-2 border-dashed border-[#4F252E]/20 text-xs font-black">
                        <span>{language === 'id' ? 'TOTAL BAYAR:' : 'TOTAL PAID:'}</span>
                        <span>{selectedFood.price}</span>
                      </div>

                      <div className="text-center pt-3 font-bold text-[#4F252E]/65 text-[9px] italic leading-tight">
                        {language === 'id'
                          ? '☕ Pesanan Anda sedang dipersiapkan di gerbong restorasi dan akan diantarkan oleh pramugari tepat di kursi Anda dalam 5-10 menit!'
                          : '☕ Your order is being prepared in the restoration car and will be delivered by a train attendant right to your seat in 5-10 minutes!'}
                      </div>
                    </div>

                    {/* Final closing Done Trigger */}
                    <button
                      onClick={handleDone}
                      className="w-full py-4 bg-emerald-600 border-2 border-black rounded-none font-display font-black text-[#FFF7C5] tracking-widest text-xs shadow-[3px_3px_0px_#4F252E] hover:bg-emerald-700 transition-colors uppercase cursor-pointer"
                    >
                      {language === 'id' ? 'SELESAI & TUTUP (DONE)' : 'DONE & CLOSE (DONE)'}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
