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
  kaynaklarını `dist/` içine kopyalar; blog ve rehberlerin ortak okuma düzenini ve metadata eşleşmelerini hazırlar.
  Deploy Preview ve branch deploy ortamlarında indekslemeyi ve form gönderimini
  kapatan bir önizleme katmanı ekler. Kaynak dosyaları değiştirmez.

Özgün `netlify.toml`, değiştirilmemiş tam yedekte bulunur. Çalışma kopyasında
yapılandırma dosyası web kökünün dışına alındı. Bu sayede bilgisayar yolu tekrar
yayınlanmaz; özgün içerik tam yedekte korunur. Geliştirme değişiklikleri aşağıda belirtilmiştir.

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


## Önizleme iyileştirmeleri · 16 Kasım 2026

- Ana sayfada gerçek saha görseli, daha kısa giriş ve görünür iletişim düğmesi;
  hizmetler, referanslar ve kaynaklar için sadeleştirilmiş akış. Üç boyutlu
  modeller kendi bölümüne taşındı; eski bölüm bağlantıları korundu.
- Mobil başlık küçültüldü; menü kullanılabilir ekran yüksekliğine uyar ve
  bağlantıya dokunulduğunda kapanır. Uzun giriş metinleri ve form alanları
  okunabilir boyutta gösterilir.
- Referanslarda başlık ve açıklama öne, blogda arşiv ve arama öne alındı.
- 81 il için Türkçe karakterleri destekleyen arama, sonuç sayısı ve boş sonuç
  açıklaması eklendi. Ek makale dizini açılır bölümde korundu.
- Zorunlu yapı kullanımı alanındaki çelişkili “isteğe bağlı” etiketi düzeltildi.

Doğrulama: 1.237 HTML sayfasının iç bağlantı, dosya ve bölüm bağlantısı
kontrolü; 1440 ve 390 pikselde 11 ana sayfa/akış, ayrıca 320 pikselde ana
sayfa, talep formu ve il dizini kontrolü. Yatay sayfa taşması veya yüklenemeyen
öncelikli görsel gözlenmedi. İl ve blog aramaları tarayıcıda denendi. Önizlemede
form gönderimi ve indeksleme koruması sürer; üretim dalına birleştirme yapılmaz.


## Hizmetler ve proje galerisi · 16 Kasım 2026

Ana slogan “Proje, Onarım ve Güçlendirmede YAPIGÜÇ” olarak düzenlendi.
16 hizmet sayfasında ortak lacivert giriş, altın iletişim düğmesi, bölüm
bağlantıları ve tutarlı içerik kartları kullanılır. Ek rehberler açılır bölümde,
iletişim çağrısı sayfanın sonunda bulunur. Teknik açıklamalar ve eski bölüm
kimlikleri korunur. Uzmanlık alanları, saha galeri merkezi, dört saha galerisi
ve dört proje dosyası da ortak başlık ve arşiv düzenini kullanır.

Proje galerisinde filtreye uymayan proje blokları gizlenir. Fotoğraflar native
dialog içinde açılır; filtrelenmiş kayıtlar arasında ileri/geri düğmeleri ve
ok tuşlarıyla gezilir. Escape ile kapanır ve klavye odağı açan bağlantıya döner.
JavaScript olmadığında özgün görsel bağlantıları çalışır. Medya, iş kapsamları
ve telif işaretleri korunur; yeni proje veya görsel üretilmez.

Geliştirme aynı recovery dalında sürer. Canlı dağıtım ve master değiştirilmez.


## SEO ve site haritaları

Sekiz XML site haritasındaki adresler mevcut canonical değerleriyle eşleştirildi;
ana dizindeki sayfa, makale ve bölge haritaları 1.228 benzersiz canonical URL
içerir. 29 eksik sayfa eklendi. Video haritasının mevcut medya bilgileri
korundu. `lastmod` yalnız bu çalışmada değişen içerik sayfaları için güncellendi.
`robots.txt` ana sitemap adresini göstermeyi sürdürür.

Hizmetlerde BreadcrumbList verisi görünür içerik yoluyla eşleşir. Güncellenen
sayfalarda paylaşım açıklamaları ve görselleri doğrulandı. Eski
`/logo-og.jpg` adresine gelen istek, var olan marka görseline 200 rewrite ile
yanıt verir; 193 eski sayfanın ortak kırık paylaşım adresi böylece korunarak
onarılır. Önceki 255 yönlendirme kuralı ve 5 başlık kuralı korunur.

Ek paket gerektirmeyen kontrol:

```text
python tools/check_seo.py
```

Bu kontrol HTML metadata ve JSON-LD verilerini, yerel paylaşım görsellerini,
canonical URL kapsamını ve XML haritalarını denetler. Yandex sahiplik doğrulama
dosyası bir içerik sayfası değildir ve değiştirilmez. Netlify Deploy Preview
`noindex, nofollow` kalır; sitemap URL'leri canlı alan adını kullanır.
Search Console'a gönderim ve canlıya yayın bu önizleme çalışmasının parçası değildir.

Uygulama kaynakları: [Google sitemap rehberi](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[Netlify rewrite açıklaması](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/).


## Blog ve teknik okuma · 16 Kasım 2026

`tools/prepare-reading.mjs`, derleme sırasında 1.025 blog/rehber sayfasına ortak
okuma CSS dosyasını ekler. 389 içindekiler listesi native details/summary
olarak açılır; 223 tablo klavyeyle kaydırılabilir bölgede sunulur. 527 boş
telefon bağlantısına mevcut numaranın görünür metni eklenir. Orijinal teknik
paragraflar, başlıklar, bölüm kimlikleri ve yayın/inceleme tarihleri korunur.
Kaynak HTML ve özgün yedek topluca yeniden yazılmaz.

1.017 blog içeriğinde görünür içerik yolu ve BreadcrumbList eşleştirilir.
Mevcut Article/BlogPosting kayıtlarının başlığı, açıklaması ve ana sayfa adresi
HTML metadata/canonical ile eşleşir; bölgesel Service içeriği Article olarak
yeniden sınıflandırılmaz. Paylaşım metinleri sayfanın gerçek başlığını izler.
Teknik rehber aramasında ana başlık ve arama öne, tanıtım bloğu sona alınır.
Teknik kütüphanede ek kaynaklar açılır bölümde korunur. Aramalarda yüklenme
durumu duyurulur; blog sonuçlarında aynı canonical yazının tekrarı önlenir.

Derleme sonrası ek paket gerektirmeyen doğrulama:

```text
python tools/check_seo.py --built
python tools/check_reading.py
```

İkinci kontrol kaynak ve çıktıyı karşılaştırır; paragraflar, başlıklar, eski
bölüm kimlikleri veya kaynak tarihleri değişirse hata verir. Üretim bağlamında
da okuma hazırlığı uygulanır; önizlemeye özgü form/noindex katmanı eklenmez.
Bu dal birleştirilmediği sürece canlı Netlify dağıtımı değişmez.
