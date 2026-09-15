import gi from 'node-gtk';
import { Monitor } from 'node-screenshots';

const deltax = 5
const sx = 730 + deltax
const sy = 170
let w = 427
let h = 750
const showH = h//580
const TEXTVIEW_HEIGHT = 180
const N = 8

const GLib = gi.require('GLib', '2.0');
const Gtk = gi.require('Gtk', '4.0');
const Gdk = gi.require('Gdk', '4.0');
const app = new Gtk.Application('com.example.myapp');

let gtexture, gtextview, gdata;

app.on('activate', () => {
  const win = new Gtk.ApplicationWindow({ application: app });
  const major = Gtk.getMajorVersion();
  const minor = Gtk.getMinorVersion();
  const micro = Gtk.getMicroVersion();
  win.setTitle(` GTK: ${major}.${minor}.${micro}`);

  win.on('close-request', () => {
    // app.quit();
    process.exit(0)
  });

  const picture = new Gtk.Picture({
    width_request: w,
    height_request: showH,
    hexpand: true,
    vexpand: true
  });

  let label = new Gtk.Label();
  label.setMarkup('<b>analysis</b>');
  const btn = new Gtk.Button();
  btn.setChild(label);

  //const btn = new Gtk.Button({ label: 'analysis' });
  btn.on('clicked', () => {
    const mainMonitor = Monitor.fromPoint(0, 0);
    btn.setSensitive(false);
    const fullImage = mainMonitor.captureImageSync(); 
/*     {
      w = fullImage.width;
      h = fullImage.height;
      // console.log(`Разрешение экрана: ${width}x${height}`);
      const rawBuffer = fullImage.toRawSync();
      const bytes = GLib.Bytes.new(rawBuffer);
      gtexture = Gdk.MemoryTexture.new(w, showH, Gdk.MemoryFormat.R8G8B8A8, bytes, w * 4);
      gdata = bytes.getData()
      picture.setPaintable(gtexture);
      let i, j, k
      l29: for (j = 0; j < h; j++) {
        for (i = 0; i < w; i += 190) {
          k = getPixelColor(i, j)
          if (k == rgbi([120, 37, 171])) {
            break l29;
          }
        }
      }
      console.log(i, j, k)
      w = 427
      h = 750
    }
 */    const croppedImage = fullImage.cropSync(sx, sy, w, h);
    const rawBuffer = croppedImage.toRawSync();
    const bytes = GLib.Bytes.new(rawBuffer);
    gtexture = Gdk.MemoryTexture.new(w, showH, Gdk.MemoryFormat.R8G8B8A8, bytes, w * 4);
    gdata = bytes.getData()
    picture.setPaintable(gtexture);
    getData()
    btn.setSensitive(true);
  });

  label = new Gtk.Label();
  label.setMarkup('<b>save</b>');
  const bsave = new Gtk.Button();
  bsave.setChild(label);

  //const bsave = new Gtk.Button({ label: 'save' });
  bsave.on('clicked', () => {
    saveImg();
  });

  const box1 = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, valign: Gtk.Align.END });
  box1.append(btn);
  box1.append(bsave);
  const overlay = new Gtk.Overlay();
  overlay.setChild(picture);
  overlay.addOverlay(box1);

  const scrolledWindow = new Gtk.ScrolledWindow({
    width_request: -1,
    height_request: TEXTVIEW_HEIGHT,
    hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
    vscrollbar_policy: Gtk.PolicyType.AUTOMATIC
  });
  gtextview = new Gtk.TextView();
  gtextview.setWrapMode(Gtk.WrapMode.WORD);

  const cssProvider = new Gtk.CssProvider();
  //    font-family: "Times New Roman";
  //Courier mmonospaced
  cssProvider.loadFromData(`
  textview  {
    font-family: "Courier";
    font-size: 14px;
  }`, -1);

  gtextview.getStyleContext().addProvider(
    cssProvider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
  );

  scrolledWindow.setChild(gtextview);

  const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
  box.append(overlay);
  box.append(scrolledWindow);

  win.setChild(box);
  win.present();
});

