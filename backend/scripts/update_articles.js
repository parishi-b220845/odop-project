require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');

const ARTICLES = [
  {
    slug: 'madhubani-walls-became-canvas',
    read_time: 7,
    cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop',
    excerpt: 'In the Mithila region of Bihar, women have painted the walls of their homes for over 2,500 years. Today, those sacred patterns have found a global audience.',
    content: `In the narrow alleys of Madhubani district, Bihar, the walls speak. Not in whispers — in bold, geometric declarations of faith, fertility, and the eternal dance between humans and the cosmos.

Madhubani painting — also called Mithila art — is one of the oldest living folk art traditions in the world. For thousands of years, the women of this region painted their mud walls and floors during festivals, weddings, and religious ceremonies. The paintings were not decoration. They were prayer.

**The Origins: Where Earth Meets Myth**

The art traces its roots to the time of the Ramayana. According to legend, King Janaka of Mithila commissioned artists to paint scenes from his daughter Sita's wedding to Lord Rama. The tradition born in that sacred ceremony never died. It was passed from mother to daughter, generation after generation, without ever being written down.

Each home had its own kohbar ghar — a marriage room — painted anew for every wedding. The bride would sit in the center of her universe, surrounded by images of lotus flowers (symbolizing purity), fish (representing fertility and good luck), peacocks (standing for love), and the sun and moon watching over the couple eternally.

**From Walls to Paper: The Earthquake That Changed Everything**

For centuries, Madhubani painting remained hidden inside homes, invisible to the outside world. That changed in 1934 when a devastating earthquake struck Bihar. British officer William George Archer was surveying the damage when he stumbled upon the ruined walls of homes — and was stopped cold by the beauty painted on them.

His photographs brought global attention to Mithila art for the first time. But the real shift came in 1966, during a catastrophic drought. The Indian government, through handcraft organizations, began giving local artists paper and canvas so they could sell their work and survive the famine. What was born out of necessity became a revolution.

**The Five Styles: A Family Portrait**

Madhubani painting is not a single style — it is five distinct traditions, each associated with different castes and families:

*Bharni* — Bold outlines filled with solid colors. Created by the Brahmin community, these paintings depict gods, goddesses, and scenes from epics. The colors are vivid: turmeric yellow, indigo blue, soot black, vermillion red.

*Kachni* — Delicate lines only, no fill. Created by the Kayastha community, these intricate pen-and-ink drawings show remarkable skill. A single painting may contain thousands of individual lines.

*Tantrik* — Ritualistic and symbolic, depicting Kali, Durga, and protective deities. These are made for specific ceremonies, not for decoration.

*Godna* — Inspired by the tattoo tradition of lower-caste women who could not afford jewelry. Bold and graphic, using only black and red.

*Kohbar* — The original wedding room painting. The most sacred style, depicting the cosmic union of Shiva and Shakti through lotus ponds and bamboo groves.

**Natural Colors from the Earth**

Traditional Madhubani painters use colors made entirely from natural materials. Black comes from lampblack mixed with cow dung. White comes from rice powder. Yellow comes from turmeric or pollen. Blue from indigo. Green from crushed leaves. Red and orange from kumkum and flowers. The paintings are made on paper or cloth coated with cow dung paste and mud — giving them a distinctive earthy texture.

Brushes are made from bamboo sticks, twigs, and fingers. The lines have an organic quality no factory brush can replicate.

**National Award Winners and a Global Market**

Today, Madhubani painting has earned a GI (Geographical Indication) tag. Master artists like the late Sita Devi, Ganga Devi, and Yamuna Devi have won national and international honors. Their work hangs in museums in Paris, New York, and Tokyo.

But in the villages of Madhubani, young women still learn from their mothers, still dip their fingers in colors made from the same plants their grandmothers used, and still paint the same lotus, the same fish, the same eternal cosmos — because some things should never change.`,
  },
  {
    slug: 'last-masters-rogan-art',
    read_time: 6,
    cover_image: 'https://images.unsplash.com/photo-1587579936580-f79ae0a37cce?w=1200&h=600&fit=crop',
    excerpt: 'In a single village in Kutch, one family holds the secret to a 400-year-old art form. Meet the last practitioners of Rogan — where oil becomes poetry.',
    content: `In the village of Nirona in Kutch, Gujarat, the Khatri family guards a 400-year-old secret. They are among the last five people on earth who know how to make Rogan art — a craft so rare that it was nearly lost to history before a chance encounter with a Prime Minister brought it back from the edge of extinction.

**What Is Rogan?**

Rogan (from the Persian word for "oil") is a textile art form that uses heated castor oil as its medium. The oil is boiled for hours until it thickens into a viscous, rubber-like resin. Natural pigments are added — vermillion, indigo, ochre, chrome green — and mixed into the hot oil to create colors that are vivid, permanent, and unlike anything achievable with water-based dyes.

The painter then holds a metal stylus (a rod of iron) in one hand and a small ball of colored Rogan paste in the other. He draws the paste out into a thread so fine it becomes nearly invisible — and then presses it onto the fabric *without the tool ever touching the cloth*. The image is built up entirely in mid-air, the thread applied from above, guided only by the artist's hand.

It is painting with a thread made of oil.

**The Mirror Technique**

The most extraordinary element of Rogan is the "mirror fold." After painting one side of the fabric, the artist folds the cloth over to transfer the design to the other half, creating a perfectly symmetrical image. The two halves are identical reflections — yet both are made by hand, in a single motion.

The Tree of Life is the most iconic Rogan motif. In the Khatri family's version, a central trunk branches into leaves, flowers, and birds that fill the fabric with a breathing, living pattern. No two trees are ever identical. Every Rogan painting is unique.

**The Story of the Gift That Changed Everything**

In 2014, Prime Minister Narendra Modi gifted a Rogan painting by Abdul Gafur Khatri to US President Barack Obama. The gesture — and the photograph of it — made headlines around the world. Within days, the Khatri family was receiving orders from 30 countries. A craft that had been struggling to survive suddenly had a global audience.

"Before that, we were making pieces for ₹50," recalls one family member. "Nobody knew about us. Now people fly to Nirona to watch us work."

**Why It Nearly Disappeared**

Rogan had nearly died because it is brutally difficult. The castor oil must be boiled at exactly the right temperature — too hot and it burns, too cold and it won't draw. The thread must be pulled at exactly the right speed. If it breaks, the pattern is ruined. Learning the craft takes years even within a family.

During the famines and droughts of the 20th century, when artisan families across Gujarat switched to commercial crafts that sold faster, the Khatris almost switched too. They didn't — partly from pride, partly from the belief that some knowledge should not be lost even when it doesn't pay.

That stubbornness saved an art form.

**UNESCO and the Future**

Rogan has been recognized by UNESCO as Intangible Cultural Heritage. The Khatri family now runs workshops, teaches visiting students, and exports to galleries worldwide. The next generation is learning — but slowly. The secret, for now, remains in one family, in one village, in the desert of Kutch.

If you hold a piece of Rogan art to the light, the threads of oil catch the sun and seem to glow from within. It is the only craft in India where the painting is made of light and oil, drawn by a hand that has never once touched the cloth.`,
  },
  {
    slug: 'blue-pottery-persia-rajasthan',
    read_time: 5,
    cover_image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=600&fit=crop',
    excerpt: 'Jaipur Blue Pottery contains no clay. Fired at lower temperatures, colored with cobalt oxide, this Persian import became Rajasthan\'s own — and earned a GI tag.',
    content: `Walk through the lanes of Jaipur's old city and you will see it everywhere: bowls, tiles, vases, and plates glazed in vivid turquoise and cobalt, decorated with flowers, birds, and geometric patterns that seem to come from another world. They do. Jaipur Blue Pottery came from Persia, traveled through Mughal courts, and settled in Rajasthan — where it transformed into something entirely its own.

**The Secret: No Clay**

Here is the extraordinary thing about Blue Pottery: it contains no clay. Traditional pottery the world over is made from clay dug from the earth. Jaipur Blue Pottery uses a completely different base — a paste made from quartz stone powder, powdered glass, borax, gum, and water. This mixture is formed into shapes, dried slowly, glazed, and fired at relatively low temperatures (around 800°C, compared to 1200°C+ for regular ceramic).

The result is a material that is simultaneously fragile and translucent, with a milky-white base that seems to glow when the cobalt or turquoise glaze is applied over it. Every finished piece is slightly different in weight and texture. No two are identical.

**The Persian Road to Rajasthan**

Blue pottery traveled the Silk Route from Persia and Central Asia to India during the Mughal period. The technique of quartz-based pottery with cobalt-oxide glazing was well established in Persia by the 10th century. Mughal emperors, who maintained strong ties to Persian culture, introduced craftsmen who practiced this art to the royal workshops of Delhi and Agra.

When the Mughal empire declined, some of these craftsmen migrated to Rajput courts. The rulers of Jaipur — always patrons of art — invited them and gave them workshops in the city. Over two centuries, the Persian craft absorbed Rajasthani motifs: lotus flowers, peacocks, deer, and the repeating geometric patterns of Rajput architecture. By the 18th century, "Jaipur Blue Pottery" had become its own distinct tradition.

**The Man Who Saved It**

By the mid-20th century, Blue Pottery was nearly dead. The original craftsmen had dwindled to a handful of families. The craft was not commercially viable — too slow, too fragile, too specialized.

In the 1950s, artist Kripal Singh Shekhawat took it upon himself to research and revive the tradition. He learned the original technique, documented it, and began teaching students. His workshops in Jaipur trained a new generation of artisans. He received the Padma Shri for this work. Without him, Blue Pottery would almost certainly be found only in museum collections today.

**Making a Blue Pottery Piece**

The process begins with mixing the quartz paste until it has the consistency of dough. It is then shaped by hand or in molds, set to dry for several days, and refined with sandpaper. The base glaze — a white mixture — is applied first. Then artisans paint designs freehand with cobalt oxide (for blue), copper oxide (for green), manganese oxide (for brown and purple), and iron oxide (for yellow). No stencils. No printed patterns. Every flower and every bird is drawn from memory by hand.

The piece is fired once in a kiln. Unlike clay pottery, Blue Pottery cannot be re-fired. If the glaze cracks, the piece is discarded.

The characteristic turquoise color comes from copper oxide fired with the quartz base — a chemical reaction that can only occur with this exact combination of materials. It cannot be replicated with clay.

**GI Tag 2008**

Jaipur Blue Pottery received its Geographical Indication tag in 2008. Today, it is sold in high-end design stores across Europe and Japan, used in hotel interiors, and collected by museums. In Jaipur, the craft supports hundreds of families. And every piece, no matter where in the world it ends up, carries the chemistry of Persia, the aesthetics of Rajasthan, and the hands of someone who learned from Kripal Singh Shekhawat's students.`,
  },
  {
    slug: 'banarasi-silk-weaving-art',
    read_time: 8,
    cover_image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1200&h=600&fit=crop',
    excerpt: 'In the lanes of Varanasi, 1.5 lakh weavers preserve a 2,000-year tradition on pit looms. A single Banarasi saree can take 15 days to weave — and last 100 years.',
    content: `In the narrow, incense-scented lanes of Varanasi, inside workshops barely wider than a hallway, the future is being woven by people who live entirely in the past. They work on pit looms — wooden contraptions that have not fundamentally changed in 500 years. They weave silk threads so fine that a single thread is thinner than a human hair. They embed real gold and silver into fabric in patterns so intricate that they must be memorized entirely, because there is no way to pause and re-read a pattern mid-weave.

They are making Banarasi silk sarees. And they have been doing this, without interruption, since before the Mughal empire rose and fell.

**A Cloth Born in the Holy City**

Varanasi — also known as Banaras or Kashi — has been India's most sacred city for at least 3,000 years. It sits on the banks of the Ganga, where Hindus believe the river is at its most purifying. The city has been a center of trade, religion, learning, and art since before recorded history.

The silk weaving tradition here is at least 2,000 years old, with mentions in ancient texts. But it was during the Mughal period — particularly under Emperor Aurangzeb and earlier Mughal patrons — that Banarasi silk became what it is today: a fabric fit for royalty, heavy with gold, alive with pattern.

**What Makes It Banarasi**

A real Banarasi silk saree is not just silk. It is silk interwoven with zari — metallic thread made from real gold or silver. Traditional zari thread is made by wrapping thin strips of real gold around a silk core. Modern zari uses silver coated with gold-colored alloy, but the finest pieces still use real gold.

The patterns woven into Banarasi sarees come from a vocabulary built up over centuries: the kalga (mango), the buta (flower motif), the jaal (net pattern), the shikargah (hunting scene), the meenakari (enamel-like patterns), and hundreds more. Each motif has a meaning. Each combination tells a story.

**The Pit Loom**

The weaver sits in a pit carved into the floor, feet dangling into the earth. The loom rises above him — a structure of wood and thread that would look medieval in any other context. He uses his feet to operate the treadles that raise and lower the silk warp threads. His hands throw a shuttle carrying the zari weft back and forth across the fabric.

For the most complex designs, a second person — a "naksha karandar" — operates a jacquard mechanism or older draw-loom device that raises individual threads in sequence to create the pattern. These two people work in perfect coordination, hour after hour, day after day.

A plain Banarasi saree takes 3-5 days to weave. A saree with a complex zari border and allover brocade pattern takes 15-30 days. The most intricate pieces — the kind commissioned for royal weddings — can take 6 months. A single mistake in the pattern means cutting out the whole section and restarting.

**The Community of Weavers**

There are approximately 1.5 lakh weavers in Varanasi, mostly Muslim families whose ancestors were brought in by Mughal emperors centuries ago. The knowledge of Banarasi weaving has been passed down within these families for generations — son learning from father, daughter learning from mother, the patterns memorized and refined with each generation.

The community has survived invasions, famines, the collapse of the Mughal empire, colonial rule, independence, and now the digital age. Their greatest current threat is not history but economics: power looms in Surat can produce a saree in 15 minutes that looks almost like a Banarasi from a distance, and sells for one-tenth the price.

**Telling Real from Fake**

A real Banarasi saree has several identifiers: the back of the fabric shows the zari work clearly (power looms hide it). Real zari threads are metallic and will not burn when held to a flame — they will melt. The weave has a density and weight that synthetic copies cannot replicate. And each piece is registered with a GI tag — Banarasi silk received its Geographical Indication status in 2009.

If you hold a real Banarasi saree to the light, the zari catches the sun and scatters it in a hundred directions. It is the light of the Ganga, caught in gold.`,
  },
  {
    slug: 'pashmina-diamond-fiber-kashmir',
    read_time: 6,
    cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
    excerpt: 'Pashmina comes from the underbelly of a Himalayan goat at 14,000 feet. Each shawl requires the wool of 3 goats, 6 months of work, and hands that have known nothing but weaving.',
    content: `At 14,000 feet above sea level, on the high plateaus of Ladakh where the temperature drops to -40°C in winter, lives the Changthangi goat. It is a small, unremarkable animal to look at — except for what grows beneath its outer coat. Every spring, when the weather begins to warm, the goat sheds its inner fleece: extraordinarily fine, soft, warm fibers that have been valued across the world for centuries.

This fiber is Pashmina. And what happens to it next — in the hands of Kashmiri artisans — is one of the most extraordinary textile traditions in human history.

**The Fiber**

Pashmina fiber averages 12-16 microns in diameter. For comparison, human hair is 70 microns wide. Merino wool — considered luxury wool — is 18-24 microns. Pashmina is thinner than Merino, thinner than cashmere (which averages 14-19 microns), and almost impossibly soft. Running a real Pashmina through a ring, the entire shawl passes through a finger ring. This is the "ring test" — and it has been used to identify genuine Pashmina for 500 years.

Each goat produces only about 80-170 grams of Pashmina fiber per year. A single shawl requires the fiber from 3-4 goats, combed by hand during the spring molt. The raw fiber travels from the high Ladakh plateau to Srinagar in the Kashmir Valley — a journey of centuries, compressed into days.

**Srinagar: Where the Magic Happens**

In Srinagar, the raw Pashmina is first dehaired — separated from coarser guard hairs — by hand. It is then cleaned, carded (aligned), and spun into yarn. Traditional Pashmina is hand-spun on a simple spinning wheel called a charkha by women in their homes. The hand-spinning creates a yarn with a characteristic loftiness that machine spinning cannot replicate — each fiber retains its crimp, giving the final fabric its signature warmth-to-weight ratio.

The yarn is then handed to weavers who work on horizontal handlooms in small, dim workshops. They weave plain Pashmina (called shahmina) or the most prestigious form: Kani weaving.

**Kani: The Queen of Textiles**

A Kani shawl is woven without embroidery — the pattern is created entirely by the weave itself, using hundreds of small wooden bobbins (called kanis) that carry individual colored threads. At any given moment during weaving, up to 900 bobbins may be in motion simultaneously, each controlled by the weaver's fingers.

Kani patterns are passed down in a written code called "talim" — a system of notation that represents each thread's color and position. Reading a talim is a skill that takes years to learn. A complex Kani shawl can have a talim several hundred pages long.

A single Kani shawl takes 6 months to two years to complete. The most intricate pieces — the kind sent to European royal courts in the 18th century, the kind that launched "Paisley" as a European design obsession — can take a master weaver three years.

**The Embroidered Shawl**

Alongside Kani, Kashmir also produces Pashmina with needle embroidery (sozni work). Sozni embroiderers — mostly women — work with a needle so fine it leaves no visible entry holes in the Pashmina. The embroidery from the front side looks identical to the embroidery from the back. Both sides are finished.

The most elaborate embroidered shawl design is the "Amlikar" — a shawl where the entire surface is covered in embroidery, with no plain fabric visible. An Amlikar can take a team of embroiderers 3-5 years.

**GI Protection and Authenticity**

Kashmir Pashmina received its Geographical Indication tag in 2008. The Craft Development Institute in Srinagar runs a testing facility that certifies genuine Pashmina using fiber diameter analysis. Genuine Pashmina is also marked with a hologram label.

The word "cashmere" comes from "Kashmir" — Western traders could not pronounce the original name. But real Kashmir Pashmina is not the same as generic cashmere. It comes from one animal, in one plateau, woven by hands in one valley.

When you wrap a Pashmina shawl around your shoulders, you are wearing 14,000 feet of altitude, six months of one person's work, and the fiber of an animal that has never seen a factory.`,
  },
  {
    slug: 'dhokra-lost-wax-casting',
    read_time: 5,
    cover_image: 'https://images.unsplash.com/photo-1611784041520-b0e1ae46d7af?w=1200&h=600&fit=crop',
    excerpt: 'Dhokra metal casting is 4,000 years old. The same technique used to make the dancing girl of Mohenjo-daro is still used today in the forests of Bastar and Bankura.',
    content: `In the Bastar district of Chhattisgarh, in a small tribal village, an artisan is making a goddess. He has never been to an art school. He has no machine tools, no computer-assisted design, no factory equipment. What he has is knowledge: a technique for shaping metal that is 4,000 years old, passed to him by his father, who received it from his father, all the way back to the craftsmen who made the famous "Dancing Girl" of Mohenjo-daro in 2500 BCE.

The technique is called Dhokra. And the result — a small brass figurine of a horse, an elephant, a goddess, a tribal dancer — has been described by art historians as among the most distinctive metal sculptures produced anywhere in the world.

**Lost Wax: The Principle**

Dhokra uses the "lost wax" casting method (cire perdue in French). The principle: create an exact model in wax, encase it in clay, heat the whole thing until the wax melts out ("is lost") through channels, then pour molten metal into the cavity left behind. When the clay is broken open, a perfect metal replica of the original wax model is inside.

Every Dhokra piece requires destroying the mold after one use. This is not a limitation — it is the point. Every single Dhokra figurine is one-of-a-kind. The clay mold is unique. The wax model is unique. The metal poured in creates a unique casting. No two pieces of Dhokra are identical.

**The Process in Five Stages**

First, a core of clay and rice husk is formed into the rough shape of the object. This is covered with a thin layer of beeswax mixed with resin from the mahua tree — a local tree whose flowers also make wine, whose oil feeds lamps, and whose wood is used for everything. The wax is worked by hand, shaped with heated tools, textured with patterns.

Fine wax threads are applied to create surface decoration: the bells around an elephant's neck, the patterns on a horse's saddle, the jewelry on a goddess. Some artisans add wax threads thinner than a millimeter, creating patterns of extraordinary delicacy.

The wax model is encased in clay, leaving channels for the metal to pour in and air to escape. The whole thing is heated in a furnace made of clay and cow dung. The wax melts and flows out. The clay solidifies into a mold.

Molten brass — a mixture of copper and zinc — is poured in. The piece cools for hours. Then the clay is broken open. What emerges is rough, still attached to the channel metal. Artisans file and polish, remove excess metal, add surface texture. What remains is the final piece.

**Bastar and Bankura: Two Traditions**

Dhokra is made by the Ghasia and Bhilia communities in Bastar, and by the Karmakar community in Bankura, West Bengal. The two traditions are related — both use lost wax — but they have developed different aesthetic vocabularies.

Bastar Dhokra tends toward tribal and mythological figures: the Danteshwari goddess, bull riders, horses with elaborate saddles, musicians playing dhols. The surfaces are textured and slightly rough, with an intentionally primal quality.

Bankura Dhokra (often called Dokra) tends toward more refined finishing: the famous Bankura horse is an iconic image of West Bengal art — a stylized horse with a long neck and intricate surface patterns that has been reproduced on everything from government logos to airline murals.

**The Archaeological Connection**

The "Dancing Girl" of Mohenjo-daro, now in the National Museum in New Delhi, is a lost-wax bronze casting from approximately 2500 BCE. It shows a young girl in a dancing pose, with detailed jewelry and a confidence in her stance that is startlingly modern.

The same technique that made her — the application of wax, the clay encasing, the metal pour, the clay breaking — is still in use today in Bastar. The knowledge has passed through 4,000 years without a gap, without a book, without a school. It has passed through hands.

Dhokra received its GI tag in 2018. The artisans who practice it are among the living links to the oldest continuous craft tradition in India.`,
  },
  {
    slug: 'kerala-coir-legacy',
    read_time: 5,
    cover_image: 'https://images.unsplash.com/photo-1567016376408-0226e4d0f9ea?w=1200&h=600&fit=crop',
    excerpt: 'From the backwaters of Alappuzha, Kerala\'s coir industry supports over 3 lakh workers, mostly women. Every mat begins with a coconut husk and ends with a piece of the Kerala ecosystem.',
    content: `The coconut palm is the tree that built Kerala. It gives shade, food, oil, toddy, timber, and thatch. But it also gives something less obvious, less edible, and — in the long run — perhaps more economically significant than any of these: the husk around the coconut, which is made of one of the most versatile natural fibers in the world.

That fiber is coir. And in the backwater districts of Kerala — especially Alappuzha, once called "the Venice of the East" — the processing of coir into matting, rope, rugs, and crafts has sustained communities for over 500 years.

**What Is Coir?**

Coir is the fiber extracted from the thick outer husk of the coconut. Between the hard shell and the green outer skin lies a layer of fibrous material called mesocarp. When this is soaked in water for 6-12 months (a process called "retting"), the non-fiber components break down, and the long brown fibers can be separated out.

These fibers — called "bristle" coir if long and straight, "mattress" coir if short and curly — are among the strongest natural fibers in the world. They are salt water resistant, fire resistant, and biodegradable. They can carry compressive loads better than almost any other natural material. They rot only in very specific conditions.

Coir is used to make rope, matting, brushes, door mats, geotextiles (for preventing soil erosion), mattress stuffing, horticultural growing media, and — in the hands of Kerala's artisans — intricately patterned handwoven floor coverings that are exported to 80+ countries.

**The Alappuzha Ecosystem**

Alappuzha (Alleppey) sits at the center of Kerala's backwater network: a complex of lakes, rivers, and canals that has been the economic lifeline of the region for centuries. The same water that makes the backwaters picturesque serves a critical function in coir production: coconut husks are retted (soaked and fermented) in the brackish water of the backwaters, which gives Kerala coir a special quality. The brackish water affects the retting process differently than fresh water, producing fibers that are slightly softer and more uniform than coir processed elsewhere.

Women in the backwater villages — often working from home — spin coir yarn on simple spinning wheels while boats pass outside their windows. This work supports over 3 lakh (300,000) workers in the coir industry in Kerala, the majority of them women.

**From Husk to Mat**

The process from coconut husk to finished coir mat involves eight to twelve steps, most of them manual:

Retting (6-12 months in backwater), defibering (separating fibers from pith), drying (spread on river banks in the sun), spinning (twisting fibers into yarn on a wooden wheel), dyeing (with natural or chemical dyes), warping (preparing the loom), weaving, trimming, and finishing.

A single woven coir mat takes 2-3 days to complete on a handloom. The patterns — geometric, floral, traditional Keralan motifs — are created by the arrangement of differently colored yarns in the warp and weft.

**GI Tag and the Global Market**

Kerala coir received its Geographical Indication tag in 2007. Today, India produces 80% of the world's coir, and Kerala produces 60% of India's coir. Alappuzha alone has thousands of registered coir units.

The paradox of coir is that it is simultaneously an ancient craft, a major industrial export, and an ecological material uniquely suited to a century anxious about sustainability. Coir products are fully biodegradable, carbon-neutral, and made from what would otherwise be agricultural waste.

When you stand on a coir doormat, you are standing on the backwaters of Kerala, on 500 years of women's labor, on the chemistry of coconut husks fermented in brackish water. You are standing on history.`,
  },
  {
    slug: 'tanjore-painting-sacred-art',
    read_time: 6,
    cover_image: 'https://images.unsplash.com/photo-1557702847-f12d49e81b73?w=1200&h=600&fit=crop',
    excerpt: 'Tanjore paintings glow with real gold. Made in layers over weeks — chalk, glue, glass, gemstone, gold foil — each one is a deity dressed for eternity.',
    content: `In the old town of Thanjavur in Tamil Nadu, there is a craft that does not merely depict the divine. It creates it. A Tanjore painting is not a picture of a god — it is a constructed presence, built up in layers of wood, chalk paste, glass, gemstone, and real gold foil until the deity at its center seems to breathe, to be wrapped in light rather than painted with it.

Tanjore painting is one of the most technically complex and visually striking classical art forms of South India. It emerged in the royal courts of the Nayak and Maratha kings of Thanjavur between the 16th and 18th centuries and has never lost its sacred character.

**What Makes a Tanjore Painting**

A Tanjore painting is built, not just drawn. The process begins with a canvas — traditionally cloth stretched over a wooden frame, today often a board — coated with zinc oxide paste mixed with an adhesive made from tamarind seeds. This creates a smooth, hard surface that can hold the subsequent layers without cracking.

The central figure — almost always a Hindu deity: Ganesha, Krishna, Saraswati, Lakshmi, Balaji — is drawn in pencil and then built up in three dimensions using chalk powder (whiting) mixed with the same adhesive. The raised areas form the deity's jewelry: thick necklaces, earrings, crowns, bangles, and the elaborate decorative borders that frame every Tanjore painting. These areas are built up by hand, shaped with spatulas and brushes, allowed to dry completely, sanded smooth.

Then comes the gold.

**The Gold Foil**

Real 22-karat gold leaf is applied over the raised areas using a traditional adhesive. Each piece of gold leaf — thinner than a breath, the size of a thumbnail — is carefully placed over the raised jewelry forms. When pressed flat and burnished, the gold adheres permanently. Every necklace, every crown, every border that seems to gleam in a Tanjore painting is real gold.

Between the gold sections, glass pieces — colored red, green, blue, and white — are embedded to create the appearance of gemstones. They catch light from different angles, creating a painting that looks different depending on where you stand and how the light falls.

**Colors and the Sacred**

The background of a Tanjore painting is flat, bold color — often deep red, green, or blue. The figure is painted with colors traditionally made from minerals: malachite for green, lapis lazuli for blue, vermillion for red. Modern paintings often use poster or oil colors, but the traditional aesthetic remains: bold, saturated, without shading or perspective.

Tanjore painting does not attempt naturalism. It is not trying to show you what a god looks like. It is showing you what a god *is* — encoded in symbolic colors, surrounded by gold, staring outward with the wide, unblinking eyes of the divine.

**The Maratha Connection**

Tanjore painting flourished under the Maratha kings who ruled Thanjavur from 1674 to 1855. The Maratha court was deeply invested in art and religion, commissioning hundreds of paintings for temples and palaces. The paintings from this period — now in the Thanjavur Maharaja Serfoji's Saraswati Mahal Library and in collections worldwide — represent the peak of the form.

The artists were mostly from specific communities: the Raju caste and some Brahmin families who had specialized in temple painting for generations. Their knowledge was considered sacred — not just technical, but spiritual. A Tanjore painter traditionally purified himself before beginning work, treating the process as a form of worship.

**Thanjavur Today**

Today, Tanjore painting is practiced by artisans in Thanjavur and the surrounding villages, most of whom learned the craft within their families. The work is slow — a painting with extensive raised work can take three to six weeks. The skills are highly specialized; not every painter can do the gold-foiling, and not every painter can do the chalk work.

Tanjore paintings received their GI tag in 2008. They are sold across India and exported to collectors in Europe, America, and Southeast Asia.

If you own a Tanjore painting, you own a small piece of a living tradition: gold applied by hand, gemstones set by hand, a deity constructed layer by layer, in a workshop in a city that has been making the divine in exactly this way for four hundred years.`,
  },
];

async function updateArticles() {
  const client = await pool.connect();
  try {
    console.log('📝 Updating cultural article stories...');
    let updated = 0;

    for (const article of ARTICLES) {
      const result = await client.query(
        `UPDATE cultural_articles
         SET content = $1, excerpt = $2, cover_image = $3
         WHERE slug = $4 RETURNING title`,
        [article.content, article.excerpt, article.cover_image, article.slug]
      );
      if (result.rowCount > 0) {
        console.log(`  ✅ "${result.rows[0].title}"`);
        updated++;
      } else {
        console.log(`  ⚠️  Article not found: ${article.slug}`);
      }
    }

    console.log(`\n✅ Updated ${updated} articles`);
  } finally {
    client.release();
    await pool.end();
  }
}

updateArticles().catch(err => { console.error('Error:', err.message); process.exit(1); });
