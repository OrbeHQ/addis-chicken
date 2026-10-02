// transform.js — Addis Chicken rebrand on the emmpo (changers.studio) template.
// Idempotent: reads pristine build inputs, writes index.pretty.html. Never hand-edit output.

const fs = require('fs');
const BUILD = 'C:/Users/anani/AppData/Local/Temp/opencode/addis-emmpo/';
const OUT = 'C:/Users/anani/Playground/addis-chicken/';

let html = fs.readFileSync(BUILD + 't.pretty.html', 'utf8').replace(/\r\n/g, '\n');
let css = fs.readFileSync(BUILD + 't.main.css', 'utf8');
let mainjs = fs.readFileSync(BUILD + 't.main.js', 'utf8');
const fonts = JSON.parse(fs.readFileSync(BUILD + 'fonts.json', 'utf8'));
const MEDIA = JSON.parse(fs.readFileSync(BUILD + 'media-map.json', 'utf8'));

const log = [];
const counts = {};
const V = id => 'https://assets.mixkit.co/videos/' + id + '/' + id + '-720.mp4';

function rep(find, replaceWith, name) {
  const n = html.split(find).length - 1;
  if (!n) log.push('MISS!! ' + name);
  else log.push(name + ': ' + n);
  html = html.split(find).join(replaceWith);
}
function repRe(regex, replaceWith, name) {
  const n = (html.match(regex) || []).length;
  if (!n) log.push('MISS!! ' + name);
  else log.push(name + ': ' + n);
  html = html.replace(regex, replaceWith);
}
function repOrdered(regex, fn, name) {
  let i = 0;
  const n = (html.match(regex) || []).length;
  html = html.replace(regex, (...a) => fn(a[0], i++, a));
  log.push(name + ': ' + n);
}

