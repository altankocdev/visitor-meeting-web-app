import { Controller, useForm } from "react-hook-form";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";

export function BookingDialog({ open, onClose, rooms, onCreate }) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { title: "", roomId: "", date: "2026-07-21", startTime: "09:00", endTime: "10:00", participantCount: 1, description: "" } });
  const submit = (data) => { onCreate(data); reset(); onClose(); };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{sx:{borderRadius:4}}}><form onSubmit={handleSubmit(submit)}><DialogTitle sx={{fontWeight:800,fontSize:24}}>Yeni rezervasyon</DialogTitle><DialogContent className="dialog-form">
    <Controller name="title" control={control} rules={{required:"Toplantı başlığı zorunludur."}} render={({field}) => <TextField {...field} label="Toplantı başlığı" error={!!errors.title} helperText={errors.title?.message} fullWidth />} />
    <Controller name="roomId" control={control} rules={{required:"Bir oda seçin."}} render={({field}) => <TextField {...field} select label="Toplantı odası" error={!!errors.roomId} helperText={errors.roomId?.message} fullWidth>{rooms.map(room => <MenuItem key={room.id} value={room.id}>{room.name} · {room.capacity} kişi</MenuItem>)}</TextField>} />
    <Controller name="date" control={control} render={({field}) => <TextField {...field} label="Tarih" type="date" InputLabelProps={{shrink:true}} fullWidth />} />
    <div className="dialog-grid"><Controller name="startTime" control={control} render={({field}) => <TextField {...field} label="Başlangıç" type="time" InputLabelProps={{shrink:true}} fullWidth />} /><Controller name="endTime" control={control} render={({field}) => <TextField {...field} label="Bitiş" type="time" InputLabelProps={{shrink:true}} fullWidth />} /></div>
    <Controller name="participantCount" control={control} rules={{min:{value:1,message:"En az 1 katılımcı."}}} render={({field}) => <TextField {...field} label="Katılımcı sayısı" type="number" error={!!errors.participantCount} helperText={errors.participantCount?.message} fullWidth />} />
    <Controller name="description" control={control} render={({field}) => <TextField {...field} label="Açıklama (opsiyonel)" multiline rows={3} fullWidth />} />
  </DialogContent><DialogActions sx={{p:3,pt:1}}><Button onClick={onClose} color="inherit">Vazgeç</Button><Button type="submit" variant="contained" size="large">Rezervasyon oluştur</Button></DialogActions></form></Dialog>;
}
