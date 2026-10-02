// transform.js — Addis Chicken rebrand on the emmpo (changers.studio) template.
// Idempotent: reads pristine build inputs, writes index.pretty.html. Never hand-edit output.

const fs = require('fs');
const BUILD = 'C:/Users/anani/AppData/Local/Temp/opencode/addis-emmpo/';
const OUT = 'C:/Users/anani/Playground/addis-chicken/';

let html = fs.readFileSync(BUILD + 't.pretty.html', 'utf8').replace(/\r\n/g, '\n');
let css = fs.readFileSync(BUILD + 't.main.css', 'utf8');
let mainjs = fs.readFileSync(BUILD + 't.main.js', 'utf8');
const fonts = JSON.parse(fs.readFileSync(BUILD + 'fonts.json', 'utf8'));
const MEDIA = JSON.parse(fs.readFileSync(BUILD + 'farm-media-map.json', 'utf8'));

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
  '<title>My Chicken Addis | Modern & Profitable Poultry Farming in Ethiopia</title>',
  '<meta name="description" content="Your trusted guide for modern, healthy, and profitable poultry farming in Ethiopia. Practical training, modern 4-tier cage systems, feed formulation, and farm consultation." />',
  '<meta property="og:title" content="My Chicken Addis | Modern Poultry Farming in Ethiopia" />',
  '<meta property="og:description" content="Practical poultry training, 4-tier cage systems, feed formulation, and farm consultation in Addis Ababa, Ethiopia." />',
  '<meta property="og:type" content="website" />',
  '<meta property="og:site_name" content="My Chicken Addis" />',
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
rep('<span class="text-hover__elem text-hover__elem-1">Emmpo</span> <span class="text-hover__elem text-hover__elem-2">Emmpo</span>', '<span class="text-hover__elem text-hover__elem-1">My Chicken</span> <span class="text-hover__elem text-hover__elem-2">My Chicken</span>', 'P3 header logo');
rep('<div class="preloader__elem preloader__text">Emmpo</div>', '<div class="preloader__elem preloader__text">My Chicken Addis</div>', 'P3 preloader text');
// maps link for fixed-nav left (BEFORE global quiz href swap)
rep('<a href="https://emmpo.calculators.cx/quiz" class="fixed-nav__link fixed-nav__link-left text-hover" target="_blank">', '<a href="https://maps.google.com/?q=Megenagna,+Addis+Ababa,+Ethiopia" class="fixed-nav__link fixed-nav__link-left text-hover" target="_blank">', 'P3 fixed-nav left -> maps');
rep('<a href="https://emmpo.calculators.cx/quiz" class="social-gallery__link" target="_blank">', '<a href="https://maps.google.com/?q=Megenagna,+Addis+Ababa,+Ethiopia" class="social-gallery__link" target="_blank">', 'P3 gallery link -> maps');
// instagram (real handle) first
rep('https://www.instagram.com/emmpocareerquiz?igsh=MW14bWFlNXUxMHJ0Zg%3D%3D&utm_source=qr', 'https://t.me/mychickenaddis', 'P3 instagram href x2');
rep('>Follow my Instagram</span>', '>Join our Telegram</span>', 'P3 instagram label x2');
rep('https://www.tiktok.com/@emmpoquiz', 'mailto:info@mychickenaddis.com', 'P3 tiktok href');
rep('>TikTok</span>', '>Email</span>', 'P3 tiktok label x2');
rep('https://discord.com/invite/K97kh26Yhb', 'https://maps.google.com/?q=Megenagna,+Addis+Ababa,+Ethiopia', 'P3 discord href');
rep('>Discord</span>', '>Visit Us</span>', 'P3 discord label x2');
// global quiz href -> order form
rep('https://emmpo.calculators.cx/quiz', '#form-main', 'P3 quiz hrefs rest');
rep('>Take the Quiz</span>', '>Enroll Now</span>', 'P3 quiz text spans xN');
repRe(/<a href="#form-main" class="header__menu-btn" target="_blank">Take the Quiz<\/a>/g, () => '<a href="#form-main" class="header__menu-btn">Enroll Now</a>', 'P3 header menu-btn text x2');
repRe(/<a href="#form-main" class="footer__title animated"[^>]*>Take the Quiz<\/a>/g, () => '<a href="#form-main" class="footer__title animated">Enroll Now</a>', 'P3 footer title 1');
repRe(/<a href="#form-main" class="footer__title[^"]*"[^>]*>\s*Take the Quiz\s*<\/a>/g, m => m.replace(/Take the Quiz/, 'Enroll Now').replace(' target="_blank"', ''), 'P3 footer titles rest')
rep('>Take the Quiz</a>', '>Enroll Now</a>', 'P3 quiz plain anchors');
rep('>Start here</span>', '>Visit the Farm</span>', 'P3 fixed-nav left text x2');

