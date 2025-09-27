# Video Kiosk Uygulaması

Bu proje, iPhone kiosk sistemi için geliştirilmiş bir video kayıt ve paylaşım uygulamasıdır.

## Özellikler

- **Tablet Kontrol Uygulaması**: Video kayıt başlatma/durdurma kontrolü
- **iPhone Kiosk Uygulaması**: Video kayıt alma ve gerçek zamanlı iletişim
- **QR Kod Sistemi**: Video indirme için QR kod oluşturma
- **Gerçek Zamanlı İletişim**: Socket.io ile anlık veri alışverişi
- **Video Yönetimi**: Otomatik video yükleme ve indirme

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Backend'i başlatın:**
```bash
cd backend
npm install
npm start
```

3. **Frontend'i başlatın:**
```bash
cd frontend
npm install
npm start
```

4. **Tüm uygulamayı aynı anda başlatın:**
```bash
npm start
```

## Kullanım

### 1. Tablet Kontrol Uygulaması
- URL: `http://localhost:3000`
- Video kayıt başlatma/durdurma kontrolü
- QR kod görüntüleme
- Gerçek zamanlı durum takibi

### 2. iPhone Kiosk Uygulaması
- URL: `http://localhost:3000/kiosk`
- Otomatik video kayıt alma
- 15 saniye süre sınırı
- Gerçek zamanlı komut alma

### 3. Video İndirme Sayfası
- URL: `http://localhost:3000/download/{sessionId}`
- QR kod okutma sonrası video indirme
- Video bilgileri görüntüleme

## API Endpoints

### Backend API (Port: 5000)

- `GET /api/health` - Sistem durumu
- `POST /api/start-recording` - Video kayıt başlatma
- `POST /api/stop-recording/:sessionId` - Video kayıt durdurma
- `GET /api/download/:sessionId` - Video indirme
- `GET /api/session/:sessionId` - Oturum bilgileri

## Teknolojiler

### Backend
- Node.js
- Express.js
- Socket.io
- Multer (dosya yükleme)
- QRCode (QR kod oluşturma)
- CORS

### Frontend
- React
- React Router
- Socket.io Client
- CSS3 (modern tasarım)

## Proje Yapısı

```
video-kiosk-app/
├── backend/
│   ├── index.js          # Ana backend dosyası
│   ├── package.json      # Backend bağımlılıkları
│   └── uploads/          # Video dosyaları (otomatik oluşur)
├── frontend/
│   ├── src/
│   │   ├── App.js        # Ana routing
│   │   ├── ControllerApp.js    # Tablet kontrol uygulaması
│   │   ├── KioskApp.js         # iPhone kiosk uygulaması
│   │   ├── DownloadPage.js     # Video indirme sayfası
│   │   └── *.css         # Stil dosyaları
│   └── package.json      # Frontend bağımlılıkları
└── package.json          # Ana proje dosyası
```

## Kullanım Senaryosu

1. **Kurulum**: iPhone'u kiosk içine yerleştirin
2. **Kontrol**: Tablette kontrol uygulamasını açın
3. **Kayıt**: "START RECORDING" butonuna basın
4. **Otomatik**: iPhone otomatik olarak 15 saniye video kaydeder
5. **QR Kod**: Kayıt tamamlandığında QR kod oluşur
6. **İndirme**: QR kodu okutan kişi videoyu indirebilir

## Güvenlik Notları

- Video dosyaları 24 saat sonra otomatik silinir
- CORS ayarları yapılandırılmıştır
- Dosya boyutu sınırı: 100MB
- Sadece video dosyaları kabul edilir

## Geliştirme

### Yeni Özellik Ekleme
1. Backend API endpoint'leri `backend/index.js` dosyasında
2. Frontend bileşenleri `frontend/src/` klasöründe
3. Stil dosyaları ilgili bileşenlerle birlikte

### Debug
- Backend logları: Terminal çıktısı
- Frontend logları: Browser console
- Socket.io: Browser Network tab

## Sorun Giderme

### Yaygın Sorunlar

1. **Port çakışması**: 3000 ve 5000 portlarının boş olduğundan emin olun
2. **CORS hatası**: Backend CORS ayarlarını kontrol edin
3. **Video yükleme hatası**: Dosya boyutu ve format kontrolü
4. **Socket bağlantı hatası**: Backend'in çalıştığından emin olun

### Log Kontrolü
```bash
# Backend logları
cd backend && npm start

# Frontend logları
cd frontend && npm start
```
