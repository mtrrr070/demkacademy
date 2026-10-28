"use strict";

/* ===== Настройки ===== */
// Дата начала конференции (Алматы, UTC+5)
const EVENT_DATE = new Date("2026-10-31T14:00:00+05:00");

/* ===== Язык: ru / kk / en (тексты — в i18n.js) ===== */
let currentLang = "ru";
function tr(key, params) {
  const dict = window.I18N[currentLang] || {};
  let text = dict[key] ?? window.I18N.ru[key] ?? key;
  for (const k in params || {}) text = text.replace("{" + k + "}", params[k]);
  return text;
}

/* ===== Меню ===== */
const menu = document.getElementById("menu");
document.getElementById("burger").addEventListener("click", () => menu.classList.toggle("open"));
menu.addEventListener("click", e => { if (e.target.tagName === "A") menu.classList.remove("open"); });

/* ===== Таймер ===== */
const tEls = { d: t("t-d"), h: t("t-h"), m: t("t-m"), s: t("t-s") };
function t(id) { return document.getElementById(id); }
function tick() {
  let diff = Math.max(0, EVENT_DATE - new Date());
  const d = Math.floor(diff / 864e5); diff %= 864e5;
  const h = Math.floor(diff / 36e5);  diff %= 36e5;
  const m = Math.floor(diff / 6e4);   diff %= 6e4;
  tEls.d.textContent = d;
  tEls.h.textContent = String(h).padStart(2, "0");
  tEls.m.textContent = String(m).padStart(2, "0");
  tEls.s.textContent = String(Math.floor(diff / 1000)).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

/* ===== Вкладки программы ===== */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".schedule").forEach(s => { s.hidden = s.id !== btn.dataset.day; });
  });
});

/* ===== Переключение языка ===== */
function applyLang(lang) {
  currentLang = Object.prototype.hasOwnProperty.call(window.I18N, lang) ? lang : "ru";
  document.documentElement.lang = currentLang;
  document.title = tr("meta.title");

  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = tr(el.dataset.i18n); });
  // data-i18n-html — только для наших собственных строк из i18n.js (там есть <b>)
  document.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = tr(el.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-attr]").forEach(el => {
    el.dataset.i18nAttr.split(";").forEach(pair => {
      const [attr, key] = pair.split(":").map(x => x.trim());
      if (attr && key) el.setAttribute(attr, tr(key));
    });
  });

  document.querySelectorAll(".lang button").forEach(b => {
    const on = b.dataset.lang === currentLang;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
  });
}

document.querySelectorAll(".lang button").forEach(b => {
  b.addEventListener("click", () => {
    applyLang(b.dataset.lang);
    try { localStorage.setItem("lang", currentLang); } catch (e) {}
  });
});

// Стартовый язык: ?lang=kk в адресе → сохранённый выбор → русский
(function initLang() {
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  const fromUrl = new URLSearchParams(location.search).get("lang");
  const start = [fromUrl, saved].find(l => l && Object.prototype.hasOwnProperty.call(window.I18N, l)) || "ru";
  applyLang(start); // русский тоже из i18n.js — единый источник текста
})();