// ============================ P4 — hero ============================
rep('<span class="main__title-top animated-main">Your Career</span>', '<span class="main__title-top animated-main">Poultry farming</span>', 'P4 hero top');
rep('<span class="main__title-elem animated-main">journey</span>', '<span class="main__title-elem animated-main">from day-old chicks</span>', 'P4 hero mid');
rep('<span class="main__title-elem animated-main">start here</span>', '<span class="main__title-elem animated-main">to daily crates</span>', 'P4 hero bottom');
repRe(/ Guiding You through Career <br> choices and Relevant degrees\s*<\/p>/, () => ' Practical poultry training grounded in real flock management.<br>Brooding, cages, feed, and market. </p>', 'P4 hero sub');

// ============================ P5 — career (#what -> fresh counter) ============================
rep('Explore <br> <span class="_c-accent">careers</span> where <br> you can make <br> a difference!', 'Build <br> <span class="_c-accent">training</span> that makes <br> your farm <br> profitable!', 'P5 career h2');
rep('Through our Career Guidance Quiz', 'Through hands-on training at our farm');
rep('You find the careers that you would most likely Enjoy and are good at.', 'You learn protocols that take chicks from day one to daily crates.');
rep('Creativity, <br> Sustainability, <br> and Tech.', 'Brooding, <br> Cages, <br> and Feed.', 'P5 career heading');

// ============================ P6 — explore (#why -> this week’s counter) ============================
rep('Explore exciting careers like:', 'Everything a farmer needs:', 'P6 explore title');
rep('<span>Multimedia</span> <span>artist</span>', '<span>Poultry</span> <span>Training</span>', 'P6 item 1 x2');
rep('<span>Sustainable</span> <span>fashion</span>', '<span>Cage</span> <span>Systems</span>', 'P6 item 2 x2');
rep('<span>Renewable</span> <span>energy</span>', '<span>Feed</span> <span>Formulation</span>', 'P6 item 3 x2');
rep('<span>Environmental</span> <span>marketing</span>', '<span>Chicken</span> <span>Sales</span>', 'P6 item 4 x2');
rep('<span>Green</span> <span>entrepreneurship</span>', '<span>Farm</span> <span>Setup</span>', 'P6 item 5 x2');

// ============================ P7 — discover (#how) ============================
rep('Discover your future!', 'Discover your flock!', 'P7 discover title');
repRe(/Find which careers match <br> your personality\.\s*<\/p>/, () => 'Find the program that fits <br> your plot.</p>', 'P7 discover sub');
rep('you will get:', 'on our farm:', 'P7 caption');
repRe(/\n?\s*Take the Quiz and receive <br> recommendations just <br> for You! \s*<\/p>/, () => ' From empty room to <br> daily egg harvest, <br> step by step! </p>', 'P7 discover text');
rep('<span class="_c-accent">Top 15+</span> tech and sustainability careers for your personality.', '<span class="_c-accent">1,500+</span> flock managers trained across central Ethiopia.', 'P7 discover card 1');
rep('<span class="_c-accent">Relevant degree</span> options for each recommended career!', '<span class="_c-accent">91%</span> peak laying rate on 400-bird, 4-tier units!', 'P7 discover card 2');

// ============================ P8 — science ============================
rep('The <span class="_c-accent">science</span> <br> behind the quiz', 'The <span class="_c-accent">science</span> <br> behind the protocols', 'P8 science title');
rep('We leverage a model that is based on', 'Our results are field-tested \u2014 built on');
repRe(/vocational psychology research that has been validated in studies repeatedly during the last 50 years, making it a <span class="_italic _bold">scientifically grounded tool <br> for career<\/span> assessment and guidance\.\s*<\/p>/, () => 'precise heat, ventilation, and hydration protocols for the first 21 days, the HB1 + LaSota vaccine schedule, and feed from <span class="_italic _bold">Ethiopian maize, soybean meal, <br>and noug cake.</span> Flock survival first. </p>', 'P8 science text');

// ============================ P9 — person (#about) ============================
rep('The person behind the quiz', 'The farm behind the training', 'P9 person title');
rep('Hey there!', 'Salam, Addis!', 'P9 person heading');
rep('src="assets/395808beb2e10735b70b.mp4"', 'src="' + V(45542) + '"', 'P9 person video');

