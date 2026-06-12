# UstaAhşap 🪵

Ahşap işleri için müşteri-usta buluşma platformu. Müşteriler iş ilanı açar, ustalar teklif verir, pazarlık yapılır ve iş anlaşılır.

## Proje Hakkında

Parke, laminat, ahşap merdiven, mutfak dolabı gibi ağırlıklı olarak ahşap odaklı ev/iş yeri tadilatlarında müşteri ile usta arasındaki köprüyü kurmak için geliştirdiğim bir platform.

Şu an beta aşamasında, canlı deployment: [ustasec.vercel.app](https://ustasec.vercel.app)

## Özellikler

- **İlan Sistemi** – Müşteriler iş türü, konum ve bütçe belirterek ilan açar
- **Teklif & Pazarlık** – Ustalar fiyat teklifi verir, müşteri karşı teklif yapabilir (max 3 tur)
- **VIP Üyelik** – VIP müşterilerin ilanları sadece deneyimli ustalara (4★+ / 30+ iş veya VIP usta) açılır
- **Usta Profilleri** – Portfolyo, değerlendirmeler, rozetler
- **Mağaza Modülü** – Parke/ahşap malzeme satan dükkanlar ürün listeleyebilir
- **Gerçek Zamanlı Mesajlaşma** – Supabase Realtime ile
- **Topluluk** – Post paylaşımı, beğeni, yorum
- **SMS Doğrulama** – Kayıt sırasında telefon doğrulama (şu an test modunda)
- **Admin Paneli** – Kullanıcı, ilan ve teklif yönetimi

## Kullanılan Teknolojiler

- **Frontend:** React + Vite
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Email:** EmailJS
- **Deployment:** Vercel

## Kurulum

```bash
npm install
```

`.env.local` dosyası oluşturun:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_OFFER=...
VITE_EMAILJS_TEMPLATE_ACCEPT=...
VITE_EMAILJS_PUBLIC_KEY=...
```

```bash
npm run dev
```

## Lisans

MIT
