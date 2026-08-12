import { CloseRounded, CloudDownloadOutlined, CloudUploadOutlined, DescriptionOutlined } from "@mui/icons-material";
import { useRef, useState } from "react";
import styles from "./UserImportDialog.module.css";

const isExcel = (file) => /\.(xlsx|xls)$/i.test(file?.name ?? "");

export function UserImportDialog({ open, onClose, onImport, onDownloadTemplate }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;

  const close = () => {
    if (submitting) return;
    setFile(null);
    setError("");
    onClose();
  };
  const choose = (selected) => {
    if (!selected) return;
    if (!isExcel(selected)) {
      setFile(null);
      setError("Yalnızca .xlsx veya .xls uzantılı dosya yükleyebilirsiniz.");
      return;
    }
    setFile(selected);
    setError("");
  };
  const submit = async () => {
    if (!file) return setError("Lütfen bir Excel dosyası seçin.");
    setSubmitting(true);
    const result = await onImport(file);
    setSubmitting(false);
    if (result.ok) close();
    else setError(result.message);
  };

  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="import-title">
      <header><span><CloudUploadOutlined /></span><div><small>TOPLU KULLANICI EKLEME</small><h2 id="import-title">Excel’den kullanıcı aktar</h2><p>Birden fazla çalışan hesabını aynı anda oluşturun.</p></div><button type="button" aria-label="Kapat" onClick={close}><CloseRounded /></button></header>
      <div className={styles.body}>
        <aside><b>Excel dosyası nasıl olmalı?</b><p>İlk satır başlıktır. Sütunlar sırasıyla <code>username</code>, <code>ad</code>, <code>soyad</code>, <code>email</code> ve <code>departman</code> olmalıdır. Departman adı sistemdeki aktif bir departmanla aynı olmalıdır. Kullanıcılar “Çalışan” rolüyle oluşturulur; ilk şifreleri kullanıcı adlarıdır ve ilk girişte değiştirilir.</p></aside>
        <button className={styles.templateButton} type="button" onClick={onDownloadTemplate}><CloudDownloadOutlined /><span><b>Örnek Excel şablonunu indir</b><small>Hazır başlıklarla .xlsx dosyası</small></span></button>
        <button className={styles.picker} type="button" onClick={() => inputRef.current?.click()}><DescriptionOutlined />{file ? <><b>{file.name}</b><small>{(file.size / 1024).toFixed(1)} KB · Değiştirmek için tıklayın</small></> : <><b>Excel dosyasını seçin</b><small>.xlsx veya .xls</small></>}</button>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={(event) => choose(event.target.files?.[0])} />
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
      <footer><button type="button" onClick={close} disabled={submitting}>Vazgeç</button><button className={styles.submit} type="button" onClick={submit} disabled={submitting}>{submitting ? "Aktarılıyor..." : "Kullanıcıları aktar"}</button></footer>
    </section>
  </div>;
}
