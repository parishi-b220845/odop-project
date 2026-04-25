require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════
// REALISTIC INDIAN FAKE DATA GENERATOR
// Generates convincing demo data for teacher presentation
// ═══════════════════════════════════════════════════════════

const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickN = (a, n) => { const s = [...a].sort(() => Math.random() - 0.5); return s.slice(0, n); };

// ─── Realistic Indian Names ──────────────────────────────
const MALE_FIRST = ['Aarav','Vivaan','Aditya','Arjun','Sai','Krishna','Ishaan','Dhruv','Kabir','Rohan','Amit','Raj','Sunil','Manoj','Rakesh','Vikram','Nikhil','Karthik','Pranav','Siddharth','Yash','Akash','Tushar','Gaurav','Harsh','Deepak','Kunal','Rahul','Sachin','Rajesh','Mohan','Gopal','Ravi','Suresh','Dinesh','Mahesh','Ganesh','Ramesh','Naresh','Vijay','Ajay','Sanjay','Ankit','Ashish','Abhishek','Naveen','Prasad','Venkat','Murali','Balaji'];
const FEMALE_FIRST = ['Aadhya','Ananya','Diya','Saanvi','Priya','Neha','Pooja','Shreya','Tanvi','Meera','Nisha','Divya','Anjali','Sakshi','Simran','Sneha','Lavanya','Ritika','Pallavi','Swati','Aishwarya','Deepa','Nandini','Kavya','Riya','Lakshmi','Sunita','Rekha','Sushma','Geeta','Radha','Padma','Kamala','Sarita','Mamta','Shanti','Urmila','Seema','Kiran','Rani'];
const LAST_NAMES = ['Sharma','Verma','Gupta','Singh','Kumar','Patel','Reddy','Nair','Iyer','Bhat','Joshi','Deshmukh','Chauhan','Mishra','Pandey','Agarwal','Malhotra','Kapoor','Banerjee','Mukherjee','Pillai','Menon','Shetty','Rao','Das','Sen','Ghosh','Thakur','Kulkarni','Chaudhary','Tiwari','Saxena','Mehta','Shah','Khanna','Arora','Sinha','Bhatt','Patil','Naik','Hegde','Kaur','Gill','Bhatia','Goel','Rastogi','Choudhury','Prasad','Rathore','Rajput'];

// ─── Real Indian Cities with Actual Pincodes ─────────────
const LOCATIONS = [
  // Metro
  {city:'Andheri West',state:'Maharashtra',pin:'400058',area:'Mumbai'},{city:'Bandra East',state:'Maharashtra',pin:'400051',area:'Mumbai'},
  {city:'Koramangala',state:'Karnataka',pin:'560034',area:'Bangalore'},{city:'Indiranagar',state:'Karnataka',pin:'560038',area:'Bangalore'},
  {city:'Madhapur',state:'Telangana',pin:'500081',area:'Hyderabad'},{city:'Gachibowli',state:'Telangana',pin:'500032',area:'Hyderabad'},
  {city:'Adyar',state:'Tamil Nadu',pin:'600020',area:'Chennai'},{city:'T Nagar',state:'Tamil Nadu',pin:'600017',area:'Chennai'},
  {city:'Salt Lake',state:'West Bengal',pin:'700091',area:'Kolkata'},{city:'New Town',state:'West Bengal',pin:'700161',area:'Kolkata'},
  {city:'Dwarka',state:'Delhi',pin:'110075',area:'New Delhi'},{city:'Saket',state:'Delhi',pin:'110017',area:'New Delhi'},
  {city:'Lajpat Nagar',state:'Delhi',pin:'110024',area:'New Delhi'},{city:'Rohini',state:'Delhi',pin:'110085',area:'New Delhi'},
  // Tier 2
  {city:'Kothrud',state:'Maharashtra',pin:'411038',area:'Pune'},{city:'Viman Nagar',state:'Maharashtra',pin:'411014',area:'Pune'},
  {city:'Malviya Nagar',state:'Rajasthan',pin:'302017',area:'Jaipur'},{city:'Vaishali Nagar',state:'Rajasthan',pin:'302021',area:'Jaipur'},
  {city:'Gomti Nagar',state:'Uttar Pradesh',pin:'226010',area:'Lucknow'},{city:'Hazratganj',state:'Uttar Pradesh',pin:'226001',area:'Lucknow'},
  {city:'Navrangpura',state:'Gujarat',pin:'380009',area:'Ahmedabad'},{city:'Satellite',state:'Gujarat',pin:'380015',area:'Ahmedabad'},
  {city:'Arera Colony',state:'Madhya Pradesh',pin:'462016',area:'Bhopal'},{city:'Vijay Nagar',state:'Madhya Pradesh',pin:'452010',area:'Indore'},
  {city:'Boring Road',state:'Bihar',pin:'800001',area:'Patna'},{city:'Kadamkuan',state:'Bihar',pin:'800003',area:'Patna'},
  {city:'Panampilly Nagar',state:'Kerala',pin:'682036',area:'Kochi'},{city:'Vazhuthacaud',state:'Kerala',pin:'695014',area:'Thiruvananthapuram'},
  {city:'Saheed Nagar',state:'Odisha',pin:'751007',area:'Bhubaneswar'},{city:'Paltan Bazaar',state:'Assam',pin:'781008',area:'Guwahati'},
  {city:'Sector 17',state:'Chandigarh',pin:'160017',area:'Chandigarh'},{city:'Model Town',state:'Punjab',pin:'141002',area:'Ludhiana'},
  {city:'Rajpur Road',state:'Uttarakhand',pin:'248001',area:'Dehradun'},{city:'Lanka',state:'Uttar Pradesh',pin:'221005',area:'Varanasi'},
  {city:'Peelamedu',state:'Tamil Nadu',pin:'641004',area:'Coimbatore'},{city:'Shivaji Nagar',state:'Maharashtra',pin:'440010',area:'Nagpur'},
  {city:'Dharampeth',state:'Maharashtra',pin:'440010',area:'Nagpur'},{city:'Adajan',state:'Gujarat',pin:'395009',area:'Surat'},
  {city:'Durgapur',state:'West Bengal',pin:'713204',area:'Durgapur'},{city:'Siliguri',state:'West Bengal',pin:'734001',area:'Siliguri'},
];