// ============================ P10 — talents ============================
rep('It\'s great to see you <br> on <span class="_c-accent">your journey</span> to <br> discovering your', 'It\'s great to see you <br> on <span class="_c-accent">your way</span> to <br> growing your', 'P10 talents title');
rep('<img src="assets/af3020a78265de970759.png" alt="Talents" class="talents__subtitle">', '<span class="_c-accent" style="font-style:inherit">— your first flock.</span>', 'P10 talents wordart -> text');
rep('I kicked off my journey', 'We kicked off with one farm');
repRe(/studying Politics and Law, worked as <br> human rights advocacy - only to realize <br> <span class="_italic _bold">my true passion lies in Creativity\.<\/span>/, () => 'and one belief: <br> Ethiopian poultry deserves training built for <br> <span class="_italic _bold">local conditions — not guesswork.</span>', 'P10 talents text 1');
rep(/Now, I(\u2019|')m all about helping <br> you thrive!/, "Now, we're all about <br> making farms work!", 'P10 talents item');
rep('With years of experience', 'From weekend intensives to masterclasses,', 'P10 talents heading 2');
repRe(/providing online education, I(\u2019|')ve learned <br> that the key to supporting you is <span class="_italic _bold">helping <br> you uncover<\/span> your strengths and passions\./, () => 'every step is measured: brooding, cage geometry, feed formulation, <br><span class="_italic _bold">and the market you sell into.</span>', 'P10 talents text 2');
rep('Your interests and values are <br> your guiding stars <span class="_c-accent"> to happiness <br> and success. </span>', 'The shortest path from <br> empty room <span class="_c-accent"> to daily crates <br> is protocol. </span>', 'P10 talents small title');
rep('Our Quiz is designed to assist you', 'Our next cohort is open to train you');
rep('in exploring <span class="_italic _bold">new career paths</span> that you <br> may not have previously known about or <br> thought possible for you.', 'with brooding checklists, cage design, feed formulation, and egg offtake \u2014 <br> everything a working farm needs.');

// ============================ P11 — community ============================
rep('Join our community of 30,000+ students!', 'Join 1,500+ flock managers we trained!');
repRe(/More than 30,000 girls from <span class="_c-accent">193 countries<\/span> have already taken our Quiz\.\s*<\/h2>/, () => 'More than <span class="_c-accent">1,500 flock managers</span> across Ethiopia have already trained with us. </h2>', 'P11 community title');
rep(/Here(\u2019|')s what they are saying:/, 'Straight from the field:', 'P11 community subtitle');

// ============================ P12 — social ============================
rep('Are you a girl who loves technology <br> and creativity?', 'Raising a flock that deserves <br> better results?', 'P12 social text 1');
rep('So go out there and make <br> something amazing!', 'So come train with us and <br> build something profitable!', 'P12 social text 2');
rep('This will help you make a more informed <br> decision about your future career.', 'This is how Addis <br> farms smarter, not harder.', 'P12 social text 4');

// ============================ P13 — courses block ============================
rep('>Build Your</h2>', '>Build Your</h2>', 'P13 keep Build Your (sanity)');
rep('<img src="assets/f71612997f774f56ffe7.png" alt="Future" class="courses-main__subtitle">', '<span class="_c-accent">Flock</span>', 'P13 Future wordart -> text');
rep('>One Course at a Time<', '>One Batch at a Time<', 'P13 courses text');
rep('>Tech Life Hacks</h2>', '>Practical Training</h2>', 'P13 catalog group 1');
rep('>Beyond today</h2>', '>Cage Systems</h2>', 'P13 catalog group 2');
rep('>Creativity crew</h2>', '>Farm Support</h2>', 'P13 catalog group 3');
// catalog items (title + subtitle pairs)
repRe(/>Sustainable wardrobe<\/h3>\s*<p class="catalog__item-subtitle">Data analytics course<\/p>/, () => '>Weekend Intensive</h3>\n                  <p class="catalog__item-subtitle">5,500 ETB · 3 days</p>', 'P13 cat 1');
repRe(/>Skincare<\/h3>\s*<p class="catalog__item-subtitle">Machine learning course<\/p>/, () => '>Commercial Masterclass</h3>\n                  <p class="catalog__item-subtitle">14,000 ETB · 4 weeks</p>', 'P13 cat 2');
repRe(/>Air polution<\/h3>\s*<p class="catalog__item-subtitle">Data analytics course<\/p>/, () => '>4-Tier Cage Setup</h3>\n                  <p class="catalog__item-subtitle">400 layers · turnkey</p>', 'P13 cat 3');
repRe(/>Light polution<\/h3>\s*<p class="catalog__item-subtitle">Data analytics course<\/p>/, () => '>Feed Formulation</h3>\n                  <p class="catalog__item-subtitle">Up to 30% savings</p>', 'P13 cat 4');
repRe(/>Share your story<\/h3>\s*<p class="catalog__item-subtitle">Video production course<\/p>/, () => '>Broiler Production</h3>\n                  <p class="catalog__item-subtitle">Meat-bird special</p>', 'P13 cat 5');
repRe(/>Interior design<\/h3>\s*<p class="catalog__item-subtitle">3D modeling course<\/p>/, () => '>Chicken Sales</h3>\n                  <p class="catalog__item-subtitle">Quality layers &amp; breeds</p>', 'P13 cat 6');
repRe(/>Green ecosystems<\/h3>\s*<p class="catalog__item-subtitle">Virtual reality course<\/p>/, () => '>Egg Distribution</h3>\n                  <p class="catalog__item-subtitle">Farm to customer</p>', 'P13 cat 7');
repRe(/>Jewellery design<\/h3>\s*<p class="catalog__item-subtitle">3D modeling course<\/p>/, () => '>Farm Financing</h3>\n                  <p class="catalog__item-subtitle">Start or expand</p>', 'P13 cat 8');
rep('>Click</span>', '>Join</span>', 'P13 item buttons x16');

// catalog item page links -> order form anchor
repRe(/href="(?:sustainable-wardrobe|skincare|air-polution|light-polution|share-your-story|interior-design|green-ecosystems|jewellery-design)\.html"/g, () => 'href="#footer"', 'P13 catalog page links x8');

// ============================ P14 — info ============================
repRe(/\s*Curious but <br> <span class="_c-accent-2">uncertain<\/span> about your <br> <span class="_c-accent-2">starting point\?<\/span>\s*/, () => ' Not sure which <br> <span class="_c-accent-2">program</span> fits your <br> <span class="_c-accent-2">farm?</span> ', 'P14 info title');
rep(' Discover your <br> ideal career in just <br> <span class="_c-accent-2">10 minutes!</span> ', ' Book a site visit — <br> diagnostics in <br> <span class="_c-accent-2">one day!</span> ', 'P14 info heading');
rep(' Take our brief quiz <span class="_c-accent">for personalized career</span> recommendations. ', ' Diagnostics, infrastructure, training, launch — <span class="_c-accent">we walk every phase</span> with you. ', 'P14 info text');

// ============================ P15 — footers + modal ============================
rep('>Emmpo</div>', '>My Chicken Addis</div>', 'P15 copyright x2');
rep('Best, Marija', 'Best, My Chicken Addis', 'P15 modal sign');
rep('Follow us on <span class="_c-accent">Discord / TikTok / Instagram</span> for updates and community!', 'Join us on <span class="_c-accent">Telegram</span> for batch dates and agronomist answers!');

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
html = html.replace(/<\/body>/, () => '\n  <script>\n' + inlineJs + '\n  </script>\n  <script>' + RUNTIME + '\n  </script>\n</body>');

// ============================ assertions ============================
const mustZero = [/emmpo/i, /changers/i, /calculators/i, /Take the Quiz/i, /Marija/i, /Politics and Law/i, /vocational/i, /degree/i, /mail\.php/i, /cloudflareinsights/i, /Sustainable wardrobe/i, /Skincare<\//, /polution/i, /Green ecosystems/i, /30,000/, /193 countries/, /Multimedia</, /Renewable</, /Environmental</, /Green entrepreneurship/, /Discord</, /TikTok</, /Career\b/, /Order Fresh/, /Crispy/, /Bole outlet/, /fillets/, /freezer/i, /SW Poultry/, /FW Agro/, /vertical integration/i, /Everyday Cuts/, /Ready to eat/, /One Cut at a Time/, /Visit the Outlet/, /stock up/i, /addis_chicken/, /facebook\.com\/AddisChicken/];
const bad = [];
mustZero.forEach(rx => { const m = html.match(rx); if (m) { const at = html.indexOf(m[0]); bad.push(rx.source + ' :: ' + JSON.stringify(html.slice(Math.max(0, at - 70), at + 90))); } });
if (bad.length) { log.push('ASSERT FAIL x' + bad.length); bad.forEach(b => log.push('  LEFTOVER!! ' + b)); }
else log.push('ASSERT: zero template leftovers');
const mustHave = ['My Chicken Addis', 'Poultry farming', 'from day-old chicks', 'to daily crates', 'Everything a farmer needs', 'Poultry', 'Cage', 'Feed', '1,500+', '91%', 'HB1 + LaSota', 'noug cake', 'Discover your flock', 'protocols', 'flock managers', 'Enroll Now', 'Visit the Farm', 'Salam, Addis', 't.me/mychickenaddis', 'info@mychickenaddis.com', 'Megenagna', '5,500 ETB', '14,000 ETB', 'Weekend Intensive', 'Commercial Masterclass', '4-Tier Cage', 'One Batch at a Time', 'Join 1,500+', 'assets/careerBox.jpg', 'assets/scienceBig.jpg', 'mixkit.co/videos/45542', 'data:font/woff;base64'];
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