// ============================ P0 — head ============================
rep('<title>Emmpo</title>', [
  '<title>Addis Chicken | Farm-Fresh Poultry, Straight From Our Farm</title>',
  '<meta name="description" content="Addis Chicken is a vertically integrated Ethiopian poultry brand — from our farm and processing plants to fresh chicken at our Bole outlet, Addis Ababa." />',
  '<meta property="og:title" content="Addis Chicken | Farm-Fresh Poultry" />',
  '<meta property="og:description" content="From our farm to your table — fresh chicken, cuts, wings, fillets and marinated packs at our Bole outlet, Addis Ababa." />',
  '<meta property="og:type" content="website" />',
  '<meta property="og:site_name" content="Addis Chicken" />',
  '<meta name="twitter:card" content="summary_large_image" />',
].join('\n  '), 'P0 title + meta');
rep('<link rel="icon" type="image/x-icon" sizes="192x192" href="assets/688b78c4178800aa2bf8.ico">', '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E%3Crect width=%2764%27 height=%2764%27 rx=%2714%27 fill=%27%23161a1b%27/%3E%3Ctext x=%2732%27 y=%2743%27 font-family=%27Georgia%27 font-style=%27italic%27 font-size=%2730%27 text-anchor=%27middle%27 fill=%27%23F2EFE4%27%3EAC%3C/text%3E%3Ccircle cx=%2749%27 cy=%2749%27 r=%273.5%27 fill=%27%23E2572E%27/%3E%3C/svg%3E">', 'P0 favicon');
repRe(/[ \t]*<link rel="preload" href="assets\/[^"]+\.woff"[^>]*>\n/g, () => '', 'P0 font preloads x3');
rep('<script defer="defer" src="main.js"></script>', '', 'P0 main.js tag (inlined later)');
repRe(/<script type="module" src="https:\/\/static\.cloudflareinsights\.com[\s\S]*?<\/script>/, () => '', 'P0 cloudflare beacon');

// ============================ P1 — CSS: fonts + inline ============================
const FONTS = [
  ['07070ee11dc38bfbd060.woff', 'Montreal', 500], ['b44b93a780ecd8dbafec.woff', 'Montreal', 700],
  ['bd8de66be4175fed48a7.woff', 'Editorial', 400], ['c77ea51aaaf5f15bd55d.woff', 'Editorial', 'italic'],
  ['dd34dea82ffd23ec2838.woff', 'Editorial', 200],
];
FONTS.forEach(([file]) => {
  const rx = new RegExp('url\\(assets/' + file + '\\) format\\("woff"\\)', 'g');
  const n = (css.match(rx) || []).length;
  css = css.replace(rx, () => 'url("data:font/woff;base64,' + fonts[file] + '") format("woff")');
  log.push('P1 font ' + file + ': ' + n);
});
const cssDesign = '/* Addis Chicken brand layer */';
const cssLeftoverRefs = (css.match(/url\(assets\//g) || []).length;
log.push('P1 css remaining asset refs (kept local): ' + cssLeftoverRefs);
rep('<link href="main.css" rel="stylesheet">', '<style>\n' + css + '\n' + cssDesign + '\n</style>', 'P1 inline css');

// ============================ P2 — engine: stub the mail.php submit ============================
const mailStubN = mainjs.split('fetch("./mail.php",{method:"POST",body:r})').length - 1;
mainjs = mainjs.split('fetch("./mail.php",{method:"POST",body:r})').join('Promise.resolve({ok:!0})');
log.push('P2 mail stub: ' + mailStubN);

// ============================ P3 — header / nav / CTAs ============================
rep('<span class="text-hover__elem text-hover__elem-1">Emmpo</span> <span class="text-hover__elem text-hover__elem-2">Emmpo</span>', '<span class="text-hover__elem text-hover__elem-1">Addis.</span> <span class="text-hover__elem text-hover__elem-2">Addis.</span>', 'P3 header logo');
rep('<div class="preloader__elem preloader__text">Emmpo</div>', '<div class="preloader__elem preloader__text">Addis Chicken</div>', 'P3 preloader text');
// maps link for fixed-nav left (BEFORE global quiz href swap)
rep('<a href="https://emmpo.calculators.cx/quiz" class="fixed-nav__link fixed-nav__link-left text-hover" target="_blank">', '<a href="https://maps.google.com/?q=8.996429,38.784672" class="fixed-nav__link fixed-nav__link-left text-hover" target="_blank">', 'P3 fixed-nav left -> maps');
rep('<a href="https://emmpo.calculators.cx/quiz" class="social-gallery__link" target="_blank">', '<a href="https://maps.google.com/?q=8.996429,38.784672" class="social-gallery__link" target="_blank">', 'P3 gallery link -> maps');
// instagram (real handle) first
rep('https://www.instagram.com/emmpocareerquiz?igsh=MW14bWFlNXUxMHJ0Zg%3D%3D&utm_source=qr', 'https://www.instagram.com/addis_chicken/', 'P3 instagram href x2');
rep('>Follow my Instagram</span>', '>Follow us on Instagram</span>', 'P3 instagram label x2');
rep('https://www.tiktok.com/@emmpoquiz', 'https://www.facebook.com/AddisChicken', 'P3 tiktok href');
rep('>TikTok</span>', '>Facebook</span>', 'P3 tiktok label x2');
rep('https://discord.com/invite/K97kh26Yhb', 'https://maps.google.com/?q=8.996429,38.784672', 'P3 discord href');
rep('>Discord</span>', '>Visit Us</span>', 'P3 discord label x2');
// global quiz href -> order form
rep('https://emmpo.calculators.cx/quiz', '#form-main', 'P3 quiz hrefs rest');
rep('>Take the Quiz</span>', '>Order Fresh</span>', 'P3 quiz text spans xN');
repRe(/<a href="#form-main" class="header__menu-btn" target="_blank">Take the Quiz<\/a>/g, () => '<a href="#form-main" class="header__menu-btn">Order Fresh</a>', 'P3 header menu-btn text x2');
repRe(/<a href="#form-main" class="footer__title animated"[^>]*>Take the Quiz<\/a>/g, () => '<a href="#form-main" class="footer__title animated">Order Fresh</a>', 'P3 footer title 1');
repRe(/<a href="#form-main" class="footer__title[^"]*"[^>]*>\s*Take the Quiz\s*<\/a>/g, m => m.replace(/Take the Quiz/, 'Order Fresh').replace(' target="_blank"', ''), 'P3 footer titles rest')
rep('>Take the Quiz</a>', '>Order Fresh</a>', 'P3 quiz plain anchors');
rep('>Start here</span>', '>Visit the Outlet</span>', 'P3 fixed-nav left text x2');

// ============================ P4 — hero ============================
rep('<span class="main__title-top animated-main">Your Career</span>', '<span class="main__title-top animated-main">Fresh Chicken</span>', 'P4 hero top');
rep('<span class="main__title-elem animated-main">journey</span>', '<span class="main__title-elem animated-main">from our farm</span>', 'P4 hero mid');
rep('<span class="main__title-elem animated-main">start here</span>', '<span class="main__title-elem animated-main">to your table</span>', 'P4 hero bottom');
repRe(/ Guiding You through Career <br> choices and Relevant degrees\s*<\/p>/, () => ' Vertically integrated \u2014 from our own farm to your plate.<br>No middlemen, no mystery. </p>', 'P4 hero sub');

// ============================ P5 — career (#what -> fresh counter) ============================
rep('Explore <br> <span class="_c-accent">careers</span> where <br> you can make <br> a difference!', 'Taste <br> <span class="_c-accent">chicken</span> the way <br> it is meant <br> to be fresh!', 'P5 career h2');
rep('Through our Career Guidance Quiz', 'Through our own farm and plants');
rep('You find the careers that you would most likely Enjoy and are good at.', 'You get chicken that went from egg to shelf with our name on every step.');
rep('Creativity, <br> Sustainability, <br> and Tech.', 'Quality, <br> Care, <br> and Chicken.', 'P5 career heading');

// ============================ P6 — explore (#why -> this week’s counter) ============================
rep('Explore exciting careers like:', 'On the counter this week:', 'P6 explore title');
rep('<span>Multimedia</span> <span>artist</span>', '<span>Crispy</span> <span>pieces</span>', 'P6 item 1 x2');
rep('<span>Sustainable</span> <span>fashion</span>', '<span>Whole</span> <span>broilers</span>', 'P6 item 2 x2');
rep('<span>Renewable</span> <span>energy</span>', '<span>Fresh</span> <span>fillets</span>', 'P6 item 3 x2');
rep('<span>Environmental</span> <span>marketing</span>', '<span>Marinated</span> <span>cuts</span>', 'P6 item 4 x2');
rep('<span>Green</span> <span>entrepreneurship</span>', '<span>Combo</span> <span>packs</span>', 'P6 item 5 x2');

// ============================ P7 — discover (#how) ============================
rep('Discover your future!', 'Discover your order!', 'P7 discover title');
repRe(/Find which careers match <br> your personality\.\s*<\/p>/, () => 'Find the cut that fits <br> your kitchen.</p>', 'P7 discover sub');
rep('you will get:', 'in every pack:', 'P7 caption');
repRe(/\n?\s*Take the Quiz and receive <br> recommendations just <br> for You! \s*<\/p>/, () => ' Fresh from the shelf, <br> packed the way <br> you cook! </p>', 'P7 discover text');
rep('<span class="_c-accent">Top 15+</span> tech and sustainability careers for your personality.', '<span class="_c-accent">Farm-direct</span> freshness, from our day-old chicks to your plate.', 'P7 discover card 1');
rep('<span class="_c-accent">Relevant degree</span> options for each recommended career!', '<span class="_c-accent">Same-day</span> cut, packed and priced \u2014 at the Bole outlet!', 'P7 discover card 2');

// ============================ P8 — science ============================
rep('The <span class="_c-accent">science</span> <br> behind the quiz', 'The <span class="_c-accent">secret</span> <br> behind the freshness', 'P8 science title');
rep('We leverage a model that is based on', 'We control the whole chain \u2014 built on');
repRe(/vocational psychology research that has been validated in studies repeatedly during the last 50 years, making it a <span class="_italic _bold">scientifically grounded tool <br> for career<\/span> assessment and guidance\.\s*<\/p>/, () => 'vertical integration \u2014 our own farm (SW Poultry), our own processing (FW Agro), our own outlet. <span class="_italic _bold">Every bird passes one chain <br>\u2014 our chain,</span> checked at every step. </p>', 'P8 science text');

// ============================ P9 — person (#about) ============================
rep('The person behind the quiz', 'The people behind the brand', 'P9 person title');
rep('Hey there!', 'Salam, Addis!', 'P9 person heading');
rep('src="assets/395808beb2e10735b70b.mp4"', 'src="' + V(45542) + '"', 'P9 person video');

// ============================ P10 — talents ============================
rep('It\'s great to see you <br> on <span class="_c-accent">your journey</span> to <br> discovering your', 'It\'s taken years to get <br> your <span class="_c-accent">kitchen\'s</span> chicken <br> from our farm', 'P10 talents title');
rep('<img src="assets/af3020a78265de970759.png" alt="Talents" class="talents__subtitle">', '<span class="_c-accent" style="font-style:inherit">— to your table.</span>', 'P10 talents wordart -> text');
rep('I kicked off my journey', 'We kicked off with one farm');
repRe(/studying Politics and Law, worked as <br> human rights advocacy - only to realize <br> <span class="_italic _bold">my true passion lies in Creativity\.<\/span>/, () => 'and one belief: <br> Addis deserves chicken that\'s actually fresh \u2014 <br> <span class="_italic _bold">not weeks in a freezer.</span>', 'P10 talents text 1');
rep(/Now, I(\u2019|')m all about helping <br> you thrive!/, "Now, we're all about <br> feeding Addis right!", 'P10 talents item');
rep('With years of experience', 'With our own farm, plants,', 'P10 talents heading 2');
repRe(/providing online education, I(\u2019|')ve learned <br> that the key to supporting you is <span class="_italic _bold">helping <br> you uncover<\/span> your strengths and passions\./, () => 'and a Bole outlet, every step matters <br> more than ever: raising, processing, packing, <br><span class="_italic _bold">and the chicken on your table.</span>', 'P10 talents text 2');
rep('Your interests and values are <br> your guiding stars <span class="_c-accent"> to happiness <br> and success. </span>', 'The shortest path from <br> farm to table <span class="_c-accent"> is honesty <br> and freshness. </span>', 'P10 talents small title');
rep('Our Quiz is designed to assist you', 'Our shelf is stocked to serve you');
rep('in exploring <span class="_italic _bold">new career paths</span> that you <br> may not have previously known about or <br> thought possible for you.', 'with every cut, fillet, and whole bird \u2014 <br> packed, priced, and ready for the way you cook.');

// ============================ P11 — community ============================
rep('Join our community of 30,000+ students!', 'Join the Addis kitchens we keep stocked!');
repRe(/More than 30,000 girls from <span class="_c-accent">193 countries<\/span> have already taken our Quiz\.\s*<\/h2>/, () => 'Every week, <span class="_c-accent">Addis families</span> stock up on farm-fresh chicken. </h2>', 'P11 community title');
rep(/Here(\u2019|')s what they are saying:/, 'Straight from the counter:', 'P11 community subtitle');

// ============================ P12 — social ============================
rep('Are you a girl who loves technology <br> and creativity?', 'Who is cooking a fresh dinner <br> in Addis tonight?', 'P12 social text 1');
rep('So go out there and make <br> something amazing!', 'So come stock up and make <br> something amazing!', 'P12 social text 2');
rep('This will help you make a more informed <br> decision about your future career.', 'This is how Addis <br> eats fresher for less.', 'P12 social text 4');

// ============================ P13 — courses block ============================
rep('>Build Your</h2>', '>Build Your</h2>', 'P13 keep Build Your (sanity)');
rep('<img src="assets/f71612997f774f56ffe7.png" alt="Future" class="courses-main__subtitle">', '<span class="_c-accent">Dinner</span>', 'P13 Future wordart -> text');
rep('>One Course at a Time<', '>One Cut at a Time<', 'P13 courses text');
rep('>Tech Life Hacks</h2>', '>Everyday Cuts</h2>', 'P13 catalog group 1');
rep('>Beyond today</h2>', '>Prepared &amp; Ready</h2>', 'P13 catalog group 2');
rep('>Creativity crew</h2>', '>For The Table</h2>', 'P13 catalog group 3');
// catalog items (title + subtitle pairs)
repRe(/>Sustainable wardrobe<\/h3>\s*<p class="catalog__item-subtitle">Data analytics course<\/p>/, () => '>Crispy Fried</h3>\n                  <p class="catalog__item-subtitle">Ready to eat</p>', 'P13 cat 1');
repRe(/>Skincare<\/h3>\s*<p class="catalog__item-subtitle">Machine learning course<\/p>/, () => '>Whole Broilers</h3>\n                  <p class="catalog__item-subtitle">By the kilo</p>', 'P13 cat 2');
repRe(/>Air polution<\/h3>\s*<p class="catalog__item-subtitle">Data analytics course<\/p>/, () => '>Fresh Fillets</h3>\n                  <p class="catalog__item-subtitle">Boneless, daily</p>', 'P13 cat 3');
repRe(/>Light polution<\/h3>\s*<p class="catalog__item-subtitle">Data analytics course<\/p>/, () => '>Wings &amp; Drums</h3>\n                  <p class="catalog__item-subtitle">Family packs</p>', 'P13 cat 4');
repRe(/>Share your story<\/h3>\s*<p class="catalog__item-subtitle">Video production course<\/p>/, () => '>Marinated</h3>\n                  <p class="catalog__item-subtitle">Spice-rubbed</p>', 'P13 cat 5');
repRe(/>Interior design<\/h3>\s*<p class="catalog__item-subtitle">3D modeling course<\/p>/, () => '>Chicken Mince</h3>\n                  <p class="catalog__item-subtitle">Ground fresh</p>', 'P13 cat 6');
repRe(/>Green ecosystems<\/h3>\s*<p class="catalog__item-subtitle">Virtual reality course<\/p>/, () => '>Griddle Packs</h3>\n                  <p class="catalog__item-subtitle">BBQ-ready</p>', 'P13 cat 7');
repRe(/>Jewellery design<\/h3>\s*<p class="catalog__item-subtitle">3D modeling course<\/p>/, () => '>Party Trays</h3>\n                  <p class="catalog__item-subtitle">Catered</p>', 'P13 cat 8');
rep('>Click</span>', '>Pick</span>', 'P13 item buttons x16');

// catalog item page links -> order form anchor
repRe(/href="(?:sustainable-wardrobe|skincare|air-polution|light-polution|share-your-story|interior-design|green-ecosystems|jewellery-design)\.html"/g, () => 'href="#footer"', 'P13 catalog page links x8');

// ============================ P14 — info ============================
repRe(/\s*Curious but <br> <span class="_c-accent-2">uncertain<\/span> about your <br> <span class="_c-accent-2">starting point\?<\/span>\s*/, () => ' Craving but <br> <span class="_c-accent-2">uncertain</span> on what <br> <span class="_c-accent-2">to cook?</span> ', 'P14 info title');
rep(' Discover your <br> ideal career in just <br> <span class="_c-accent-2">10 minutes!</span> ', ' Drive over and <br> we pack it <br> <span class="_c-accent-2">for you!</span> ', 'P14 info heading');
rep(' Take our brief quiz <span class="_c-accent">for personalized career</span> recommendations. ', ' Fresh, frozen, or marinated \u2014 <span class="_c-accent">we cut it</span> your way. ', 'P14 info text');

// ============================ P15 — footers + modal ============================
rep('>Emmpo</div>', '>Addis Chicken</div>', 'P15 copyright x2');
rep('Best, Marija', 'Best, Addis Chicken', 'P15 modal sign');
rep('Follow us on <span class="_c-accent">Discord / TikTok / Instagram</span> for updates and community!', 'Follow us on <span class="_c-accent">Instagram</span> for fresh batches and announcements!');

// ============================ P16 — media swaps (content photos -> local files) ============================
const PHOTOS = [
  ['8ef7901dbe5edf86b8b0.png', 'careerBox'],
  ['f8c7d7665849f7d24b99.png', 'explore1'], ['3dc17292ee9c10d13b64.png', 'explore2'], ['f8c26a3a983864ec4c8f.png', 'explore3'], ['0710f2b66fbeb1d1969b.png', 'explore4'], ['72e05126e506faaaf8b6.png', 'explore5'],
  ['19fe6ba1416662966d9a.png', 'discover1'], ['4ad5ec5a3db01004cdd0.png', 'discover2'],
  ['015b0abcd9f6857596dd.png', 'person1'], ['19685070beb1700a065e.png', 'person2'],
  ['96bc32349c71f8ada495.png', 'talents1'], ['0ef1120be377127bff85.png', 'talents2'], ['26dc59fb58b7d7384916.png', 'talents3'],
  ['bd54b336fe8a1578518c.png', 'social1'], ['5d8e83a8acb1e91a2524.png', 'social2'], ['e5a5f7527a35682f0f3c.png', 'social3'], ['fa4926cbcadb447bd89d.png', 'social4'], ['877390e8023f2471770d.png', 'social5'],
  ['44e6599e5fcef020a716.png', 'info'],
  ['44defe13f60b358970ac.png', 'modal'],
  ['7e430397325c44c01a70.png', 'coursesBg'], ['80db5c615a851f0355d1.png', 'coursesBg'],
  ['4c9637b9dfc98f809bab.png', 'socialMobile'],
  ['4fbb40b07af6f682db96.png', 'careerImg1'], ['601577b96b18bd5ad582.png', 'careerImg2'], ['23328bbf22f42ecf852a.png', 'careerImg3'],
  ['7d73da477e4a14cd5ebf.png', 'science1'], ['2ffd93e449b9c38c6203.png', 'science2'], ['c0eb7fdf5673f312a5cc.png', 'science3'],
  ['c1613401b1dc979fd5ba.png', 'scienceBig'],
];
PHOTOS.forEach(([token, slot]) => {
  if (!MEDIA[slot]) { log.push('MISS!! media slot ' + slot); return; }
  rep('assets/' + token, MEDIA[slot].file, 'P16 ' + slot + ' -> ' + MEDIA[slot].file);
});

// ============================ P17 — inline main.js + runtime ============================
const RUNTIME = `
(function () {
  'use strict';
  window.__stageAssetsDone = true;
  // Preloader watchdog: if the load event stalls (slow network/headless), release the page
  setTimeout(function () {
    try {
      var p = document.querySelector('.preloader');
      if (p && getComputedStyle(p).display !== 'none') window.dispatchEvent(new Event('load'));
    } catch (e) {}
  }, 7000);
  setTimeout(function () {
    try {
      var p = document.querySelector('.preloader');
      if (p) {
        var cs = getComputedStyle(p), r = p.getBoundingClientRect();
        var covering = cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0.05 && r.bottom > innerHeight * 0.5;
        if (covering) {
          try { window.dispatchEvent(new Event('load')); } catch (e) {}
          p.style.transition = 'opacity .5s ease'; p.style.opacity = '0'; p.style.pointerEvents = 'none';
          setTimeout(function () { try { if (p.parentNode) p.style.display = 'none'; } catch (e) {} }, 600);
          try { document.body.style.overflow = ''; } catch (e) {}
        }
      }
    } catch (e) {}
  }, 11000);
  // Smooth-scroll for our swapped-in hash links (engine's scroll-to covers data-scroll-to buttons)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    try { window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' }); } catch (err) { window.scrollTo(0, t.offsetTop); }
    if (history.replaceState) history.replaceState(null, '', id);
  });
})();
`;
const inlineJs = mainjs.replace(/<\/script/g, '<\\/script');
rep('<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js', '<script type="module" id="dead-beacon" src="#', 'P0 beacon killed earlier (check)'); // noop safeguard
html = html.replace(/<\/body>/, () => '\n  <script>\n' + inlineJs + '\n  </script>\n  <script>' + RUNTIME + '\n  </script>\n</body>');

// ============================ assertions ============================
const mustZero = [/emmpo/i, /changers/i, /calculators/i, /Take the Quiz/i, /Career Guidance Quiz/i, /Marija/i, /Politics and Law/i, /vocational/i, /degree/i, /mail\.php/i, /cloudflareinsights/i, /Sustainable wardrobe/i, /Skincare<\//, /polution/i, /Green ecosystems/i, /30,000/, /193 countries/, /Multimedia</, /Renewable</, /Environmental</, /Green entrepreneurship/, /Discord</, /TikTok</, /Career\b/];
const bad = [];
mustZero.forEach(rx => { const m = html.match(rx); if (m) { const at = html.indexOf(m[0]); bad.push(rx.source + ' :: ' + JSON.stringify(html.slice(Math.max(0, at - 70), at + 90))); } });
if (bad.length) { log.push('ASSERT FAIL x' + bad.length); bad.forEach(b => log.push('  LEFTOVER!! ' + b)); }
else log.push('ASSERT: zero template leftovers');
const mustHave = ['Addis Chicken', 'Fresh Chicken', 'from our farm', 'to your table', 'On the counter this week', 'Crispy', 'Whole', 'broilers', 'Fresh', 'fillets', 'Marinated', 'Combo', 'vertical integration', 'SW Poultry', 'FW Agro', 'Bole', 'Discover your order', 'secret', 'farm-fresh chicken', 'Order Fresh', 'Salam, Addis', 'Instagram', 'addis_chicken', 'facebook.com/AddisChicken', '8.996429', 'Everyday Cuts', 'Prepared', 'For The Table', 'Order', 'assets/careerBox.jpg', 'assets/scienceBig.jpg', 'mixkit.co/videos/45542', 'data:font/woff;base64'];
const missing = mustHave.filter(x => !html.includes(x));
if (missing.length) missing.forEach(x => log.push('MISSING!! marker ' + x));
log.push('MARKERS: ' + (mustHave.length - missing.length) + '/' + mustHave.length);
counts.sections = (html.match(/<section/g) || []).length;
counts.imgs = (html.match(/<img/g) || []).length;
counts.scripts = (html.match(/<script/g) || []).length;
counts.forms = (html.match(/<form/g) || []).length;
counts.localAssetRefs = (html.match(/assets\/[a-f0-9]{20}\./g) || []).length;
counts.localFoodRefs = (html.match(/assets\/(careerBox|explore|discover|person|talents|social|info|modal|coursesBg|science|careerImg|socialMobile)[a-zA-Z0-9]*\.jpg/g) || []).length;
log.push('COUNTS ' + JSON.stringify(counts));
fs.writeFileSync(OUT + 'index.pretty.html', html);
log.push('WROTE ' + OUT + 'index.pretty.html (' + html.length + ' bytes)');
console.log(log.join('\n'));