const STREETS = ['1st Cross Road','2nd Main Road','3rd Floor, Emerald Towers','4th Cross','Gandhi Road','Nehru Marg','MG Road',
  'Station Road','Temple Street','Market Road','College Road','Park Avenue','Lake View Colony','Garden Layout','Ring Road',
  'Industrial Area Phase 1','Sector 5','Block A','Near Bus Stand','Opposite City Mall','Behind Railway Station',
  'JP Nagar','KR Puram','Jubilee Hills','Anna Nagar','Rajaji Nagar','Tilak Road','Subhash Marg','Shastri Circle'];

const APARTMENTS = ['Flat No.','Apt','House No.','Plot No.','Villa','Door No.','Block','Tower'];

// ─── Indian Banks ────────────────────────────────────────
const BANKS = [
  {name:'State Bank of India',ifsc:'SBIN0'},
  {name:'HDFC Bank',ifsc:'HDFC0'},
  {name:'ICICI Bank',ifsc:'ICIC0'},
  {name:'Punjab National Bank',ifsc:'PUNB0'},
  {name:'Bank of Baroda',ifsc:'BARB0'},
  {name:'Canara Bank',ifsc:'CNRB0'},
  {name:'Union Bank of India',ifsc:'UBIN0'},
  {name:'Bank of India',ifsc:'BKID0'},
  {name:'Kotak Mahindra Bank',ifsc:'KKBK0'},
  {name:'Axis Bank',ifsc:'UTIB0'},
  {name:'IndusInd Bank',ifsc:'INDB0'},
  {name:'Yes Bank',ifsc:'YESB0'},
];

