require('dotenv').config({ path: __dirname + '/../backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'odop_marketplace',
  user: process.env.DB_USER || 'odop_user',
  password: process.env.DB_PASSWORD || 'odop_secret_2024',
});

// Real product images from /api/images/ matched to each article topic
const ARTICLES = [
  {
    slug: 'banarasi-silk-weaving-art',
    cover_image: '/api/images/1IoxoC4_njjXyXLMgBujXPtmarKXx_zyC',
    read_time: 6,
    excerpt: 'For over 500 years, the looms of Varanasi have woven stories in silk and gold. Discover how Banarasi weavers keep a dying art alive.',
    content: `# The Living Art of Banarasi Silk Weaving

In the narrow lanes of Varanasi — a city older than history itself — the rhythmic clatter of handlooms has echoed for over five centuries. Banarasi silk sarees are not merely garments; they are woven manuscripts recording India's most refined artistic traditions.

## The Mughal Inheritance

Banarasi weaving as we know it was profoundly shaped during the Mughal era (16th–18th centuries). Persian motifs — jamdani flowers, kalga bootas, jal jangla patterns — were fused with indigenous Indian iconography to create something entirely new. Weavers in Varanasi's Peeli Kothi and Madanpura neighbourhoods perfected the art of weaving real gold and silver zari thread into silk fabric.

## How a Banarasi Saree is Made

A single saree can take anywhere from 15 days to 6 months to complete, depending on its complexity.

**Step 1: Yarn Preparation**
Raw silk, imported primarily from Bangalore and China, is first degummed by boiling in soda solution, then dyed in vibrant colours using both natural and synthetic dyes.

**Step 2: Jacquard Punching**
Modern Banarasi looms use a Jacquard mechanism — a system of punched cards that controls which threads are raised on each pass of the shuttle. A complex brocade design may require thousands of individual punch cards.

**Step 3: Handloom Weaving**
Two weavers work a single loom — one managing the shuttle, one reading the design cards. The warp (vertical threads) and weft (horizontal threads) are interlaced, with zari threads woven in at precise points to create the brocade pattern.

**Step 4: Finishing**
The completed saree is washed, starched lightly, and examined thread by thread for defects before folding.

## The Varieties

- **Katan**: Pure silk warp and weft, the finest variety
- **Organza (Kora)**: Crisp, transparent with a stiff drape
- **Shattir**: Woven on a cotton warp for durability
- **Tanchoi**: Multi-coloured silk-woven patterns with satin finish
- **Jangla**: Dense floral brocade covering the entire saree

## The GI Protection

In 2009, Banarasi silk received Geographical Indication (GI) status — India's equivalent of France's Champagne appellation. Only sarees woven in Varanasi and surrounding districts (Mirzapur, Chandauli, Bhadohi, Jaunpur) can legally carry the Banarasi label.

## The Crisis and the Hope

The 1990s and 2000s brought a devastating crisis: power-loom copies from Surat and Chinese machine-made silk flooded the market at a fraction of the price. An estimated 30% of Varanasi's 1.5 lakh weavers abandoned the craft.

Today, a revival is underway. Younger designers like Sabyasachi and Abraham & Thakore have brought Banarasi back to Indian fashion runways. The ODOP scheme has connected master weavers directly with global buyers, bypassing middlemen who historically took 60–70% of the final price.`,
  },
  {
    slug: 'pashmina-diamond-fiber-kashmir',
    cover_image: '/api/images/1ADUPRal5uaDXtRvOJuLiQ4lmq3jG0WVZ',
    read_time: 5,
    excerpt: 'Softer than cashmere, warmer than wool — Kashmir\'s Pashmina is woven from the winter undercoat of Himalayan mountain goats at 14,000 feet.',
    content: `# Pashmina: The Diamond Fiber of Kashmir

At 14,000 feet in the Changthang plateau of Ladakh, the Changthangi goat survives temperatures plunging to -40°C. To endure these extremes, it grows an impossibly fine inner coat — just 12–15 microns in diameter, three times finer than human hair. This fiber is Pashmina.

## From Plateau to Loom

The journey of Pashmina begins each spring during the Ladakhi shedding season (March–May). Nomadic Changpa herders hand-comb their goats — never shearing — collecting the precious pashm that naturally falls away. Each goat yields only 80–170 grams per year.

The raw fiber travels to Kashmir Valley, where it passes through a chain of extraordinary specialists:

**Sorting (Pashm Chunna)**: Expert hands separate the coarse guard hair from the fine pashm. This stage alone takes a week per kilogram.

**Spinning (Yarnning)**: Traditionally done by women on a spinning wheel (charkha), converting raw fiber into yarn. A single spinner can produce just 100–200 metres per day.

**Weaving**: Male artisans work the traditional loom (karghah), weaving the yarn into fabric. A plain Pashmina shawl takes 3 days; an intricate Kani weave can take 18 months.

**Washing (Rafugari)**: The finished fabric is washed in the cold, soft waters of Dal Lake, which gives Kashmiri Pashmina its characteristic softness.

## The Kani Shawl: Pashmina's Crown Jewel

The Kani shawl — named after the town of Kanihama — is considered the highest expression of Pashmiri textile art. Weavers use hundreds of small wooden spools (kanis) instead of a shuttle, interweaving dozens of colours simultaneously to create elaborate tapestry patterns. A single Kani shawl can involve 900+ individual colour passes per centimetre.

## Spotting a Genuine Pashmina

The fastest test: a genuine Pashmina burns like hair (carbon smell) and leaves a crushable ash. Synthetic copies melt and smell of burning plastic. Authentic pieces also pass the "ring test" — a genuine shawl slips through a finger ring.

## GI Status and the Fight Against Fakes

Kashmir Pashmina received GI status in 2008. The Pashmina Testing and Quality Certification Centre in Srinagar certifies authentic pieces with a hologram tag. Despite this, an estimated 70% of "Pashmina" sold globally is machine-made acrylic — a ₹3,000 crore fraud industry.`,
  },
  {
    slug: 'blue-pottery-persia-rajasthan',
    cover_image: '/api/images/1mf1apiPcKq5jwK65ksYnQ7GEpUlJfsFk',
    read_time: 4,
    excerpt: 'Blue Pottery is Jaipur\'s most recognisable craft — yet it contains no clay. Its Persian-Turko origins make it one of India\'s great artistic mysteries.',
    content: `# Blue Pottery: Where Persia Meets Rajasthan

Walk through Jaipur's old city and every souvenir shop gleams with it — vivid cobalt vases, turquoise tiles, flower-painted bowls. Blue Pottery is Jaipur's most photographed craft. Paradoxically, it is made without clay, fired at low temperatures, and was nearly extinct fifty years ago.

## An Unlikely Journey

Blue Pottery's ancestry runs through a remarkable chain of cultures. The craft originated in 14th-century Persia (modern Iran) as a glazing technique using quartz instead of clay. Mongol conquests spread it to Afghanistan, where it became the signature ceramics of Multan and Sindh. When Mughal emperors brought Afghan craftsmen to Delhi, the technique arrived in India. Jaipur's connection came through the Kachwahas of Amber, who invited these artisans to their capital in the 18th century.

## No Clay — So What Is It Made Of?

Traditional pottery is shaped from clay. Blue Pottery is shaped from a paste made of:
- Quartz stone powder (80%)
- Powdered glass
- Multani mitti (Fuller's Earth)
- Borax
- Gum (katira)

This mixture is kneaded into a dough, shaped by hand (not thrown on a wheel), dried in shade for 2–3 days, then fired at just 800°C — half the temperature of standard ceramics.

## The Blue That Defines the Craft

The signature cobalt blue comes from cobalt oxide — the same mineral that gave its name to the colour. Copper oxide produces turquoise; iron oxide, brown; manganese, black. The designs — arabesques, lotus flowers, birds, geometric patterns — are painted freehand with a fine brush before a transparent lead glaze is applied.

## Decline and Revival

By the 1950s, Blue Pottery had nearly died. Mass-produced ceramics made it economically unviable. The revival is credited to artist Kripal Singh Shekhawat, who spent decades documenting surviving techniques and training a new generation of artisans. Today, the Jaipur Blue Pottery Trust supports over 300 artisan families.`,
  },
  {
    slug: 'last-masters-rogan-art',
    cover_image: '/api/images/1tyupxJBsP5Yf62IWxTLl4dNWS0jFx2Z_',
    read_time: 5,
    excerpt: 'In Kutch, Gujarat, only one family keeps Rogan Art alive — a 300-year-old tradition of painting with castor oil paste on fabric using a single nail.',
    content: `# The Last Masters of Rogan Art

In the dusty town of Nirona in Kutch, Gujarat, one family carries the entire weight of a 300-year-old tradition. The Khatri family — specifically the brothers Abdul Gafur and Sumar Khatri — are believed to be the last living practitioners of Rogan Art. When they asked their children to learn, only a few agreed.

## What is Rogan Art?

Rogan (from the Persian word for "oil-based varnish") is a fabric painting technique unlike anything else in the world. The medium is castor oil, processed into a thick, brilliantly coloured paste. The tool is a single metal rod — essentially a large nail — held above the fabric without ever touching it. The artist pulls threads of paste from the rod onto the fabric using only air resistance and gravity.

There is no sketching beforehand. There is no erasing mistakes. Each stroke is permanent.

## The Making of Rogan Paste

1. Raw castor oil is heated for 8–10 hours until it reduces to a thick resin
2. The resin is mixed with vegetable dyes (once exclusively natural; now mostly synthetic for vibrancy)
3. The paste is kneaded to remove air bubbles
4. It must be used within 2–3 days before it hardens

## The Mirror Technique

The most iconic aspect of Rogan paintings: once a design is complete on one half of the fabric, the cloth is folded and pressed, mirroring the pattern perfectly onto the other half. This bilateral symmetry is the hallmark of authentic Rogan.

## The Near-Death

The 2001 Bhuj earthquake destroyed most of Nirona and the Khatri family's workshop. For years, they had no income from the craft. International attention came unexpectedly when a Rogan painting was gifted to President Barack Obama during his 2015 India visit. Orders flooded in overnight. The family now has a waiting list of months.

## The Uncertain Future

Despite the Obama moment, Rogan's survival is genuinely uncertain. The process is so painstaking — a single large panel takes 3–4 weeks — that few young people find it economically rational to learn. The Khatri family continues to teach, but as of 2024, fewer than 10 people in the world can make Rogan Art to traditional standards.`,
  },
  {
    slug: 'tanjore-painting-sacred-art',
    cover_image: '/api/images/1eSY_ixbQlTEPkrPyutqBCKcd0OQNBAvu',
    read_time: 5,
    excerpt: 'Tanjore paintings glow with 24-carat gold foil and semi-precious stones. Born in the courts of the Maratha kings, they remain Tamil Nadu\'s most sacred art form.',
    content: `# The Sacred Art of Tanjore Painting

A Tanjore painting does not merely hang on a wall — it radiates. The 24-carat gold foil embedded in its surface catches any light in the room, making the deity at the centre appear to glow from within. For 400 years, these paintings have adorned the prayer rooms of Tamil Nadu's devout households.

## The Maratha Court and Its Patronage

Tanjore painting (Thanjavur Painting) emerged in the 16th century in the court of the Nayak kings, but reached its fullest expression under the Marathas of Thanjavur (1676–1855). The Bhosale rulers were extravagant patrons — they commissioned paintings not just for temples and palaces but as gifts for important visitors. The subjects were always devotional: Krishna in his multiple forms, Rama and Sita, Lakshmi, Ganesha.

## The Materials That Make It Glow

**Canvas**: Thick cotton cloth pasted onto a wooden plank (teak traditionally, now also plywood) and coated with chalk powder and glue to create a smooth painting surface.

**Drawing**: The outline is drawn first in pencil, then traced in watercolour. Figures follow strict iconographic rules — Krishna must be blue-skinned, Lakshmi must hold a lotus, proportions follow Shastra measurements.

**Relief Work**: Before painting, certain areas (jewellery, garments, architectural borders) are built up in relief using chalk powder paste mixed with glue. This three-dimensional texture is what sets Tanjore apart from flat paintings.

**Gold Foil Application**: 22–24 carat gold foil (and sometimes silver foil) is carefully laid onto the raised areas while the paste is still slightly tacky. This stage determines the painting's quality; skilled goldwork can take days.

**Gemstone Embedding**: Semi-precious stones (rubies, emeralds, sapphires — now often glass alternatives) are pressed into the gold to simulate jewellery.

**Painting**: Finally, water-soluble paints fill in the remaining areas, with vivid reds, greens, and blues completing the image.

## The Living Tradition

Today, Thanjavur district still supports hundreds of painting families. The craft received GI tag status in 2007. ODOP has helped connect these artisans directly with collectors across India and internationally, eliminating the gallery middlemen who previously captured most of the value.`,
  },
  {
    slug: 'kerala-coir-legacy',
    cover_image: '/api/images/1OrB-XVfoZ3UrCoR2K9gLjrYdocwHlwMn',
    read_time: 4,
    excerpt: 'Kerala turns coconut husks — agriculture\'s most ignored byproduct — into flooring, mattresses, and decorative crafts exported to 70+ countries.',
    content: `# Kerala's Coir Legacy: Coconut to Craft

Every year, Kerala's 87 million coconut trees produce 160,000 tonnes of husks that other states consider waste. Kerala turns this "waste" into one of India's most successful export industries: coir. From beach mats to luxury floor coverings sold in European design stores, coir is the material that built Kerala's rural economy.

## The Anatomy of a Coconut Husk

Between the hard shell and the outer green skin of a coconut lies a thick fibrous layer — the husk. This husk is made of cellulose and lignin fibres (called coir fibre) packed in a spongy tissue (coir pith). Both parts are commercially valuable, though they require completely different processing.

## Retting: The Ancient Process

The traditional method of extracting coir fibre is retting — soaking husks in water for 6–10 months. Kerala's backwaters (kayal) were historically the world's largest retting sites. Husks submerged in the brackish lagoons slowly decompose, leaving only the resistant fibres behind.

After retting, women beat the husks with wooden mallets to loosen the fibres, then comb them with iron toothed boards. The result: long, tawny fibres ready for spinning.

## From Fibre to Product

**Hand-Spinning**: Coir fibre is twisted into yarn on simple spinning wheels. This cottage industry employs over 300,000 workers in Kerala — predominantly women in the Alappuzha and Kollam districts.

**Weaving**: Coir yarn is woven into mats, carpets, and runners on traditional pit looms. More complex designs use power looms for the backing while hand-weavers add decorative elements.

**Rubberised Coir**: Coir fibre can be needle-punched and latex-treated to create rubberised sheets — the material in high-end mattresses and car seat padding worldwide.

## The Numbers

Kerala supplies 80% of India's coir exports. The industry generates ₹3,000 crore annually and supports 700,000+ workers. Major export markets: USA, UK, Netherlands, Germany, and Australia.

## Coir Pith: Zero Waste

The spongy tissue around coir fibre (coir pith) was historically considered waste and dumped in rivers, causing pollution. Today it's compressed into blocks sold worldwide as an eco-friendly planting medium — coir pith can absorb 10 times its weight in water, making it perfect for hydroponics and urban gardening.`,
  },
  {
    slug: 'dhokra-lost-wax-casting',
    cover_image: '/api/images/1vngg7E0mu3zs9vMTfWKL7LnlsRupuLlF',
    read_time: 5,
    excerpt: 'Dhokra craftspeople use the same lost-wax casting technique as ancient civilisations — a 4,000-year-old process producing some of India\'s most iconic metal art.',
    content: `# Dhokra: 4000 Years of Lost-Wax Casting

The Dancing Girl of Mohenjo-daro — cast in bronze roughly 4,500 years ago, now in the National Museum of India — was made using the same technique used by Dhokra craftspeople in Chhattisgarh today. The method has not fundamentally changed in four millennia. In a world obsessed with technological disruption, Dhokra's survival is an act of quiet defiance.

## The Lost-Wax Method (Cire Perdue)

The process is ingeniously simple, yet demands complete mastery:

**Step 1: Clay Core**
A rough shape is formed in clay mixed with rice husk and sand. This becomes the inner structure of the finished piece.

**Step 2: Wax Overlay**
Threads of beeswax — mixed with resin from the dhaura tree for strength — are rolled by hand and coiled around the clay core to build up the detailed surface. Each decorative element (a musician's fingers, an elephant's anklets, a goddess's crown) is sculpted individually in wax and attached.

**Step 3: Outer Clay Mould**
The wax-covered form is completely encased in multiple layers of fine clay. Funnel-shaped openings are left at top and bottom.

**Step 4: Firing and Casting**
The mould is placed upside-down in a fire. As temperature rises, the wax melts and drains out (hence "lost-wax"). Molten brass — made from recycled metal and mixed with zinc for specific properties — is poured in through the top funnel.

**Step 5: Breaking the Mould**
After cooling, the outer clay is broken away to reveal the metal casting. Each piece is unique; the mould cannot be reused. No two Dhokra objects are ever identical.

## The Dhokra Artisan Communities

Dhokra work is practised by several tribal communities — the Gharua of Chhattisgarh and Jharkhand, the Situlya of Odisha, the Muria of Bastar. The craft is named after the Dhokra Damar tribe of West Bengal.

## Iconic Forms

Dhokra sculptures favour folk deities (Ganesha, Laxmi), tribal daily life (women with water pots, musicians), and animals (horses, elephants, peacocks). The characteristic "granular" texture from the wax threads gives Dhokra its unmistakable visual identity.

## The Economic Reality

A skilled Dhokra artisan spends 2–4 weeks on a single medium-sized piece. The market has historically been dominated by intermediaries who paid artisans ₹500 for pieces that sold in Delhi boutiques for ₹8,000. ODOP's direct-to-buyer model has allowed artisans to retain 3–4x more value from their work.`,
  },
  {
    slug: 'madhubani-walls-became-canvas',
    cover_image: '/api/images/1nWdJMZD9ifTn8oS7eyRntq2eV9m7lxPq',
    read_time: 4,
    excerpt: 'Madhubani painting was born on the walls of Bihar\'s villages — drawn by women for weddings and festivals. A 1934 earthquake brought it from walls to paper and changed everything.',
    content: `# Madhubani: When Walls Became Canvas

In the Mithila region of north Bihar — the ancient kingdom of King Janaka, father of Sita — women have been painting their walls for at least 2,500 years. Not decoration: prayer. Madhubani paintings (also called Mithila paintings) were originally created by women on the freshly plastered mud walls of their homes for weddings, festivals, and rites of passage. Then came a disaster that accidentally saved the tradition.

## The 1934 Earthquake and the Discovery of Madhubani

The Bihar earthquake of January 15, 1934 destroyed much of the Mithila region. In its aftermath, colonial officer William Archer surveyed the damage. Amid the rubble, he found something unexpected: the collapsed walls had exposed interior rooms where extraordinary paintings survived on the inner surfaces. Archer photographed them, published his findings in 1949, and Madhubani art was "discovered" by the outside world.

Yet it had never been hidden — it simply existed in spaces men rarely entered.

## The Iconographic Universe

Madhubani art has a vocabulary as specific as Sanskrit grammar. Every motif carries meaning:

- **Fish** (matsya): Fertility, prosperity, auspiciousness — used in all wedding paintings
- **Bamboo**: New life, growth — present at births
- **Sun and Moon**: Cosmic order, always painted together
- **Lotus**: Purity, spiritual knowledge
- **Peacock**: Beauty, monsoon, the divine
- **Kohbar** (sacred marriage chamber): Coded panel painted for weddings depicting a man and woman surrounded by protective symbols

The paintings are never complete without a border — multiple concentric frames containing floral patterns that "protect" the central image.

## Five Distinct Styles

Madhubani art is not a single style but five:

1. **Bharni**: Bold outlines filled with solid colour, originated in Brahmin communities
2. **Kachni**: Line-based, cross-hatching for texture, minimal colour
3. **Tantrik**: Geometric, strongly coded, related to Shakti worship
4. **Godna**: Based on tattoo patterns of lower-caste communities
5. **Kohbar**: Specifically for the wedding chamber

## From Village Walls to Global Galleries

The 1960s Bihar drought pushed women to paint on paper for the first time as an income source. The paper format allowed the art to travel globally. Today, Madhubani paintings are in the permanent collections of museums in New York, London, and Tokyo. GI status was granted in 2007. Master painters like Sita Devi and Ganga Devi (who painted for the Smithsonian) gave the tradition international legitimacy.`,
  },
];

(async () => {
  // Add read_time column if it doesn't exist
  await pool.query(`ALTER TABLE cultural_articles ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5`);
  console.log('read_time column ready');

  let updated = 0;
  for (const a of ARTICLES) {
    const res = await pool.query(`
      UPDATE cultural_articles
      SET cover_image = $1,
          content     = $2,
          excerpt     = $3,
          read_time   = $4,
          updated_at  = NOW()
      WHERE slug = $5
    `, [a.cover_image, a.content, a.excerpt, a.read_time, a.slug]);
    if (res.rowCount > 0) { updated++; console.log(`✓ ${a.slug}`); }
    else console.log(`✗ NOT FOUND: ${a.slug}`);
  }

  console.log(`\nUpdated ${updated}/${ARTICLES.length} articles`);
  await pool.end();
})();
