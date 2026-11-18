(function () {
  var m = (location.hash || '').match(/jpext=([A-Za-z0-9_-]+)/);
  if (!m) return;
  var token = m[1];

  function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function regOf(r) {
    var d = r.detail || {};
    if (d.reg) return norm(d.reg);
    var x = String(r.label || '').match(/^([A-Za-z0-9-]+)\s/);
    return x ? norm(x[1]) : '';
  }
  function api(path) {
    return fetch(path, { credentials: 'include', headers: { Accept: 'application/json' } }).then(function (r) {
      return r.text().then(function (text) {
        if (!r.ok) {
          var e = new Error('HTTP ' + r.status);
          e.status = r.status;
          e.challenge = r.status === 403 || r.status === 503;
          throw e;
        }
        if (/Just a moment|cf-challenge|请稍候|Enable JavaScript/i.test(text.slice(0, 4000))) {
          var c = new Error('challenge');
          c.challenge = true;
          throw c;
        }
        try { return JSON.parse(text); } catch (x) { throw new Error('non-json'); }
      });
    });
  }
  function airport(id) {
    if (!id) return Promise.resolve(null);
    return api('/api/v2/airports/' + id).then(function (j) {
      var i = (((j || {}).data || {}).info) || {};
      return i.id ? {
        id: i.id, iata: i.iata, icao: i.icao, name: i.name, city: i.city,
        lat: i.latitude, lon: i.longitude, tz: i.timezone
      } : null;
    });
  }
  function cancelled(x) {
    var st = x.status || {}, g = ((st.generic || {}).status) || {};
    return /cancel/i.test(String(g.type || '')) || /cancel/i.test(String(st.text || ''));
  }
  function operated(x) {
    var st = x.status || {}, g = ((st.generic || {}).status) || {};
    var real = (x.time || {}).real || {};
    return !!(real.departure || real.arrival) || String(g.type || '').toLowerCase() === 'arrival';
  }
  function brief(x) {
    var idn = x.identification || {}, ap = x.airport || {}, tm = x.time || {}, st = x.status || {};
    var g = ((st.generic || {}).status) || {}, o = ap.origin || {}, d = ap.destination || {}, rr = ap.real || {};
    return {
      number: ((idn.number || {}).default) || null,
      callsign: idn.callsign || null,
      origin_code: o.code || null,
      destination_code: rr.code || d.code || null,
      origin_id: o.id || null,
      destination_id: rr.id || d.id || null,
      real_departure: ((tm.real || {}).departure) || null,
      real_arrival: ((tm.real || {}).arrival) || null,
      status_text: st.text || null,
      cancelled: cancelled(x),
      live: !!st.live,
      aircraft_type: (((x.aircraft || {}).model) || {}).text || null,
      airline: ((x.airline || {}).name) || null
    };
  }

  function history(key, out) {
    return api('/api/v2/flights?fetchBy=reg&query=' + encodeURIComponent(key) + '&limit=12').then(function (j) {
      var items = ((((j || {}).result || {}).response || {}).data) || [];
      if (!items.length) {
        out.no_records = true;
        out.notes.push('FR24 没有这架飞机的航班记录');
        return out;
      }
      var liveItems = items.filter(function (x) { return !cancelled(x); });
      var last = liveItems.filter(operated)[0] || liveItems[0];
      if (last) {
        out.last_flight = brief(last);
        out.en_route = !!(out.last_flight.real_departure && !out.last_flight.real_arrival);
        if (!out.aircraft.model) out.aircraft.model = out.last_flight.aircraft_type;
        if (!out.aircraft.airline) out.aircraft.airline = out.last_flight.airline;
        return airport(out.last_flight.destination_id).then(function (ap) {
          out.airport = ap;
          out.last_flight.airport = ap;
          var now = Date.now() / 1000;
          var up = liveItems.filter(function (x) {
            var sd = (((x.time || {}).scheduled || {}).departure) || 0;
            return sd > now && !operated(x);
          })[0];
          if (up) out.upcoming = brief(up);
          return out;
        });
      }
      return out;
    });
  }

  function lookupCore(reg) {
    var key = norm(reg);
    var out = {
      query: reg, found: false, aircraft: { reg: reg },
      live: null, flight: null, last_flight: null, airport: null,
      upcoming: null, notes: [], en_route: false, fetched_at: new Date().toISOString()
    };
    return api('/v1/search/web/find?query=' + encodeURIComponent(reg) + '&limit=20').then(function (s) {
      var results = (s || {}).results || [];
      var exact = results.filter(function (r) { return regOf(r) === key; });
      if (!exact.length) {
        out.notes.push('FR24 没有该注册号的精确记录');
        return out;
      }
      out.found = true;
      var ac = exact.filter(function (r) { return r.type === 'aircraft'; })[0];
      var live = exact.filter(function (r) { return r.type === 'live'; })[0];
      if (ac) {
        var ad = ac.detail || {};
        out.aircraft.type = ad.equip || null;
        out.aircraft.icao24 = ad.hex || null;
        out.aircraft.airline = ad.owner || null;
      }
      if (!live) return history(key, out);
      var det = live.detail || {};
      out.aircraft.reg = det.reg || reg;
      out.aircraft.type = det.ac_type || out.aircraft.type;
      out.aircraft.icao24 = det.hex || out.aircraft.icao24;
      out.aircraft.route_text = det.route || null;
      out.live = {
        fr24_id: live.id || '', callsign: det.callsign || null,
        lat: det.lat, lon: det.lon, alt: null, gs: null, track: null,
        vs: null, ground: false, ts: null, age_s: null,
        precision: '粗（FR24 搜索接口，约 11 km）'
      };
      if (!live.id) return out;
      return api('/api/v2/flights/' + encodeURIComponent(live.id)).then(function (j) {
        var d = (j || {}).data || {}, f = d.flight || {}, sch = d.schedule || {}, fa = d.aircraft || {};
        out.aircraft.model = fa.name || out.aircraft.model;
        out.aircraft.type = fa.type || out.aircraft.type;
        out.aircraft.airline = d.airline || out.aircraft.airline;
        out.flight = {
          number: f.number || null, callsign: f.callsign || out.live.callsign,
          origin: null, destination: null,
          std: sch.std || null, atd: sch.atd || null, sta: sch.sta || null, ata: sch.ata || null
        };
        return Promise.all([airport(d.originId), airport(d.destinationId)]).then(function (aps) {
          out.flight.origin = aps[0];
          out.flight.destination = aps[1];
          return out;
        });
      }).catch(function () { return out; });
    });
  }

  function parseFeed(j) {
    var arr = null;
    Object.keys(j || {}).some(function (k) {
      if (Array.isArray(j[k])) { arr = j[k]; return true; }
      return false;
    });
    if (!arr || arr.length < 6) return null;
    var alt = +arr[4], gs = +arr[5], track = +arr[3];
    return {
      lat: isFinite(+arr[1]) ? +arr[1] : null,
      lon: isFinite(+arr[2]) ? +arr[2] : null,
      alt: isFinite(alt) ? alt : null,
      gs: isFinite(gs) ? gs : null,
      track: isFinite(track) ? track : null,
      ground: alt === 0
    };
  }
  function feedFor(reg) {
    var url = 'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?reg=!' + encodeURIComponent(reg);
    return fetch(url, { credentials: 'include' }).then(function (r) { return r.json(); }).catch(function () {
      return new Promise(function (resolve) {
        chrome.runtime.sendMessage({ type: 'jpfr24ext-feed', reg: reg }, function (r) {
          resolve(r && r.ok ? r.data : null);
        });
      });
    }).then(parseFeed).catch(function () { return null; });
  }
  function lookup(reg) {
    return lookupCore(reg).then(function (out) {
      if (!out.live) return out;
      return feedFor(out.aircraft.reg || reg).then(function (f) {
        if (!f) return out;
        if (f.lat != null) out.live.lat = f.lat;
        if (f.lon != null) out.live.lon = f.lon;
        if (f.alt != null) out.live.alt = f.alt;
        if (f.gs != null) out.live.gs = f.gs;
        if (f.track != null) out.live.track = f.track;
        if (f.ground) out.live.ground = true;
        return out;
      });
    });
  }

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg) return;
    if (msg.type === 'jpext-ping') {
      chrome.runtime.sendMessage({ type: 'fr24-ready', token: token });
      sendResponse({ ok: true });
      return true;
    }
    if (msg.type === 'jpext-lookup') {
      lookup(msg.reg).then(function (report) {
        sendResponse({ ok: true, report: report });
      }).catch(function (err) {
        sendResponse({
          ok: false,
          error: err && err.challenge ? 'challenge' : 'query',
          message: String((err && err.message) || err)
        });
      });
      return true;
    }
  });

  chrome.runtime.sendMessage({ type: 'fr24-ready', token: token }, function () {
    if (chrome.runtime.lastError) return;
  });
})();