// ─── Seller Business Data ────────────────────────────────
const SELLER_PROFILES = [
  {biz:'Vishwakarma Silk House',craft:'Banarasi Silk Weaving',dist:'Varanasi',st:'Uttar Pradesh',pin:'221001',desc:'Fourth-generation master weavers specializing in authentic Banarasi silk sarees with real gold and silver zari. Our workshop in the narrow lanes of Varanasi has been operating since 1897. Every saree is handwoven on pit looms using techniques passed down through our family for over 125 years. We supply to leading boutiques across India and export to 12 countries.'},
  {biz:'Madhubani Art Studio',craft:'Madhubani Painting',dist:'Madhubani',st:'Bihar',pin:'847211',desc:'Women-led cooperative of 23 Mithila artists preserving the ancient tradition of Madhubani painting. Founded by National Award winner Smt. Lakshmi Devi in 2008. Our artists use natural dyes derived from turmeric, indigo, neem, and banana leaves. Each painting follows centuries-old Bharni and Kachni techniques.'},
  {biz:'Kutch Heritage Textiles',craft:'Rogan Art & Ajrakh',dist:'Kutch',st:'Gujarat',pin:'370001',desc:'Preserving two ancient textile arts from the Kutch region - the nearly extinct Rogan oil painting and the 4000-year-old Ajrakh block printing tradition. Our master artisan Abdul Gafur Khatri is among the last 5 Rogan artists in the world. UNESCO recognized.'},
  {biz:'Rajasthan Blue Art',craft:'Blue Pottery & Miniature',dist:'Jaipur',st:'Rajasthan',pin:'302001',desc:'Studio and workshop creating authentic Jaipur Blue Pottery and Rajasthani miniature paintings. Our blue pottery uses the traditional quartz-based technique with no clay - each piece is unique. Miniature paintings are created using single-hair brushes and real gold leaf.'},
  {biz:'Kerala Coir Works',craft:'Coir & Coconut Products',dist:'Alappuzha',st:'Kerala',pin:'688001',desc:'Cooperative of 150+ women artisans from the backwaters of Alappuzha producing eco-friendly coir products. We source coconut fiber from local farms and process everything by hand. Our products are 100% biodegradable and support sustainable livelihoods.'},
  {biz:'Kanchipuram Silk Looms',craft:'Kanchipuram Silk Saree',dist:'Kanchipuram',st:'Tamil Nadu',pin:'631502',desc:'Family-owned handloom unit weaving pure mulberry silk Kanchipuram sarees since 1952. We use real gold-dipped silver zari (tested at BIS standards). Each saree takes 15-45 days to complete on our traditional pit looms. GI tagged since 2005.'},
  {biz:'Pattachitra Art Gallery',craft:'Pattachitra Painting',dist:'Puri',st:'Odisha',pin:'752001',desc:'Traditional Pattachitra scroll paintings from the holy city of Puri. Our family of chitrakars (painters) has been creating these mythological artworks for the Jagannath Temple for 7 generations. Natural colors extracted from stones, vegetables, and lampblack.'},
  {biz:'Pashmina House Kashmir',craft:'Pashmina Shawl',dist:'Srinagar',st:'Jammu and Kashmir',pin:'190001',desc:'Premium Pashmina from the highlands of Kashmir. Our raw material comes from Changthangi goats at 14,000+ feet in Ladakh. Each shawl is hand-spun and handwoven by master artisans of Srinagar, taking 3-6 months to complete. GI certified.'},
  {biz:'Bastar Tribal Art',craft:'Dhokra & Bell Metal',dist:'Bastar',st:'Chhattisgarh',pin:'494001',desc:'Tribal art collective working with indigenous artists of Bastar to preserve the 4000-year-old Dhokra lost-wax casting tradition. Each brass figurine is cast by hand - the clay mold is broken after one use, making every piece truly one-of-a-kind.'},
  {biz:'Lucknow Chikan House',craft:'Chikankari Embroidery',dist:'Lucknow',st:'Uttar Pradesh',pin:'226003',desc:'Workshops employing 200+ women artisans doing traditional Chikankari hand embroidery. We specialize in the intricate tepchi, murri, and shadow work styles. Our kurtas and sarees are worn by celebrities and featured in Vogue India. Est. 1985.'},
  {biz:'Bankura Dokra Crafts',craft:'Dokra Metal Casting',dist:'Bankura',st:'West Bengal',pin:'722101',desc:'Collective of 40+ Dokra artisan families preserving the ancient lost-wax metal casting tradition of Bankura. Our figurines, jewelry, and decorative items use the same technique that created the famous Dancing Girl of Mohenjo-daro 5,000 years ago.'},
  {biz:'Pochampally Ikat Weavers',craft:'Pochampally Ikat',dist:'Nalgonda',st:'Telangana',pin:'508284',desc:'Handloom cooperative of 75 weavers from Pochampally village, known as the Silk City of India. Our double-ikat technique involves tie-dyeing both warp and weft threads before weaving. UNESCO Creative City of Crafts since 2023.'},
  {biz:'Moradabad Brass Palace',craft:'Brass & Meenakari',dist:'Moradabad',st:'Uttar Pradesh',pin:'244001',desc:'From the Brass City of India, we create handcrafted brass utensils, decorative items, and Meenakari enamel work. Fourth-generation family business exporting to 30+ countries. Featured in India International Trade Fair.'},
  {biz:'Chanderi Handloom Hub',craft:'Chanderi Silk Weaving',dist:'Ashoknagar',st:'Madhya Pradesh',pin:'473446',desc:'Chanderi fabric weaving cooperative combining silk and cotton in the signature Chanderi technique. Known for tissue-thin transparency and buttis (small motifs). Our weavers are direct descendants of the original Chanderi artisans from the 2nd century BC.'},
  {biz:'Mysore Silk Factory',craft:'Mysore Silk Saree',dist:'Mysuru',st:'Karnataka',pin:'570001',desc:'Government-recognized Mysore silk producers using 100% pure mulberry silk with real gold zari. Each saree carries the Silk Mark certification. Our sarees follow the classic Mysore style with the kasuti border embroidery.'},
  {biz:'Thanjavur Art House',craft:'Tanjore Painting',dist:'Thanjavur',st:'Tamil Nadu',pin:'613001',desc:'Creating authentic Thanjavur paintings with real 22-karat gold foil, semi-precious stones, and glass inlay. This 400-year-old art form originated under the Maratha rulers of Thanjavur. Each painting depicts Hindu deities and takes 2-8 weeks to complete.'},
  {biz:'Phulkari Punjab',craft:'Phulkari Embroidery',dist:'Patiala',st:'Punjab',pin:'147001',desc:'Reviving the ancient Phulkari embroidery of Punjab. Our dupattas and shawls feature the traditional darning stitch on handspun khadi fabric. Each piece takes 40-60 hours of hand-stitching. We work with 80+ rural women artisans.'},
  {biz:'Assam Silk House',craft:'Muga & Eri Silk',dist:'Sualkuchi',st:'Assam',pin:'781103',desc:'Producing the golden Muga silk, found nowhere else in the world, and the warm Eri silk known as the fabric of peace. Our looms in Sualkuchi, the Manchester of the East, produce royal-grade fabrics using silkworms reared in our own farms.'},
  {biz:'Warli Art Collective',craft:'Warli Tribal Painting',dist:'Palghar',st:'Maharashtra',pin:'401404',desc:'Indigenous Warli tribal artists creating the 2500-year-old geometric art form. Our paintings on canvas, cloth, and household items depict harvest dances, festivals, and daily tribal life using simple circles, triangles, and lines in white pigment.'},
  {biz:'Santiniketan Leather Works',craft:'Shantiniketan Leather',dist:'Birbhum',st:'West Bengal',pin:'731235',desc:'Hand-embossed leather products using the batik-on-leather technique pioneered at Rabindranath Tagore\'s Visva-Bharati University. Each bag, wallet, and journal features nature-inspired motifs burned and painted by hand. GI tagged.'},
  {biz:'Firozabad Glass Art',craft:'Glass Bangles & Art',dist:'Firozabad',st:'Uttar Pradesh',pin:'283203',desc:'From the Glass City of India, creating handblown glass bangles, decorative items, and art pieces. Our furnaces run 24/7 at 1400°C. Firozabad produces 100% of India\'s glass bangles. A tradition spanning 200+ years.'},
  {biz:'Kinnauri Shawl Studio',craft:'Kinnauri Shawl',dist:'Kinnaur',st:'Himachal Pradesh',pin:'172107',desc:'Hand-spun and handwoven Kinnauri shawls from the remote Kinnaur valley at 12,000 feet. Made from local sheep wool dyed with natural walnut, indigo, and pomegranate extracts. The geometric patterns are unique to each village and clan.'},
  {biz:'Bidriware Artisans',craft:'Bidriware Metal Inlay',dist:'Bidar',st:'Karnataka',pin:'585401',desc:'Creating the 600-year-old Bidriware craft - intricate silver inlay work on blackened alloy of zinc and copper. Our artisans learned from the original Persian craftsmen who came to the Bahmani Sultanate. No two pieces are identical.'},
  {biz:'Pipli Applique House',craft:'Pipli Applique Work',dist:'Puri',st:'Odisha',pin:'752104',desc:'Vibrant applique work from Pipli village, used traditionally to decorate the chariots during the Jagannath Rath Yatra. Our canopies, wall hangings, and garden umbrellas feature mirror work and chain stitch on cotton fabric.'},
  {biz:'Aranmula Metal Mirrors',craft:'Aranmula Kannadi',dist:'Pathanamthitta',st:'Kerala',pin:'689533',desc:'Among the last 5 families in the world who know the secret copper-tin alloy formula for making Aranmula metal mirrors - front-reflecting mirrors that show the truest reflection. Each mirror is cast by hand and polished for days. National Heritage product.'},
  {biz:'Srikalahasti Kalamkari',craft:'Kalamkari Painting',dist:'Tirupati',st:'Andhra Pradesh',pin:'517644',desc:'Pen-style Kalamkari using the ancient Srikalahasti technique with natural vegetable dyes. Each fabric undergoes 17 steps of dyeing, waxing, and painting over 2-3 weeks. Our artworks depict scenes from the Mahabharata and Ramayana.'},
  {biz:'Kangra Miniature Gallery',craft:'Kangra Miniature Art',dist:'Kangra',st:'Himachal Pradesh',pin:'176001',desc:'Kangra school miniature paintings depicting Radha-Krishna themes in the distinctive soft palette of the Pahari style. Our artists use handmade paper, natural pigments ground on stone, and brushes made from squirrel hair.'},
  {biz:'Manipuri Handloom Co.',craft:'Manipuri Handloom',dist:'Imphal West',st:'Manipur',pin:'795001',desc:'Traditional Manipuri handloom fabrics including the famous Moirang Phee and Wangkhei Phee. Woven by women on throw-shuttle looms in their homes, these textiles are integral to Meitei culture and ceremonies.'},
  {biz:'Sikkim Carpet Weavers',craft:'Sikkimese Carpets',dist:'Gangtok',st:'Sikkim',pin:'737101',desc:'Hand-knotted Tibetan-style carpets made by artisans in the hills of Gangtok. Our carpets use 100% highland sheep wool and natural dyes. Traditional Buddhist dragon and phoenix motifs. Each 3x5ft carpet takes 3-4 months.'},
  {biz:'Nagaland Shawl House',craft:'Naga Tribal Textiles',dist:'Dimapur',st:'Nagaland',pin:'797112',desc:'Traditional Naga warrior shawls and textiles woven by tribal women. Each tribe has distinct patterns - we work with Angami, Ao, Lotha, and Sema artisans. The black and red warrior shawl with spear motifs is our signature piece.'},
];

