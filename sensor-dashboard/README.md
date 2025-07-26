# Sensor Dashboard

## Kurulum ve Çalıştırma

1. **Node.js 18.x veya üzeri kurulu olmalı.**
   - [Node.js İndir](https://nodejs.org/)

2. **Projeyi klonlayın:**
   ```bash
   git clone https://github.com/kullaniciadi/sensor-dashboard.git
   cd sensor-dashboard
   ```

3. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

4. **(Varsa) .env dosyasını oluşturun:**
   - Eğer projede .env dosyası gerekiyorsa, aşağıdaki komutla örnek dosyayı kopyalayın:
   ```bash
   cp .env.example .env
   ```
   - Gerekli ortam değişkenlerini doldurun.

5. **Projeyi başlatın:**
   ```bash
   npm start
   ```

## Notlar
- `node_modules`, `.env`, `build` gibi klasörler repoya yüklenmez, otomatik oluşur.
- Eğer `package.json` içinde `proxy` alanı varsa, sadece geliştirme ortamında çalışır. Başka bir kullanıcıda backend yoksa hata verebilir.
- Hata alırsanız terminal çıktısını paylaşın.
- Bağımlılık sürümleri sabitlenmiştir, farklı sürüm kullanmayın.

## Sık Karşılaşılan Hatalar ve Çözümleri
- **Bağımlılık Hatası:**
  - `npm install` komutunu tekrar çalıştırın.
- **Proxy Hatası:**
  - `package.json` içindeki `proxy` alanını kaldırabilir veya kendi backend adresinizi yazabilirsiniz.
- **Çalışmayan Script:**
  - Node.js sürümünüzü kontrol edin.

## Katkı ve İletişim
- Sorun yaşarsanız GitHub Issues üzerinden bildirin.
