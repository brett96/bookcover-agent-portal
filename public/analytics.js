(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var product = script.getAttribute("data-product") || "legacy";
  var site = script.getAttribute("data-site") || "landing";
  var trackUrl = script.getAttribute("data-track-url") || "/api/track";

  function getOrCreateId(storageKey) {
    try {
      var existing = localStorage.getItem(storageKey);
      if (existing) return existing;
      var id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
      localStorage.setItem(storageKey, id);
      return id;
    } catch (e) {
      return "anon";
    }
  }

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    };
  }

  function track(eventType, extra) {
    var payload = Object.assign(
      {
        visitorId: getOrCreateId("bc_visitor_id"),
        sessionId: getOrCreateId("bc_session_id"),
        eventType: eventType || "pageview",
        path: window.location.pathname + window.location.search,
        referrer: document.referrer || null,
        product: product,
        site: site,
      },
      getUtmParams(),
      extra || {},
    );

    var body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        trackUrl,
        new Blob([body], { type: "application/json" }),
      );
    } else {
      fetch(trackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
        credentials: "omit",
      }).catch(function () {});
    }
  }

  track("pageview");
  window.bcTrack = track;
})();