// ─── Helper: Generate fake but valid-looking PII ─────────
const genPhone = () => `${pick(['98','97','96','95','94','93','91','90','89','88','87','86','85','84','83','82','81','80','79','78','77','76','75','74','73','72','71','70','63','62','61'])}${rand(10000000,99999999)}`;
const genGSTIN = (stCode) => `${stCode}${String.fromCharCode(65+rand(0,25))}${String.fromCharCode(65+rand(0,25))}${String.fromCharCode(65+rand(0,25))}${String.fromCharCode(65+rand(0,25))}${rand(1000,9999)}${String.fromCharCode(65+rand(0,25))}${rand(1,9)}Z${String.fromCharCode(65+rand(0,25))}`;
const genPAN = () => `${String.fromCharCode(65+rand(0,25))}${String.fromCharCode(65+rand(0,25))}${String.fromCharCode(65+rand(0,25))}P${String.fromCharCode(65+rand(0,25))}${rand(1000,9999)}${String.fromCharCode(65+rand(0,25))}`;
const genBankAcc = () => `${rand(1,9)}${Array.from({length:rand(10,14)},()=>rand(0,9)).join('')}`;
const GST_STATE_CODES = {'Uttar Pradesh':'09','Bihar':'10','Gujarat':'24','Rajasthan':'08','Kerala':'32','Tamil Nadu':'33','Odisha':'21','Jammu and Kashmir':'01','Chhattisgarh':'22','West Bengal':'19','Telangana':'36','Madhya Pradesh':'23','Karnataka':'29','Maharashtra':'27','Punjab':'03','Assam':'18','Andhra Pradesh':'37','Himachal Pradesh':'02','Manipur':'14','Sikkim':'11','Nagaland':'13'};