app.run([]);

function showText(t) {
  const buffer = gtextview.getBuffer();
  buffer.setText(t, -1);
}

function saveImg() {
  if (gtexture) {
    let name = imgName()
    gtexture.saveToPng(name);
    showText('saved ' + name);
  }
  else {
    showText('изображение не загружено');
  }
}

function imgName() {
  const tzOffset = (new Date()).getTimezoneOffset() * 60000; // Смещение в миллисекундах
  return './blocks/' + (new Date(Date.now() - tzOffset)).toISOString()
    .replace('T', '_').replace(/[:-]/g, '').split('.')[0] + '.png';
}

function getData() {
  const sx = 35 - deltax;
  const sy = 175;
  const step = 52
  const empty = [10232938, [9774179, 14365843], [9315420, 13710217], 8856405, 8397390, 7873095, 7348800, 6889785]
  let s, i, j, k, es, ea, l, b = []
  /*
    l140: for (j = 0; j < h; j++) {
      for (i = 0; i < w; i++) {
        k = getPixelColor(i, j)
        if (k == rgbi([109, 37, 160])) {
          break l140
        }
      }
    }
    console.log(i, j)
  */
  empty.forEach((e, j) => {
    l = []
    for (i = 0; i < N; i++) {
      k = getPixelColor(sx + i * step, sy + j * step)
      if (Array.isArray(e)) {
        es = Math.min(...e.map(e => colorDifference(k, e)))
      }
      else {
        es = colorDifference(k, e)
      }
      //console.log(i, j, colorDifference(k, e),k)
      l.push(+(es > 50))
    }
    b.push(l)
  })

  s = ''
  l = getFigures()
  l.forEach((f, fi) => {
    if (!f.length) {
      return
    }
    ea = possibleMoves(f, b, l, fi)
    //console.log(JSON.stringify(f))
    es = code(f)
    i = new Map([
      ['01 11 10', 'z']
      , ['01 11 01', 't']
      , ['001 111', 'l']
      , ['101 111', 'π']
      , ['01 11', 'corner']
      , ['001 001 111', 'cornerbig']]).get(es)
    if (!i) {
      if (es.startsWith('11')) {
        i = '⬛' //+ (2 + (es.length == 11))
      }
      else {
        i = es.length == 1 ? '⬛' : 'line'//((es.length + 1) / 2 + 'l')
      }
    }
    //e[3] - endgame after this move
    s += i.toUpperCase() + ' ' + ea.sort((a, b) => b[1] - a[1]).map((e, i, a) => e[0] + (e[2] ? '[' + e[2] + ']' : '') + (e[3] ? 'e' : '') + (a[i + 1] && a[i + 1][1] == e[1] ? ' ' : '→' + e[1])).join(' ') + '\n'
  })
  k = b.flat().reduce((a, e) => a + e);
  s += `${k}/${N ** 2}=${(k * 100 / N ** 2).toFixed(2)}%`

  i = b.map(e => e.join('')).join('\n')
  s += '\n' + i
  showText(s)
}

