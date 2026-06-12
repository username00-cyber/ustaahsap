// ─── Ahşap / Zemin Hizmet Kategorileri ─────────────────────────────────────
// Her kategori: birim fiyat aralığı, ölçü birimi, ek sorular, fiyat etkileri

export const CATEGORIES = [
  {
    id: 'laminant_parke',
    label: 'Laminant Parke Döşeme',
    emoji: '🪵',
    unit: 'm²',
    minPrice: 100,
    maxPrice: 200,
    description: 'Laminant/Lamine parke döşeme işçiliği',
    questions: [
      {
        id: 'old_floor_removal',
        label: 'Eski zemin söküm gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Mevcut halı, fayans veya eski parke var mı?',
      },
      {
        id: 'furniture_move',
        label: 'Eşya taşıma gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 15 },
        hint: 'Oda boş değil, eşyalar taşınacak mı?',
      },
      {
        id: 'underlay_included',
        label: 'Şilte (underlay/ses yalıtımı) dahil mi?',
        type: 'boolean',
        priceImpact: { type: 'fixed_per_m2', value: 25 },
        hint: 'Parke altına serilen ses/ısı yalıtım şiltesi',
      },
      {
        id: 'skirting_board',
        label: 'Süpürgelik montajı yapılacak mı?',
        type: 'boolean',
        priceImpact: { type: 'fixed_per_m2', value: 30 },
        hint: 'Duvar-zemin birleşimindeki süpürgelik şeridi',
      },
      {
        id: 'subfloor_leveling',
        label: 'Alt zemin tesviye (düzeltme) gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 25 },
        hint: 'Zemin eğri veya düzensizse tesviye maliyeti eklenir',
      },
    ],
  },
  {
    id: 'masif_parke',
    label: 'Masif / Lamine Parke Döşeme',
    emoji: '🌳',
    unit: 'm²',
    minPrice: 150,
    maxPrice: 350,
    description: 'Doğal masif ya da kalın lamine parke döşeme',
    questions: [
      {
        id: 'old_floor_removal',
        label: 'Eski zemin söküm gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Mevcut zemin malzemesi var mı?',
      },
      {
        id: 'subfloor_leveling',
        label: 'Alt zemin tesviye gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 25 },
        hint: 'Masif parke için düzgün zemin şarttır',
      },
      {
        id: 'furniture_move',
        label: 'Eşya taşıma gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 15 },
        hint: 'Oda boş değil mi?',
      },
      {
        id: 'varnish_included',
        label: 'Vernik/cila uygulaması dahil mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Masif parke montaj sonrası cilalanacak mı?',
      },
    ],
  },
  {
    id: 'parke_cila',
    label: 'Parke Cilalama / Vernikleme',
    emoji: '✨',
    unit: 'm²',
    minPrice: 50,
    maxPrice: 100,
    description: 'Mevcut ahşap zeminin zımparalanıp cilalanması',
    questions: [
      {
        id: 'floor_condition',
        label: 'Zemin durumu nedir?',
        type: 'select',
        options: [
          { value: 'good', label: 'İyi (hafif soluk)', priceImpact: { type: 'percent', value: 0 } },
          { value: 'medium', label: 'Orta (çizikler var)', priceImpact: { type: 'percent', value: 15 } },
          { value: 'bad', label: 'Kötü (derin hasarlar)', priceImpact: { type: 'percent', value: 30 } },
        ],
        hint: 'Zemin ne kadar hasar görmüş?',
      },
      {
        id: 'varnish_coats',
        label: 'Kaç kat vernik uygulanacak?',
        type: 'select',
        options: [
          { value: '1', label: '1 kat', priceImpact: { type: 'percent', value: 0 } },
          { value: '2', label: '2 kat', priceImpact: { type: 'percent', value: 10 } },
          { value: '3', label: '3 kat (premium)', priceImpact: { type: 'percent', value: 20 } },
        ],
        hint: 'Daha fazla kat daha dayanıklı sonuç verir',
      },
      {
        id: 'furniture_move',
        label: 'Eşya taşıma gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 15 },
        hint: 'Oda boş mu yoksa eşyalar taşınacak mı?',
      },
    ],
  },
  {
    id: 'parke_soküm',
    label: 'Parke / Zemin Söküm',
    emoji: '🔨',
    unit: 'm²',
    minPrice: 30,
    maxPrice: 60,
    description: 'Mevcut parke veya zemin kaplamasının sökülmesi',
    questions: [
      {
        id: 'debris_removal',
        label: 'Moloz / atık taşıma dahil mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Sökülen malzemenin binadan çıkarılması',
      },
      {
        id: 'subfloor_clean',
        label: 'Alt zemin temizlik gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 15 },
        hint: 'Yapıştırıcı, çivi kalıntıları temizlenecek mi?',
      },
    ],
  },
  {
    id: 'lambri_duvar',
    label: 'Lambri Kaplama (Duvar)',
    emoji: '🏠',
    unit: 'm²',
    minPrice: 80,
    maxPrice: 150,
    description: 'Duvar yüzeyine lambri veya ahşap panel kaplaması',
    questions: [
      {
        id: 'material_type',
        label: 'Malzeme türü?',
        type: 'select',
        options: [
          { value: 'pvc', label: 'PVC Lambri (ekonomik)', priceImpact: { type: 'percent', value: 0 } },
          { value: 'wood', label: 'Ahşap Lambri', priceImpact: { type: 'percent', value: 30 } },
          { value: 'mdf', label: 'MDF Panel', priceImpact: { type: 'percent', value: 15 } },
        ],
        hint: 'PVC daha ekonomik, ahşap daha doğal görünüm',
      },
      {
        id: 'painting',
        label: 'Boya / badana gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Montaj sonrası boya işlemi yapılacak mı?',
      },
    ],
  },
  {
    id: 'lambri_tavan',
    label: 'Lambri Kaplama (Tavan)',
    emoji: '⬆️',
    unit: 'm²',
    minPrice: 100,
    maxPrice: 200,
    description: 'Tavan yüzeyine lambri kaplaması',
    questions: [
      {
        id: 'existing_ceiling_removal',
        label: 'Mevcut tavan söküm gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 25 },
        hint: 'Asma tavan veya eski kaplama var mı?',
      },
      {
        id: 'led_profile',
        label: 'LED profil / aydınlatma nişi yapılacak mı?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Dekoratif LED şerit için kanal açılması',
      },
    ],
  },
  {
    id: 'ahsap_merdiven',
    label: 'Ahşap Merdiven Yapımı / Kaplaması',
    emoji: '🪜',
    unit: 'basamak',
    minPrice: 300,
    maxPrice: 800,
    description: 'Ahşap merdiven yapımı veya mevcut merdivenin ahşapla kaplanması',
    questions: [
      {
        id: 'railing',
        label: 'Korkuluk / tırabzan dahil mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 35 },
        hint: 'Ahşap veya metal korkuluk montajı',
      },
      {
        id: 'finish',
        label: 'Yüzey işlemi?',
        type: 'select',
        options: [
          { value: 'raw', label: 'Ham (boyasız)', priceImpact: { type: 'percent', value: 0 } },
          { value: 'painted', label: 'Boyalı', priceImpact: { type: 'percent', value: 15 } },
          { value: 'varnished', label: 'Verniklı (doğal ahşap)', priceImpact: { type: 'percent', value: 20 } },
        ],
        hint: 'Teslim sonrası yüzey bitişi',
      },
    ],
  },
  {
    id: 'ahsap_kapi',
    label: 'Ahşap Kapı Montajı',
    emoji: '🚪',
    unit: 'adet',
    minPrice: 500,
    maxPrice: 1500,
    description: 'İç kapı montajı, çerçeve ve kasa dahil veya hariç',
    questions: [
      {
        id: 'frame_included',
        label: 'Kasa/çerçeve dahil mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 30 },
        hint: 'Sadece kapı kanadı mı yoksa kasa da mı monte edilecek?',
      },
      {
        id: 'handle_lock',
        label: 'Kol ve kilit montajı dahil mi?',
        type: 'boolean',
        priceImpact: { type: 'fixed_per_unit', value: 150 },
        hint: 'Kapı kolu ve mandal/kilit seti',
      },
      {
        id: 'painting',
        label: 'Boyama gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Kapı montaj sonrası boyanacak mı?',
      },
    ],
  },
  {
    id: 'pvc_zemin',
    label: 'PVC / Vinil Zemin Döşeme',
    emoji: '🔲',
    unit: 'm²',
    minPrice: 60,
    maxPrice: 120,
    description: 'PVC veya vinil zemin kaplaması döşenmesi',
    questions: [
      {
        id: 'old_floor_removal',
        label: 'Eski zemin söküm gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Mevcut zemin kaldırılacak mı?',
      },
      {
        id: 'furniture_move',
        label: 'Eşya taşıma gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 15 },
        hint: 'Oda dolu mu?',
      },
    ],
  },
  {
    id: 'hali',
    label: 'Halı Döşeme',
    emoji: '🟫',
    unit: 'm²',
    minPrice: 30,
    maxPrice: 80,
    description: 'Makine halısı veya kesim halı döşenmesi',
    questions: [
      {
        id: 'pad_included',
        label: 'Altlık (ped/keçe) dahil mi?',
        type: 'boolean',
        priceImpact: { type: 'fixed_per_m2', value: 15 },
        hint: 'Halı altına ses/ısı yalıtımı',
      },
      {
        id: 'old_carpet_removal',
        label: 'Eski halı söküm gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 20 },
        hint: 'Mevcut halı kaldırılacak mı?',
      },
      {
        id: 'furniture_move',
        label: 'Eşya taşıma gerekli mi?',
        type: 'boolean',
        priceImpact: { type: 'percent', value: 15 },
        hint: 'Oda dolu mu?',
      },
    ],
  },
];