const genAddress = () => {
  const loc = pick(LOCATIONS);
  return { ...loc, line1: `${pick(APARTMENTS)} ${rand(1,999)}, ${pick(STREETS)}`, line2: loc.area ? `Near ${pick(['Metro Station','Bus Stop','Post Office','Market','Temple','School','Park','Hospital'])}, ${loc.area}` : '' };
};

// ─── Review templates ────────────────────────────────────
const REVIEWS = [
  {t:'Absolutely stunning!',c:'The craftsmanship is breathtaking. You can tell this was made by skilled artisans who truly care about their craft. The attention to detail is remarkable.',r:5},
  {t:'Beautiful handwork',c:'Received the product yesterday and I\'m in love with the quality. The colors are vibrant and exactly as shown in the photos. Will definitely order again.',r:5},
  {t:'Perfect gift',c:'Bought this as a wedding gift for my sister and she absolutely loved it. The packaging was also very elegant. Great value for an authentic handmade product.',r:5},
  {t:'Exceeded expectations',c:'I was skeptical about ordering handmade products online, but this exceeded all my expectations. The material quality is premium and the finish is flawless.',r:5},
  {t:'Very good quality',c:'Good product with genuine handmade feel. The texture and colors are beautiful. Delivery was a bit slow but the product makes up for it.',r:4},
  {t:'Authentic and beautiful',c:'You can see the hours of work that went into this piece. Very authentic and true to the traditional art form. Supporting artisans feels great.',r:4},
  {t:'Happy with purchase',c:'Nice product, well packaged. The color is slightly different from the photo but still beautiful. Would recommend to friends looking for traditional Indian crafts.',r:4},
  {t:'Good but slow delivery',c:'The product itself is excellent quality and clearly handmade. However, delivery took 12 days which was longer than expected. Product worth the wait though.',r:4},
  {t:'Decent product',c:'It\'s a good product for the price. Not as detailed as I expected from the photos, but still nice. The artisan clearly has skill.',r:3},
  {t:'Could be better',c:'The material quality is okay but the finishing could have been more polished. Still, it\'s a genuine handmade product and I appreciate the artisan\'s work.',r:3},
  {t:'Lovely addition to home',c:'This looks absolutely wonderful in my living room. Multiple guests have complimented it. The traditional design adds such warmth to modern decor.',r:5},
  {t:'Museum quality piece',c:'I collect Indian art and this is among the finest pieces I\'ve purchased online. The artist has maintained the authenticity of the traditional style perfectly.',r:5},
  {t:'Great for the price',c:'At this price point, getting a genuine handmade product from a traditional artisan is incredible value. The quality far exceeds what you\'d find at tourist shops.',r:4},
  {t:'Unique and authentic',c:'Every piece is slightly different because it\'s truly handmade - I love that. You can see the artisan\'s individual touch. Not a factory-made replica.',r:5},
  {t:'Practical and beautiful',c:'Not just decorative - this is genuinely functional and well-made. The artisan clearly designed this for daily use while maintaining traditional aesthetics.',r:4},
  {t:'Second purchase',c:'This is my second order from this seller and the quality is consistent. I\'m slowly building a collection of authentic Indian handicrafts through this platform.',r:5},
  {t:'Perfect for Diwali',c:'Ordered these for Diwali decoration and they looked absolutely stunning. Received many compliments from friends and family during the celebration.',r:5},
  {t:'Supporting artisans',c:'Love that my purchase directly supports traditional artisans. The product quality speaks to their expertise. India\'s craft heritage is truly precious.',r:4},
];

