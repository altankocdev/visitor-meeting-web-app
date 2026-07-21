# Meetly frontend architecture

React uygulaması bağımlılık yönünü iç katmanlara doğru korur:

```text
presentation -> application -> domain
infrastructure -> domain/application contracts
```

## Katmanlar

- `domain/models`: Backend entity ve DTO'larından türetilen saf modeller.
- `application`: API bağlantısı geldiğinde rezervasyon use-case'lerinin bulunacağı katman.
- `infrastructure/api`: Axios istemcisi.
- `infrastructure/repositories`: Spring REST endpoint adaptörleri.
- `presentation/pages`: React Router tarafından açılan sayfalar.
- `presentation/components`: Tek sorumluluklu React bileşenleri.
- `presentation/theme.js`: Material UI tema ve renk paleti.

## Kullanılan teknoloji

- React + Vite
- React Router
- Axios
- React Hook Form
- Material UI
- FullCalendar

## Backend eşleşmesi

Rezervasyon formu `ReservationRequestDto` alanlarını kullanır: `title`,
`description`, `startTime`, `endTime`, `roomId`, `participantCount`.
Oda kartları `RoomResponseDto` alanlarını kullanır: `name`, `location`,
`capacity`, `features`, `active`.

Şimdilik ekrandaki veriler domain mock dosyasından gelir. Repository adaptörleri
hazırdır ancak sayfaya enjekte edilmemiştir; bu sayede UI geliştirmesi backend'den
bağımsız devam eder.
