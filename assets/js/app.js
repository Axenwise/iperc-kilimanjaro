/* =========================================================================
   IPERC post-test · Kilimanjaro Restaurant Café
   Lógica del sitio: carga los datos, pinta las vistas y filtra.
   ========================================================================= */
(function () {
"use strict";

var D = [], RUT = [], CAP = [], listo = false;

var NIV = {
  'Intolerable': {v:5, c:'--n5', f:'--n5f', dice:'Muy alto: no se debe trabajar así'},
  'Importante':  {v:4, c:'--n4', f:'--n4f', dice:'Alto: hay que corregirlo pronto'},
  'Moderado':    {v:3, c:'--n3', f:'--n3f', dice:'Medio: se trabaja con cuidado y con los controles puestos'},
  'Tolerable':   {v:2, c:'--n2', f:'--n2f', dice:'Bajo: se mantiene vigilado'},
  'Trivial':     {v:1, c:'--n1', f:'--n1f', dice:'Muy bajo'}
};
var ORDEN = ['Intolerable','Importante','Moderado','Tolerable','Trivial'];
var TIPO = {'Físico':{c:'--tp1',f:'--tp1f'}, 'Ergonómico':{c:'--tp2',f:'--tp2f'},
            'Locativo':{c:'--tp3',f:'--tp3f'}};
var FOTO_AREA = {'Cocina':'area-cocina.jpg', 'Salón de atención al cliente':'area-salon.jpg',
                 'Lavado de utensilios':'area-lavado.jpg'};
var AREACOL = {};

/* Un icono por familia de peligro: el dibujo ayuda a reconocerla de un vistazo. */
var ICO = {
  quemadura:'<path d="M12 2s5 5 5 9a5 5 0 0 1-10 0c0-1.5.6-2.8 1.4-3.9C9.6 8.6 12 6 12 2z"/><path d="M12 22a6 6 0 0 0 6-6"/>',
  corte:'<path d="M4 20 20 4"/><path d="M14 4h6v6"/><path d="M4 14v6h6"/>',
  caida_nivel:'<path d="M3 18h18"/><path d="M7 18c0-4 3-7 7-7"/><path d="M14 4v4"/><path d="M17 7l-3 1"/>',
  caida_altura:'<path d="M6 21V5m6 16V5"/><path d="M6 9h6M6 13h6M6 17h6"/><path d="M18 5v14"/>',
  caida_objetos:'<rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/><path d="M9 8l3-4 3 4"/>',
  carga:'<path d="M9 4h6v4H9z"/><path d="M6 20v-6l3-2h6l3 2v6"/><path d="M4 20h16"/>',
  postura_estatica:'<circle cx="12" cy="5" r="2"/><path d="M12 8v7m0 0-3 6m3-6 3 6M8 10h8"/>',
  postura_forzada:'<circle cx="9" cy="5" r="2"/><path d="M9 8c4 0 7 2 9 5"/><path d="M9 8v6l-3 7"/>',
  repetitivo:'<path d="M4 9a8 8 0 0 1 14-4"/><path d="M20 15a8 8 0 0 1-14 4"/><path d="M18 3v3h-3M6 21v-3h3"/>',
  quimico_piel:'<path d="M9 3h6v4l4 9a4 4 0 0 1-3.6 5.9H8.6A4 4 0 0 1 5 16l4-9z"/><path d="M9 14h6"/>',
  quimico_vapor:'<path d="M8 21h8"/><path d="M10 17c-2-3 2-4 0-7"/><path d="M14 17c-2-3 2-4 0-7"/><path d="M6 3h12"/>',
  humos:'<path d="M4 20h16"/><path d="M7 16c-2-3 2-4 0-7"/><path d="M12 16c-2-4 3-5 0-9"/><path d="M17 16c-2-3 2-4 0-7"/>',
  electrico:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  gas_fuego:'<path d="M12 3c4 4 6 7 6 10a6 6 0 0 1-12 0c0-2 1-4 3-6 0 2 1 3 2 3s1-4 1-7z"/>',
  ojos:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  golpe:'<path d="M12 2l2.5 5.5L20 10l-5.5 2.5L12 18l-2.5-5.5L4 10l5.5-2.5z"/>',
  evacuacion:'<path d="M3 3h18v18H3z" opacity=".25"/><path d="M14 8v8"/><path d="M10 12h8m0 0-3-3m3 3-3 3"/>'
};

/* --------------------------------------------------------------- utilidades */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function sinTilde(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();}
function pill(n){var k=NIV[n]||NIV.Moderado;
  return '<span class="pill" style="color:var('+k.c+');background:var('+k.f+');border-color:var('+k.c+')">'+esc(n)+'</span>';}
function icono(fam, color){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="1.9" '
    + 'stroke-linecap="round" stroke-linejoin="round">'+(ICO[fam]||ICO.golpe)+'</svg>';}
function nivelDe(r){var v=r*1; return v<=4?'Trivial':v<=8?'Tolerable':v<=16?'Moderado':v<=24?'Importante':'Intolerable';}
function $(id){return document.getElementById(id);}

/* -------------------------------------------------------------- estado */
var F = {area:'', tipo:'', niv:'', q:'', fam:null};
var vista = 'panel', momento = 'post';

/* ==================================================== vista: panel */
function pintarPanel(){
  var t = D.length;
  var mp = reparto('pre'), mq = reparto('post');
  var bajaron = D.filter(function(r){return NIV[r.post.nivel].v < NIV[r.pre.nivel].v;}).length;
  var altosPre = mp.Intolerable + mp.Importante, altosPost = mq.Intolerable + mq.Importante;

  $('tarjetas').innerHTML =
      tarjeta(t, 'peligros evaluados', '', '')
    + tarjeta(bajaron, 'bajaron de nivel', 'var(--n2)', Math.round(bajaron*100/t)+' %')
    + tarjeta(altosPre, 'eran de nivel alto', 'var(--n5)', 'antes')
    + tarjeta(altosPost, 'siguen en nivel alto', 'var(--n4)', 'hoy');

  var h = '';
  for(var i=0;i<ORDEN.length;i++){
    if(!mp[ORDEN[i]] && !mq[ORDEN[i]]) continue;
    h += bloqueNivel(ORDEN[i], mp[ORDEN[i]], mq[ORDEN[i]], t);
  }
  $('p-barras').innerHTML = h;
  pintarMatriz();
}
function tarjeta(cifra, pie, color, chip){
  return '<div class="dato">'+(chip?'<span class="chip">'+esc(chip)+'</span>':'')
    + '<p class="cifra"'+(color?' style="color:'+color+'"':'')+'>'+cifra+'</p>'
    + '<p class="pie">'+esc(pie)+'</p></div>';
}
function reparto(campo){
  var m={},i; for(i=0;i<ORDEN.length;i++) m[ORDEN[i]]=0;
  for(i=0;i<D.length;i++) m[D[i][campo].nivel]++;
  return m;
}
function bloqueNivel(nom, antes, hoy, total){
  var k=NIV[nom];
  function fila(mom, n, clase){
    return '<div class="barra"><span class="mom">'+mom+'</span>'
      + '<span class="bpista"><span class="bseg '+clase+(n?' hay':'')+'" style="width:'
      +   (total && n ? (n*100/total).toFixed(2) : 0)+'%;background:var('+k.c+')"></span></span>'
      + '<span class="cif">'+n+'</span></div>';
  }
  return '<div class="nivelbloque"><div class="ncab">'+pill(nom)
    + '<span class="dice">'+esc(k.dice)+'</span></div>'
    + fila('Antes', antes, 'antes') + fila('Hoy', hoy, 'hoy') + '</div>';
}

/* La matriz cruza el índice de probabilidad (A+B+C+D) con la severidad,
   tal como la define la R.M. N.° 050-2013-TR. */
function pintarMatriz(){
  var m = momento, ips = [], i, j;
  for(i=0;i<D.length;i++){ var v=+D[i][m].IP; if(ips.indexOf(v)<0) ips.push(v); }
  var minIP = Math.min.apply(null, ips), maxIP = Math.max.apply(null, ips);
  minIP = Math.max(4, minIP - 1); maxIP = Math.min(24, maxIP + 1);

  var cuenta = {};
  for(i=0;i<D.length;i++){
    var c = (+D[i][m].IP)+'x'+(+D[i][m].S);
    cuenta[c] = (cuenta[c]||0)+1;
  }
  var SEV = [[1,'Leve'],[2,'Dañino'],[3,'Muy grave']];
  var h = '<table class="matriz"><caption>Probabilidad (A+B+C+D) frente a la gravedad del daño. '
        + 'El número es la cantidad de peligros en esa casilla.</caption><thead><tr><th></th>';
  for(j=0;j<SEV.length;j++) h += '<th class="sev">'+SEV[j][1]+'</th>';
  h += '</tr></thead><tbody>';
  for(i=maxIP;i>=minIP;i--){
    h += '<tr><th class="eje-y" scope="row">'+i+'</th>';
    for(j=0;j<SEV.length;j++){
      var s = SEV[j][0], niv = nivelDe(i*s), k = NIV[niv];
      var n = cuenta[i+'x'+s] || 0;
      h += '<td class="'+(n?'':'vacia')+'" style="color:var('+k.c+');background:var('+k.f
        +  ');border-color:var('+k.c+')" title="'+esc(niv)+' · riesgo '+(i*s)+' · '+n+' peligro'
        +  (n===1?'':'s')+'">'+(n||'·')+'</td>';
    }
    h += '</tr>';
  }
  h += '</tbody></table>';
  $('p-matriz').innerHTML = h;
}

/* ==================================================== vista: áreas */
function pintarAreas(){
  var vistos = [], h = '';
  D.forEach(function(r){ if(vistos.indexOf(r.area)<0) vistos.push(r.area); });
  vistos.forEach(function(area){
    var filas = D.filter(function(r){return r.area===area;});
    var altos = filas.filter(function(r){return NIV[r.post.nivel].v>=4;}).length;
    var pend  = filas.filter(function(r){return r.pendiente.length;}).length;
    var cuenta = {};
    filas.forEach(function(r){ cuenta[r.post.nivel]=(cuenta[r.post.nivel]||0)+1; });
    var mini = ORDEN.filter(function(n){return cuenta[n];})
      .map(function(n){ var k=NIV[n];
        return '<span class="tag" style="color:var('+k.c+');background:var('+k.f+')">'
             + cuenta[n]+' '+esc(n.toLowerCase())+'</span>'; }).join('');
    h += '<button class="area" type="button" data-area="'+esc(area)+'">'
      + '<span class="foto"><img src="assets/img/'+FOTO_AREA[area]+'" alt="" loading="lazy">'
      +   '<span class="velo"></span><h3>'+esc(area)+'</h3></span>'
      + '<span class="cuerpo"><span class="mini">'+mini+'</span>'
      +   '<p class="txt">'+filas.length+' peligros revisados &middot; '+altos
      +   ' de nivel alto &middot; '+pend+' con algo pendiente.</p></span></button>';
  });
  $('areas').innerHTML = h;
}

/* ==================================================== vista: fichas */
function filtrar(){
  return D.filter(function(r){
    if(F.fam && F.fam.indexOf(r.fam)<0) return false;
    if(F.area && r.area!==F.area) return false;
    if(F.tipo && r.tipo!==F.tipo) return false;
    if(F.niv  && r.post.nivel!==F.niv) return false;
    if(F.q){
      var t=sinTilde([r.peligro,r.riesgo,r.tarea,r.actividad,r.puesto,r.proceso,r.area,r.tipo,
                      r.epp,r.consecuencias,r.causas,r.responsable,r.famTitulo,
                      r.hecho.join(' '),r.pendiente.join(' '),r.eppTarea.join(' ')].join(' '));
      if(t.indexOf(F.q)<0) return false;
    }
    return true;
  });
}

function ficha(r){
  var kp=NIV[r.pre.nivel]||NIV.Moderado, kq=NIV[r.post.nivel]||NIV.Moderado;
  var kt=TIPO[r.tipo]||TIPO['Físico'];
  var bajo = kp.v - kq.v;
  var h = '<article class="ficha">'
    + '<div class="franja" style="background:var('+kq.c+')"></div>'
    + '<div class="fcab">'
    +   '<span class="icono" style="background:var('+kt.f+')">'+icono(r.fam,'var('+kt.c+')')+'</span>'
    +   '<div><p class="fmeta"><b style="color:var('+AREACOL[r.area]+')">'+esc(r.area)+'</b> &middot; '
    +     esc(r.puesto)+' &middot; n.&deg; '+esc(r.n)+'</p>'
    +   '<p class="peligro">'+esc(r.peligro)+'</p>'
    +   '<p class="etiquetas"><span class="tag" style="color:var('+kt.c+');background:var('+kt.f+')">'
    +     'Riesgo '+esc(r.tipo.toLowerCase())+'</span>'
    +     '<span class="tag" style="color:var('+kq.c+');background:var('+kq.f+')">Nivel '
    +     esc(r.post.nivel.toLowerCase())+'</span></p></div></div>'
    + '<div class="fcuerpo">'

    + '<div class="bloqueF"><p class="rot">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'
    + 'Qu&eacute; te puede pasar</p><p class="txt">'+esc(r.riesgo)+'</p></div>'

    + '<div class="semaforo">'
    + '<div class="caja" style="color:var('+kp.c+');background:var('+kp.f+');border-color:var('+kp.c+')">'
    + '<p class="cet">Antes</p><p class="cniv">'+esc(r.pre.nivel)+'</p><p class="cval">puntaje '+esc(r.pre.R)+'</p></div>'
    + '<div class="flecha" aria-hidden="true">&rarr;</div>'
    + '<div class="caja" style="color:var('+kq.c+');background:var('+kq.f+');border-color:var('+kq.c+')">'
    + '<p class="cet">Hoy</p><p class="cniv">'+esc(r.post.nivel)+'</p><p class="cval">puntaje '+esc(r.post.R)+'</p></div>'
    + '</div>'
    + '<p class="baja'+(bajo>0?'':' igual')+'">'
    + (bajo>0 ? 'El riesgo baj&oacute; '+bajo+' nivel'+(bajo>1?'es':'')+'. ' : '')
    + esc(kq.dice)+'.</p>'

    + '<div class="caja2 bien"><p class="rot">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12a9 9 0 1 1-6.2-8.5"/></svg>'
    + 'C&oacute;mo se hace bien</p><p class="famtit">'+esc(r.famTitulo)+'</p>'
    + '<ol class="pasos">'+r.comoHacer.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol></div>'

    + '<div class="bloqueF"><p class="rot">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3z"/></svg>'
    + 'Lo que debes usar</p><ul class="lista epp">'
    + r.eppTarea.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>'
    + (r.epp && r.epp!=='—'
       ? '<p class="nota">Entregado por la empresa para este puesto: '+esc(r.epp)+'.</p>' : '')
    + '</div>'

    + '<div class="caja2 sos"><p class="rot">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/></svg>'
    + 'Si pasa, &iquest;qu&eacute; hago?</p>'
    + '<ol class="pasos">'+r.siPasa.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol>'
    + '<p class="nota">Despu&eacute;s de atender a la persona, avisa al jefe de &aacute;rea y anota el hecho '
    + 'en el registro de accidentes e incidentes, aunque haya sido leve. '
    + '<b>SAMU 106</b> &middot; <b>Bomberos 116</b>.</p></div>';

  if(r.hecho.length){
    h += '<div class="bloqueF"><p class="rot">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
      + 'Lo que ya se hizo</p><ul class="lista hecho">'
      + r.hecho.map(function(x){return '<li>'+conSesion(esc(x))+'</li>';}).join('')+'</ul></div>';
  }
  if(r.pendiente.length){
    h += '<div class="bloqueF"><p class="rot">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
      + 'Lo que falta hacer</p><ul class="lista falta">'
      + r.pendiente.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></div>';
  }

  h += '<button class="mas" type="button" aria-expanded="false">Ver el detalle t&eacute;cnico</button>'
    + '<div class="detalle" hidden><div class="pares">'
    + par('Proceso y tarea', esc(r.proceso)+' &middot; '+esc(r.actividad)+'<br>'+esc(r.tarea)
        + ' ('+esc(r.tipoTarea.toLowerCase())+')')
    + par('Por qu&eacute; ocurre', esc(r.causas))
    + par('Consecuencias', esc(r.consecuencias))
    + par('Responsable', esc(r.responsable))
    + par('Base legal', esc(r.legal))
    + par('Etapa del ciclo de mejora', esc(r.phva))
    + '</div>'
    + '<table class="tablita"><thead><tr><th>Momento</th><th>A</th><th>B</th><th>C</th><th>D</th>'
    + '<th>&Sigma;</th><th>S</th><th>Riesgo</th></tr></thead><tbody>'
    + filaT('Antes', r.pre) + filaT('Hoy', r.post) + '</tbody></table>'
    + '<p class="nota">A: personas expuestas &middot; B: procedimientos &middot; C: capacitaci&oacute;n &middot; '
    + 'D: exposici&oacute;n &middot; S: gravedad del da&ntilde;o. Anexo '+esc(r.anexo)+' del informe.</p>'
    + '</div></div></article>';
  return h;
}
/* Convierte «(Sesión 7)» en un botón que lleva a la diapositiva de esa sesión. */
function conSesion(html){
  return html.replace(/\(Sesi&oacute;n (\d+)\)|\(Sesión (\d+)\)/g, function(m, a, b){
    var n = a || b;
    return '<button class="marca-ses" type="button" data-ses="'+n+'" '
         + 'title="Ver la diapositiva de la sesión '+n+'">Sesión '+n+'</button>';
  });
}

function par(rot, val){return '<div class="par"><p class="rot">'+rot+'</p><p class="txt">'+val+'</p></div>';}
function filaT(nom, o){
  return '<tr><td>'+nom+'</td><td>'+esc(o.A)+'</td><td>'+esc(o.B)+'</td><td>'+esc(o.C)+'</td>'
    + '<td>'+esc(o.D)+'</td><td>'+esc(o.IP)+'</td><td>'+esc(o.S)+'</td><td><b>'+esc(o.R)+'</b></td></tr>';
}

/* ==================================================== vista: lista */
function tabla(lista){
  var h = '<div class="envtab"><table class="full"><thead><tr>'
    + '<th>N.&deg;</th><th>Peligro</th><th>&Aacute;rea</th><th>Antes</th><th>Hoy</th>'
    + '</tr></thead><tbody>';
  for(var i=0;i<lista.length;i++){var r=lista[i];
    h += '<tr data-n="'+esc(r.n)+'" data-area="'+esc(r.area)+'" tabindex="0">'
      + '<td>'+esc(r.n)+'</td>'
      + '<td><b>'+esc(r.peligro)+'</b><br><span style="color:var(--tinta3);font-size:13.5px">'+esc(r.riesgo)+'</span></td>'
      + '<td style="color:var('+AREACOL[r.area]+');font-weight:600">'+esc(r.area)+'</td>'
      + '<td>'+pill(r.pre.nivel)+'</td><td>'+pill(r.post.nivel)+'</td></tr>';
  }
  return h + '</tbody></table></div>';
}

/* ==================================================== vista: rutinas */
function pintarRutinas(){
  $('galeria').innerHTML = RUT.map(function(rt, k){
    var pasos = rt.flujo.map(function(nd){
      var tipo = nd[0], cls = tipo==='dec' ? 'dec' : (tipo==='act' ? 'act' : tipo);
      var h = '<li class="paso '+cls+'"><span class="pbola"></span><p class="ptxt">'+esc(nd[1])+'</p>';
      if(tipo==='dec'){
        h += '<p class="psi">Si la respuesta es <b>sí</b>, continúa.</p>'
          +  '<p class="pno"><b>Si no:</b> '+esc(nd[2])+'</p>';
      }
      return h+'</li>';
    }).join('');
    return '<article class="rut">'
      + '<button class="vista" type="button" data-cod="'+esc(rt.cod)+'" '
      +   'data-nombre="'+esc(rt.nombre)+'" aria-label="Ver el flujograma '+esc(rt.cod)+' en grande">'
      +   '<img src="assets/flujos/'+esc(rt.cod)+'_mini.jpg" alt="Flujograma '+esc(rt.cod)+'" loading="lazy">'
      +   '<span class="lupa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>Ver completo</span>'
      + '</button>'
      + '<button class="rcab" type="button" aria-expanded="false">'
      +   '<span class="rcod">'+esc(rt.cod)+'</span>'
      +   '<span class="rtit"><b>'+esc(rt.nombre)+'</b><span>'+esc(rt.area)
      +     ' &middot; cubre '+rt.n+' peligro'+(rt.n===1?'':'s')+'</span></span>'
      +   '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="m6 9 6 6 6-6"/></svg>'
      + '</button>'
      + '<div class="rcuerpo" hidden><ol class="flujo">'+pasos+'</ol>'
      +   '<div class="rpie">'
      +     '<button class="rbtn ver-peligros" type="button" data-fam="'+esc(rt.fam.join(','))+'">'
      +       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
      +       'Ver '+(rt.n===1?'su peligro':'sus '+rt.n+' peligros')+'</button>'
      +     '<a class="rbtn" href="assets/flujos/'+esc(rt.cod)+'.png" download>'
      +       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/></svg>'
      +       'Descargar</a>'
      +   '</div></div></article>';
  }).join('');
}

/* ==================================================== vista: capacitaciones */
function pintarCapacitaciones(){
  $('capacitaciones').innerHTML = CAP.map(function(c){
    return '<article class="rut" id="ses-'+esc(c.num)+'">'
      + '<button class="vista" type="button" data-img="assets/capacitaciones/sesion_'+esc(c.num)+'.png" '
      +   'data-nombre="Sesión '+esc(c.num)+' · '+esc(c.titulo)+'" '
      +   'aria-label="Ver la diapositiva de la sesión '+esc(c.num)+' en grande">'
      +   '<img src="assets/capacitaciones/sesion_'+esc(c.num)+'_mini.jpg" '
      +     'alt="Diapositiva de la sesión '+esc(c.num)+'" loading="lazy">'
      +   '<span class="lupa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>Ver la diapositiva</span>'
      + '</button>'
      + '<button class="rcab" type="button" aria-expanded="false">'
      +   '<span class="rcod">S'+esc(c.num)+'</span>'
      +   '<span class="rtit"><b>'+esc(c.titulo)+'</b><span>'+esc(c.areas.join(' · '))
      +     ' &middot; cubre '+c.peligros+' peligro'+(c.peligros===1?'':'s')+'</span></span>'
      +   '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="m6 9 6 6 6-6"/></svg>'
      + '</button>'
      + '<div class="rcuerpo" hidden><ol class="pasos">'
      +   c.puntos.map(function(p){return '<li>'+esc(p)+'</li>';}).join('')
      + '</ol><div class="rpie">'
      +   '<button class="rbtn ver-sesion" type="button" data-ses="'+esc(c.num)+'">'
      +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
      +     'Ver sus peligros</button>'
      +   '<a class="rbtn" href="assets/capacitaciones/sesion_'+esc(c.num)+'.png" download>'
      +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/></svg>'
      +     'Descargar</a>'
      + '</div></div></article>';
  }).join('');
}

/* ==================================================== vista: descargas */
var LIBROS = [
  ['IPERC_post_test_General.xlsx', 'IPERC completo · las tres áreas', 'Matriz de los 74 peligros, con hoja de resumen y una hoja por área'],
  ['IPERC_post_test_Cocina.xlsx', 'IPERC de Cocina', 'Solo los peligros del área de cocina'],
  ['IPERC_post_test_Salon.xlsx', 'IPERC de Salón', 'Solo los peligros del salón de atención al cliente'],
  ['IPERC_post_test_Lavado.xlsx', 'IPERC de Lavado', 'Solo los peligros del área de lavado de utensilios']
];
function pintarDescargas(){
  var xls = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m9 12 6 6m0-6-6 6"/></svg>';
  var baja = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/></svg>';
  $('descargas').innerHTML = LIBROS.map(function(l){
    var n = l[0].indexOf('General')>0 ? D.length
          : D.filter(function(r){return sinTilde(r.area).indexOf(sinTilde(l[1].split(' de ')[1]||''))===0;}).length;
    return '<a class="desc" href="descargas/'+l[0]+'" download>'
      + '<span class="xls">'+xls+'</span>'
      + '<span class="info"><b>'+esc(l[1])+'</b><span>'+esc(l[2])+'</span></span>'
      + '<span class="baja2">'+baja+'</span></a>';
  }).join('');

  var img = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 15 5-5 4 4 3-3 6 6"/></svg>';
  $('descargas-flujos').innerHTML = RUT.map(function(rt){
    return '<a class="desc" href="assets/flujos/'+esc(rt.cod)+'.png" download>'
      + '<span class="xls" style="background:var(--tp1f);color:var(--tp1);border-color:var(--tp1)">'+img+'</span>'
      + '<span class="info"><b>'+esc(rt.cod)+' &middot; '+esc(rt.nombre)+'</b><span>'+esc(rt.area)+'</span></span>'
      + '<span class="baja2">'+baja+'</span></a>';
  }).join('');
}

/* ==================================================== pintado general */
function pintar(){
  if(!listo) return;
  if(vista==='panel'){ pintarPanel(); return; }
  if(vista==='areas'){ if(!$('areas').innerHTML) pintarAreas(); return; }
  if(vista==='rutinas'){ if(!$('galeria').innerHTML) pintarRutinas(); return; }
  if(vista==='capacitaciones'){ if(!$('capacitaciones').innerHTML) pintarCapacitaciones(); return; }
  if(vista==='descargas'){ if(!$('descargas').innerHTML) pintarDescargas(); return; }

  var lista = filtrar();
  var activos = [F.area,F.tipo,F.niv,F.q].filter(Boolean).length;
  $('quedan').textContent = activos
    ? lista.length+' de '+D.length+' · '+activos+' filtro'+(activos>1?'s':'')
    : 'los '+D.length+' peligros';

  if(F.fam){
    var rt = RUT.filter(function(x){return x.fam.join(',')===F.fam.join(',');})[0];
    $('cuenta').innerHTML = 'Peligros que cubre la rutina <b>'+esc(rt?rt.cod:'')+'</b>: <b>'
      + lista.length+'</b>. <button class="enlace" id="todos" type="button">Ver los '+D.length+'</button>';
  } else {
    $('cuenta').innerHTML = lista.length===D.length
      ? 'Mostrando los <b>'+D.length+'</b> peligros de las tres &aacute;reas.'
      : 'Mostrando <b>'+lista.length+'</b> de '+D.length+' peligros.';
  }

  if(vista==='fichas'){
    $('lista-fichas').innerHTML = lista.length ? lista.map(ficha).join('')
      : '<div class="vacio">No encontramos peligros con esa b&uacute;squeda. Prueba con otra palabra.</div>';
  } else if(vista==='tabla'){
    $('v-tabla').innerHTML = (lista.length ? tabla(lista)
      : '<div class="vacio">No encontramos peligros con esa b&uacute;squeda.</div>');
  }
}

/* ==================================================== filtros */
function chips(cont, campo, valores){
  var h = '<button class="chip" type="button" data-v="" aria-pressed="true">Todas'
        + '<span class="pt">'+D.length+'</span></button>';
  valores.forEach(function(v){
    var n = campo==='post.nivel'
      ? D.filter(function(r){return r.post.nivel===v;}).length
      : D.filter(function(r){return r[campo]===v;}).length;
    if(!n) return;
    h += '<button class="chip" type="button" data-v="'+esc(v)+'" aria-pressed="false">'
       + esc(v)+'<span class="pt">'+n+'</span></button>';
  });
  cont.innerHTML = h;
}
function unicos(campo){var s=[],m={};D.forEach(function(r){if(!m[r[campo]]){m[r[campo]]=1;s.push(r[campo]);}});return s;}

function montarFiltros(){
  chips($('f-area'),'area',unicos('area'));
  chips($('f-tipo'),'tipo',unicos('tipo'));
  chips($('f-niv'),'post.nivel',ORDEN);
  ['f-area','f-tipo','f-niv'].forEach(function(id){
    var clave = {'f-area':'area','f-tipo':'tipo','f-niv':'niv'}[id];
    $(id).addEventListener('click',function(e){
      var b=e.target.closest('.chip'); if(!b) return;
      F[clave]=b.dataset.v; F.fam=null;
      Array.prototype.forEach.call(this.querySelectorAll('.chip'),function(c){
        c.setAttribute('aria-pressed', c===b ? 'true':'false');});
      pintar();
    });
  });
}
function reiniciarChips(){
  ['f-area','f-tipo','f-niv'].forEach(function(id){
    Array.prototype.forEach.call($(id).querySelectorAll('.chip'), function(c){
      c.setAttribute('aria-pressed', c.dataset.v==='' ? 'true':'false');});
  });
}

/* ==================================================== interacción */
function irA(id){
  var b = $('t-'+id); if(b) b.click();
}
function cerrarFiltros(){ $('filtros').hidden=true; $('plegar').setAttribute('aria-expanded','false'); }

var SECCIONES = ['panel','areas','fichas','tabla','rutinas','capacitaciones','descargas'];

/* Cada seccion tiene su propia direccion (#rutinas, #descargas...), para poder
   enlazarla o compartirla directamente. */
function mostrar(v, conHash){
  if(SECCIONES.indexOf(v) < 0) v = 'panel';
  vista = v;
  Array.prototype.forEach.call(document.querySelectorAll('nav .tab'), function(t){
    t.setAttribute('aria-selected', t.id === 't'+'-'+v ? 'true' : 'false');});
  SECCIONES.forEach(function(x){ $('v-'+x).hidden = (x !== v); });
  if(conHash && location.hash.slice(1) !== v){
    history.replaceState(null, '', '#'+v);
  }
  pintar();
}

addEventListener('hashchange', function(){ mostrar(location.hash.slice(1), false); });

document.querySelector('nav').addEventListener('click',function(e){
  var b=e.target.closest('.tab'); if(!b) return;
  mostrar(b.id.slice(2), true);
});

document.addEventListener('click',function(e){
  /* filtros plegables */
  if(e.target.closest('#plegar')){
    var f=$('filtros');
    if(f.hidden){ f.hidden=false; $('plegar').setAttribute('aria-expanded','true'); }
    else cerrarFiltros();
    return;
  }
  /* volver a todos */
  if(e.target.id==='todos'){ F.fam=null; pintar(); return; }
  /* detalle técnico */
  var mas=e.target.closest('.mas');
  if(mas){
    var d=mas.nextElementSibling, abre=d.hidden;
    d.hidden=!abre; mas.setAttribute('aria-expanded', abre?'true':'false');
    mas.textContent = abre ? 'Ocultar el detalle técnico' : 'Ver el detalle técnico';
    return;
  }
  /* área -> peligros de esa área */
  var area=e.target.closest('.area');
  if(area){
    F={area:area.dataset.area, tipo:'', niv:'', q:'', fam:null};
    $('q').value=''; $('borrar').hidden=true;
    reiniciarChips();
    Array.prototype.forEach.call($('f-area').querySelectorAll('.chip'), function(c){
      c.setAttribute('aria-pressed', c.dataset.v===F.area ? 'true':'false');});
    irA('fichas'); scrollTo({top:0,behavior:'smooth'});
    return;
  }
  /* rutina: abrir o cerrar */
  var cab=e.target.closest('.rcab');
  if(cab){
    var cu=cab.nextElementSibling, ab=cu.hidden;
    cu.hidden=!ab; cab.setAttribute('aria-expanded', ab?'true':'false');
    return;
  }
  /* rutina -> sus peligros */
  var vp=e.target.closest('.ver-peligros');
  if(vp){
    F={area:'',tipo:'',niv:'',q:'',fam:vp.dataset.fam.split(',')};
    $('q').value=''; $('borrar').hidden=true; reiniciarChips();
    irA('fichas'); scrollTo({top:0,behavior:'smooth'});
    return;
  }
  /* flujograma a pantalla completa */
  var ver=e.target.closest('.vista');
  if(ver){
    $('visorImg').src = ver.dataset.img || ('assets/flujos/'+ver.dataset.cod+'.png');
    $('visorImg').alt = ver.dataset.cod ? 'Flujograma de la rutina '+ver.dataset.cod
                                        : ver.dataset.nombre;
    $('visorPie').textContent = ver.dataset.cod
      ? ver.dataset.cod+' · '+ver.dataset.nombre : ver.dataset.nombre;
    $('visor').hidden=false; $('cerrarVisor').focus();
    return;
  }
  /* desde una sesión, ver los peligros que capacitó */
  var vs=e.target.closest('.ver-sesion');
  if(vs){
    F={area:'',tipo:'',niv:'',q:'sesion '+vs.dataset.ses,fam:null};
    $('q').value='Sesión '+vs.dataset.ses; $('borrar').hidden=false; reiniciarChips();
    irA('fichas'); scrollTo({top:0,behavior:'smooth'});
    return;
  }
  /* una mención «(Sesión N)» dentro de una ficha abre su diapositiva */
  var ms=e.target.closest('.marca-ses');
  if(ms){
    irA('capacitaciones');
    requestAnimationFrame(function(){
      var art=$('ses-'+ms.dataset.ses);
      if(art){ art.scrollIntoView({behavior:'smooth',block:'center'});
               art.querySelector('.rcab').click(); }
    });
    return;
  }
  if(e.target.closest('#cerrarVisor') || e.target.id==='visor'){ $('visor').hidden=true; return; }
  /* fila de la lista -> su ficha */
  var tr=e.target.closest('tr[data-n]');
  if(tr){ abrirFicha(tr.dataset.n, tr.dataset.area); }
});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape' && !$('visor').hidden){ $('visor').hidden=true; }
  if(e.key==='Enter'){
    var tr=e.target.closest && e.target.closest('tr[data-n]');
    if(tr) abrirFicha(tr.dataset.n, tr.dataset.area);
  }
});