// ─── Support ticket templates ────────────────────────────
const TICKETS = [
  {s:'When will my order be delivered?',cat:'shipping',p:'medium',msgs:['I ordered 5 days ago but haven\'t received tracking information yet. Can you please check?','Your order has been shipped via DTDC. Tracking ID: D12345678. Expected delivery in 3-5 business days.','Thank you! I can see the tracking now. Appreciate the quick response.']},
  {s:'Product color is different from photo',cat:'product',p:'low',msgs:['The saree I received is a slightly different shade of red compared to the listing photo.','Thank you for your feedback. Handmade products may have slight color variations as they use natural dyes. This is actually a hallmark of authenticity. Would you like to return it for exchange?','I understand now. Actually, the color looks beautiful in person. I\'ll keep it. Thanks for explaining!']},
  {s:'Damaged during shipping',cat:'shipping',p:'high',msgs:['The pottery vase arrived with a crack on the side. I\'ve attached photos showing the damage.','We sincerely apologize for the damage during transit. We\'re arranging a replacement immediately. Please keep the damaged item - no need to return. Your new vase will ship within 24 hours.','Received the replacement today and it\'s perfect. Great customer service!']},
  {s:'Request for bulk order pricing',cat:'general',p:'medium',msgs:['I\'m interested in ordering 50 units of the Madhubani coasters for corporate gifts. Do you offer bulk pricing?','Absolutely! For 50 units, we can offer 25% discount on the listed price. Delivery would take 15-20 days as each piece is handpainted. Shall I create a custom order for you?','That sounds great. Please go ahead with the order.']},
  {s:'Need gift wrapping option',cat:'general',p:'low',msgs:['Do you provide gift wrapping for products? I want to send this as a birthday gift.','We offer traditional Indian gift wrapping using handmade paper and fabric ribbon for ₹99 extra. Would you like us to add that to your order?','Yes please! That would be perfect.']},
  {s:'Cancel my order',cat:'order',p:'high',msgs:['I need to cancel order ODOP-2025-XYZ as I ordered the wrong size.','We\'ve cancelled the order and initiated a refund. The amount will be credited to your account within 5-7 business days.','Refund received. Thank you for the quick processing.']},
  {s:'How to care for silk saree?',cat:'product',p:'low',msgs:['I just received my Banarasi silk saree. What\'s the best way to care for it and store it?','Great question! Always dry clean your Banarasi saree - never machine wash. Store it wrapped in a soft muslin cloth, not plastic. Add a few neem leaves to prevent insects. Air it out every 3-4 months.','Very helpful. Thank you for the detailed care instructions!']},
];