// ─── Fiyat Hesaplama ────────────────────────────────────────────────────────
export function calculateEstimatedPrice(categoryId, area, answers) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return { min: 0, max: 0, estimated: 0 };

  const midPrice = (cat.minPrice + cat.maxPrice) / 2;
  let baseMin = cat.minPrice * area;
  let baseMax = cat.maxPrice * area;
  let estimated = midPrice * area;

  let percentBonus = 0;
  let fixedBonus = 0;

  for (const q of cat.questions) {
    const answer = answers[q.id];
    if (!answer || answer === false || answer === 'good' || answer === '1' || answer === 'raw') continue;

    if (q.type === 'boolean' && answer === true) {
      if (q.priceImpact.type === 'percent') {
        percentBonus += q.priceImpact.value;
      } else if (q.priceImpact.type === 'fixed_per_m2') {
        fixedBonus += q.priceImpact.value * area;
      } else if (q.priceImpact.type === 'fixed_per_unit') {
        fixedBonus += q.priceImpact.value;
      }
    } else if (q.type === 'select') {
      const opt = q.options?.find(o => o.value === answer);
      if (opt?.priceImpact?.value) {
        percentBonus += opt.priceImpact.value;
      }
    }
  }

  const multiplier = 1 + percentBonus / 100;
  estimated = Math.round(estimated * multiplier + fixedBonus);
  baseMin = Math.round(baseMin * multiplier + fixedBonus * 0.8);
  baseMax = Math.round(baseMax * multiplier + fixedBonus * 1.2);

  return { min: baseMin, max: baseMax, estimated };
}

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || null;
}
