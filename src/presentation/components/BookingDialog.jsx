import {
  AccessTimeRounded,
  CheckCircleRounded,
  RestartAltRounded,
} from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { mapReservationFromApi } from "../../infrastructure/mappers/reservationMapper";
import { reservationRepository } from "../../infrastructure/repositories/reservationRepository";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { useAuth } from "../auth/AuthContext";
import styles from "./BookingDialog.module.css";

const TIME_SLOTS = [
  { start: "08:00", end: "09:00", label: "08:00 - 09:00" },
  { start: "09:00", end: "10:00", label: "09:00 - 10:00" },
  { start: "10:00", end: "11:00", label: "10:00 - 11:00" },
  { start: "11:00", end: "12:00", label: "11:00 - 12:00" },
  { start: "12:00", end: "13:00", label: "12:00 - 13:00" },
  { start: "13:00", end: "14:00", label: "13:00 - 14:00" },
  { start: "14:00", end: "15:00", label: "14:00 - 15:00" },
  { start: "15:00", end: "16:00", label: "15:00 - 16:00" },
  { start: "16:00", end: "17:00", label: "16:00 - 17:00" },
  { start: "17:00", end: "18:00", label: "17:00 - 18:00" },
  { start: "18:00", end: "19:00", label: "18:00 - 19:00" },
];

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const createDefaultValues = () => ({
  title: "",
  roomId: "",
  date: new Date().toLocaleDateString("en-CA"),
  startTime: "",
  endTime: "",
  participantCount: 1,
  participantUsernames: [],
  description: "",
});

