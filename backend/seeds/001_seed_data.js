require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ════════════════════════════════════════════════════════════
// ODOP Dataset — 106 products from official GOI ODOP list
// ════════════════════════════════════════════════════════════
const odopData = [
  // Uttar Pradesh (12)
  { state: 'Uttar Pradesh', district: 'Varanasi', product_name: 'Banarasi Silk Saree', category: 'Textiles', gi_tag: true, description: 'World-renowned handwoven silk sarees with intricate zari work' },
  { state: 'Uttar Pradesh', district: 'Lucknow', product_name: 'Chikankari', category: 'Textiles', gi_tag: true, description: 'Delicate hand-embroidered textile art dating back to Mughal era' },
  { state: 'Uttar Pradesh', district: 'Moradabad', product_name: 'Brassware', category: 'Metal Crafts', gi_tag: false, description: 'Intricate brass metalwork - pitchers, plates, and decorative items' },
  { state: 'Uttar Pradesh', district: 'Azamgarh', product_name: 'Black Pottery', category: 'Pottery', gi_tag: true, description: 'Distinctive black clay pottery with silver-like designs' },
  { state: 'Uttar Pradesh', district: 'Firozabad', product_name: 'Glass Bangles', category: 'Jewelry', gi_tag: false, description: 'Colorful glass bangles crafted by skilled artisans' },
  { state: 'Uttar Pradesh', district: 'Agra', product_name: 'Marble Inlay Work', category: 'Handicrafts', gi_tag: true, description: 'Pietra dura marble inlay inspired by Taj Mahal craftsmanship' },
  { state: 'Uttar Pradesh', district: 'Kanpur', product_name: 'Leather Products', category: 'Handicrafts', gi_tag: false, description: 'Premium leather goods - bags, wallets, shoes, belts' },
  { state: 'Uttar Pradesh', district: 'Saharanpur', product_name: 'Wood Carving', category: 'Handicrafts', gi_tag: true, description: 'Exquisite wood carving on sheesham and teak' },
  { state: 'Uttar Pradesh', district: 'Bhadohi', product_name: 'Handknotted Carpet', category: 'Textiles', gi_tag: true, description: 'Hand-knotted woolen carpets with Persian and Indian designs' },
  { state: 'Uttar Pradesh', district: 'Mirzapur', product_name: 'Dari & Carpet', category: 'Textiles', gi_tag: false, description: 'Traditional flat-woven cotton carpets and floor coverings' },
  { state: 'Uttar Pradesh', district: 'Gorakhpur', product_name: 'Terracotta', category: 'Pottery', gi_tag: false, description: 'Red clay terracotta figurines, toys, and decorative pieces' },
  { state: 'Uttar Pradesh', district: 'Etah', product_name: 'Zardozi Embroidery', category: 'Textiles', gi_tag: true, description: 'Gold and silver metallic thread embroidery art' },
  // Bihar (6)
  { state: 'Bihar', district: 'Madhubani', product_name: 'Madhubani Painting', category: 'Art', gi_tag: true, description: 'Ancient Mithila folk art with geometric and natural motifs' },
  { state: 'Bihar', district: 'Bhagalpur', product_name: 'Bhagalpuri Silk', category: 'Textiles', gi_tag: true, description: 'Distinctive tussar silk fabric with natural golden sheen' },
  { state: 'Bihar', district: 'Muzaffarpur', product_name: 'Shahi Litchi', category: 'Food Products', gi_tag: true, description: 'Premium variety litchi fruit with unique aroma' },
  { state: 'Bihar', district: 'Nalanda', product_name: 'Bawan Buti Saree', category: 'Textiles', gi_tag: false, description: 'Traditional 52-motif handwoven sarees' },
  { state: 'Bihar', district: 'Patna', product_name: 'Tikuli Art', category: 'Art', gi_tag: false, description: 'Gold leaf artwork on glass dating back to centuries' },
  { state: 'Bihar', district: 'Gaya', product_name: 'Stone Craft', category: 'Handicrafts', gi_tag: false, description: 'Hand-carved stone idols and decorative items' },
  // Rajasthan (10)
  { state: 'Rajasthan', district: 'Jaipur', product_name: 'Blue Pottery', category: 'Pottery', gi_tag: true, description: 'Turquoise-blue glazed pottery with Mughal designs' },
  { state: 'Rajasthan', district: 'Jodhpur', product_name: 'Bandhani Textile', category: 'Textiles', gi_tag: true, description: 'Tie-dye textiles with thousands of tiny dots creating patterns' },
  { state: 'Rajasthan', district: 'Udaipur', product_name: 'Miniature Painting', category: 'Art', gi_tag: false, description: 'Intricate miniature paintings depicting royal life' },
  { state: 'Rajasthan', district: 'Barmer', product_name: 'Applique Work', category: 'Textiles', gi_tag: false, description: 'Colorful applique embroidery on fabric' },
  { state: 'Rajasthan', district: 'Bikaner', product_name: 'Usta Art (Camel Leather)', category: 'Handicrafts', gi_tag: true, description: 'Gold and silver painted camel leather art' },
  { state: 'Rajasthan', district: 'Jaisalmer', product_name: 'Rajasthani Embroidery', category: 'Textiles', gi_tag: false, description: 'Mirror work and thread embroidery on fabric' },
  { state: 'Rajasthan', district: 'Alwar', product_name: 'Kagzi Pottery', category: 'Pottery', gi_tag: false, description: 'Thin paper-like pottery unique to Alwar region' },
  { state: 'Rajasthan', district: 'Kota', product_name: 'Kota Doria Saree', category: 'Textiles', gi_tag: true, description: 'Lightweight woven sarees with distinctive check patterns' },
  { state: 'Rajasthan', district: 'Nathdwara', product_name: 'Pichwai Painting', category: 'Art', gi_tag: true, description: 'Large devotional paintings depicting Lord Krishna' },
  { state: 'Rajasthan', district: 'Sanganer', product_name: 'Block Printing', category: 'Textiles', gi_tag: true, description: 'Hand block printing on fabric using wooden blocks' },
  // Gujarat (8)
  { state: 'Gujarat', district: 'Kutch', product_name: 'Rogan Art', category: 'Art', gi_tag: true, description: 'Ultra-rare oil-based textile painting from Nirona village' },
  { state: 'Gujarat', district: 'Kutch', product_name: 'Kutch Embroidery', category: 'Textiles', gi_tag: true, description: 'Mirror work embroidery by local tribal communities' },
  { state: 'Gujarat', district: 'Patan', product_name: 'Patola Saree', category: 'Textiles', gi_tag: true, description: 'Complex double-ikat woven sarees, each taking months' },
  { state: 'Gujarat', district: 'Ahmedabad', product_name: 'Bandhej (Bandhani)', category: 'Textiles', gi_tag: true, description: 'Traditional tie-dye art with intricate dot patterns' },
  { state: 'Gujarat', district: 'Jamnagar', product_name: 'Ajrakh Block Print', category: 'Textiles', gi_tag: true, description: 'Resist block printing with natural indigo dyes' },
  { state: 'Gujarat', district: 'Bhuj', product_name: 'Copper Bells', category: 'Metal Crafts', gi_tag: false, description: 'Handcrafted copper cow bells and wind chimes' },
  { state: 'Gujarat', district: 'Morbi', product_name: 'Ceramic Tiles', category: 'Pottery', gi_tag: false, description: 'Decorative ceramic tiles and pottery' },
  { state: 'Gujarat', district: 'Rajkot', product_name: 'Tankha Painting', category: 'Art', gi_tag: false, description: 'Cloth-based paintings with mythological themes' },
  // Kerala (7)
  { state: 'Kerala', district: 'Alappuzha', product_name: 'Coir Products', category: 'Handicrafts', gi_tag: true, description: 'Handwoven coconut fiber mats, planters, and crafts' },
  { state: 'Kerala', district: 'Thrissur', product_name: 'Kasavu Saree', category: 'Textiles', gi_tag: true, description: 'Traditional cream saree with gold zari border' },
  { state: 'Kerala', district: 'Palakkad', product_name: 'Bell Metal Craft', category: 'Metal Crafts', gi_tag: true, description: 'Traditional bell metal utensils and lamps' },
  { state: 'Kerala', district: 'Kozhikode', product_name: 'Malabar Spices', category: 'Food Products', gi_tag: true, description: 'Premium cardamom, pepper, and cinnamon' },
  { state: 'Kerala', district: 'Kottayam', product_name: 'Rubber Products', category: 'Handicrafts', gi_tag: false, description: 'Natural rubber-based products and crafts' },
  { state: 'Kerala', district: 'Pathanamthitta', product_name: 'Aranmula Kannadi', category: 'Handicrafts', gi_tag: true, description: 'Rare metal mirror using secret alloy composition' },
  { state: 'Kerala', district: 'Wayanad', product_name: 'Wayanad Coffee', category: 'Food Products', gi_tag: true, description: 'Arabica coffee grown in Western Ghats' },
  // West Bengal (7)
  { state: 'West Bengal', district: 'Kolkata', product_name: 'Terracotta Craft', category: 'Pottery', gi_tag: false, description: 'Red clay terracotta temples, figurines and décor' },
  { state: 'West Bengal', district: 'Shantiniketan', product_name: 'Kantha Embroidery', category: 'Textiles', gi_tag: true, description: 'Running stitch embroidery on old sarees creating quilts' },
  { state: 'West Bengal', district: 'Murshidabad', product_name: 'Murshidabad Silk', category: 'Textiles', gi_tag: true, description: 'Premium quality silk from sericulture clusters' },
  { state: 'West Bengal', district: 'Bankura', product_name: 'Dokra Metal Art', category: 'Metal Crafts', gi_tag: true, description: 'Lost-wax cast brass figurines and jewelry' },
  { state: 'West Bengal', district: 'Darjeeling', product_name: 'Darjeeling Tea', category: 'Food Products', gi_tag: true, description: 'World-famous tea from Himalayan estates' },
  { state: 'West Bengal', district: 'Purulia', product_name: 'Chhau Dance Masks', category: 'Art', gi_tag: true, description: 'Elaborate painted masks for traditional Chhau dance' },
  { state: 'West Bengal', district: 'Nadia', product_name: 'Nakshi Kantha', category: 'Textiles', gi_tag: true, description: 'Embroidered quilt storytelling tradition' },
  // Tamil Nadu (6)
  { state: 'Tamil Nadu', district: 'Kanchipuram', product_name: 'Kancheepuram Silk', category: 'Textiles', gi_tag: true, description: 'Temple-town silk sarees with gold zari' },
  { state: 'Tamil Nadu', district: 'Thanjavur', product_name: 'Tanjore Painting', category: 'Art', gi_tag: true, description: 'Gold-leaf paintings with gemstone embellishments' },
  { state: 'Tamil Nadu', district: 'Madurai', product_name: 'Sungudi Saree', category: 'Textiles', gi_tag: true, description: 'Tie-dyed cotton sarees with dot patterns' },
  { state: 'Tamil Nadu', district: 'Kumbakonam', product_name: 'Brass Lamps', category: 'Metal Crafts', gi_tag: false, description: 'Traditional brass oil lamps for temples and homes' },
  { state: 'Tamil Nadu', district: 'Mahabalipuram', product_name: 'Stone Sculpture', category: 'Handicrafts', gi_tag: true, description: 'Granite and sandstone carvings in Pallava tradition' },
  { state: 'Tamil Nadu', district: 'Nilgiris', product_name: 'Nilgiri Tea', category: 'Food Products', gi_tag: true, description: 'Aromatic tea from the Blue Mountains' },
  // Maharashtra (6)
  { state: 'Maharashtra', district: 'Thane', product_name: 'Warli Painting', category: 'Art', gi_tag: true, description: 'Ancient tribal art using geometric patterns' },
  { state: 'Maharashtra', district: 'Pune', product_name: 'Kolhapuri Chappal', category: 'Handicrafts', gi_tag: true, description: 'Hand-stitched leather sandals with traditional design' },
  { state: 'Maharashtra', district: 'Nagpur', product_name: 'Nagpur Orange', category: 'Food Products', gi_tag: true, description: 'Premium sweet oranges from Nagpur region' },
  { state: 'Maharashtra', district: 'Solapur', product_name: 'Solapur Chaddar', category: 'Textiles', gi_tag: true, description: 'Thick cotton towels and bedspreads' },
  { state: 'Maharashtra', district: 'Nashik', product_name: 'Nashik Grapes & Wine', category: 'Food Products', gi_tag: true, description: 'Premium table grapes and India-made wines' },
  { state: 'Maharashtra', district: 'Aurangabad', product_name: 'Paithani Saree', category: 'Textiles', gi_tag: true, description: 'Royal silk sarees with peacock motif borders' },
  // Karnataka (6)
  { state: 'Karnataka', district: 'Mysuru', product_name: 'Mysore Silk', category: 'Textiles', gi_tag: true, description: 'Pure mulberry silk sarees in rich colors' },
  { state: 'Karnataka', district: 'Ramanagara', product_name: 'Channapatna Toys', category: 'Handicrafts', gi_tag: true, description: 'Lacquer-coated wooden toys with vegetable dyes' },
  { state: 'Karnataka', district: 'Bidar', product_name: 'Bidriware', category: 'Metal Crafts', gi_tag: true, description: 'Silver-inlaid blackened alloy metal craft' },
  { state: 'Karnataka', district: 'Dharwad', product_name: 'Dharwad Pedha', category: 'Food Products', gi_tag: true, description: 'Famous milk-based sweet delicacy' },
  { state: 'Karnataka', district: 'Coorg', product_name: 'Coorg Coffee', category: 'Food Products', gi_tag: true, description: 'Arabica and robusta coffee from Kodagu hills' },
  { state: 'Karnataka', district: 'Udupi', product_name: 'Udupi Krishna Idol', category: 'Handicrafts', gi_tag: false, description: 'Traditional wooden and metal deity sculptures' },
  // Madhya Pradesh (5)
  { state: 'Madhya Pradesh', district: 'Gwalior', product_name: 'Chanderi Fabric', category: 'Textiles', gi_tag: true, description: 'Sheer lightweight fabric with gold/silver motifs' },
  { state: 'Madhya Pradesh', district: 'Bhopal', product_name: 'Zari-Zardozi', category: 'Textiles', gi_tag: false, description: 'Metallic thread embroidery on fabric' },
  { state: 'Madhya Pradesh', district: 'Jhabua', product_name: 'Tribal Bamboo Craft', category: 'Handicrafts', gi_tag: false, description: 'Bamboo baskets, furniture, and décor by Bhil tribe' },
  { state: 'Madhya Pradesh', district: 'Indore', product_name: 'Maheshwari Saree', category: 'Textiles', gi_tag: true, description: 'Cotton-silk blend sarees with reversible borders' },
  { state: 'Madhya Pradesh', district: 'Mandla', product_name: 'Gond Painting', category: 'Art', gi_tag: true, description: 'Vibrant tribal art depicting forest and nature' },
  // Odisha (5)
  { state: 'Odisha', district: 'Puri', product_name: 'Pattachitra', category: 'Art', gi_tag: true, description: 'Cloth-based scroll paintings of mythological scenes' },
  { state: 'Odisha', district: 'Sambalpur', product_name: 'Sambalpuri Saree', category: 'Textiles', gi_tag: true, description: 'Ikat woven sarees with traditional bandha tie-dye' },
  { state: 'Odisha', district: 'Cuttack', product_name: 'Silver Filigree', category: 'Jewelry', gi_tag: true, description: 'Intricate silver wire jewelry and decorative items' },
  { state: 'Odisha', district: 'Bhubaneswar', product_name: 'Applique Work', category: 'Textiles', gi_tag: false, description: 'Colorful fabric applique for festival decorations' },
  { state: 'Odisha', district: 'Koraput', product_name: 'Tribal Dhokra', category: 'Metal Crafts', gi_tag: true, description: 'Lost-wax cast brass tribal figures and jewelry' },
  // Andhra Pradesh & Telangana (6)
  { state: 'Andhra Pradesh', district: 'Srikalahasti', product_name: 'Kalamkari', category: 'Textiles', gi_tag: true, description: 'Hand-painted vegetable-dyed cotton textiles' },
  { state: 'Andhra Pradesh', district: 'Machilipatnam', product_name: 'Machilipatnam Kalamkari', category: 'Textiles', gi_tag: true, description: 'Block-printed Kalamkari with natural dyes' },
  { state: 'Andhra Pradesh', district: 'Tirupati', product_name: 'Tirupati Laddu', category: 'Food Products', gi_tag: true, description: 'Sacred temple sweet offering' },
  { state: 'Andhra Pradesh', district: 'Kondapalli', product_name: 'Kondapalli Toys', category: 'Handicrafts', gi_tag: true, description: 'Lightweight softwood painted toys and figurines' },
  { state: 'Telangana', district: 'Hyderabad', product_name: 'Hyderabadi Pearls', category: 'Jewelry', gi_tag: true, description: 'Lustrous freshwater pearls and pearl jewelry' },
  { state: 'Telangana', district: 'Warangal', product_name: 'Warangal Durries', category: 'Textiles', gi_tag: false, description: 'Handwoven cotton rugs with geometric patterns' },
  // Jammu & Kashmir (4)
  { state: 'Jammu & Kashmir', district: 'Srinagar', product_name: 'Pashmina Shawl', category: 'Textiles', gi_tag: true, description: 'Ultra-fine cashmere from Changthangi goats' },
  { state: 'Jammu & Kashmir', district: 'Srinagar', product_name: 'Kashmiri Carpet', category: 'Textiles', gi_tag: true, description: 'Hand-knotted silk carpets with Persian knots' },
  { state: 'Jammu & Kashmir', district: 'Srinagar', product_name: 'Walnut Wood Carving', category: 'Handicrafts', gi_tag: true, description: 'Intricately carved walnut wood furniture and décor' },
  { state: 'Jammu & Kashmir', district: 'Srinagar', product_name: 'Paper Mache', category: 'Handicrafts', gi_tag: true, description: 'Papier-mâché boxes, vases, and ornaments' },
  // Assam & NE (6)
  { state: 'Assam', district: 'Kamrup', product_name: 'Muga Silk', category: 'Textiles', gi_tag: true, description: 'Golden silk exclusive to Assam from Antheraea assamensis' },
  { state: 'Assam', district: 'Jorhat', product_name: 'Assam Tea', category: 'Food Products', gi_tag: true, description: 'World-famous strong, malty tea from Assam plains' },
  { state: 'Nagaland', district: 'Dimapur', product_name: 'Naga Shawl', category: 'Textiles', gi_tag: true, description: 'Colorful tribal warrior shawls with symbolic patterns' },
  { state: 'Manipur', district: 'Imphal', product_name: 'Manipuri Dance Costume', category: 'Textiles', gi_tag: false, description: 'Ornate costumes for classical Manipuri dance' },
  { state: 'Meghalaya', district: 'East Khasi Hills', product_name: 'Khasi Bamboo Craft', category: 'Handicrafts', gi_tag: false, description: 'Bamboo and cane baskets, furniture and instruments' },
  { state: 'Tripura', district: 'West Tripura', product_name: 'Tripura Queen Pineapple', category: 'Food Products', gi_tag: true, description: 'Sweet, juicy pineapples from Tripura hills' },
  // Punjab & Haryana (4)
  { state: 'Punjab', district: 'Patiala', product_name: 'Phulkari', category: 'Textiles', gi_tag: true, description: 'Vibrant floral embroidery on shawls and dupattas' },
  { state: 'Punjab', district: 'Amritsar', product_name: 'Amritsari Papad', category: 'Food Products', gi_tag: true, description: 'Hand-rolled spiced papads and snacks' },
  { state: 'Punjab', district: 'Ludhiana', product_name: 'Ludhiana Hosiery', category: 'Textiles', gi_tag: false, description: 'Woolen knitwear and hosiery products' },
  { state: 'Haryana', district: 'Panipat', product_name: 'Handloom Textiles', category: 'Textiles', gi_tag: false, description: 'Handwoven durries, blankets and home textiles' },
  // Chhattisgarh & Jharkhand (4)
  { state: 'Chhattisgarh', district: 'Bastar', product_name: 'Dhokra Art', category: 'Metal Crafts', gi_tag: true, description: 'Ancient 4000-year-old lost-wax brass casting' },
  { state: 'Chhattisgarh', district: 'Raigarh', product_name: 'Kosa Silk', category: 'Textiles', gi_tag: true, description: 'Tussar silk woven by tribal communities' },
  { state: 'Jharkhand', district: 'Dumka', product_name: 'Sohrai Painting', category: 'Art', gi_tag: true, description: 'Mud wall paintings by Santhal tribe women' },
  { state: 'Jharkhand', district: 'Ranchi', product_name: 'Lac Bangles', category: 'Jewelry', gi_tag: false, description: 'Colorful lac resin bangles with mirror work' },
  // Himachal Pradesh & Uttarakhand (4)
  { state: 'Himachal Pradesh', district: 'Kullu', product_name: 'Kullu Shawl', category: 'Textiles', gi_tag: true, description: 'Handwoven woolen shawls with colorful borders' },
  { state: 'Himachal Pradesh', district: 'Chamba', product_name: 'Chamba Rumal', category: 'Textiles', gi_tag: true, description: 'Double-sided embroidered handkerchiefs' },
  { state: 'Uttarakhand', district: 'Dehradun', product_name: 'Basmati Rice', category: 'Food Products', gi_tag: true, description: 'Premium long-grain aromatic rice from Doon Valley' },
  { state: 'Uttarakhand', district: 'Almora', product_name: 'Aipan Art', category: 'Art', gi_tag: false, description: 'Ritual floor and wall art of Kumaon region' },
  // Goa (2)
  { state: 'Goa', district: 'North Goa', product_name: 'Cashew Feni', category: 'Food Products', gi_tag: true, description: 'Traditional spirit distilled from cashew fruit' },
  { state: 'Goa', district: 'South Goa', product_name: 'Crochet Lace', category: 'Textiles', gi_tag: false, description: 'Portuguese-influenced crochet and lace work' },
];

