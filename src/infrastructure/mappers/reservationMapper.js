export function mapReservationFromApi(reservation) {
  return {
    ...reservation,
    start: reservation.startTime,
    end: reservation.endTime,
    roomId: reservation.room?.id,
    room: reservation.room?.name ?? "",
    roomDetails: reservation.room,
    participants: reservation.participants?.length ?? 0,
    participantUsers: reservation.participants ?? [],
    organizer: reservation.organizer?.fullName || reservation.organizer?.email || "",
    organizerId: reservation.organizer?.id,
  };
}

export function mapReservationFormToApi(form) {
  return {
    title: form.title.trim(),
    description: form.description?.trim() || null,
    startTime: `${form.date}T${form.startTime}:00`,
    endTime: `${form.date}T${form.endTime}:00`,
    roomId: Number(form.roomId),
    participantIds: form.participantIds?.map(Number) ?? [],
  };
}
