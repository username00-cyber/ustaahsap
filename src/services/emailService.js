/**
 * ─── Email Bildirim Servisi ───────────────────────────────────────────────────
 * EmailJS kullanır — backend gerekmez, tamamen frontend'de çalışır.
 * 
 * KURULUM (1 kez yapılır):
 * 1. https://emailjs.com → Ücretsiz hesap aç
 * 2. Email Services → Gmail veya Outlook bağla
 * 3. Email Templates → İki şablon oluştur (aşağıda açıklanmış)
 * 4. src/lib/emailConfig.js dosyasına KEY'leri gir
 */

// ─── Yapılandırma ────────────────────────────────────────────────────────────
// Bu değerleri emailjs.com'dan al ve .env dosyasına yaz:
// VITE_EMAILJS_SERVICE_ID=service_xxxxxx
// VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxx
// VITE_EMAILJS_TEMPLATE_OFFER=template_xxxxxx   (usta → müşteri: yeni teklif)
// VITE_EMAILJS_TEMPLATE_MESSAGE=template_xxxxxx (mesaj bildirimi)
// VITE_EMAILJS_TEMPLATE_ACCEPTED=template_xxxxxx (teklif kabul bildirimi)

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TEMPLATE_OFFER = import.meta.env.VITE_EMAILJS_TEMPLATE_OFFER;
const TEMPLATE_MESSAGE = import.meta.env.VITE_EMAILJS_TEMPLATE_MESSAGE;
const TEMPLATE_ACCEPTED = import.meta.env.VITE_EMAILJS_TEMPLATE_ACCEPTED;

const isConfigured = SERVICE_ID && PUBLIC_KEY;

// EmailJS dinamik yükle (CDN yerine npm paketi olmadığı için)
async function loadEmailJS() {
  if (window.emailjs) return window.emailjs;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      window.emailjs.init({ publicKey: PUBLIC_KEY });
      resolve(window.emailjs);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function sendEmail(templateId, params) {
  if (!isConfigured || !templateId) {
    return;
  }
  try {
    const ejs = await loadEmailJS();
    await ejs.send(SERVICE_ID, templateId, params);
  } catch (_) {
    // e-posta hataları ana akışı engellemesin
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const emailService = {
  /**
   * Müşteriye: Yeni teklif geldi
   * Template değişkenleri: to_name, to_email, usta_name, job_title, price, site_url
   */
  async notifyNewOffer({ customerEmail, customerName, ustaName, jobTitle, price }) {
    await sendEmail(TEMPLATE_OFFER, {
      to_email: customerEmail,
      to_name: customerName,
      usta_name: ustaName,
      job_title: jobTitle,
      price: `${Number(price).toLocaleString('tr-TR')} TL`,
      site_url: 'https://ustasec.vercel.app',
    });
  },

  /**
   * Alıcıya: Yeni mesaj geldi
   * Template değişkenleri: to_name, to_email, sender_name, preview, site_url
   */
  async notifyNewMessage({ receiverEmail, receiverName, senderName, messagePreview }) {
    await sendEmail(TEMPLATE_MESSAGE, {
      to_email: receiverEmail,
      to_name: receiverName,
      sender_name: senderName,
      preview: messagePreview?.substring(0, 100),
      site_url: 'https://ustasec.vercel.app',
    });
  },

  /**
   * Ustaya: Teklifi kabul edildi
   * Template değişkenleri: to_name, to_email, job_title, price, customer_name, site_url
   */
  async notifyOfferAccepted({ ustaEmail, ustaName, jobTitle, price, customerName }) {
    await sendEmail(TEMPLATE_ACCEPTED, {
      to_email: ustaEmail,
      to_name: ustaName,
      job_title: jobTitle,
      price: `${Number(price).toLocaleString('tr-TR')} TL`,
      customer_name: customerName,
      site_url: 'https://ustasec.vercel.app',
    });
  },
};