function possibleMoves(f, b, figures, figuresIndex, o = 0) {
  let i, j, ea = [], es, fill, x, y, k, l, _x, _y, after, end
  for (j = 0; j <= N - f.length; j++) {
    l183: for (i = 0; i <= N - f[0].length; i++) {
      es = 0
      fill = structuredClone(b)
      for (_y = 0; _y < f.length; _y++) {
        for (_x = 0; _x < f[_y].length; _x++) {
          if (f[_y][_x]) {
            x = _x + i
            y = _y + j
            if (b[y][x]) {
              continue l183;
            }
            es += (x == 0 ? 1 : b[y][x - 1])
              + (x == N - 1 ? 1 : b[y][x + 1])
              + (y == 0 ? 1 : b[y - 1][x])
              + (y == N - 1 ? 1 : b[y + 1][x])
            fill[y][x] = 1
          }
        }
      }
      if (o) {
        return true
      }
      l = 0
      after = structuredClone(fill)
      for (k = 0; k < 2; k++) {
        for (x = 0; x < N; x++) {
          for (y = 0; y < N && (k ? fill[x][y] : fill[y][x]); y++);
          if (y == N) {
            for (y = 0; y < N; y++) {
              if (k)
                after[x][y] = 0
              else
                after[y][x] = 0
            }
            //console.log(k,x,y)
            l++
          }
        }
      }
      //console.log(figures.filter((e, i) => i != figuresIndex && e.length), figures)
      k = figures.filter((e, i) => i != figuresIndex && e.length)
      end = k.length && k.every(e => !possibleMoves(e, after, null, null, 1))
      ea.push([i + '' + j, es, l, end])
    }
  }
  return o ? false : ea
}

function rotate(a) {
  let b = Array.from(a[0], () => []);
  a.forEach((e, y) => e.forEach((v, x) => b[x][y] = v))
  return b
}

function invert(a, x, y) {
  let b = x ? a.map(row => row.toReversed()) : a
  if (y) {
    b = b.toReversed()
  }
  return b.map(e => e.reduce((a, e) => a + e, '')).join(' ')
}

function code(a) {
  let x, y, c, i, min = '2', r = rotate(a)
  for (x = 0; x < 2; x++) {
    for (y = 0; y < 2; y++) {
      for (i = 0; i < 2; i++) {
        c = invert([a, r][i], x, y)
        if (c < min) {
          min = c
        }
      }
    }
  }
  return min
}

function getFigures() {
  let x, y, x1, y1, c, s, i, j, a, q
  const dy = 12
  const steps = 24
  const STX = [12, 159, 311]
  const STY = 615
  const FC = [[158, 237, 89]
    , [247, 220, 69]
    , [255, 118, 118]
    , [69, 185, 255]
    , [233, 90, 246]
  ].map(e => rgbi(e))

  return STX.map((e, n) => {
    a = []
    q = 1
    l18: for (y1 = 0; y1 < 100; y1 += 8) {
      for (x1 = 0; x1 < 100; x1 += 8) {
        x = x1 + e
        y = y1 + STY
        c = getPixelColor(x, y)
        if (FC.includes(c)) {
          q = 0
          break l18;
        }
      }
    }
    if (q) {
      return []
    }
    for (j = 0; j < 5; j++, y += steps) {
      q = []
      x = (x1 % steps) + e
      for (i = 0; i < 5; i++, x += steps) {
        // if(n==1)
        // console.log(i,j,colorDifference(c, getPixelColor(x, y)))
        q.push(+(colorDifference(c, getPixelColor(x, y)) < 77))
      }
      if (q.some(e => e == 1)) {
        a.push(q)
      }
      else {
        break
      }
    }
    i = Math.min(...a.map(e => e.indexOf(1)))
    j = Math.max(...a.map(e => e.lastIndexOf(1)))
    return a.map(e => e.slice(i, j + 1))
  })
}

function colorDifference(c1, c2) {
  let i, r = 0
  for (i = 0; i < 3; i++, c1 >>= 8, c2 >>= 8) {
    r += Math.abs((c1 & 0xff) - (c2 & 0xff))
  }
  return r
}

function rgbi(e, i = 0) {
  let r = 0, j
  for (j = 0; j < 3; j++)
    r |= e[i + j] << (8 * j)
  return r
}

function getPixelColor(x, y) {
  return rgbi(gdata, (y * w + x) * 4)
}


function getPixelColorString(x, y) {
  let i = (y * w + x) * 4, j, s = ''
  for (j = 0; j < 3; j++) {
    if (j) {
      s += ','
    }
    s += gdata[i + j].toString()
  }
  return s;
}
