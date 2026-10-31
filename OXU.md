# Yazışma — Qurulma Təlimatı

Sadə, profil şəkilsiz yazışma proqramı. Hər kəsin öz ID-si, adı və bio-su var.
Bu təlimatla 30-40 dəqiqəyə işlək veb/tətbiq versiyasını qura bilərsən.

## 1-ci addım: Supabase (pulsuz verilənlər bazası)

1. https://supabase.com saytına get, pulsuz hesab aç.
2. "New project" düyməsinə bas, ad ver (məs: yazisma), şifrə qoy, region seç.
3. Layihə hazır olanda sol menyudan **SQL Editor**-a keç.
4. Bu qovluqdakı `supabase_schema.sql` faylının içini kopyala, SQL Editor-a yapışdır, **Run** bas.
5. Sol menyudan **Project Settings → API**-ya keç. Orada görəcəksən:
   - **Project URL** → bunu kopyala
   - **anon public key** → bunu da kopyala

## 2-ci addım: Kodu lokal işə sal (sınamaq üçün, məcburi deyil)

Kompüterində Node.js (18+) quraşdırılmış olmalıdır.

```bash
cd yazisma
npm install
cp .env.local.example .env.local
```

`.env.local` faylını aç, Supabase-dən aldığın URL və key-i yapışdır:

```
NEXT_PUBLIC_SUPABASE_URL=https://sənin-layihən.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sənin-key-in
```

Sonra:

```bash
npm run dev
```

http://localhost:3000 ünvanında aç, işlədiyini yoxla.

## 3-cü addım: Vercel-ə yükləmək (pulsuz sayt)

1. Bu qovluğu GitHub-a yüklə (yeni repo yarat, kodu push et).
   - GitHub bilmirsənsə: https://github.com/new ilə repo yarat, sonra:
     ```bash
     git init
     git add .
     git commit -m "ilk versiya"
     git remote add origin REPO-LINKI
     git push -u origin main
     ```
2. https://vercel.com saytına get, GitHub hesabınla daxil ol.
3. **Add New → Project**, GitHub repo-nu seç, **Import** bas.
4. "Environment Variables" bölməsində iki dəyişəni əlavə et:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy** bas. 1-2 dəqiqəyə saytın linki hazır olacaq (məs: `yazisma.vercel.app`).

## 4-cü addım: Telefonda "tətbiq" kimi quraşdırmaq

Mağazaya yükləmədən, birbaşa brauzerdən:

- **iPhone (Safari):** Linki aç → paylaş düyməsi → "Add to Home Screen" (Əsas ekrana əlavə et)
- **Android (Chrome):** Linki aç → sağ üstdəki üç nöqtə → "Add to Home screen" / "Install app"

Beləcə ikon telefonun əsas ekranında görünür, tam ekranda, tətbiq kimi açılır — tamamilə pulsuz, App Store/Play Store-a ehtiyac yoxdur.

## Necə işləyir?

- Hər kəs ilk dəfə girəndə özünə unikal bir **ID** seçir (məs: `vusal_c`), adını və istəsə bio yazır, 4 rəqəmli şəxsi kod təyin edir.
- Həmin kod başqa telefondan eyni profillə girmək üçün lazımdır (parol əvəzi, sadə saxlanılıb).
- Giriş etdikdən sonra bütün qeydiyyatdan keçmiş insanların siyahısı görünür, üstünə basıb yazışmaq olur.
- Mesajlar **real-time** çatır (Supabase Realtime vasitəsilə) — səhifəni yeniləmək lazım deyil.

## Qeyd

Bu sistemdə təhlükəsizlik minimaldır (tanışlar arasında istifadə üçün nəzərdə tutulub, 4 rəqəmli kod əsas qorunmadır). İctimai/geniş istifadə üçün əlavə təhlükəsizlik tədbirləri (əsl parol, email təsdiqi və s.) lazımdır.
