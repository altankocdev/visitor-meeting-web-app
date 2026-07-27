import { AddRounded, EditOutlined, GroupsOutlined, LocationOnOutlined, MeetingRoomOutlined, SearchRounded, SettingsSuggestOutlined, ToggleOffOutlined } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { managementSession } from "../../domain/auth/managementSession";
import { managedRooms as seedRooms, roomFeatures as seedFeatures } from "../../domain/models/roomManagement";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { FeatureFormDialog, ResourceStatusDialog, RoomFormDialog } from "../components/RoomFeatureDialogs";
import styles from "./RoomManagementPage.module.css";

export function RoomManagementPage({ session = managementSession }) {
  const [tab, setTab] = useState("rooms");
  const [rooms, setRooms] = useState(seedRooms);
  const [features, setFeatures] = useState(seedFeatures);
  const [search, setSearch] = useState("");
  const [roomForm, setRoomForm] = useState(false);
  const [featureForm, setFeatureForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [editFeature, setEditFeature] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const filteredRooms = useMemo(() => rooms.filter((room) => `${room.name} ${room.location} ${room.description}`.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))), [rooms, search]);
  const filteredFeatures = useMemo(() => features.filter((feature) => `${feature.name} ${feature.description}`.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))), [features, search]);

  const saveRoom = (data) => {
    const normalized = { ...data, capacity: Number(data.capacity), featureIds: (data.featureIds || []).map(Number) };
    if (editRoom) setRooms((current) => current.map((item) => item.id === editRoom.id ? { ...item, ...normalized } : item));
    else setRooms((current) => [{ id: Date.now(), ...normalized, active: true }, ...current]);
    setRoomForm(false); setEditRoom(null);
  };
  const saveFeature = (data) => {
    if (editFeature) setFeatures((current) => current.map((item) => item.id === editFeature.id ? { ...item, ...data } : item));
    else setFeatures((current) => [{ id: Date.now(), ...data, active: true }, ...current]);
    setFeatureForm(false); setEditFeature(null);
  };
  const toggleStatus = () => {
    if (statusTarget.type === "room") setRooms((current) => current.map((item) => item.id === statusTarget.item.id ? { ...item, active: !item.active } : item));
    else setFeatures((current) => current.map((item) => item.id === statusTarget.item.id ? { ...item, active: !item.active } : item));
    setStatusTarget(null);
  };

  return <div className={styles.shell}><AdminSidebar session={session} /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>KAYNAK YÖNETİMİ</small><h1>Odalar ve özellikler</h1><p>Toplantı odalarını, kapasitelerini ve kullanılabilir donanımları yönetin.</p></div><button className={styles.createButton} type="button" onClick={() => tab === "rooms" ? setRoomForm(true) : setFeatureForm(true)}><AddRounded />{tab === "rooms" ? "Yeni oda" : "Yeni özellik"}</button></header>
    <section className={styles.stats}><article><span className={styles.blue}><MeetingRoomOutlined /></span><div><small>Toplam oda</small><strong>{rooms.length}</strong><p>{rooms.filter((room) => room.active).length} aktif oda</p></div></article><article><span className={styles.green}><GroupsOutlined /></span><div><small>Toplam kapasite</small><strong>{rooms.filter((room) => room.active).reduce((sum, room) => sum + room.capacity, 0)}</strong><p>Aktif odalardaki koltuk</p></div></article><article><span className={styles.orange}><SettingsSuggestOutlined /></span><div><small>Özellik kataloğu</small><strong>{features.length}</strong><p>{features.filter((item) => item.active).length} kullanılabilir özellik</p></div></article></section>
    <section className={styles.panel}>
      <div className={styles.toolbar}><div className={styles.tabs}><button className={tab === "rooms" ? styles.selected : ""} onClick={() => { setTab("rooms"); setSearch(""); }}>Toplantı odaları <span>{rooms.length}</span></button><button className={tab === "features" ? styles.selected : ""} onClick={() => { setTab("features"); setSearch(""); }}>Özellik kataloğu <span>{features.length}</span></button></div><label className={styles.search}><SearchRounded /><input value={search} placeholder={tab === "rooms" ? "Oda adı veya konum ara..." : "Özellik ara..."} onChange={(event) => setSearch(event.target.value)} /></label></div>
      {tab === "rooms" ? <div className={styles.roomGrid}>{filteredRooms.map((room) => <article className={styles.roomCard} key={room.id}><header><span><MeetingRoomOutlined /></span><div><h3>{room.name}</h3><p><LocationOnOutlined />{room.location}</p></div><b className={room.active ? styles.active : styles.passive}>{room.active ? "Aktif" : "Pasif"}</b></header><p className={styles.description}>{room.description}</p><div className={styles.capacity}><GroupsOutlined /><span><b>{room.capacity} kişi</b><small>Kapasite</small></span></div><div className={styles.featureList}>{features.filter((feature) => room.featureIds.includes(feature.id)).map((feature) => <span key={feature.id}>{feature.name}</span>)}</div><footer><button type="button" onClick={() => setEditRoom(room)}><EditOutlined />Düzenle</button><button type="button" onClick={() => setStatusTarget({ type: "room", item: room })}><ToggleOffOutlined />{room.active ? "Pasifleştir" : "Aktifleştir"}</button></footer></article>)}</div>
      : <div className={styles.featureTable}><table><thead><tr><th>ÖZELLİK</th><th>AÇIKLAMA</th><th>KULLANILDIĞI ODA</th><th>DURUM</th><th>İŞLEMLER</th></tr></thead><tbody>{filteredFeatures.map((feature) => <tr key={feature.id}><td><div className={styles.featureName}><span><SettingsSuggestOutlined /></span><b>{feature.name}</b></div></td><td>{feature.description}</td><td>{rooms.filter((room) => room.featureIds.includes(feature.id)).length} oda</td><td><span className={feature.active ? styles.active : styles.passive}>{feature.active ? "Aktif" : "Pasif"}</span></td><td><div className={styles.actions}><button onClick={() => setEditFeature(feature)}><EditOutlined /></button><button onClick={() => setStatusTarget({ type: "feature", item: feature })}><ToggleOffOutlined /></button></div></td></tr>)}</tbody></table></div>}
    </section>
  </main></div>
  <RoomFormDialog open={roomForm || Boolean(editRoom)} room={editRoom} features={features} onClose={() => { setRoomForm(false); setEditRoom(null); }} onSave={saveRoom} />
  <FeatureFormDialog open={featureForm || Boolean(editFeature)} feature={editFeature} onClose={() => { setFeatureForm(false); setEditFeature(null); }} onSave={saveFeature} />
  <ResourceStatusDialog item={statusTarget?.item} type={statusTarget?.type} onClose={() => setStatusTarget(null)} onConfirm={toggleStatus} />
  </div>;
}
