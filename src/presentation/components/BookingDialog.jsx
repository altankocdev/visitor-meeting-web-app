import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { useAuth } from "../auth/AuthContext";
import styles from "./BookingDialog.module.css";

const createDefaultValues = () => ({
  title: "",
  roomId: "",
  date: new Date().toLocaleDateString("en-CA"),
  startTime: "09:00",
  endTime: "10:00",
  participantCount: 1,
  participantUsernames: [],
  description: "",
});

export function BookingDialog({ open, onClose, rooms, onCreate }) {
  const { session } = useAuth();
  const [userOptions, setUserOptions] = useState([]);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: createDefaultValues() });

  const participantCount = Number(watch("participantCount")) || 0;
  const participantUsernames = watch("participantUsernames");
  useEffect(() => {
    if (!open || !session?.user.companyId) return;
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
  }, [open, session?.user.companyId, session?.user.id]);

  const submit = (data) => {
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

          <div className={styles.grid}>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => <TextField {...field} label="Başlangıç" type="time" InputLabelProps={{ shrink: true }} fullWidth />}
            />
            <Controller
              name="endTime"
              control={control}
              rules={{
                validate: (value) => value > watch("startTime") || "Bitiş saati başlangıçtan sonra olmalıdır.",
              }}
              render={({ field }) => (
                <TextField {...field} label="Bitiş" type="time" InputLabelProps={{ shrink: true }} error={Boolean(errors.endTime)} helperText={errors.endTime?.message} fullWidth />
              )}
            />
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
                    key={value}
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
