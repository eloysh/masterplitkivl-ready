import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'
import { Phone, MessageCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Layers, Calculator, Lock, Save } from 'lucide-react'

const DOMAIN = 'masterplitkivl.ru'
const PHONE_DISPLAY = '+7 951 005‑00‑02'
const PHONE_TEL = '+79510050002'
const WHATSAPP = 'https://wa.me/79510050002'

// Fallback initial prices (editable by admin)
const initialPrices = {
  base: {
    bathroom: { tile: 1800, porcelain: 1800 },
    backsplash: { tile: 1800, porcelain: 1800 },
    floor: { tile: 1800, porcelain: 1800 },
  },
  extras: {
    demolitionPerM2: 200,
    waterproofingPerM2: 250,
    prepPerM2: 140,
    adhesivePerM2: 220,
    groutPerM2: 130,
    miterPerLm: 250,
    siliconePerLm: 90,
    packageDiscountPct: 5,
  },
  coefficients: {
    normal: 1.0,
    diagonal: 1.1,
    largeFormat: 1.15,
    mosaic: 1.2,
  },
}

type AreaType = 'bathroom' | 'backsplash' | 'floor'
type MaterialType = 'tile' | 'porcelain'
type Complexity = 'normal' | 'diagonal' | 'largeFormat' | 'mosaic'

const galleryImages: { src: string; alt: string }[] = [
  { src: '/images/photo1.jpg', alt: 'Санузел — керамогранит, ванна' },
  { src: '/images/photo2.jpg', alt: 'Открытая полка — керамогранит' },
  { src: '/images/photo3.jpg', alt: 'Открытая полка — керамогранит' },
  { src: '/images/photo4.jpg', alt: 'Открытая полка — керамогранит' },
  { src: '/images/photo5.jpg', alt: 'Санузел под ключ' },
  { src: '/images/photo6.jpg', alt: 'Санузел под ключ' },
  { src: '/images/photo7.jpg', alt: 'Ванная комната — керамогранит, ванна' },
  { src: '/images/photo8.jpg', alt: 'Ванная комната — керамогранит, душ' },
  { src: '/images/photo9.jpg', alt: 'Санузел — керамогранит, ванна' },
  { src: '/images/photo10.jpg', alt: 'Пол — крупный формат 60×120' },
  { src: '/images/photo12.jpg', alt: 'Санузел — скрытая ниша' },
  { src: '/images/photo13.jpg', alt: 'Фартук кухни — белый кабанчикКухня — фартук и столешница' },
  { src: '/images/photo14.jpg', alt: 'Фартук кухни — белый кабанчик' },
  { src: '/images/photo15.jpg', alt: 'Фартук кухни — белый кабанчикДекоративные швы и примыкания' },
  { src: '/images/photo16.jpg', alt: 'Фартук кухни — белый кабанчик' },
  { src: '/images/photo22.jpg', alt: 'Душ — линейный трап, стекло' },
]

const tileBg: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(255,255,255,.06) 0 1px, transparent 1px 56px), ' +
    'repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px 56px)',
  backgroundSize: '56px 56px, 56px 56px'
}

function WhatsAppButton({ label, message }: { label?: string; message?: string }) {
  const href = useMemo(() => {
    const query = message ? `?text=${encodeURIComponent(message)}` : ''
    return `${WHATSAPP}${query}`
  }, [message])
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition focus:outline-none focus:ring text-white bg-emerald-600 hover:bg-emerald-700"
    >
      <MessageCircle className="w-5 h-5" />
      <span>{label ?? 'Написать в WhatsApp'}</span>
    </a>
  )
}

// --- Admin helpers (basic-auth token in localStorage)
function getAdminToken() {
  return localStorage.getItem('adminToken') || ''
}

function setAdminToken(token: string) {
  localStorage.setItem('adminToken', token)
}

