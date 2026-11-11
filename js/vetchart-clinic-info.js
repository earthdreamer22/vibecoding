/* VetChart — 진료시간·휴진·공지 표시 (content/clinic.json을 읽어 #vetchart-clinic-info에 표시)
   데이터는 글자(textContent)로만 넣는다 — HTML로 해석하지 않음 */
(function () {
  var box = document.getElementById('vetchart-clinic-info');
  if (!box) return;
  var src = (document.currentScript && document.currentScript.getAttribute('data-src')) || 'content/clinic.json';

  var css = '#vetchart-clinic-info{max-width:960px;margin:32px auto;padding:20px 24px;border:1px solid #e5e7eb;border-radius:12px;' +
    'font-family:inherit;line-height:1.6;background:#fff;color:#1f2937}' +
    '#vetchart-clinic-info h3{margin:0 0 8px;font-size:1.1em}' +
    '#vetchart-clinic-info .vc-sec{margin:12px 0}' +
    '#vetchart-clinic-info table{border-collapse:collapse}' +
    '#vetchart-clinic-info td{padding:2px 16px 2px 0;vertical-align:top}' +
    '#vetchart-clinic-info .vc-notice{padding:10px 12px;margin:6px 0;background:#f9fafb;border-left:3px solid #2563eb;border-radius:4px}' +
    '#vetchart-clinic-info .vc-notice p{margin:4px 0 0;white-space:pre-line}' +
    '#vetchart-clinic-info .vc-muted{color:#6b7280;font-size:.9em}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text != null) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }
  function today() {
    var d = new Date();
    var m = ('0' + (d.getMonth() + 1)).slice(-2), day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  fetch(src + '?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      var t = today();
      var notices = (d.notices || []).filter(function (n) {
        return (!n.from || n.from <= t) && (!n.to || t <= n.to);
      });
      var closed = (d.closed || []).filter(function (c) { return c.date >= t; })
        .sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(0, 10);
      var hours = d.hours || [];
      if (!notices.length && !closed.length && !hours.length) return;

      if (notices.length) {
        var s1 = el('div', null, 'vc-sec');
        s1.appendChild(el('h3', '공지'));
        notices.forEach(function (n) {
          var b = el('div', null, 'vc-notice');
          b.appendChild(el('strong', n.title));
          if (n.body) b.appendChild(el('p', n.body));
          s1.appendChild(b);
        });
        box.appendChild(s1);
      }
      if (hours.length) {
        var s2 = el('div', null, 'vc-sec');
        s2.appendChild(el('h3', '진료시간'));
        var tb = el('table');
        hours.forEach(function (h) {
          var tr = el('tr');
          tr.appendChild(el('td', h.days));
          tr.appendChild(el('td', h.time));
          tb.appendChild(tr);
        });
        if (d.lunch) {
          var tr2 = el('tr');
          tr2.appendChild(el('td', '점심시간'));
          tr2.appendChild(el('td', d.lunch));
          tb.appendChild(tr2);
        }
        s2.appendChild(tb);
        box.appendChild(s2);
      }
      if (closed.length) {
        var s3 = el('div', null, 'vc-sec');
        s3.appendChild(el('h3', '휴진 안내'));
        closed.forEach(function (c) {
          s3.appendChild(el('div', c.date + (c.reason ? ' — ' + c.reason : '')));
        });
        box.appendChild(s3);
      }
      if (d.phone || d.address) {
        box.appendChild(el('div', [d.phone ? '전화 ' + d.phone : '', d.address || ''].filter(Boolean).join(' · '), 'vc-muted'));
      }
    })
    .catch(function () { /* 데이터를 못 읽으면 아무것도 표시하지 않음 */ });
})();