function abrirFicha(n, area){
  F={area:'',tipo:'',niv:'',q:'',fam:null};
  $('q').value=''; $('borrar').hidden=true; reiniciarChips();
  irA('fichas');
  requestAnimationFrame(function(){
    var fichas=$('lista-fichas').querySelectorAll('.ficha');
    for(var i=0;i<fichas.length;i++){
      var meta=fichas[i].querySelector('.fmeta').textContent;
      if(meta.indexOf(area)===0 && meta.indexOf('n.° '+n)>0){
        fichas[i].scrollIntoView({behavior:'smooth',block:'center'});
        fichas[i].querySelector('.mas').click();
        break;
      }
    }
  });
}

$('p-matriz').parentNode.querySelector('.conmutador').addEventListener('click',function(e){
  var b=e.target.closest('button'); if(!b) return;
  momento=b.dataset.m;
  Array.prototype.forEach.call(this.querySelectorAll('button'),function(x){
    x.setAttribute('aria-pressed', x===b ? 'true':'false');});
  pintarMatriz();
});

var q=$('q'), borrar=$('borrar');
q.addEventListener('input',function(){F.q=sinTilde(this.value.trim()); F.fam=null;
  borrar.hidden=!this.value; pintar();});
borrar.addEventListener('click',function(){q.value='';F.q='';this.hidden=true;pintar();q.focus();});