// ════════════════════════════════════════════════════════════
// Fake Indian names and data generators
// ════════════════════════════════════════════════════════════
const firstNames = ['Aarav','Aditi','Aditya','Aisha','Amit','Amrita','Ananya','Anjali','Arjun','Bhavna','Chandra','Deepa','Dev','Diya','Fatima','Gauri','Harsh','Isha','Jaya','Karan','Kavya','Krishna','Lakshmi','Manish','Meera','Nandini','Nikhil','Pallavi','Pooja','Priya','Rahul','Ravi','Rekha','Rohit','Sakshi','Sandeep','Sangeeta','Sanjay','Sarika','Shreya','Sita','Sneha','Suman','Sunita','Suresh','Tanvi','Uma','Varun','Vikram','Zara'];
const lastNames = ['Sharma','Verma','Gupta','Patel','Singh','Kumar','Reddy','Nair','Pillai','Das','Devi','Iyer','Menon','Joshi','Mishra','Pandey','Shah','Mehta','Chauhan','Yadav','Thakur','Tiwari','Agarwal','Chopra','Malhotra','Bhat','Shetty','Naik','Gowda','Rao'];
const cities = [{city:'Mumbai',state:'Maharashtra',pin:'400001'},{city:'Delhi',state:'Delhi',pin:'110001'},{city:'Bangalore',state:'Karnataka',pin:'560001'},{city:'Hyderabad',state:'Telangana',pin:'500001'},{city:'Chennai',state:'Tamil Nadu',pin:'600001'},{city:'Kolkata',state:'West Bengal',pin:'700001'},{city:'Pune',state:'Maharashtra',pin:'411001'},{city:'Ahmedabad',state:'Gujarat',pin:'380001'},{city:'Jaipur',state:'Rajasthan',pin:'302001'},{city:'Lucknow',state:'Uttar Pradesh',pin:'226001'},{city:'Chandigarh',state:'Punjab',pin:'160001'},{city:'Kochi',state:'Kerala',pin:'682001'},{city:'Bhopal',state:'Madhya Pradesh',pin:'462001'},{city:'Patna',state:'Bihar',pin:'800001'},{city:'Indore',state:'Madhya Pradesh',pin:'452001'}];

