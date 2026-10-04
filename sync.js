/* Shared sync for kit, model and paydown (baleno.html has its own, same passphrase and same row).
   Each page keeps saving to localStorage first. Once a passphrase is set (on any page, it is shared),
   changes are pushed automatically and newer data from other devices is pulled when a page opens.
   Each page's data is stored in the same row as the Baleno notes under the key "blob:<name>" as {v, t}. */
(function () {
  "use strict";
  var SB_URL = "https://pylydxonynjuaviqjpbs.supabase.co";
  var SB_KEY = "sb_publishable_XvxvC2AKgltjPTFSUndXCQ_RK84ozCp";   // publishable key: safe in the browser
  var LSK = "baleno.sync";
  var BLOBS = { kit: "carhuntkit.v1", model: "carmoneymodel.v1", paydown: "cardebtpaydown.v1" };

  var syncKey = "", pushT, busy = false, again = false, pillEl, dlg;
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function tOf(n) { return +ls("carsync.t." + n) || 0; }
  syncKey = ls(LSK) || "";

  function rpc(fn, body) {
    return fetch(SB_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: { "Content-Type": "application/json", apikey: SB_KEY }, body: JSON.stringify(body) })
      .then(function (r) { return r.text().then(function (t) { if (!r.ok) throw new Error(r.status + " " + t.slice(0, 120)); return t ? JSON.parse(t) : null; }); });
  }
  function pill(txt) { if (pillEl) pillEl.textContent = txt; }
  function hhmm() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }

  function sync() {
    if (!syncKey) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    busy = true; pill("Syncing...");
    var applied = false;
    return rpc("carplanner_get", { p_key: syncKey }).then(function (remote) {
      remote = remote || {};
      var push = false;
      Object.keys(BLOBS).forEach(function (n) {
        var r = remote["blob:" + n], lt = tOf(n), raw = ls(BLOBS[n]);
        if (r && typeof r.t === "number" && r.t > lt) {
          lsSet(BLOBS[n], JSON.stringify(r.v)); lsSet("carsync.t." + n, String(r.t)); applied = true;
        } else if (raw && (!r || lt > r.t || !r.t)) {
          var v; try { v = JSON.parse(raw); } catch (e) { return; }
          if (!lt) { lt = Date.now(); lsSet("carsync.t." + n, String(lt)); }
          remote["blob:" + n] = { v: v, t: lt }; push = true;
        }
      });
      return push ? rpc("carplanner_put", { p_key: syncKey, p_data: remote }) : null;
    }).then(function () {
      pill("Synced " + hhmm());
      if (applied) {
        var last = +ls("carsync.reload") || 0;
        if (Date.now() - last > 10000) { lsSet("carsync.reload", String(Date.now())); location.reload(); }
      }
    }).catch(function () { pill("Offline: saved here"); })
      .then(function () { busy = false; if (again) { again = false; schedule(); } });
  }
  function schedule() { if (!syncKey) return; pill("Saved here, syncing soon"); clearTimeout(pushT); pushT = setTimeout(sync, 1500); }

  /* pages call this from their save() */
  function touch(name) { lsSet("carsync.t." + name, String(Date.now())); schedule(); }

  /* ---------- small pill + dialog ---------- */
  function ui() {
    var css = document.createElement("style");
    css.textContent =
      ".csPill{position:fixed;right:.8rem;bottom:.8rem;z-index:50;font:500 .68rem/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.04em;" +
      "background:var(--surface,#fff);color:var(--ink-muted,#556764);border:1px solid var(--hairline-2,#C2D0CB);border-radius:99px;padding:.5rem .8rem;min-height:36px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.15)}" +
      ".csDlg{border:1px solid var(--hairline-2,#C2D0CB);border-radius:12px;background:var(--surface,#fff);color:var(--ink,#101E1C);padding:1.1rem;max-width:22rem;width:calc(100% - 2rem);font:400 .95rem/1.5 'Public Sans',system-ui,sans-serif}" +
      ".csDlg::backdrop{background:rgba(0,0,0,.5)}.csDlg h2{margin:0 0 .4rem;font-size:1.05rem}.csDlg p{margin:0 0 .8rem;color:var(--ink-muted,#556764);font-size:.85rem}" +
      ".csDlg input{width:100%;box-sizing:border-box;font:inherit;padding:.55rem .6rem;border:1px solid var(--hairline-2,#C2D0CB);border-radius:8px;background:transparent;color:inherit;margin-bottom:.7rem}" +
      ".csDlg button{font:600 .85rem inherit;font-family:inherit;padding:.55rem .9rem;min-height:40px;border-radius:8px;border:1px solid var(--accent,#0B6E5F);background:var(--accent,#0B6E5F);color:var(--accent-ink,#fff);cursor:pointer;margin-right:.4rem}" +
      ".csDlg button.alt{background:transparent;color:var(--accent,#0B6E5F)}";
    document.head.appendChild(css);
    pillEl = document.createElement("button"); pillEl.type = "button"; pillEl.className = "csPill";
    pillEl.textContent = syncKey ? "Synced" : "Saved on this device";
    pillEl.addEventListener("click", openDlg);
    document.body.appendChild(pillEl);
  }
  function openDlg() {
    if (!dlg) { dlg = document.createElement("dialog"); dlg.className = "csDlg"; document.body.appendChild(dlg); }
    dlg.innerHTML = "";
    function add(tag, txt) { var e = document.createElement(tag); if (txt) e.textContent = txt; dlg.appendChild(e); return e; }
    function btn(txt, fn, alt) { var b = add("button", txt); b.type = "button"; if (alt) b.className = "alt"; b.addEventListener("click", fn); return b; }
    if (!syncKey) {
      add("h2", "Sync between devices");
      add("p", "Pick a passphrase (8+ characters) and use the same one on your phone and laptop. After that everything saves to the cloud by itself.");
      var inp = add("input"); inp.type = "password"; inp.autocomplete = "off"; inp.placeholder = "Passphrase";
      btn("Turn on", function () {
        var k = inp.value.trim(); if (k.length < 8) { inp.placeholder = "At least 8 characters"; inp.value = ""; return; }
        syncKey = k; lsSet(LSK, k); dlg.close(); sync();
      });
      btn("Cancel", function () { dlg.close(); }, true);
    } else {
      add("h2", "Sync is on");
      add("p", "Changes on every page are saved to the cloud automatically.");
      btn("Sync now", function () { dlg.close(); sync(); });
      btn("Turn off", function () {
        if (!confirm("Turn off sync on this device? Your data stays here and in the cloud.")) return;
        syncKey = ""; try { localStorage.removeItem(LSK); } catch (e) {} pill("Saved on this device"); dlg.close();
      }, true);
    }
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  window.CarSync = { touch: touch, sync: sync };
  ui();
  if (syncKey) sync();
  window.addEventListener("online", sync);
})();
