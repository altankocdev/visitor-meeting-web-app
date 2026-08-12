import { CloseRounded, ComputerRounded, DownloadRounded, PersonOutlineRounded, SearchRounded, VisibilityOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/tr";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../../infrastructure/api/apiError";
import { auditRepository } from "../../infrastructure/repositories/auditRepository";
import { useAuth } from "../auth/AuthContext";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";
import { AppNotice } from "../components/AppNotice";
import styles from "./AuditLogsPage.module.css";
import { auditActionLabels as localizedActionLabels, auditTargetLabels, localizeAuditDetails } from "../utils/auditLocalization";

const actionLabels = {
  ...localizedActionLabels,
  USER_CREATED: "Kullanıcı oluşturuldu",
  USER_DEACTIVATED: "Kullanıcı pasifleştirildi",
  RESERVATION_APPROVED: "Rezervasyon onaylandı",
  RESERVATION_EXPIRED: "Rezervasyon süresi doldu",
  ROLE_UPDATED: "Rol güncellendi",
  ROOM_CREATED: "Oda oluşturuldu",
  DEPARTMENT_UPDATED: "Departman güncellendi",
};

function mapAuditLog(log) {
  return {
    ...log,
    actionCode: log.action,
    action: localizedActionLabels[log.action] || "Sistem işlemi",
    targetTypeCode: log.targetType,
    targetType: auditTargetLabels[log.targetType] || "Sistem kaydı",
    details: localizeAuditDetails(log.action, log.details),
    actor: log.actorName || "Sistem",
    username: log.actorUserId ? `user-${log.actorUserId}` : "system",
    targetLabel: log.companyName || log.targetType,
    actionLabel: localizedActionLabels[log.action] || "Sistem işlemi",
    targetTypeLabel: auditTargetLabels[log.targetType] || "Sistem kaydı",
    localizedDetails: localizeAuditDetails(log.action, log.details),
  };
}

export function AuditLogsPage() {
  const { session } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({ search: "", targetType: "", actor: "", date: "" });
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    let active = true;
    setLoading(true);
    auditRepository.list({
      isPlatformAdmin: session.isPlatformAdmin,
      page: 0,
      size: 200,
      sort: "createdAt,desc",
    }).then((page) => {
      if (!active) return;
      setAuditLogs((page.content ?? []).map(mapAuditLog));
      setNotice(null);
    }).catch((error) => {
      if (active) setNotice({ severity: "error", text: getApiErrorMessage(error, "Denetim kayıtları yüklenemedi.") });
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [session.isPlatformAdmin]);

  const exportLogs = async () => {
    setExporting(true);
    try {
      const targetTypes = filters.targetType ? [filters.targetType] : undefined;
      const { blob, filename } = await auditRepository.exportFile({
        isPlatformAdmin: session.isPlatformAdmin,
        targetTypes,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ severity: "success", text: "Denetim kayıtları Excel dosyası olarak indirildi." });
    } catch (error) {
      setNotice({ severity: "error", text: getApiErrorMessage(error, "Denetim kayıtları indirilemedi.") });
    } finally {
      setExporting(false);
    }
  };

  const actors = useMemo(
    () => [...new Map(auditLogs.map((log) => [log.username, log.actor])).entries()],
    [auditLogs],
  );
  const filtered = useMemo(() => auditLogs.filter((log) => {
    const search = filters.search.toLocaleLowerCase("tr-TR");
    return (!search || `${log.actor} ${log.actionLabel} ${log.targetLabel} ${log.targetTypeLabel} ${log.localizedDetails}`.toLocaleLowerCase("tr-TR").includes(search))
      && (!filters.targetType || log.targetTypeCode === filters.targetType)
      && (!filters.actor || log.username === filters.actor)
      && (!filters.date || dayjs(log.createdAt).format("YYYY-MM-DD") === filters.date);
  }), [filters, auditLogs]);

  return <div className={styles.shell}><AdminSidebar session={session} /><div className={styles.main}><AdminTopbar /><main className={styles.content}>
    <header className={styles.pageHead}><div><small>GÜVENLİK VE İZLENEBİLİRLİK</small><h1>Denetim kayıtları</h1><p>Şirket içindeki kritik yönetim işlemlerinin kim tarafından ve ne zaman yapıldığını inceleyin.</p></div><button type="button" onClick={exportLogs} disabled={exporting}><DownloadRounded />{exporting ? "Hazırlanıyor..." : "Kayıtları dışa aktar"}</button></header>
    <AppNotice notice={notice} onClose={() => setNotice(null)} />
    <section className={styles.panel}><header><div><h2>İşlem geçmişi</h2><p>{loading ? "Kayıtlar yükleniyor..." : `${filtered.length} kayıt gösteriliyor`}</p></div></header><div className={styles.filters}><label><SearchRounded /><input value={filters.search} placeholder="Kullanıcı, işlem veya hedef ara..." onChange={(event) => setFilters((value) => ({ ...value, search: event.target.value }))} /></label><select value={filters.targetType} onChange={(event) => setFilters((value) => ({ ...value, targetType: event.target.value }))}><option value="">Tüm kaynaklar</option><option value="USER">Kullanıcı</option><option value="USER_PERMISSION">Kullanıcı yetkisi</option><option value="RESERVATION">Rezervasyon</option><option value="ROLE">Rol</option><option value="ROOM">Oda</option><option value="DEPARTMENT">Departman</option><option value="JOB_TITLE">Unvan</option><option value="COMPANY">Şirket</option><option value="FEATURE">Özellik</option><option value="AUTH">Oturum</option></select><select value={filters.actor} onChange={(event) => setFilters((value) => ({ ...value, actor: event.target.value }))}><option value="">Tüm aktörler</option>{actors.map(([username, actor]) => <option key={username} value={username}>{actor}</option>)}</select><input type="date" value={filters.date} onChange={(event) => setFilters((value) => ({ ...value, date: event.target.value }))} /></div>
      <div className={styles.tableWrap}><table><thead><tr><th>TARİH VE SAAT</th><th>İŞLEMİ YAPAN</th><th>İŞLEM</th><th>HEDEF</th><th>DETAY</th><th /></tr></thead><tbody>{filtered.map((log) => <tr key={log.id}><td><b>{dayjs(log.createdAt).locale("tr").format("D MMMM YYYY")}</b><small>{dayjs(log.createdAt).format("HH:mm:ss")}</small></td><td><div className={styles.actor}><span>{log.actorUserId ? <PersonOutlineRounded /> : <ComputerRounded />}</span><div><b>{log.actor}</b><small>@{log.username}</small></div></div></td><td><span className={styles.action}>{actionLabels[log.action] || log.action}</span></td><td><b>{log.targetLabel}</b><small>{log.targetType} #{log.targetId}</small></td><td><p className={styles.detailText}>{log.details}</p></td><td><button className={styles.view} type="button" onClick={() => setSelected(log)}><VisibilityOutlined /></button></td></tr>)}</tbody></table></div>
    </section>
  </main></div>
  {selected && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><section className={styles.dialog} role="dialog" aria-modal="true"><header><span><HistoryRounded /></span><div><small>DENETİM KAYDI</small><h2>{actionLabels[selected.action] || selected.action}</h2><p>Kayıt #{selected.id}</p></div><button type="button" onClick={() => setSelected(null)}><CloseRounded /></button></header><div className={styles.dialogBody}><dl><div><dt>Tarih ve saat</dt><dd>{dayjs(selected.createdAt).locale("tr").format("D MMMM YYYY, dddd · HH:mm:ss")}</dd></div><div><dt>İşlemi yapan</dt><dd>{selected.actor} (@{selected.username})</dd></div><div><dt>İşlem kodu</dt><dd><code>{selected.action}</code></dd></div><div><dt>Hedef</dt><dd>{selected.targetType} #{selected.targetId} · {selected.targetLabel}</dd></div></dl><section><small>İŞLEM DETAYI</small><p>{selected.details}</p></section></div><footer><button type="button" onClick={() => setSelected(null)}>Kapat</button></footer></section></div>}
  </div>;
}