const streets = ['MG Road','Station Road','Gandhi Nagar','Nehru Colony','Rajaji Street','Subhash Marg','Tagore Lane','Patel Nagar','Shastri Nagar','Civil Lines','Model Town','Sector 12','Block C','Lakshmi Nagar','Sarojini Devi Road'];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[rand(0, arr.length - 1)];
const phone = () => `9${rand(100000000, 999999999)}`;
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + rand(100, 999);

// Product name variants to generate multiple listings per ODOP
const variants = [
  { prefix: 'Premium', suffix: '- Heritage Collection', priceMult: 1.5 },
  { prefix: 'Royal', suffix: '- Artisan Special', priceMult: 2.0 },
  { prefix: 'Classic', suffix: '- Traditional Design', priceMult: 1.0 },
  { prefix: 'Handcrafted', suffix: '- Studio Edition', priceMult: 1.3 },
  { prefix: 'Authentic', suffix: '- Master Artisan', priceMult: 1.8 },
];

const basePrices = { 'Textiles': 2500, 'Art': 3500, 'Pottery': 1500, 'Handicrafts': 2000, 'Metal Crafts': 2800, 'Jewelry': 1200, 'Food Products': 500 };

const reviewTexts = [
  'Absolutely beautiful craftsmanship! The quality exceeded my expectations.',
  'Authentic product, just as described. Very happy with my purchase.',
  'The artisan really put their heart into this piece. Stunning work.',
  'Great quality for the price. Will definitely order again.',
  'Perfect gift for my mother. She loved the traditional design.',
  'The colors are so vibrant and the material feels premium.',
  'Delivery was quick and packaging was excellent. No damage at all.',
  'This is my third purchase from this seller. Consistently great quality.',
  'A true representation of Indian craftsmanship. Proud to own this.',
  'Slightly different from the image but still a beautiful piece.',
  'Love supporting local artisans through this platform!',
  'The intricate detailing on this piece is mesmerizing.',
  'My friends were amazed at the quality. Highly recommended!',
  'Wonderful product that showcases our rich cultural heritage.',
  'Worth every rupee. This is genuine handmade art.',
];