export function BookingDialog({ open, onClose, rooms = [], onCreate }) {
  const { session } = useAuth();
  const [userOptions, setUserOptions] = useState([]);
  const [dayReservations, setDayReservations] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues: createDefaultValues() });

  const selectedDate = watch("date");
  const selectedRoomId = watch("roomId");
  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const participantCount = Number(watch("participantCount")) || 0;
  const participantUsernames = watch("participantUsernames") || [];

  // Auto select first room if not selected
  useEffect(() => {
    if (open && rooms.length > 0 && !selectedRoomId) {
      setValue("roomId", rooms[0].id);
    }
  }, [open, rooms, selectedRoomId, setValue]);

  // Fetch users for participant autocomplete
  useEffect(() => {
    if (!open || !session?.user?.companyId) return;
    let active = true;
    userRepository.directory(session.user.companyId, "", { size: 100 })
      .then((page) => {
        if (active) setUserOptions(page.content.filter((user) => user.id !== session.user.id));
      })
      .catch(() => {
        if (active) setUserOptions([]);
      });
    return () => {
      active = false;
    };
  }, [open, session?.user?.companyId, session?.user?.id]);

  // Fetch day reservations for room occupancy
  useEffect(() => {
    if (!open || !selectedDate) return;
    let active = true;
    const from = dayjs(selectedDate).startOf("day").toISOString();
    const to = dayjs(selectedDate).endOf("day").toISOString();

    reservationRepository.calendar(from, to)
      .then((page) => {
        if (!active) return;
        const items = (page.content ?? page ?? []).map(mapReservationFromApi);
        setDayReservations(items);
      })
      .catch(() => {
        if (active) setDayReservations([]);
      });

    return () => {
      active = false;
    };
  }, [open, selectedDate]);

  // Check if a time slot / range is occupied in the selected room
  const checkRangeOccupied = useCallback((slotStart, slotEnd) => {
    if (!selectedRoomId || !selectedDate || !dayReservations.length || !slotStart || !slotEnd) {
      return false;
    }

    const slotStartDt = dayjs(`${selectedDate}T${slotStart}:00`);
    const slotEndDt = dayjs(`${selectedDate}T${slotEnd}:00`);

    if (!slotStartDt.isValid() || !slotEndDt.isValid() || !slotEndDt.isAfter(slotStartDt)) {
      return true;
    }

    return dayReservations.some((res) => {
      if (res.status === "CANCELLED") return false;
      const resRoomId = res.roomId ?? res.room?.id;
      if (resRoomId != null && String(resRoomId) !== String(selectedRoomId)) return false;

      const resStart = dayjs(res.start || res.startTime);
      const resEnd = dayjs(res.end || res.endTime);

      return resStart.isBefore(slotEndDt) && resEnd.isAfter(slotStartDt);
    });
  }, [selectedRoomId, selectedDate, dayReservations]);

  const checkSlotOccupied = useCallback((slotStart, slotEnd) => {
    return checkRangeOccupied(slotStart, slotEnd);
  }, [checkRangeOccupied]);

  // Auto select first available slot when date/room changes if current slot is invalid or empty
  useEffect(() => {
    if (!open) return;

    if (!startTime || !endTime || checkRangeOccupied(startTime, endTime)) {
      const firstAvailable = TIME_SLOTS.find((slot) => !checkSlotOccupied(slot.start, slot.end));
      if (firstAvailable) {
        setValue("startTime", firstAvailable.start, { shouldValidate: true });
        setValue("endTime", firstAvailable.end, { shouldValidate: true });
        clearErrors("startTime");
      } else {
        setValue("startTime", "");
        setValue("endTime", "");
      }
    }
  }, [open, selectedRoomId, selectedDate, dayReservations, checkSlotOccupied, checkRangeOccupied, startTime, endTime, setValue, clearErrors]);

  // Handle clicking slot button for multi-hour consecutive range selection
  const handleSlotClick = (slot) => {
    if (checkSlotOccupied(slot.start, slot.end)) return;

    if (!startTime || !endTime) {
      setValue("startTime", slot.start, { shouldValidate: true });
      setValue("endTime", slot.end, { shouldValidate: true });
      clearErrors("startTime");
      return;
    }

    const currentStartMin = timeToMinutes(startTime);
    const currentEndMin = timeToMinutes(endTime);
    const clickStartMin = timeToMinutes(slot.start);
    const clickEndMin = timeToMinutes(slot.end);

    let targetStartMin = currentStartMin;
    let targetEndMin = currentEndMin;

    if (clickStartMin >= currentEndMin) {
      targetEndMin = clickEndMin;
    } else if (clickEndMin <= currentStartMin) {
      targetStartMin = clickStartMin;
    } else if (slot.start === startTime && slot.end === endTime) {
      // Toggle / deselect if single slot clicked again
      setValue("startTime", "", { shouldValidate: true });
      setValue("endTime", "", { shouldValidate: true });
      return;
    } else {
      // Clicked inside or non-contiguous -> start new selection at clicked slot
      targetStartMin = clickStartMin;
      targetEndMin = clickEndMin;
    }

    const targetStart = minutesToTime(targetStartMin);
    const targetEnd = minutesToTime(targetEndMin);

    if (!checkRangeOccupied(targetStart, targetEnd)) {
      setValue("startTime", targetStart, { shouldValidate: true });
      setValue("endTime", targetEnd, { shouldValidate: true });
      clearErrors("startTime");
    } else {
      // Spans an occupied slot -> reset to clicked slot
      setValue("startTime", slot.start, { shouldValidate: true });
      setValue("endTime", slot.end, { shouldValidate: true });
      clearErrors("startTime");
    }
  };

  const clearTimeSelection = () => {
    setValue("startTime", "");
    setValue("endTime", "");
  };

  const durationHours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    return (endMin - startMin) / 60;
  }, [startTime, endTime]);

  const submit = (data) => {
    if (!data.startTime || !data.endTime) {
      setError("startTime", { type: "manual", message: "Lütfen en az bir toplantı saati seçin." });
      return;
    }
    if (checkRangeOccupied(data.startTime, data.endTime)) {
      setError("startTime", { type: "manual", message: "Seçilen saat aralığında oda doludur. Lütfen başka bir saat seçin." });
      return;
    }

    onCreate({
      ...data,
      participantIds: data.participantUsernames.map((user) => user.id),
    });
    reset(createDefaultValues());
    onClose();
  };

  const close = () => {
    reset(createDefaultValues());
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <form onSubmit={handleSubmit(submit)}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 24 }}>Yeni rezervasyon</DialogTitle>
        <DialogContent className={styles.form}>
          <Controller
            name="title"
            control={control}
            rules={{ required: "Toplantı başlığı zorunludur." }}
            render={({ field }) => (
              <TextField {...field} label="Toplantı başlığı" error={Boolean(errors.title)} helperText={errors.title?.message} fullWidth />
            )}
          />

          <Controller
            name="roomId"
            control={control}
            rules={{ required: "Bir oda seçin." }}
            render={({ field }) => (
              <TextField {...field} select label="Toplantı odası" error={Boolean(errors.roomId)} helperText={errors.roomId?.message} fullWidth>
                {rooms.map((room) => <MenuItem key={room.id} value={room.id}>{room.name} · {room.capacity} kişi</MenuItem>)}
              </TextField>
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => <TextField {...field} label="Tarih" type="date" InputLabelProps={{ shrink: true }} fullWidth />}
          />

          <div className={styles.timeSection}>
            <div className={styles.timeHeader}>
              <div className={styles.timeTitle}>
                <AccessTimeRounded />
                <span>Saat Seçimi</span>
              </div>
              <div className={styles.headerActions}>
                {startTime && endTime && !checkRangeOccupied(startTime, endTime) && (
                  <span className={styles.selectedSummary}>
                    Seçilen: {startTime} – {endTime} ({durationHours} saat)
                  </span>
                )}
                {startTime && (
                  <button type="button" className={styles.clearBtn} onClick={clearTimeSelection} title="Seçimi Temizle">
                    <RestartAltRounded sx={{ fontSize: 16 }} />
                  </button>
                )}
              </div>
            </div>

            <span className={styles.timeSubtext}>
              {selectedRoomId
                ? "Ard arda saatlere tıklayarak 2+ saatlik toplantı seçebilirsiniz (Dolu saatlerin üstü çizilidir):"
                : "Saat durumlarını görmek için lütfen bir toplantı odası seçin."}
            </span>

            <div className={styles.slotGrid}>
              {TIME_SLOTS.map((slot) => {
                const isOccupied = checkSlotOccupied(slot.start, slot.end);
                const isSelected =
                  startTime &&
                  endTime &&
                  slot.start >= startTime &&
                  slot.end <= endTime;

                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={isOccupied}
                    className={`${styles.slotButton} ${
                      isOccupied ? styles.slotDisabled : isSelected ? styles.slotSelected : ""
                    }`}
                    onClick={() => handleSlotClick(slot)}
                  >
                    <span className={isOccupied ? styles.strikeThrough : styles.slotLabel}>
                      {slot.label}
                    </span>
                    {isOccupied ? (
                      <span className={styles.busyBadge}>Dolu</span>
                    ) : isSelected ? (
                      <CheckCircleRounded sx={{ fontSize: 16, mt: 0.5, color: "#fff" }} />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {errors.startTime && (
              <FormHelperText error sx={{ mt: 1, fontWeight: 600 }}>
                {errors.startTime.message}
              </FormHelperText>
            )}
          </div>

          <Controller
            name="participantUsernames"
            control={control}
            rules={{
              validate: (values) => values.every((user) => Number.isInteger(user.id))
                || "Katılımcıları listeden seçin.",
            }}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={userOptions}
                value={field.value}
                getOptionLabel={(option) => `${option.fullName} · ${option.email}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, values) => {
                  field.onChange(values);
                  if (participantCount < values.length) {
                    setValue("participantCount", values.length, { shouldValidate: true });
                  }
                }}
                renderTags={(values, getTagProps) => values.map((value, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={value.id}
                    label={value.fullName}
                    size="small"
                    className={styles.userChip}
                  />
                ))}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <div className={styles.userOption}>
                      <strong>{option.fullName}</strong>
                      <small>{option.email}</small>
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Katılımcı ekle"
                    placeholder="Ad veya e-posta ile ara"
                    error={Boolean(errors.participantUsernames)}
                    helperText={errors.participantUsernames?.message || "Veritabanındaki şirket kullanıcılarından seçim yapın."}
                  />
                )}
              />
            )}
          />

          <Controller
            name="participantCount"
            control={control}
            rules={{
              min: {
                value: Math.max(1, participantUsernames.length),
                message: `Katılımcı sayısı eklenen ${participantUsernames.length} kullanıcıdan az olamaz.`,
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Toplam katılımcı sayısı"
                type="number"
                inputProps={{ min: Math.max(1, participantUsernames.length) }}
                error={Boolean(errors.participantCount)}
                helperText={errors.participantCount?.message || `${participantUsernames.length} kullanıcı adı eklendi.`}
                fullWidth
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => <TextField {...field} label="Açıklama (opsiyonel)" multiline rows={3} fullWidth />}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={close} color="inherit">Vazgeç</Button>
          <Button type="submit" variant="contained" size="large">Rezervasyon oluştur</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
