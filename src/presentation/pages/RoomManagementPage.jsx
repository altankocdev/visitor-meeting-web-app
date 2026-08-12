import { AddRounded, DeleteOutlineRounded, EditOutlined, GroupsOutlined, LocationOnOutlined, MeetingRoomOutlined, SearchRounded, SettingsSuggestOutlined } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { organizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { EditAction, ManagementActions, StatusAction } from "../components/ManagementActions";
import { FeatureFormDialog, ResourceStatusDialog, RoomFormDialog } from "../components/RoomFeatureDialogs";
import styles from "./RoomManagementPage.module.css";

export function RoomManagementPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState([]);
  const [features, setFeatures] = useState([]);
  const [search, setSearch] = useState("");
  const [roomForm, setRoomForm] = useState(false);
  const [featureForm, setFeatureForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [editFeature, setEditFeature] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      organizationRepository.rooms(session.user.companyId, { size: 200 }),
      organizationRepository.features(session.user.companyId, { size: 200 }),
    ]).then(([roomResult, featureResult]) => {
      if (!active) return;
      if (roomResult.status === "fulfilled") {
        setRooms((roomResult.value.content ?? []).map((room) => ({
          ...room,
          featureIds: (room.features ?? []).map((feature) => feature.id),
        })));
      }
      if (featureResult.status === "fulfilled") {
        setFeatures(featureResult.value.content ?? []);
      }
    });
    return () => { active = false; };
  }, [session.user.companyId]);

  const filteredRooms = useMemo(() => rooms.filter((room) => `${room.name} ${room.location} ${room.description}`.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))), [rooms, search]);
  const filteredFeatures = useMemo(() => features.filter((feature) => `${feature.name} ${feature.description}`.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))), [features, search]);

  const saveRoom = async (data) => {
    const normalized = {
      name: data.name,
      location: data.location || "",
      capacity: Number(data.capacity),
      description: data.description || "",
      featureIds: (data.featureIds || []).map(Number)
    };

    try {
      if (editRoom) {
        const updated = await organizationRepository.updateRoom(session.user.companyId, editRoom.id, normalized);
        setRooms((current) => current.map((item) => item.id === editRoom.id ? { ...updated, featureIds: (updated.features || []).map(f => f.id) } : item));
        setNotice({ severity: "success", text: "Oda başarıyla güncellendi." });
      } else {
        const created = await organizationRepository.createRoom(session.user.companyId, normalized);
        setRooms((current) => [{ ...created, featureIds: (created.features || []).map(f => f.id) }, ...current]);
        setNotice({ severity: "success", text: "Oda başarıyla oluşturuldu." });
      }
      setRoomForm(false);
      setEditRoom(null);
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Oda kaydedilemedi.") });
    }
  };

  const saveFeature = async (data) => {
    try {
      if (editFeature) {
        const updated = await organizationRepository.updateFeature(session.user.companyId, editFeature.id, data);
        setFeatures((current) => current.map((item) => item.id === editFeature.id ? updated : item));
        setNotice({ severity: "success", text: "Özellik başarıyla güncellendi." });
      } else {
        const created = await organizationRepository.createFeature(session.user.companyId, data);
        setFeatures((current) => [created, ...current]);
        setNotice({ severity: "success", text: "Özellik başarıyla oluşturuldu." });
      }
      setFeatureForm(false);
      setEditFeature(null);
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Özellik kaydedilemedi.") });
    }
  };

  const toggleStatus = async () => {
    try {
      if (statusTarget.type === "room") {
        if (statusTarget.item.active) {
          await organizationRepository.deactivateRoom(session.user.companyId, statusTarget.item.id);
          setRooms((current) => current.map((item) => item.id === statusTarget.item.id ? { ...item, active: false } : item));
          setNotice({ severity: "success", text: "Oda pasifleştirildi." });
        } else {
          await organizationRepository.activateRoom(session.user.companyId, statusTarget.item.id);
          setRooms((current) => current.map((item) => item.id === statusTarget.item.id ? { ...item, active: true } : item));
          setNotice({ severity: "success", text: "Oda aktifleştirildi." });
        }
      } else {
        if (statusTarget.item.active) {
          await organizationRepository.deactivateFeature(session.user.companyId, statusTarget.item.id);
          setFeatures((current) => current.map((item) => item.id === statusTarget.item.id ? { ...item, active: false } : item));
          setNotice({ severity: "success", text: "Özellik pasifleştirildi." });
        } else {
          await organizationRepository.activateFeature(session.user.companyId, statusTarget.item.id);
          setFeatures((current) => current.map((item) => item.id === statusTarget.item.id ? { ...item, active: true } : item));
          setNotice({ severity: "success", text: "Özellik aktifleştirildi." });
        }
      }
      setStatusTarget(null);
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Durum değiştirilemedi.") });
    }
  };

  const archiveRoom = async (room) => {
    if (!window.confirm(`${room.name} odasını silmek istediğinize emin misiniz? Oda listelerden kaldırılacak, geçmiş rezervasyon kayıtları korunacaktır.`)) return;
    try {
      await organizationRepository.archiveRoom(session.user.companyId, room.id);
      setRooms((current) => current.filter((item) => item.id !== room.id));
      setNotice({ severity: "success", text: "Oda silindi. Geçmiş rezervasyon kayıtları korundu." });
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Oda silinemedi.") });
    }
  };

  return <div className={styles.shell}><AdminSidebar session={session} /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>KAYNAK YÖNETİMİ</small><h1>Odalar ve özellikler</h1><p>Toplantı odalarını, kapasitelerini ve kullanılabilir donanımları yönetin.</p></div><button className={styles.createButton} type="button" onClick={() => tab === "rooms" ? setRoomForm(true) : setFeatureForm(true)}><AddRounded />{tab === "rooms" ? "Yeni oda" : "Yeni özellik"}</button></header>
    <section className={styles.stats}><article><span className={styles.blue}><MeetingRoomOutlined /></span><div><small>Toplam oda</small><strong>{rooms.length}</strong><p>{rooms.filter((room) => room.active).length} aktif oda</p></div></article><article><span className={styles.green}><GroupsOutlined /></span><div><small>Toplam kapasite</small><strong>{rooms.filter((room) => room.active).reduce((sum, room) => sum + room.capacity, 0)}</strong><p>Aktif odalardaki koltuk</p></div></article><article><span className={styles.orange}><SettingsSuggestOutlined /></span><div><small>Özellik kataloğu</small><strong>{features.length}</strong><p>{features.filter((item) => item.active).length} kullanılabilir özellik</p></div></article></section>
    <section className={styles.panel}>
      <div className={styles.toolbar}><div className={styles.tabs}><button className={tab === "rooms" ? styles.selected : ""} onClick={() => { setTab("rooms"); setSearch(""); }}>Toplantı odaları <span>{rooms.length}</span></button><button className={tab === "features" ? styles.selected : ""} onClick={() => { setTab("features"); setSearch(""); }}>Özellik kataloğu <span>{features.length}</span></button></div><label className={styles.search}><SearchRounded /><input value={search} placeholder={tab === "rooms" ? "Oda adı veya konum ara..." : "Özellik ara..."} onChange={(event) => setSearch(event.target.value)} /></label></div>
      {tab === "rooms" ? <div className={styles.roomGrid}>{filteredRooms.map((room) => <article className={styles.roomCard} key={room.id}><header><span><MeetingRoomOutlined /></span><div><h3>{room.name}</h3><p><LocationOnOutlined />{room.location}</p></div><b className={room.active ? styles.active : styles.passive}>{room.active ? "Aktif" : "Pasif"}</b></header><p className={styles.description}>{room.description}</p><div className={styles.capacity}><GroupsOutlined /><span><b>{room.capacity} kişi</b><small>Kapasite</small></span></div><div className={styles.featureList}>{features.filter((feature) => room.featureIds.includes(feature.id)).map((feature) => <span key={feature.id}>{feature.name}</span>)}</div><footer><button type="button" onClick={() => setEditRoom(room)}><EditOutlined />Düzenle</button><button className={styles.statusButton} type="button" onClick={() => setStatusTarget({ type: "room", item: room })} aria-label={room.active ? `${room.name} odasını pasifleştir` : `${room.name} odasını aktifleştir`}><span className={`${styles.switchTrack} ${room.active ? styles.switchOn : ""}`} aria-hidden="true"><i /></span>{room.active ? "Pasifleştir" : "Aktifleştir"}</button><button className={styles.deleteButton} type="button" onClick={() => archiveRoom(room)}><DeleteOutlineRounded />Sil</button></footer></article>)}</div>
      : <div className={styles.featureTable}><table><thead><tr><th>ÖZELLİK</th><th>AÇIKLAMA</th><th>KULLANILDIĞI ODA</th><th>DURUM</th><th>İŞLEMLER</th></tr></thead><tbody>{filteredFeatures.map((feature) => <tr key={feature.id}><td><div className={styles.featureName}><span><SettingsSuggestOutlined /></span><b>{feature.name}</b></div></td><td>{feature.description}</td><td>{rooms.filter((room) => room.featureIds.includes(feature.id)).length} oda</td><td><span className={feature.active ? styles.active : styles.passive}>{feature.active ? "Aktif" : "Pasif"}</span></td><td><ManagementActions><EditAction label="Özelliği düzenle" onClick={() => setEditFeature(feature)} /><StatusAction active={feature.active} label={feature.active ? "Özelliği pasifleştir" : "Özelliği aktifleştir"} onClick={() => setStatusTarget({ type: "feature", item: feature })} /></ManagementActions></td></tr>)}</tbody></table></div>}
    </section>
  </main></div>
  <RoomFormDialog open={roomForm || Boolean(editRoom)} room={editRoom} features={features} onClose={() => { setRoomForm(false); setEditRoom(null); }} onSave={saveRoom} />
  <FeatureFormDialog open={featureForm || Boolean(editFeature)} feature={editFeature} onClose={() => { setFeatureForm(false); setEditFeature(null); }} onSave={saveFeature} />
  <ResourceStatusDialog item={statusTarget?.item} type={statusTarget?.type} onClose={() => setStatusTarget(null)} onConfirm={toggleStatus} />
  <Snackbar open={Boolean(notice)} autoHideDuration={6000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }} sx={{ mt: 2 }}>
    <Alert severity={notice?.severity} variant="filled" onClose={() => setNotice(null)}>
      {notice?.text}
    </Alert>
  </Snackbar>
  </div>;
}
