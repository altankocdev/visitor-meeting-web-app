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
import { Controller, useForm } from "react-hook-form";
import { employeeSession } from "../../domain/auth/employeeSession";
import { companyUsers } from "../../domain/models/companyUsers";
import styles from "./BookingDialog.module.css";

const defaultValues = {
  title: "",
  roomId: "",
  date: "2026-07-21",
  startTime: "09:00",
  endTime: "10:00",
  participantCount: 1,
  participantUsernames: [],
  description: "",
};

export function BookingDialog({ open, onClose, rooms, onCreate }) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues });

  const participantCount = Number(watch("participantCount")) || 0;
  const participantUsernames = watch("participantUsernames");
  const userOptions = companyUsers.filter(
    (user) => user.username !== employeeSession.user.username,
  );

  const submit = (data) => {
    onCreate({
      ...data,
      participantUsernames: data.participantUsernames.map((username) =>
        username.replace(/^@/, "").trim().toLocaleLowerCase("tr-TR"),
      ),
    });
    reset(defaultValues);
    onClose();
  };

  const close = () => {
    reset(defaultValues);
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
              validate: (values) => values.every((username) =>
                /^[a-z0-9._-]{3,50}$/i.test(username.replace(/^@/, "")),
              ) || "Kullanıcı adları 3–50 karakter olmalı; yalnızca harf, rakam, nokta, tire ve alt çizgi içermelidir.",
            }}
            render={({ field }) => (
              <Autocomplete
                multiple
                freeSolo
                options={userOptions}
                value={field.value}
                getOptionLabel={(option) => typeof option === "string" ? option : option.username}
                isOptionEqualToValue={(option, value) =>
                  option.username === (typeof value === "string" ? value : value.username)
                }
                onChange={(_, values) => {
                  const usernames = [...new Set(values.map((value) =>
                    (typeof value === "string" ? value : value.username)
                      .replace(/^@/, "")
                      .trim(),
                  ).filter(Boolean))];
                  field.onChange(usernames);
                  if (participantCount < usernames.length) {
                    setValue("participantCount", usernames.length, { shouldValidate: true });
                  }
                }}
                renderTags={(values, getTagProps) => values.map((value, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={value}
                    label={`@${typeof value === "string" ? value : value.username}`}
                    size="small"
                    className={styles.userChip}
                  />
                ))}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <div className={styles.userOption}>
                      <strong>@{option.username}</strong>
                      <small>{option.email}</small>
                    </div>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Katılımcıları kullanıcı adıyla ekle"
                    placeholder="Kullanıcı adı yazıp Enter'a basın"
                    error={Boolean(errors.participantUsernames)}
                    helperText={errors.participantUsernames?.message || "Şirket kullanıcısı seçin veya kullanıcı adını yazıp Enter'a basın."}
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