// ═══════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════
async function seedRealisticData() {
  const client = await pool.connect();
  let spIdx = 0;
  const safe = async (q, p) => {
    const sp = `rsp_${++spIdx}`;
    await client.query(`SAVEPOINT ${sp}`);
    try { const r = await client.query(q, p); await client.query(`RELEASE SAVEPOINT ${sp}`); return r; }
    catch (e) { await client.query(`ROLLBACK TO SAVEPOINT ${sp}`); throw e; }
  };

  try {
    await client.query('BEGIN');
    console.log('\n🎭 Generating realistic demo data...\n');
    const password = await bcrypt.hash('password123', 10);

    // ── 1. Create 30 realistic sellers with full PII ────
    console.log('🏪 Creating 30 sellers with GST/PAN/bank details...');
    const sellerIds = [];
    for (const sp of SELLER_PROFILES) {
      const isFemale = Math.random() > 0.6;
      const first = pick(isFemale ? FEMALE_FIRST : MALE_FIRST);
      const last = pick(LAST_NAMES);
      const name = `${first} ${last}`;
      const emailName = `${first.toLowerCase()}.${sp.biz.toLowerCase().replace(/[^a-z]/g,'').substring(0,10)}`;
      const email = `${emailName}@${pick(['artisan.in','craft.co.in','handloom.in','gmail.com','outlook.com'])}`;
      const id = uuidv4();
      const phone = genPhone();
      const bank = pick(BANKS);
      const stCode = GST_STATE_CODES[sp.st] || '09';

      try {
        await safe(`INSERT INTO users (id,name,email,password_hash,phone,role,is_active,email_verified,last_login,created_at)
          VALUES ($1,$2,$3,$4,$5,'seller',true,true,NOW()-interval '${rand(0,3)} days',NOW()-interval '${rand(60,365)} days')
          ON CONFLICT(email) DO NOTHING`, [id, name, email, password, phone]);

        await safe(`INSERT INTO seller_profiles (user_id,business_name,description,gstin,pan_number,bank_account,bank_ifsc,bank_name,district,state,city,pincode,craft_speciality,verification,verified_at,rating,total_sales,total_revenue)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$9,$11,$12,'verified',NOW()-interval '${rand(30,180)} days',$13,$14,$15)
          ON CONFLICT(user_id) DO NOTHING`,
          [id, sp.biz, sp.desc, genGSTIN(stCode), genPAN(), genBankAcc(), bank.ifsc+rand(100000,999999), bank.name,
           sp.dist, sp.st, sp.pin, sp.craft, (3.8+Math.random()*1.2).toFixed(2), rand(100,2000), rand(50000,2500000)]);

        sellerIds.push(id);
      } catch(e) { /* skip */ }
    }
    console.log(`  ✅ ${sellerIds.length} sellers with full business profiles`);

    // ── 2. Create 100 realistic buyers ──────────────────
    console.log('👥 Creating 100 buyers with addresses...');
    const buyerIds = [];
    const usedEmails = new Set();
    for (let i = 0; i < 100; i++) {
      const isFemale = Math.random() > 0.5;
      const first = pick(isFemale ? FEMALE_FIRST : MALE_FIRST);
      const last = pick(LAST_NAMES);
      const name = `${first} ${last}`;
      let email = `${first.toLowerCase()}${last.toLowerCase()}${rand(1,999)}@${pick(['gmail.com','gmail.com','gmail.com','yahoo.co.in','outlook.com','hotmail.com','rediffmail.com','icloud.com'])}`;
      if (usedEmails.has(email)) email = `${first.toLowerCase()}.${last.toLowerCase()}.${rand(100,999)}@gmail.com`;
      usedEmails.add(email);
      const id = uuidv4();
      const phone = genPhone();

      try {
        await safe(`INSERT INTO users (id,name,email,password_hash,phone,role,is_active,email_verified,last_login,created_at)
          VALUES ($1,$2,$3,$4,$5,'buyer',true,true,NOW()-interval '${rand(0,14)} days',NOW()-interval '${rand(1,300)} days')
          ON CONFLICT(email) DO NOTHING`, [id, name, email, password, phone]);
        buyerIds.push({id, name, phone});

        // Add 1-2 addresses
        const numAddr = rand(1, 2);
        for (let a = 0; a < numAddr; a++) {
          const addr = genAddress();
          await safe(`INSERT INTO buyer_addresses (user_id,label,name,phone,address_line1,address_line2,city,state,pincode,is_default)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [id, a === 0 ? 'Home' : 'Office', name, phone, addr.line1, addr.line2, addr.city, addr.state, addr.pin, a === 0]);
        }
      } catch(e) { /* skip */ }
    }
    console.log(`  ✅ ${buyerIds.length} buyers with addresses`);

    // Get all sellers and products for orders
    const allSellers = (await client.query("SELECT id FROM users WHERE role='seller'")).rows.map(r => r.id);
    const allProducts = (await client.query("SELECT id, name, price, seller_id, thumbnail FROM products WHERE is_active=true ORDER BY RANDOM() LIMIT 500")).rows;

    if (allProducts.length === 0) {
      console.log('  ⚠️  No products found - run product seeds first');
      await client.query('COMMIT');
      return;
    }

    // ── 3. Create 600 realistic orders ──────────────────
    console.log('📦 Creating 600 orders with realistic data...');
    const STATUSES = ['pending','confirmed','processing','shipped','delivered','delivered','delivered','delivered'];
    const orderIds = [];
    let orderCount = 0;

    for (let i = 0; i < 600; i++) {
      const buyer = pick(buyerIds);
      const prods = pickN(allProducts, rand(1, 3));
      if (prods.length === 0) continue;

      const subtotal = prods.reduce((s, p) => s + parseFloat(p.price) * rand(1,2), 0);
      const shipping = subtotal > 2000 ? 0 : pick([49, 79, 99, 149]);
      const tax = Math.round(subtotal * 0.05 * 100) / 100;
      const total = Math.round((subtotal + shipping + tax) * 100) / 100;
      const status = pick(STATUSES);
      const daysAgo = rand(1, 120);
      const addr = genAddress();
      const orderNum = `ODOP-${String(rand(10000,99999))}${String.fromCharCode(65+rand(0,25))}`;

      try {
        const oRes = await safe(`INSERT INTO orders (order_number,buyer_id,status,subtotal,shipping_fee,tax,total,payment_status,shipping_address,delivered_at,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()-interval '${daysAgo} days')
          ON CONFLICT(order_number) DO NOTHING RETURNING id`,
          [orderNum, buyer.id, status, subtotal, shipping, tax, total,
           status === 'delivered' ? 'captured' : status === 'cancelled' ? 'refunded' : 'captured',
           JSON.stringify({name:buyer.name, phone:buyer.phone, address:addr.line1, address2:addr.line2, city:addr.city, state:addr.state, pincode:addr.pin}),
           status === 'delivered' ? new Date(Date.now() - (daysAgo - rand(1,5)) * 86400000) : null]);

        if (oRes.rows.length > 0) {
          const oid = oRes.rows[0].id;
          orderIds.push({id: oid, buyerId: buyer.id});
          for (const p of prods) {
            const qty = rand(1, 2);
            await safe(`INSERT INTO order_items (order_id,product_id,seller_id,product_name,product_image,quantity,price,total,status)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
              [oid, p.id, p.seller_id, p.name.substring(0,200), p.thumbnail, qty, p.price, (parseFloat(p.price)*qty).toFixed(2), status]);
          }
          orderCount++;
        }
      } catch(e) { /* skip */ }
    }
    console.log(`  ✅ ${orderCount} orders`);

    // ── 4. Create 800 realistic reviews ─────────────────
    console.log('⭐ Creating 800 reviews...');
    let reviewCount = 0;
    const reviewedPairs = new Set();

    for (let i = 0; i < 800; i++) {
      const buyer = pick(buyerIds);
      const product = pick(allProducts);
      const order = orderIds.length > 0 ? pick(orderIds) : null;
      const pairKey = `${product.id}-${buyer.id}-${order?.id || 'x'}`;
      if (reviewedPairs.has(pairKey)) continue;
      reviewedPairs.add(pairKey);

      const rev = pick(REVIEWS);
      try {
        await safe(`INSERT INTO reviews (product_id,user_id,order_id,rating,title,comment,is_verified_purchase,helpful_count,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()-interval '${rand(1,90)} days')
          ON CONFLICT DO NOTHING`,
          [product.id, buyer.id, order?.id || null, rev.r, rev.t, rev.c, Math.random()>0.3, rand(0,25)]);
        reviewCount++;
      } catch(e) { /* skip */ }
    }
    console.log(`  ✅ ${reviewCount} reviews`);

    // ── 5. Update product ratings from reviews ──────────
    console.log('📊 Updating product ratings...');
    await client.query(`UPDATE products p SET avg_rating=sub.ar, review_count=sub.cnt FROM
      (SELECT product_id, ROUND(AVG(rating)::numeric,1) ar, COUNT(*) cnt FROM reviews GROUP BY product_id) sub
      WHERE p.id=sub.product_id`);

    // ── 6. Update seller stats ──────────────────────────
    console.log('💰 Updating seller revenue stats...');
    await client.query(`UPDATE seller_profiles sp SET
      total_sales = sub.cnt, total_revenue = sub.rev, rating = sub.r
      FROM (
        SELECT oi.seller_id, COUNT(DISTINCT oi.order_id) cnt, COALESCE(SUM(oi.total),0) rev,
          ROUND((4.0 + RANDOM())::numeric, 2) r
        FROM order_items oi GROUP BY oi.seller_id
      ) sub WHERE sp.user_id = sub.seller_id`);

    // ── 7. Create support tickets ───────────────────────
    console.log('🎫 Creating support tickets...');
    let ticketCount = 0;
    const adminId = (await client.query("SELECT id FROM users WHERE role='admin' LIMIT 1")).rows[0]?.id;

    for (let i = 0; i < 25; i++) {
      const tpl = TICKETS[i % TICKETS.length];
      const buyer = pick(buyerIds);
      const order = orderIds.length > 0 ? pick(orderIds) : null;
      const ticketNum = `TKT-${rand(10000,99999)}${String.fromCharCode(65+rand(0,25))}`;
      const isResolved = Math.random() > 0.3;
      const daysAgo = rand(1, 60);

      try {
        const tRes = await safe(`INSERT INTO support_tickets (ticket_number,user_id,order_id,subject,category,status,priority,created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()-interval '${daysAgo} days')
          ON CONFLICT(ticket_number) DO NOTHING RETURNING id`,
          [ticketNum, buyer.id, order?.id || null, tpl.s, tpl.cat, isResolved ? 'resolved' : 'open', tpl.p]);

        if (tRes.rows.length > 0) {
          const tid = tRes.rows[0].id;
          // Add messages
          for (let m = 0; m < tpl.msgs.length; m++) {
            const isAdmin = m % 2 === 1;
            const senderId = isAdmin && adminId ? adminId : buyer.id;
            await safe(`INSERT INTO ticket_messages (ticket_id,sender_id,message,is_admin,created_at)
              VALUES ($1,$2,$3,$4,NOW()-interval '${daysAgo - m} days')`,
              [tid, senderId, tpl.msgs[m], isAdmin]);
          }
          ticketCount++;
        }
      } catch(e) { /* skip */ }
    }
    console.log(`  ✅ ${ticketCount} support tickets with conversations`);

    await client.query('COMMIT');
    console.log(`
╔═══════════════════════════════════════════╗
║   🎉 REALISTIC DATA SEEDING COMPLETE!    ║
╠═══════════════════════════════════════════╣
║  Sellers:  ${String(sellerIds.length).padStart(4)}  (with GST/PAN/bank)    ║
║  Buyers:   ${String(buyerIds.length).padStart(4)}  (with addresses)       ║
║  Orders:   ${String(orderCount).padStart(4)}  (realistic timeline)   ║
║  Reviews:  ${String(reviewCount).padStart(4)}  (varied comments)     ║
║  Tickets:  ${String(ticketCount).padStart(4)}  (with conversations)  ║
╚═══════════════════════════════════════════╝
    `);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedRealisticData();