// ════════════════════════════════════════════════════════════
// Main seeder
// ════════════════════════════════════════════════════════════
const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🌱 Seeding database...\n');

    // ── 1. Seed ODOP dataset ──────────────────────────────
    console.log('  📦 ODOP dataset...');
    for (const od of odopData) {
      await client.query(`
        INSERT INTO odop_dataset (product_name, district, state, category, gi_tag, description)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING
      `, [od.product_name, od.district, od.state, od.category, od.gi_tag, od.description]);
    }
    console.log(`    ✅ ${odopData.length} ODOP entries`);

    // ── 2. Seed districts ─────────────────────────────────
    console.log('  📍 Districts...');
    const districtCoords = {};
    const stateBase = {
      'Uttar Pradesh':[26.8,80.9],'Bihar':[25.6,85.1],'Rajasthan':[26.9,75.8],'Gujarat':[22.3,71.2],'Kerala':[10.8,76.3],
      'West Bengal':[22.6,88.4],'Tamil Nadu':[11.1,78.7],'Maharashtra':[19.7,75.7],'Karnataka':[15.3,75.7],'Madhya Pradesh':[23.5,77.9],
      'Odisha':[20.9,84.8],'Andhra Pradesh':[15.9,79.7],'Telangana':[18.1,79.0],'Jammu & Kashmir':[33.8,74.8],'Assam':[26.2,92.9],
      'Nagaland':[26.2,94.6],'Manipur':[24.8,93.9],'Meghalaya':[25.5,91.9],'Tripura':[23.9,91.9],'Punjab':[31.1,75.3],
      'Haryana':[29.1,76.1],'Chhattisgarh':[21.3,81.7],'Jharkhand':[23.6,85.3],'Himachal Pradesh':[31.1,77.2],'Uttarakhand':[30.1,79.0],
      'Goa':[15.3,74.0]
    };
    const seenDistricts = new Set();
    for (const od of odopData) {
      const key = `${od.district}|${od.state}`;
      if (seenDistricts.has(key)) continue;
      seenDistricts.add(key);
      const base = stateBase[od.state] || [22, 78];
      const lat = base[0] + (Math.random() - 0.5) * 3;
      const lng = base[1] + (Math.random() - 0.5) * 3;
      districtCoords[key] = { lat, lng };
      await client.query(`
        INSERT INTO districts (name, state, latitude, longitude, famous_for, description)
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING
      `, [od.district, od.state, lat.toFixed(4), lng.toFixed(4), od.product_name, od.description]);
    }
    console.log(`    ✅ ${seenDistricts.size} districts`);

    // ── 3. Create users ───────────────────────────────────
    console.log('  👤 Users...');
    const password = await bcrypt.hash('password123', 12);

    // Admin
    const adminId = uuidv4();
    await client.query(`INSERT INTO users (id,name,email,password_hash,phone,role,is_active,email_verified) VALUES ($1,'ODOP Admin','admin@odopmarket.in',$2,'9999900000','admin',true,true) ON CONFLICT(email) DO NOTHING`, [adminId, password]);

    // 20 Sellers — spread across states
    const sellerIds = [];
    const sellerStates = [...new Set(odopData.map(o => o.state))];
    for (let i = 0; i < 20; i++) {
      const id = uuidv4();
      const fn = pick(firstNames);
      const ln = pick(lastNames);
      const st = sellerStates[i % sellerStates.length];
      const dist = odopData.find(o => o.state === st)?.district || 'Unknown';
      const craft = odopData.find(o => o.state === st)?.product_name || 'Traditional Crafts';

      await client.query(`INSERT INTO users (id,name,email,password_hash,phone,role,is_active,email_verified) VALUES ($1,$2,$3,$4,$5,'seller',true,true) ON CONFLICT(email) DO NOTHING`,
        [id, `${fn} ${ln}`, `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@artisan.in`, password, phone()]);

      await client.query(`INSERT INTO seller_profiles (user_id,business_name,description,district,state,city,verification,rating,total_sales,craft_speciality) VALUES ($1,$2,$3,$4,$5,$6,'verified',$7,$8,$9) ON CONFLICT DO NOTHING`,
        [id, `${fn}'s ${craft} Studio`, `Authentic ${craft} artisan from ${dist}, ${st}. Preserving traditional craftsmanship for generations.`,
        dist, st, dist, (3.5 + Math.random() * 1.5).toFixed(2), rand(50, 500), craft]);

      sellerIds.push(id);
    }
    console.log(`    ✅ 20 sellers`);

    // 30 Buyers with addresses
    const buyerIds = [];
    for (let i = 0; i < 30; i++) {
      const id = uuidv4();
      const fn = pick(firstNames);
      const ln = pick(lastNames);
      const loc = pick(cities);

      await client.query(`INSERT INTO users (id,name,email,password_hash,phone,role,is_active,email_verified) VALUES ($1,$2,$3,$4,$5,'buyer',true,true) ON CONFLICT(email) DO NOTHING`,
        [id, `${fn} ${ln}`, `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`, password, phone()]);

      await client.query(`INSERT INTO buyer_addresses (user_id,label,name,phone,address_line1,city,state,pincode,is_default) VALUES ($1,'Home',$2,$3,$4,$5,$6,$7,true) ON CONFLICT DO NOTHING`,
        [id, `${fn} ${ln}`, phone(), `${rand(1,999)}, ${pick(streets)}`, loc.city, loc.state, loc.pin]);

      buyerIds.push(id);
    }

    // Add known demo accounts
    const demoBuyerId = uuidv4();
    await client.query(`INSERT INTO users (id,name,email,password_hash,phone,role,is_active,email_verified) VALUES ($1,'Priya Sharma','priya@example.com',$2,'9876500001','buyer',true,true) ON CONFLICT(email) DO NOTHING`, [demoBuyerId, password]);
    const demoSellerId = uuidv4();
    await client.query(`INSERT INTO users (id,name,email,password_hash,phone,role,is_active,email_verified) VALUES ($1,'Ramesh Vishwakarma','ramesh@example.com',$2,'9876543210','seller',true,true) ON CONFLICT(email) DO NOTHING`, [demoSellerId, password]);
    await client.query(`INSERT INTO seller_profiles (user_id,business_name,description,district,state,city,verification,rating,total_sales,craft_speciality) VALUES ($1,'Vishwakarma Silk House','Fourth-generation Banarasi silk weaver. Creating exquisite sarees for over 120 years.','Varanasi','Uttar Pradesh','Varanasi','verified',4.7,320,'Banarasi Silk Saree') ON CONFLICT DO NOTHING`, [demoSellerId]);
    buyerIds.push(demoBuyerId);
    sellerIds.push(demoSellerId);

    console.log(`    ✅ 30 buyers + demo accounts`);

    // ── 4. Generate products from ODOP dataset ─────────────
    console.log('  🏺 Products...');
    let productCount = 0;
    const productIds = [];

    for (const od of odopData) {
      const numVariants = rand(3, 5);
      const sellerId = pick(sellerIds);
      const basePrice = basePrices[od.category] || 2000;

      for (let v = 0; v < numVariants; v++) {
        const variant = variants[v % variants.length];
        const name = `${variant.prefix} ${od.product_name} ${variant.suffix}`;
        const price = Math.round(basePrice * variant.priceMult * (0.8 + Math.random() * 0.4) / 10) * 10;
        const compare = Math.round(price * (1.2 + Math.random() * 0.3) / 10) * 10;
        const productId = uuidv4();
        const isFeatured = v === 0 && Math.random() > 0.6;

        await client.query(`
          INSERT INTO products (id,seller_id,name,slug,description,short_description,category,price,compare_price,stock,state,district,
            odop_product_name,odop_verified,gi_tagged,is_handmade,materials,making_time,bulk_available,min_bulk_qty,bulk_price,
            is_featured,artisan_story,is_active,images,thumbnail,avg_rating,review_count,view_count,order_count,tags)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,$14,true,$15,$16,$17,$18,$19,$20,$21,true,'[]',null,$22,$23,$24,$25,$26)
          ON CONFLICT (slug) DO NOTHING
        `, [
          productId, sellerId, name, slug(name),
          `${od.description}. This ${variant.prefix.toLowerCase()} edition showcases the finest craftsmanship from ${od.district}, ${od.state}. Each piece is handmade by skilled artisans preserving centuries-old traditions.`,
          `${variant.prefix} ${od.product_name} from ${od.district}`,
          od.category, price, compare, rand(5, 50), od.state, od.district,
          od.product_name, od.gi_tag, 'Natural materials, Traditional techniques',
          `${rand(2, 30)} days`, Math.random() > 0.5, rand(5, 25), Math.round(price * 0.8),
          isFeatured, `Artisan from ${od.district} preserving ${od.product_name} tradition for generations.`,
          (3.5 + Math.random() * 1.5).toFixed(1), rand(5, 50), rand(50, 2000), rand(5, 200),
          JSON.stringify([od.category, od.state, od.district, od.product_name, od.gi_tag ? 'GI Tagged' : ''].filter(Boolean))
        ]);

        productIds.push(productId);
        productCount++;
      }
    }
    console.log(`    ✅ ${productCount} products`);

    // ── 5. Generate orders ─────────────────────────────────
    console.log('  📦 Orders...');
    let orderCount = 0;
    for (let i = 0; i < 80; i++) {
      const buyerId = pick(buyerIds);
      const productId = pick(productIds);
      const sellerId = pick(sellerIds);
      const qty = rand(1, 3);
      const price = rand(500, 15000);
      const total = price * qty;
      const statuses = ['pending','confirmed','processing','shipped','delivered','delivered','delivered'];
      const status = pick(statuses);
      const orderNum = `ODOP-${Date.now().toString(36).toUpperCase()}-${rand(1000,9999)}`;
      const loc = pick(cities);

      const orderId = uuidv4();
      await client.query(`
        INSERT INTO orders (id,order_number,buyer_id,status,subtotal,shipping_fee,tax,total,shipping_address,created_at)
        VALUES ($1,$2,$3,$4,$5,0,0,$5,$6,NOW() - interval '${rand(1,60)} days')
        ON CONFLICT DO NOTHING
      `, [orderId, orderNum, buyerId, status, total,
          JSON.stringify({name:pick(firstNames)+' '+pick(lastNames),phone:phone(),address:`${rand(1,999)}, ${pick(streets)}`,city:loc.city,state:loc.state,pincode:loc.pin})]);

      await client.query(`
        INSERT INTO order_items (order_id,product_id,seller_id,product_name,quantity,price,total)
        VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING
      `, [orderId, productId, sellerId, 'Product', qty, price, total]);

      orderCount++;
    }
    console.log(`    ✅ ${orderCount} orders`);

    // ── 6. Generate reviews ────────────────────────────────
    console.log('  ⭐ Reviews...');
    let reviewCount = 0;
    const usedPairs = new Set();
    for (let i = 0; i < 200; i++) {
      const pid = pick(productIds);
      const uid = pick(buyerIds);
      const key = `${pid}-${uid}`;
      if (usedPairs.has(key)) continue;
      usedPairs.add(key);

      await client.query(`
        INSERT INTO reviews (product_id,user_id,rating,title,comment,is_verified_purchase,created_at)
        VALUES ($1,$2,$3,$4,$5,true,NOW() - interval '${rand(1,90)} days')
        ON CONFLICT DO NOTHING
      `, [pid, uid, rand(3, 5), pick(['Amazing!','Beautiful craft','Love it','Great quality','Worth it','Excellent','Stunning piece']),
          pick(reviewTexts)]);
      reviewCount++;
    }
    console.log(`    ✅ ${reviewCount} reviews`);

    // ── 7. Cultural articles ──────────────────────────────
    console.log('  📝 Cultural articles...');
    const articles = [
      { title: 'The Living Art of Banarasi Silk Weaving', sl: 'banarasi-silk-weaving-art', excerpt: 'For over 600 years, Varanasi has been the epicenter of silk weaving in India.', content: 'Banarasi silk sarees are more than garments — they are a tradition woven into the cultural fabric of India. The art dates back to the Mughal era when artisans from Persia settled in Varanasi and blended their techniques with local traditions. The process begins with pure mulberry silk threads, dyed in vibrant colors. The real magic happens on the handloom, where weavers interlace silk with gold and silver zari. A single saree can take 15 days to 6 months to complete.', state: 'Uttar Pradesh', district: 'Varanasi', category: 'Textiles', cover: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=450&fit=crop' },
      { title: 'Madhubani: When Walls Became Canvas', sl: 'madhubani-walls-became-canvas', excerpt: 'The story of how ancient wall-painting became a globally celebrated art form.', content: 'Madhubani painting originated in the Mithila region of Bihar. For centuries, women painted walls and floors during festivals. The art gained recognition in 1934 when a British officer discovered paintings on earthquake-damaged walls. It uses natural dyes from turmeric, indigo, and flowers. The five styles are Bharni, Kachni, Tantrik, Godna, and Kohbar.', state: 'Bihar', district: 'Madhubani', category: 'Art', cover: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800&h=450&fit=crop' },
      { title: 'The Last Masters of Rogan Art', sl: 'last-masters-rogan-art', excerpt: 'An endangered art form where paint never touches cloth.', content: 'In Nirona village in Kutch, one family holds the secret to Rogan art. Heated castor oil is mixed with natural pigments and applied with a metal stylus without the tool touching the cloth. The craft gained fame when PM Modi gifted a Rogan art piece to President Obama. UNESCO has recognized it as intangible cultural heritage.', state: 'Gujarat', district: 'Kutch', category: 'Art', cover: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=450&fit=crop' },
      { title: 'Blue Pottery: Where Persia Meets Rajasthan', sl: 'blue-pottery-persia-rajasthan', excerpt: 'How a Persian craft found its home in the Pink City.', content: 'Jaipur Blue Pottery contains no clay. Instead, the base is quartz stone powder, glass, gum, and borax. The craft was introduced via the Silk Route and revived in the 1950s by Kripal Singh Shekhawat. The signature turquoise comes from copper oxide. It received its GI tag in 2008.', state: 'Rajasthan', district: 'Jaipur', category: 'Pottery', cover: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=450&fit=crop' },
      { title: "Kerala's Coir Legacy: Coconut to Craft", sl: 'kerala-coir-legacy', excerpt: 'How the coconut husk became the foundation of a thriving craft industry.', content: 'Kerala transformed the coconut husk into a craft industry. Coir production centers around Alappuzha. The process begins with retting husks in backwater lagoons for 6-10 months. The industry employs over 400,000 workers, mostly women. India produces 80% of global coir products.', state: 'Kerala', district: 'Alappuzha', category: 'Handicrafts', cover: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=450&fit=crop' },
      { title: 'Dhokra: 4000 Years of Lost-Wax Casting', sl: 'dhokra-lost-wax-casting', excerpt: 'One of the earliest known methods of non-ferrous metal casting.', content: 'Dhokra casting is among the oldest metalwork traditions in the world. Tribal artisans in Bastar, Chhattisgarh create figures by coating wax models in clay, then melting out the wax and pouring in molten brass. Every piece is unique because the clay mold is destroyed to reveal the casting. The Dancing Girl of Mohenjo-daro was made using a similar technique.', state: 'Chhattisgarh', district: 'Bastar', category: 'Metal Crafts', cover: 'https://images.unsplash.com/photo-1551732998-9573f695fdbb?w=800&h=450&fit=crop' },
      { title: 'The Sacred Art of Tanjore Painting', sl: 'tanjore-painting-sacred-art', excerpt: 'Gold-leaf paintings that blend art, devotion, and heritage.', content: 'Tanjore paintings originated in the Maratha court of Thanjavur in the 16th century. Characterized by rich gold leaf, semi-precious stones, and vivid colors, they typically depict Hindu deities. The base is made of cloth pasted on wood, coated with limestone and cloth. Gold foil is then applied, and gemstones are set into the composition.', state: 'Tamil Nadu', district: 'Thanjavur', category: 'Art', cover: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=450&fit=crop' },
      { title: 'Pashmina: The Diamond Fiber of Kashmir', sl: 'pashmina-diamond-fiber-kashmir', excerpt: 'From Ladakh highlands to the looms of Srinagar.', content: 'Pashmina comes from Changthangi goats living above 14000 feet in Ladakh. Each goat produces only about 80-170 grams of fiber per year. The fiber is hand-spun and hand-woven by artisans in Srinagar. A single Pashmina shawl can take months to weave. The craft has supported Kashmiri families for centuries.', state: 'Jammu & Kashmir', district: 'Srinagar', category: 'Textiles', cover: 'https://images.unsplash.com/photo-1601244005535-a48d52d3a309?w=800&h=450&fit=crop' },
    ];
    for (const a of articles) {
      await client.query(`INSERT INTO cultural_articles (title,slug,content,excerpt,cover_image,state,district,category,author_id,tags,is_published,view_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11) ON CONFLICT(slug) DO NOTHING`,
        [a.title, a.sl, a.content, a.excerpt, a.cover, a.state, a.district, a.category, adminId,
        JSON.stringify([a.category, a.state, 'ODOP', 'Heritage']), rand(200, 2000)]);
    }
    console.log(`    ✅ ${articles.length} articles`);

    // ── 8. Notifications ──────────────────────────────────
    for (const bid of buyerIds.slice(0, 10)) {
      await client.query(`INSERT INTO notifications (user_id,title,message,type,is_read) VALUES ($1,'Welcome to ODOP Marketplace!','Discover authentic Indian handicrafts from 700+ districts.','info',false)`, [bid]);
    }
    console.log('    ✅ Notifications');

    await client.query('COMMIT');
    console.log('\n🎉 Seeding complete!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { seed };