export default function App() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const [prices, setPrices] = useState<any>(initialPrices)
  const [adminOpen, setAdminOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  // calculator inputs
  const [areaType, setAreaType] = useState<AreaType>('bathroom')
  const [material, setMaterial] = useState<MaterialType>('tile')
  const [area, setArea] = useState<number>(6)
  const [complexity, setComplexity] = useState<Complexity>('normal')
  const [turnkey, setTurnkey] = useState<boolean>(true)
  const [withDemolition, setWithDemolition] = useState<boolean>(false)
  const [withPrep, setWithPrep] = useState<boolean>(true)
  const [withAdhesive, setWithAdhesive] = useState<boolean>(true)
  const [withGrout, setWithGrout] = useState<boolean>(true)
  const [withWaterproofing, setWithWaterproofing] = useState<boolean>(true)
  const [waterproofingArea, setWaterproofingArea] = useState<number>(6)
  const [linkWaterproofingToArea, setLinkWaterproofingToArea] = useState<boolean>(true)
  const [miterLm, setMiterLm] = useState<number>(0)
  const [siliconeLm, setSiliconeLm] = useState<number>(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        setAdminOpen(v => !v)
      }
      if (!lightboxOpen) return
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i + 1) % galleryImages.length)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i - 1 + galleryImages.length) % galleryImages.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  // Fetch prices from API (if available on Vercel)
  useEffect(() => {
    fetch('/api/prices')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(json => setPrices(json))
      .catch(() => setPrices(initialPrices))
  }, [])

  useEffect(() => {
    if (linkWaterproofingToArea) setWaterproofingArea(area)
  }, [area, linkWaterproofingToArea])

  const baseRate = prices.base[areaType][material]
  const coeff = prices.coefficients[complexity]
  const baseCost = (area || 0) * baseRate * coeff
  const demolitionCost = withDemolition ? (area || 0) * prices.extras.demolitionPerM2 : 0
  const prepCost = withPrep ? (area || 0) * prices.extras.prepPerM2 : 0
  const adhesiveCost = withAdhesive ? (area || 0) * prices.extras.adhesivePerM2 : 0
  const groutCost = withGrout ? (area || 0) * prices.extras.groutPerM2 : 0
  const waterproofingCost = withWaterproofing ? (linkWaterproofingToArea ? (area || 0) : (waterproofingArea || 0)) * prices.extras.waterproofingPerM2 : 0
  const miterCost = (miterLm || 0) * prices.extras.miterPerLm
  const siliconeCost = (siliconeLm || 0) * prices.extras.siliconePerLm
  const subtotal = baseCost + demolitionCost + prepCost + adhesiveCost + groutCost + waterproofingCost + miterCost + siliconeCost
  const discount = turnkey ? Math.round((subtotal * prices.extras.packageDiscountPct) / 100) : 0
  const total = Math.max(0, subtotal - discount)

  const calcMsg =
    `Здравствуйте! Хочу рассчитать работы: ${areaType === "bathroom" ? "Санузел" : areaType === "backsplash" ? "Фартук кухни" : "Пол"}. ` +
    `Материал: ${material === "tile" ? "кафель" : "керамогранит"}. Площадь: ${area} м².\n` +
    `Сложность: ${ { normal: "стандарт", diagonal: "диагональ (+10%)", largeFormat: "крупный формат (+15%)", mosaic: "мозаика/рисунок (+20%)" }[complexity] }.\n` +
    `${withDemolition ? `Демонтаж: да (≈${prices.extras.demolitionPerM2} ₽/м²).\n` : ""}` +
    `${withPrep ? `Подготовка: да (≈${prices.extras.prepPerM2} ₽/м²).\n` : ""}` +
    `${withAdhesive ? `Клей/расходники: да (≈${prices.extras.adhesivePerM2} ₽/м²).\n` : ""}` +
    `${withGrout ? `Затирка: да (≈${prices.extras.groutPerM2} ₽/м²).\n` : ""}` +
    `${withWaterproofing ? `Гидроизоляция: ${linkWaterproofingToArea ? area : waterproofingArea} м² (≈${prices.extras.waterproofingPerM2} ₽/м²).\n` : ""}` +
    `${miterLm ? `Запил 45°: ${miterLm} пог. м (≈${prices.extras.miterPerLm} ₽/п.м).\n` : ""}` +
    `${siliconeLm ? `Силикон: ${siliconeLm} пог. м (≈${prices.extras.siliconePerLm} ₽/п.м).\n` : ""}` +
    `${turnkey ? `Пакет «под ключ»: скидка ${prices.extras.packageDiscountPct}%.\n` : ""}` +
    `Предварительная сумма: ~${total.toLocaleString("ru-RU")} ₽. Подскажите ближайшую дату выезда на замер?`

  async function adminLogin() {
    const token = 'Basic ' + btoa(`${login}:${password}`)
    try {
      const r = await fetch('/api/prices', { headers: { 'Authorization': token } })
      if (r.ok) {
        setIsAdmin(true)
        setAdminToken(token)
        const json = await r.json()
        setPrices(json)
        alert('Вход выполнен')
      } else {
        alert('Неверный логин или пароль')
      }
    } catch {
      alert('Ошибка сети')
    }
  }

  async function savePrices() {
    const token = getAdminToken()
    if (!token) return alert('Нет доступа')
    try {
      const r = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(prices)
      })
      if (r.ok) alert('Цены сохранены')
      else alert('Ошибка сохранения')
    } catch (e) {
      alert('Ошибка сохранения')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100">
      <Helmet>
        <html lang="ru" />
        <title>Плиточник Владивосток, Артём — Гуренко Евгений | Укладка плитки и керамогранита</title>
        <meta name="description" content="Плиточные работы во Владивостоке и Артёме: санузел под ключ, фартук кухни, пол. Калькулятор цены. WhatsApp +7 951 005-00-02." />
        <link rel="canonical" href={`https://${DOMAIN}/`} />
        <meta name="robots" content="index,follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Гуренко Евгений — плиточник",
          url: `https://${DOMAIN}/`,
        })}</script>
      </Helmet>

      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={tileBg}
        animate={{ backgroundPosition: ['0px 0px, 0px 0px', '56px 56px, 56px 56px'] }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-30"
        initial={{ opacity: 0.14 }}
        animate={{ opacity: [0.14, 0.22, 0.14] }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          background:
            'radial-gradient(800px 520px at 10% -10%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(800px 520px at 110% 110%, rgba(34,211,238,0.12), transparent 60%)'
        }}
      />

      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80 bg-slate-950/90 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -8, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
              className="w-9 h-9 rounded-2xl bg-emerald-500/25 grid place-content-center shadow-inner"
            >
              <Layers className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <div>
              <div className="text-xs sm:text-sm uppercase tracking-widest text-emerald-400">{DOMAIN}</div>
              <div className="font-semibold text-base sm:text-lg">Гуренко Евгений — плиточник</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${PHONE_TEL}`}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 transition bg-slate-900"
            >
              <Phone className="w-4 h-4" />
              <span>{PHONE_DISPLAY}</span>
            </a>
            <WhatsAppButton />
          </div>
        </div>
      </header>

      <section className="relative pt-10 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14 grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
              Плиточные работы во Владивостоке и Артёме
              <span className="block text-emerald-400">качественно, в срок, под ключ</span>
            </h1>
            <p className="text-slate-200 text-base sm:text-lg">
              Укладка плитки и керамогранита: санузлы, фартуки кухонь, полы. Подготовка основания, гидроизоляция, затирка, запил под 45°, аккуратные примыкания.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <WhatsAppButton label="Рассчитать и записаться" message={calcMsg} />
              <a
                href={`tel:${PHONE_TEL}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 hover:border-white/30 transition bg-slate-900"
              >
                <Phone className="w-5 h-5" /> Позвонить
              </a>
            </div>
            <div className="text-sm text-slate-300">
              Базовая цена укладки: <span className="text-white font-medium">от 1 800 ₽/м²</span>. Итог после замера.
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl bg-slate-950/95"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              <h2 className="text-2xl font-bold">Калькулятор</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="grid grid-cols-3 gap-2">
                {(['bathroom', 'backsplash', 'floor'] as const).map(k => (
                  <button key={k} onClick={() => setAreaType(k)} className={`px-3 py-2 rounded-xl border ${areaType === k ? 'border-emerald-400 bg-emerald-400/10':'border-white/15'}`}>
                    {k==='bathroom'?'Санузел':k==='backsplash'?'Фартук':'Пол'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['tile', 'porcelain'] as const).map(k => (
                  <button key={k} onClick={() => setMaterial(k)} className={`px-3 py-2 rounded-xl border ${material === k ? 'border-emerald-400 bg-emerald-400/10':'border-white/15'}`}>
                    {k==='tile'?'Кафель':'Керамогранит'}
                  </button>
                ))}
              </div>

              <label className="block text-sm">
                Площадь, м²
                <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 mt-1" value={area} onChange={e=>setArea(Number(e.target.value||0))} />
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['normal','diagonal','largeFormat','mosaic'] as const).map(k => (
                  <button key={k} onClick={() => setComplexity(k)} className={`px-3 py-2 rounded-xl border ${complexity === k ? 'border-emerald-400 bg-emerald-400/10':'border-white/15'}`}>
                    {k==='normal'?'Стандарт':k==='diagonal'?'Диагональ':k==='largeFormat'?'Крупный формат':'Мозаика'}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={turnkey} onChange={e=>setTurnkey(e.target.checked)} /><span>Санузел под ключ (скидка {prices.extras.packageDiscountPct}%)</span></label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withDemolition} onChange={e=>setWithDemolition(e.target.checked)} /><span>Демонтаж</span></label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withPrep} onChange={e=>setWithPrep(e.target.checked)} /><span>Подготовка/выравнивание</span></label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withAdhesive} onChange={e=>setWithAdhesive(e.target.checked)} /><span>Клей и расходники</span></label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withGrout} onChange={e=>setWithGrout(e.target.checked)} /><span>Затирка</span></label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={withWaterproofing} onChange={e=>setWithWaterproofing(e.target.checked)} /><span>Гидроизоляция</span></label>
                {withWaterproofing && (
                  <label className="inline-flex items-center gap-2"><input type="checkbox" className="accent-emerald-500 w-4 h-4" checked={linkWaterproofingToArea} onChange={e=>setLinkWaterproofingToArea(e.target.checked)} /><span>= площади</span></label>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block text-sm">
                  Запил 45°, пог. м
                  <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 mt-1" value={miterLm} onChange={e=>setMiterLm(Number(e.target.value||0))} />
                </label>
                <label className="block text-sm">
                  Силикон/примыкания, пог. м
                  <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 mt-1" value={siliconeLm} onChange={e=>setSiliconeLm(Number(e.target.value||0))} />
                </label>
              </div>

              {withWaterproofing && !linkWaterproofingToArea && (
                <label className="block text-sm">
                  Гидроизоляция — площадь, м²
                  <input type="number" inputMode="decimal" min={0} step={0.1} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 mt-1" value={waterproofingArea} onChange={e=>setWaterproofingArea(Number(e.target.value||0))} />
                </label>
              )}

              <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950 p-4">
                <div className="text-sm text-slate-300">Предварительный расчёт</div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <ul className="space-y-1">
                    <li className="flex justify-between gap-3"><span>База (×{coeff.toFixed(2)})</span><span>{Math.round(baseCost).toLocaleString('ru-RU')} ₽</span></li>
                    {withDemolition && <li className="flex justify-between gap-3"><span>Демонтаж</span><span>{Math.round(demolitionCost).toLocaleString('ru-RU')} ₽</span></li>}
                    {withPrep && <li className="flex justify-between gap-3"><span>Подготовка</span><span>{Math.round(prepCost).toLocaleString('ru-RU')} ₽</span></li>}
                    {withAdhesive && <li className="flex justify-between gap-3"><span>Клей/расходники</span><span>{Math.round(adhesiveCost).toLocaleString('ru-RU')} ₽</span></li>}
                  </ul>
                  <ul className="space-y-1">
                    {withGrout && <li className="flex justify-between gap-3"><span>Затирка</span><span>{Math.round(groutCost).toLocaleString('ru-RU')} ₽</span></li>}
                    {withWaterproofing && <li className="flex justify_between gap-3"><span>Гидроизоляция</span><span>{Math.round(waterproofingCost).toLocaleString('ru-RU')} ₽</span></li>}
                    {miterLm > 0 && <li className="flex justify-between gap-3"><span>Запил 45°</span><span>{Math.round(miterCost).toLocaleString('ru-RU')} ₽</span></li>}
                    {siliconeLm > 0 && <li className="flex justify-between gap-3"><span>Силикон</span><span>{Math.round(siliconeCost).toLocaleString('ru-RU')} ₽</span></li>}
                  </ul>
                </div>
                {turnkey && <div className="flex justify-between gap-3 text-sm mt-2 text-emerald-300"><span>Скидка «под ключ»</span><span>−{discount.toLocaleString('ru-RU')} ₽</span></div>}
                <div className="text-3xl font-extrabold mt-2">{total.toLocaleString('ru-RU')} ₽</div>
                <div className="text-xs text-slate-400 mt-1">Без материалов (если не отмечены). Итог после замера и раскладки.</div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <WhatsAppButton label="Отправить расчёт в WhatsApp" message={calcMsg} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl sm:text-3xl font-bold drop-shadow">Галерея выполненных работ</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => { setLightboxIndex(i); setLightboxOpen(true) }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full h-full object-cover group-hover:scale-[1.03] transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                <div className="absolute bottom-2 left-2 text-[11px] sm:text-xs text-slate-200 drop-shadow">{img.alt}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 grid place-items-center p-4" role="dialog" aria-modal="true">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 focus:outline-none"
            aria-label="Закрыть"
          >
            ✕
          </button>
          <div className="relative max-w-5xl w-full">
            <img
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].alt}
              className="w-full h-auto rounded-2xl border border-white/10"
            />
            <div className="absolute inset-0 flex items-center justify-between px-2">
              <button
                onClick={() => setLightboxIndex(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                aria-label="Назад"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setLightboxIndex(i => (i + 1) % galleryImages.length)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20"
                aria-label="Вперёд"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 py-8 text-sm text-slate-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} {DOMAIN}</div>
          <div className="flex items-center gap-3">
            <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center gap-2 underline decoration-dotted">
              <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
            </a>
            <WhatsAppButton label="WhatsApp" />
          </div>
        </div>
      </footer>

      {adminOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900 p-4 sm:p-6">
            {!isAdmin ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <div className="text-lg font-semibold">Вход администратора</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block text-sm">
                    Логин
                    <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 mt-1" value={login} onChange={e=>setLogin(e.target.value)} />
                  </label>
                  <label className="block text-sm">
                    Пароль
                    <input type="password" className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 mt-1" value={password} onChange={e=>setPassword(e.target.value)} />
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={adminLogin} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Lock className="w-4 h-4" /> Войти
                  </button>
                  <button onClick={()=>setAdminOpen(false)} className="px-4 py-2 rounded-xl border border-white/15">Закрыть</button>
                </div>
                <div className="text-xs text-slate-400 mt-2">Подсказка: нажми Ctrl+Shift+A чтобы открыть это окно</div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-400" />
                    <div className="text-lg font-semibold">Настройка цен</div>
                  </div>
                  <button onClick={savePrices} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4" /> Сохранить
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm max-h-[60vh] overflow-auto pr-1">
                  {(['bathroom','backsplash','floor'] as const).map((k) => (
                    <div key={k} className="rounded-xl border border-white/10 p-3 bg-slate-950">
                      <div className="font-medium mb-2">{k==='bathroom'?'Санузел':k==='backsplash'?'Фартук':'Пол'}</div>
                      <label className="block mb-2">Кафель ₽/м²
                        <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={prices.base[k].tile} onChange={(e)=>setPrices((p:any)=>({...p, base:{...p.base, [k]:{...p.base[k], tile:Number(e.target.value||0)}}}))} />
                      </label>
                      <label className="block">Керамогранит ₽/м²
                        <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={prices.base[k].porcelain} onChange={(e)=>setPrices((p:any)=>({...p, base:{...p.base, [k]:{...p.base[k], porcelain:Number(e.target.value||0)}}}))} />
                      </label>
                    </div>
                  ))}
                  <div className="rounded-xl border border-white/10 p-3 bg-slate-950">
                    <div className="font-medium mb-2">Доп. работы</div>
                    {Object.entries(prices.extras).map(([key, val]: any) => (
                      <label key={key} className="block mb-2">{key}
                        <input type="number" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={val} onChange={(e)=>setPrices((p:any)=>({...p, extras:{...p.extras, [key]:Number(e.target.value||0)}}))} />
                      </label>
                    ))}
                  </div>
                  <div className="rounded-xl border border-white/10 p-3 bg-slate-950">
                    <div className="font-medium mb-2">Коэффициенты</div>
                    {Object.entries(prices.coefficients).map(([key, val]: any) => (
                      <label key={key} className="block mb-2">{key}
                        <input type="number" step={0.01} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2" value={val} onChange={(e)=>setPrices((p:any)=>({...p, coefficients:{...p.coefficients, [key]:Number(e.target.value||0)}}))} />
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex gap-2 justify-end">
                  <button onClick={()=>setAdminOpen(false)} className="px-4 py-2 rounded-xl border border-white/15">Закрыть</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
