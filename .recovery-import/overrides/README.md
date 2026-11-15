# YAPIGÜÇ - kurtarılan proje

15 Kasım 2026 tarihinde Netlify `golden-mousse-6377c5` projesinin yayımlanmış
`6af88d146bd0998f7c3c86ef` sürümünden kurtarıldı. Canlı site değiştirilmedi.

## Dosyalar

- `site/`: yayımlanmış HTML, CSS, JavaScript, görsel, video ve belgeler.
- `netlify.toml`: taşınabilir dağıtım yapılandırması. Eski bilgisayarın mutlak
  dizini yerine `publish = "site"` kullanır. 249 TOML yönlendirmesi ve 5 başlık
  kuralı korundu; `site/_redirects` içindeki 6 kural da korundu.
- `tools/preview.py`: Python 3.11+ ile ek paket gerektirmeyen yerel önizleme.

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

## Geliştirme ve yayın

Değişiklikleri `site/` içinde yapın. Önce yerelde, ardından mevcut projeye bağlı
bir Netlify taslak dağıtımında doğrulayın. Netlify CLI zaten kurulu ve oturum
açılmışsa `netlify deploy --dir site` taslak oluşturur. Komut çalıştırmadan önce
CLI'nin mevcut `golden-mousse-6377c5` projesine bağlı olduğunu doğrulayın.

Bu kurtarma sırasında GitHub'a kod gönderilmedi ve yeni Netlify dağıtımı
oluşturulmadı. Mevcut GitHub bağlantısı `trcayan/trcayan`; inceleme sırasında
`master` dalında yalnız `.gitignore` bulunuyordu.

Yerel `recovery/netlify-2026-11-15` dalı, mevcut GitHub `master` geçmişinden
başlatıldı. Eski başlangıç commit'i ve ignore kuralları korundu. Dal uzaktaki
depoya gönderilmedi; üretim dalı değiştirilmedi.

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