/* modo oscuro, recordado en este teléfono */
var bTema=$('tema');
function ponTema(v){
  if(v) document.documentElement.setAttribute('data-tema', v);
  else document.documentElement.removeAttribute('data-tema');
  bTema.setAttribute('aria-pressed', v==='oscuro' ? 'true':'false');
  bTema.querySelector('span').textContent = v==='oscuro' ? 'Modo claro' : 'Modo oscuro';
}
/* ?tema=claro u ?tema=oscuro fuerza el modo; sirve para enlazar e imprimir */
var forzado = (location.search.match(/[?&]tema=(claro|oscuro)/) || [])[1];
if(forzado){ ponTema(forzado); }
else { try{ var g=localStorage.getItem('tema'); if(g) ponTema(g); }catch(e){} }
bTema.addEventListener('click',function(){
  var v = document.documentElement.getAttribute('data-tema')==='oscuro' ? 'claro' : 'oscuro';
  ponTema(v);
  try{ localStorage.setItem('tema', v); }catch(e){}
});

var arriba=$('arriba');
addEventListener('scroll',function(){arriba.hidden = scrollY < 700;},{passive:true});
arriba.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});

/* ==================================================== arranque */
Promise.all([
  fetch('assets/datos/iperc.json').then(function(r){
    if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }),
  fetch('assets/datos/capacitaciones.json').then(function(r){
    return r.ok ? r.json() : []; }).catch(function(){ return []; })
])
  .then(function(res){
    var p = res[0];
    D = p.peligros; RUT = p.rutinas; CAP = res[1]; listo = true;
    D.forEach(function(r){ if(!(r.area in AREACOL)){
      AREACOL[r.area] = '--ar' + (Object.keys(AREACOL).length + 1); } });

    var mq = reparto('post'), altos = mq.Intolerable + mq.Importante;
    var bajaron = D.filter(function(r){return NIV[r.post.nivel].v < NIV[r.pre.nivel].v;}).length;
    $('kpis').innerHTML =
        '<div class="kpi"><b>'+D.length+'</b><span>peligros revisados</span></div>'
      + '<div class="kpi"><b>'+bajaron+'</b><span>bajaron de nivel</span></div>'
      + '<div class="kpi"><b>'+reparto('pre').Intolerable+' &rarr; '+mq.Intolerable+'</b><span>intolerables</span></div>'
      + '<div class="kpi"><b>'+altos+'</b><span>siguen en nivel alto</span></div>';

    montarFiltros();
    mostrar(location.hash.slice(1) || 'panel', false);
  })
  .catch(function(err){
    $('kpis').innerHTML = '<div class="kpi" style="grid-column:1/-1"><b>·</b><span>'
      + 'No se pudieron cargar los datos ('+esc(err.message)+'). Si abriste el archivo '
      + 'directamente desde la carpeta, súbelo a un servidor o ábrelo con una extensión de '
      + 'servidor local.</span></div>';
  });
})();
