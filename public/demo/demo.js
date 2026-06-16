/* BookCover Agent Portal Demo — modular shell (v59) */

let SCREENS = [];
let FLOWS = [];
const flowHtmlCache = new Map();
const flowLoadPromises = new Map();

let activeFlow = 0;
let cur = 0;
let isOverview = true;
let isWiw = false;
let vis = [];

function scrollDeviceToTop() {
  const area = document.getElementById("device-area");
  if (area) area.scrollTop = 0;
  const scr = document.getElementById("screen");
  if (scr) scr.scrollTop = 0;
  const main = scr && scr.querySelector(".mock-main");
  if (main) main.scrollTop = 0;
}

function setDeviceMode(mode) {
  const area = document.getElementById("device-area");
  if (area) area.classList.toggle("has-mockup", mode === "mockup");
}

function updateGuideSummary() {
  const summary = document.getElementById("guide-toggle-summary");
  if (!summary) return;
  const uc = document.getElementById("uc");
  const st = document.getElementById("st");
  const ucText = uc ? uc.textContent : "";
  const stText = st ? st.textContent : "";
  summary.innerHTML =
    "<strong>" + (stText || "Presenter guide") + "</strong>" +
    (ucText ? " · " + ucText : " · tap to expand");
}

function initMobileGuide() {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("guide-toggle");
  if (!sidebar || !toggle) return;
  toggle.addEventListener("click", function () {
    const open = sidebar.classList.toggle("guide-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function flowStart(f) {
  return FLOWS[f].start;
}

function flowCur() {
  return flowStart(activeFlow) + cur;
}

async function ensureFlowHtml(flowIdx) {
  const flow = FLOWS[flowIdx];
  if (!flow) return [];
  if (flowHtmlCache.has(flow.id)) return flowHtmlCache.get(flow.id);

  let promise = flowLoadPromises.get(flow.id);
  if (!promise) {
    promise = fetch("data/html/" + flow.id + ".json")
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load flow " + flow.id);
        return res.json();
      })
      .then(function (chunk) {
        flowHtmlCache.set(flow.id, chunk);
        return chunk;
      });
    flowLoadPromises.set(flow.id, promise);
  }
  return promise;
}

function getScreenHtml(globalIdx) {
  for (let f = 0; f < FLOWS.length; f++) {
    const flow = FLOWS[f];
    if (globalIdx >= flow.start && globalIdx < flow.start + flow.count) {
      const chunk = flowHtmlCache.get(flow.id);
      if (!chunk) return null;
      return chunk[globalIdx - flow.start];
    }
  }
  return null;
}

function prepareMockHtml(h) {
  return h
    .replace(/^<div style="/, '<div class="mock-frame" style="')
    .replace(
      '<div style="background:#2D2D2D;padding:10px 14px',
      '<div class="mock-chrome" style="background:#2D2D2D;padding:10px 14px',
    )
    .replace(
      '<div style="background:#FFFFFF;border-bottom:1px solid #E2E8F0;height:44px;display:flex;align-items:center;padding:0 16px',
      '<div class="mock-appbar" style="background:#FFFFFF;border-bottom:1px solid #E2E8F0;height:44px;display:flex;align-items:center;padding:0 16px',
    )
    .replace(
      '<div style="flex:1;display:flex;overflow:hidden">',
      '<div class="mock-body" style="flex:1;display:flex;overflow:hidden">',
    )
    .replace(
      '<div style="width:160px;flex-shrink:0;background:#FFFFFF;border-right:1px solid #E2E8F0;display:flex;flex-direction:column;min-height:0">',
      '<div class="mock-nav" style="width:160px;flex-shrink:0;background:#FFFFFF;border-right:1px solid #E2E8F0;display:flex;flex-direction:column;min-height:0">',
    )
    .replace(
      '<div style="flex:1;overflow-y:auto;background:#F8FAFC">',
      '<div class="mock-main" style="flex:1;overflow-y:auto;background:#F8FAFC">',
    );
}

function switchToOverview() {
  isOverview = true;
  isWiw = false;
  setDeviceMode("overview");
  document.querySelectorAll(".flow-tab").forEach(function (b) {
    b.classList.remove("active");
  });
  const ovBtn = document.getElementById("ftab-ov");
  if (ovBtn) ovBtn.classList.add("active");
  const panel = document.getElementById("ov-panel");
  if (panel) {
    panel.style.display = "flex";
    panel.style.flexDirection = "column";
  }
  const wp = document.getElementById("wiw-panel");
  if (wp) wp.style.display = "none";
  const scr = document.getElementById("screen");
  if (scr) scr.style.display = "none";
  document.getElementById("prev").disabled = true;
  document.getElementById("next").disabled = false;
  document.getElementById("dots").innerHTML = "";
  document.getElementById("ctr").textContent = "";
  document.getElementById("fill").style.width = "0%";
  document.getElementById("uc").textContent = "Overview";
  document.getElementById("ph").textContent = "BOOKCOVER AGENT PORTAL";
  document.getElementById("st").textContent = "Carrier Retention Demo";
  document.getElementById("ss").textContent =
    "Medicare Advantage · 12,450 members · Your Health Plan";
  document.getElementById("sb").textContent =
    "Select a use case tab above to begin the walkthrough. Each tab shows a complete agent workflow with step-by-step screen navigation and presenter talking points.";
  document.getElementById("buls").innerHTML = [
    "D1: Daily Dashboard (1 screen) — KPIs, approvals, NBA at-risk section",
    "D2: Daily Campaigns (8 screens) — list, queue, review, edit, settings, approve",
    "D3: Daily At Risk (4 screens) — NBA list, member detail, log outreach, disposition",
    "Tab 4: Member Details (4 screens) — score factors, comms timeline, outreach logging",
    "Tab 5: Reporting & Sharing (4 screens) — analytics, AEP Stay vs Switch, automated delivery",
  ]
    .map(function (b) {
      return '<li class="bul"><div class="bd"></div>' + b + "</li>";
    })
    .join("");
  updateGuideSummary();
  scrollDeviceToTop();
}

async function switchFlow(f, startIdx) {
  if (startIdx === undefined) startIdx = 0;
  if (f === activeFlow && !isOverview && !isWiw && startIdx === cur) return;

  isOverview = false;
  isWiw = false;
  setDeviceMode("mockup");
  const panel = document.getElementById("ov-panel");
  if (panel) panel.style.display = "none";
  const wp = document.getElementById("wiw-panel");
  if (wp) wp.style.display = "none";
  const scr = document.getElementById("screen");
  if (scr) {
    scr.style.display = "flex";
    scr.style.flexDirection = "column";
  }
  activeFlow = f;
  cur = startIdx;

  document.querySelectorAll(".flow-tab[data-fidx]").forEach(function (b) {
    b.classList.toggle("active", parseInt(b.dataset.fidx, 10) === f);
  });
  document.querySelectorAll(".flow-tab").forEach(function (b) {
    if (!b.dataset.fidx) b.classList.remove("active");
  });
  const ovBtn = document.getElementById("ftab-ov");
  if (ovBtn) ovBtn.classList.remove("active");
  const wiwBtn = document.getElementById("ftab-wiw");
  if (wiwBtn) wiwBtn.classList.remove("active");

  scrollDeviceToTop();
  await ensureFlowHtml(f);
  render(startIdx, 1);
}

function render(idx) {
  cur = idx;
  vis[activeFlow].add(cur);
  const gi = flowCur();
  const s = SCREENS[gi];
  const h = getScreenHtml(gi);

  document.getElementById("uc").textContent = s.useCase || "";
  document.getElementById("ph").textContent = s.phase || "";
  document.getElementById("st").textContent = s.title || "";
  document.getElementById("ss").textContent = s.subtitle || "";
  document.getElementById("sb").textContent = s.explanation || "";
  document.getElementById("buls").innerHTML = (s.bullets || [])
    .map(function (b) {
      return '<li class="bul"><div class="bd"></div>' + b + "</li>";
    })
    .join("");
  updateGuideSummary();

  const total = FLOWS[activeFlow].count;
  document.getElementById("ctr").textContent = idx + 1 + " / " + total;
  document.getElementById("fill").style.width = ((idx + 1) / total) * 100 + "%";
  document.getElementById("dots").innerHTML = Array.from(
    { length: total },
    function (_, i) {
      let c = "dot";
      if (i === idx) c += " on";
      else if (vis[activeFlow].has(i)) c += " been";
      return (
        '<button type="button" class="' +
        c +
        '" onclick="jump(' +
        i +
        ')"></button>'
      );
    },
  ).join("");

  const maxTabFlow = 5;
  const atFirst = idx === 0;
  const atLast = idx === total - 1;
  document.getElementById("prev").disabled = atFirst && activeFlow === 0;
  document.getElementById("next").disabled = atLast && activeFlow >= maxTabFlow;

  const scr = document.getElementById("screen");
  if (h) {
    scr.innerHTML = prepareMockHtml(h);
  } else {
    scr.innerHTML =
      '<div class="mock-loading">Loading screen…</div>';
  }
  scrollDeviceToTop();
  requestAnimationFrame(scrollDeviceToTop);
}

async function nav(d) {
  if (isOverview) {
    if (d > 0) await switchFlow(0);
    return;
  }
  if (isWiw) {
    if (d > 0) await switchFlow(0);
    else if (d < 0) switchToOverview();
    return;
  }
  const total = FLOWS[activeFlow].count;
  const n = cur + d;
  if (n >= 0 && n < total) {
    render(n);
    return;
  }
  const maxTabFlow = 5;
  if (d > 0 && n >= total && activeFlow < maxTabFlow) {
    await switchFlow(activeFlow + 1, 0);
    return;
  }
  if (d < 0 && n < 0 && activeFlow > 0) {
    await switchFlow(activeFlow - 1, FLOWS[activeFlow - 1].count - 1);
  }
}

async function jump(i) {
  if (i === cur) return;
  render(i);
}

function gotoSettings() {
  gotoScreen(32);
}
function gotoMyAccount() {
  gotoScreen(33);
}

async function gotoScreen(globalIdx) {
  if (typeof globalIdx !== "number") return;
  for (let f = 0; f < FLOWS.length; f++) {
    const flow = FLOWS[f];
    if (globalIdx >= flow.start && globalIdx < flow.start + flow.count) {
      await switchFlow(f, globalIdx - flow.start);
      return;
    }
  }
}

function switchToWhyItWorks() {
  isOverview = false;
  isWiw = true;
  setDeviceMode("wiw");
  const op = document.getElementById("ov-panel");
  if (op) op.style.display = "none";
  const scr = document.getElementById("screen");
  if (scr) scr.style.display = "none";
  const wp = document.getElementById("wiw-panel");
  if (wp) {
    wp.style.display = "flex";
    wp.style.flexDirection = "column";
  }
  document.querySelectorAll(".flow-tab").forEach(function (b) {
    b.classList.remove("active");
  });
  const wiwBtn = document.getElementById("ftab-wiw");
  if (wiwBtn) wiwBtn.classList.add("active");
  document.getElementById("prev").disabled = false;
  document.getElementById("next").disabled = false;
  document.getElementById("dots").innerHTML = "";
  document.getElementById("ctr").textContent = "";
  document.getElementById("fill").style.width = "0%";
  document.getElementById("uc").textContent = "About BookCover";
  document.getElementById("ph").textContent = "WHY IT WORKS";
  document.getElementById("st").textContent = "How BookCover drives retention";
  document.getElementById("ss").textContent =
    "A philosophical deep-dive into the platform";
  document.getElementById("sb").textContent =
    "This page explains the retention thesis underlying BookCover — why members actually leave, what real retention requires, and how the platform automates the relationship work human teams can't scale at carrier volume.";
  document.getElementById("buls").innerHTML = [
    "Hero: Retention isn't a campaign. It's a relationship.",
    "Why members leave — disenrollment correlates with silence, not price",
    "What real retention requires — continuous contact, real personalization, relationship recognition",
    "What BookCover does — automation + claims-based personalization + risk scoring",
    "How the risk score works — standard factors + member + carrier behavior",
    "From insight to action — Transition Reports + Stay-Switch Analysis",
    "What this looks like to the member — specific outcomes from the member's seat",
  ]
    .map(function (b) {
      return '<li class="bul"><div class="bd"></div>' + b + "</li>";
    })
    .join("");
  updateGuideSummary();
  scrollDeviceToTop();
}

document.addEventListener("keydown", function (e) {
  if (isOverview || isWiw) {
    if (["ArrowRight", "ArrowDown", " "].includes(e.key)) {
      e.preventDefault();
      nav(1);
    }
    if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      nav(-1);
    }
    return;
  }
  if (["ArrowRight", "ArrowDown", " "].includes(e.key)) {
    e.preventDefault();
    nav(1);
  }
  if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
    e.preventDefault();
    nav(-1);
  }
  if (e.key === "Home") jump(0);
  if (e.key === "End") jump(FLOWS[activeFlow].count - 1);
});

async function initDemo() {
  initMobileGuide();
  const [screensRes, flowsRes] = await Promise.all([
    fetch("data/screens.json"),
    fetch("data/flows.json"),
  ]);
  SCREENS = await screensRes.json();
  FLOWS = await flowsRes.json();
  vis = FLOWS.map(function () {
    return new Set([0]);
  });
  switchToOverview();
}

initDemo();

// Expose handlers for inline onclick attributes
window.switchToOverview = switchToOverview;
window.switchToWhyItWorks = switchToWhyItWorks;
window.switchFlow = switchFlow;
window.nav = nav;
window.jump = jump;
window.gotoSettings = gotoSettings;
window.gotoMyAccount = gotoMyAccount;
window.gotoScreen = gotoScreen;
