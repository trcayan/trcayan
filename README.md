# YAPIGÜÇ - kurtarılan proje

15 Kasım 2026 tarihinde Netlify `golden-mousse-6377c5` projesinin yayımlanmış
`6af88d146bd0998f7c3c86ef` sürümünden kurtarıldı. Canlı site değiştirilmedi.

## Dosyalar

- `site/`: yayımlanmış HTML, CSS, JavaScript, görsel, video ve belgeler.
- `netlify.toml`: taşınabilir dağıtım yapılandırması. Eski bilgisayarın mutlak
  dizini yerine `publish = "dist"` kullanır. 249 TOML yönlendirmesi ve 5 başlık
  kuralı korundu; `site/_redirects` içindeki 6 kural da korundu.
- `tools/preview.py`: Python 3.11+ ile ek paket gerektirmeyen yerel önizleme.
- `tools/build.mjs`: Node.js ile ek paket gerektirmeyen derleme. `site/`
  kaynaklarını `dist/` içine kopyalar; üretim bağlamında içeriği değiştirmez.
  Deploy Preview ve branch deploy ortamlarında indekslemeyi ve form gönderimini
  kapatan bir önizleme katmanı ekler. Kaynak dosyaları değiştirmez.

Özgün `netlify.toml`, değiştirilmemiş tam yedekte bulunur. Çalışma kopyasında
yapılandırma dosyası web kökünün dışına alındı. Bu sayede bilgisayar yolu tekrar
yayınlanmaz; içerik dosyaları özgün yedekle aynı kalır.

## Yerel önizleme

Proje dizininde:

```text
python tools/preview.py
```

`http://127.0.0.1:8765/` adresini açın. Temiz URL'ler ve doğrudan yönlendirmeler
desteklenir. Önizleme arama motorlarına `noindex, nofollow` başlığı gönderir.
Formlar gönderilmez; sunucu API'leri taklit edilmez. Sunucuyu Ctrl+C ile kapatın.

Netlify önizleme davranışını PowerShell'de yerelde doğrulamak için:

```powershell
$env:CONTEXT='deploy-preview'
node tools/build.mjs
python tools/preview.py --built
```

Üretim çıktısını hazırlamak için `CONTEXT` değerini `production` yapıp yeniden
derleyin. `dist/` geçicidir ve Git'e alınmaz. Netlify bağlamı otomatik belirler.

## Geliştirme ve yayın

Değişiklikleri `site/` içinde yapın. Önce yerelde, ardından mevcut projeye bağlı
bir Netlify taslak dağıtımında doğrulayın. Netlify CLI zaten kurulu ve oturum
açılmışsa önce önizleme bağlamında derleyip `netlify deploy --dir dist` ile taslak
oluşturun. Komut çalıştırmadan önce
CLI'nin mevcut `golden-mousse-6377c5` projesine bağlı olduğunu doğrulayın.

GitHub deposu: https://github.com/trcayan/trcayan

Geliştirme dalı: `recovery/netlify-2026-11-15`. Mevcut `master` geçmişinden
başlatıldı; eski başlangıç commit'i ve ignore kuralları korundu.

Taslak PR: https://github.com/trcayan/trcayan/pull/1

Netlify önizleme: https://deploy-preview-1--golden-mousse-6377c5.netlify.app/

Üretim dalı `master` olarak kalır. Önizleme değişiklikleri bu dalda incelenir;
canlıya yayın için PR'ın ayrıca değerlendirilmesi gerekir.

## Yedeğin kapsamı

Tam ZIP ve SHA-256 envanteri bu proje klasörünün yanında bulunur. ZIP, 2.544
özgün dağıtım dosyasını ve ek bir `BACKUP-MANIFEST.json` kaydını içerir.
Yönlendirilen 22 HTML dosyası, hedef sayfanın kopyası yerine Netlify dosya
tarayıcısından alınan özgün dosyalarla kurtarıldı. Büyük video doğrulanmış
HTTP byte range parçalarıyla tamamlandı.

Bu bir yayımlanmış dosya yedeğidir. Hesap parolaları, ortam değişkenlerinin
gizli değerleri, form kayıtları, dış hizmetlerdeki dosyalar ve dağıtımda
bulunmayan özgün derleme kaynakları bu arşive dahil değildir. İncelenen sürümde
0 Netlify Function görünüyordu. Eski AFAD görevinin önizlemesi daha eski bir
ana sayfaya dayanıyordu; doğrudan üretime taşınmamalıdır.
