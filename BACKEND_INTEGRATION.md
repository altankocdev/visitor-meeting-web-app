# Frontend – Backend entegrasyon notları

## Frontend tarafında tamamlananlar

- JWT access token bütün API isteklerine Axios interceptor ile eklenir.
- `401` yanıtında refresh token yalnızca bir kez yenilenir; eşzamanlı istekler aynı yenileme işlemini bekler.
- Yenileme başarısız olduğunda oturum temizlenir ve kullanıcı giriş sayfasına yönlendirilir.
- Rezervasyon isteklerinde artık `X-Company-Id` ve `X-User-Id` gönderilmez.
- Rezervasyon oluşturma isteğine `Idempotency-Key` eklenir.
- Backend `ApiResponse` ve `PageResponse` zarfları tek noktadan açılır.
- Backend hata ve alan doğrulama yanıtları kullanıcıya okunabilir mesaj olarak gösterilir.
- Normal ve şirket yöneticisi girişleri `/auth/login` sözleşmesini kullanır.
- İlk şifre değiştirme ekranı `currentPassword` ve `newPassword` alanlarını backend sözleşmesine göre gönderir.

## Backend tarafında çözülmesi gereken sözleşme boşlukları

1. `SecurityConfig` yalnızca `Authorization` ve `Content-Type` başlıklarına izin veriyor. Tarayıcının rezervasyon oluşturma isteğini kabul etmesi için CORS `allowedHeaders` listesine `Idempotency-Key` eklenmeli.
2. Geliştirme CORS origin'i `http://localhost:3000`; frontend Vite ile varsayılan olarak `http://localhost:5173` üzerinde çalışır. Kullanılan geliştirme adresi de izin verilen origin'lere eklenmeli.
3. `GET /reservations` yalnızca `RESERVATION_VIEW_ALL` yetkisini kabul ediyor. `CALISAN` rolündeki `RESERVATION_VIEW_OWN` kullanıcısı için ayrı bir `/reservations/my` endpoint'i veya servis düzeyinde yalnızca kendi kayıtlarını döndüren yetki dalı gerekli.
4. Rezervasyon formu kullanıcı adıyla katılımcı arıyor; backend create DTO'su `participantIds` bekliyor. Çalışanın erişebileceği, şirket kapsamında kullanıcı adı arayan minimal bir endpoint gerekli. Mevcut kullanıcı arama endpoint'i `USER_VIEW_ALL` istiyor.
5. `IdempotencyFilter` anahtarı kullanıcı/şirket/endpoint ile birlikte kapsamlandırmıyor ve anahtar formatını UUID olarak doğrulamıyor. Aynı anahtarın farklı kullanıcılar arasında çakışmaması için kayıt anahtarının tenant ve kullanıcı kimliğiyle kapsamlandırılması önerilir.
6. Login cevabı profil bilgisi döndürmüyor. JWT'den `userId` ve `companyId` okunabiliyor ancak ilk ekranın kullanıcı adını, şirket adını ve rol adlarını gösterebilmesi için `/auth/me` benzeri bir endpoint gerekir.
7. `JobTitleController` hâlâ `X-Company-Id` kullanıyor. Diğer tenant endpoint'leriyle aynı güvenlik modeline geçirilip şirket kimliği JWT'den çözülmeli.
8. Şifre değişikliği tüm refresh token'ları iptal ediyor fakat yeni token döndürmüyor. Frontend güvenli biçimde oturumu kapatıp tekrar giriş istiyor. Kesintisiz akış istenirse endpoint yeni access/refresh token çifti döndürmeli.

## Veri eşlemesi

Backend rezervasyon alanları frontend görünüm modeline şu şekilde çevrilir:

- `startTime` → `start`
- `endTime` → `end`
- `room.id/name` → `roomId/room`
- `participants.length` → `participants`
- `organizer.id/fullName/email` → organizatör görünüm alanları
