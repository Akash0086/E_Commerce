import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../models/mongo/product.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.resolve(__dirname, "../../frontend/public/images/products");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function downloadImage(url, filename) {
  const filePath = path.join(imagesDir, filename);
  if (fs.existsSync(filePath)) {
    return `products/${filename}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved image: ${filename}`);
    return `products/${filename}`;
  } catch (err) {
    console.warn(`Could not download ${filename} (${err.message}). Using web URL fallback.`);
    return url;
  }
}

const productsToSeed = [
  // ===================== MOBILE (14 new + 1 existing = 15) =====================
  {
    name: "Apple iPhone 16 Pro Max",
    description: "Forged in titanium with the cutting-edge A18 Pro chip, Camera Control, 48MP Fusion camera, and unmatched battery life.",
    category: "Mobile",
    brand: "Apple",
    price: 144900,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    imageFile: "iphone-16-pro-max.jpg",
  },
  {
    name: "Apple iPhone 15",
    description: "Dynamic Island, 48MP main camera, USB-C, and all-day battery life encased in durable color-infused back glass.",
    category: "Mobile",
    brand: "Apple",
    price: 69900,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
    imageFile: "iphone-15.jpg",
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Galaxy AI flagship featuring Snapdragon 8 Gen 3, built-in S Pen, 200MP camera system, and flat titanium frame.",
    category: "Mobile",
    brand: "Samsung",
    price: 129999,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
    imageFile: "galaxy-s24-ultra.jpg",
  },
  {
    name: "Samsung Galaxy Z Flip 6",
    description: "Pocket-sized foldable smartphone with 3.4-inch Flex Window, 50MP pro-grade camera, and enhanced vapor chamber cooling.",
    category: "Mobile",
    brand: "Samsung",
    price: 109999,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=800&q=80",
    imageFile: "galaxy-z-flip6.jpg",
  },
  {
    name: "Google Pixel 9 Pro",
    description: "Super Actua display, Google Tensor G4 processor, revolutionary Gemini AI, and triple studio-grade camera system.",
    category: "Mobile",
    brand: "Google",
    price: 106999,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80",
    imageFile: "pixel-9-pro.jpg",
  },
  {
    name: "Google Pixel 8a",
    description: "Tensor G3 power, stunning 120Hz Actua display, AI photography with Magic Editor & Best Take, in vibrant colors.",
    category: "Mobile",
    brand: "Google",
    price: 52999,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    imageFile: "pixel-8a.jpg",
  },
  {
    name: "OnePlus 12",
    description: "Snapdragon 8 Gen 3 with 4th Gen Hasselblad Camera System, 5400mAh battery, and 100W SUPERVOOC hyper-fast charging.",
    category: "Mobile",
    brand: "OnePlus",
    price: 64999,
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
    imageFile: "oneplus-12.jpg",
  },
  {
    name: "OnePlus Nord CE 4",
    description: "Snapdragon 7 Gen 3, 100W fast charging, 120Hz AMOLED display, and 50MP Sony LYT-600 camera with OIS.",
    category: "Mobile",
    brand: "OnePlus",
    price: 24999,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80",
    imageFile: "oneplus-nord-ce4.jpg",
  },
  {
    name: "Xiaomi 14 Ultra",
    description: "Leica quad camera system with 1-inch stepless variable aperture sensor, Snapdragon 8 Gen 3, and Shield Glass protection.",
    category: "Mobile",
    brand: "Xiaomi",
    price: 99999,
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    imageFile: "xiaomi-14-ultra.jpg",
  },
  {
    name: "Redmi Note 13 Pro+ 5G",
    description: "Curved 1.5K AMOLED display, 200MP OIS camera, 120W HyperCharge, IP68 water resistance, and MediaTek Dimensity 7200 Ultra.",
    category: "Mobile",
    brand: "Xiaomi",
    price: 31999,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=800&q=80",
    imageFile: "redmi-note-13-pro-plus.jpg",
  },
  {
    name: "Nothing Phone (2)",
    description: "Iconic transparent back with Glyph Interface lighting, Snapdragon 8+ Gen 1, dual 50MP cameras, and pure Nothing OS 2.5.",
    category: "Mobile",
    brand: "Nothing",
    price: 37999,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80",
    imageFile: "nothing-phone-2.jpg",
  },
  {
    name: "Motorola Edge 50 Ultra",
    description: "Real wood & vegan leather finishes, Snapdragon 8s Gen 3, 50MP periscope telephoto, 144Hz pOLED display, and 125W TurboPower.",
    category: "Mobile",
    brand: "Motorola",
    price: 59999,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80",
    imageFile: "motorola-edge-50-ultra.jpg",
  },
  {
    name: "Realme GT 6",
    description: "6000-nit ultra-bright display, Snapdragon 8s Gen 3 chipset, 50MP Sony LYT-808 OIS camera, and 120W SUPERVOOC charging.",
    category: "Mobile",
    brand: "Realme",
    price: 40999,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
    imageFile: "realme-gt-6.jpg",
  },
  {
    name: "Vivo X100 Pro",
    description: "ZEISS APO Floating Telephoto camera with 1-inch Sony sensor, Dimensity 9300, and customized V3 imaging chip.",
    category: "Mobile",
    brand: "Vivo",
    price: 89999,
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?auto=format&fit=crop&w=800&q=80",
    imageFile: "vivo-x100-pro.jpg",
  },

  // ===================== LAPTOPS (14 new + 1 existing = 15) =====================
  {
    name: "Apple MacBook Pro 16\" (M3 Max)",
    description: "16-core CPU, 40-core GPU, Liquid Retina XDR display with ProMotion, 48GB unified memory, and up to 22 hours of battery life.",
    category: "Laptops",
    brand: "Apple",
    price: 349900,
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    imageFile: "macbook-pro-16.jpg",
  },
  {
    name: "Apple MacBook Air 15\" (M3)",
    description: "Strikingly thin 15.3-inch Liquid Retina display, M3 processor, fanless silent operation, 1080p FaceTime HD camera, and MagSafe 3.",
    category: "Laptops",
    brand: "Apple",
    price: 134900,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    imageFile: "macbook-air-15.jpg",
  },
  {
    name: "Dell XPS 16 (2024)",
    description: "Intel Core Ultra 9 processor, 16.3-inch 4K OLED InfinityEdge touch display, NVIDIA GeForce RTX 4070, and CNC aluminum unibody.",
    category: "Laptops",
    brand: "Dell",
    price: 249990,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
    imageFile: "dell-xps-16.jpg",
  },
  {
    name: "Dell Inspiron 14 Plus",
    description: "Intel Core Ultra 7 processor with AI Boost, 2.8K anti-glare display, 16GB LPDDR5X RAM, and 1TB NVMe SSD in a compact body.",
    category: "Laptops",
    brand: "Dell",
    price: 89990,
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    imageFile: "dell-inspiron-14-plus.jpg",
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 12",
    description: "Legendary business ultrabook weighing just 1.09 kg, Intel Core Ultra 7, carbon fiber top cover, and OLED display option.",
    category: "Laptops",
    brand: "Lenovo",
    price: 198990,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
    imageFile: "thinkpad-x1-carbon.jpg",
  },
  {
    name: "Lenovo Legion Pro 7i",
    description: "Intel Core i9-14900HX, RTX 4080 12GB graphics, 16-inch WQXGA 240Hz PureSight display, and Legion ColdFront 5.0 vapor cooling.",
    category: "Laptops",
    brand: "Lenovo",
    price: 219990,
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
    imageFile: "lenovo-legion-pro-7i.jpg",
  },
  {
    name: "ASUS ROG Zephyrus G16",
    description: "Ultra-slim 1.49cm aluminum chassis with Slash Lighting, Intel Core Ultra 9, RTX 4070, and 2.5K 240Hz ROG Nebula OLED display.",
    category: "Laptops",
    brand: "ASUS",
    price: 189990,
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
    imageFile: "asus-rog-zephyrus-g16.jpg",
  },
  {
    name: "ASUS Zenbook 14 OLED",
    description: "Ultra-portable luxury laptop featuring a vibrant 3K 120Hz Lumina OLED display, Intel Core Ultra 7, and 75Wh all-day battery.",
    category: "Laptops",
    brand: "ASUS",
    price: 99990,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    imageFile: "asus-zenbook-14-oled.jpg",
  },
  {
    name: "HP Spectre x360 14",
    description: "Premium 2-in-1 convertible with 2.8K OLED touchscreen, Intel Core Ultra 7, 9MP AI camera with night mode, and HP rechargeable tilt pen.",
    category: "Laptops",
    brand: "HP",
    price: 154990,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
    imageFile: "hp-spectre-x360.jpg",
  },
  {
    name: "HP Pavilion Plus 14",
    description: "Sleek all-metal chassis with AMD Ryzen 7 7840U processor, Radeon 780M graphics, 120Hz 2.8K OLED screen, and Bang & Olufsen sound.",
    category: "Laptops",
    brand: "HP",
    price: 79990,
    stock: 32,
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    imageFile: "hp-pavilion-plus-14.jpg",
  },
  {
    name: "Acer Predator Helios 16",
    description: "Intel Core i7 14th Gen, RTX 4070 8GB, 16-inch WQXGA 240Hz IPS display, per-key RGB backlighting, and dual 5th Gen AeroBlade 3D fans.",
    category: "Laptops",
    brand: "Acer",
    price: 149990,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1595327656903-2f54e37ce09b?auto=format&fit=crop&w=800&q=80",
    imageFile: "acer-predator-helios-16.jpg",
  },
  {
    name: "Acer Swift Go 14 AI",
    description: "Intel Core Ultra 5 with AI NPU accelerator, 14-inch 2.8K 90Hz OLED display, dual fan cooling, and lightweight 1.3kg aluminum design.",
    category: "Laptops",
    brand: "Acer",
    price: 69990,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=800&q=80",
    imageFile: "acer-swift-go-14.jpg",
  },
  {
    name: "Microsoft Surface Laptop 7",
    description: "Copilot+ PC powered by Snapdragon X Elite, stunning PixelSense Flow touchscreen, Studio Mics, and up to 20 hours battery life.",
    category: "Laptops",
    brand: "Microsoft",
    price: 116990,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
    imageFile: "surface-laptop-7.jpg",
  },
  {
    name: "Razer Blade 15",
    description: "Ultra-compact gaming laptop with CNC aluminum body, Intel Core i7 13th Gen, RTX 4070, QHD 240Hz display, and THX Spatial Audio.",
    category: "Laptops",
    brand: "Razer",
    price: 239990,
    stock: 11,
    imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80",
    imageFile: "razer-blade-15.jpg",
  },

  // ===================== WEARABLES (14 new + 1 existing = 15) =====================
  {
    name: "Apple Watch Ultra 2",
    description: "Rugged 49mm aerospace titanium case, precision dual-frequency GPS, customizable Action button, 100m water resistance, and 3000 nits display.",
    category: "Wearables",
    brand: "Apple",
    price: 89900,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    imageFile: "apple-watch-ultra-2.jpg",
  },
  {
    name: "Apple Watch Series 10",
    description: "Thinnest Apple Watch ever with larger wide-angle OLED display, sleep apnea notifications, depth gauge, and 50m water resistance.",
    category: "Wearables",
    brand: "Apple",
    price: 46900,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80",
    imageFile: "apple-watch-series-10.jpg",
  },
  {
    name: "Samsung Galaxy Watch Ultra",
    description: "Titanium cushion-design case, dual-frequency GPS, 100m water resistance, multi-sport tracking, and 100-hour battery in Power Saving mode.",
    category: "Wearables",
    brand: "Samsung",
    price: 59999,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    imageFile: "galaxy-watch-ultra.jpg",
  },
  {
    name: "Samsung Galaxy Watch 7",
    description: "Powered by 3nm processor, advanced BioActive sensor, dual-frequency GPS, sleep tracking with Sleep Apnea feature, and Energy Score.",
    category: "Wearables",
    brand: "Samsung",
    price: 29999,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80",
    imageFile: "galaxy-watch-7.jpg",
  },
  {
    name: "Garmin Fenix 7 Pro Sapphire Solar",
    description: "Premium multisport GPS watch with solar charging Power Sapphire lens, built-in LED flashlight, endurance score, and preloaded TopoActive maps.",
    category: "Wearables",
    brand: "Garmin",
    price: 93990,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    imageFile: "garmin-fenix-7-pro.jpg",
  },
  {
    name: "Garmin Forerunner 265",
    description: "Brilliant AMOLED touchscreen display, training readiness score, morning report, wrist-based running dynamics, and up to 13 days of battery life.",
    category: "Wearables",
    brand: "Garmin",
    price: 49990,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80",
    imageFile: "garmin-forerunner-265.jpg",
  },
  {
    name: "Google Pixel Watch 3 (45mm)",
    description: "Larger Actua display with 2000 nits, comprehensive Fitbit health and fitness tracking, cardio load tracking, and deep Google ecosystem sync.",
    category: "Wearables",
    brand: "Google",
    price: 39990,
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    imageFile: "pixel-watch-3.jpg",
  },
  {
    name: "Fitbit Charge 6",
    description: "Premium fitness tracker with built-in GPS, 40+ exercise modes, YouTube Music controls, Google Maps integration, and 7-day battery life.",
    category: "Wearables",
    brand: "Fitbit",
    price: 14990,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80",
    imageFile: "fitbit-charge-6.jpg",
  },
  {
    name: "OnePlus Watch 2",
    description: "Dual-Engine Architecture with Wear OS 4, up to 100 hours of battery in Smart Mode, 1.43-inch AMOLED screen, and stainless steel chassis.",
    category: "Wearables",
    brand: "OnePlus",
    price: 24999,
    stock: 28,
    imageUrl: "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=800&q=80",
    imageFile: "oneplus-watch-2.jpg",
  },
  {
    name: "Amazfit Balance",
    description: "Classic round design with 1.5-inch HD AMOLED display, body composition measurement, Zepp Pay contactless payments, and 14-day battery life.",
    category: "Wearables",
    brand: "Amazfit",
    price: 19999,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    imageFile: "amazfit-balance.jpg",
  },
  {
    name: "Amazfit T-Rex Ultra",
    description: "Stainless steel bezel and bridge, 30m freediving certification, ultra-bright 1000-nit AMOLED display, offline maps, and military toughness.",
    category: "Wearables",
    brand: "Amazfit",
    price: 39999,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
    imageFile: "amazfit-trex-ultra.jpg",
  },
  {
    name: "Noise ColorFit Pro 5 Max",
    description: "1.96-inch AMOLED display with always-on display, post-training VO2 max analysis, Bluetooth calling with Tru Sync, and 100+ sports modes.",
    category: "Wearables",
    brand: "Noise",
    price: 4499,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=800&q=80",
    imageFile: "noise-colorfit-pro-5.jpg",
  },
  {
    name: "Fire-Boltt Invincible Plus",
    description: "1.43-inch AMOLED display, 4GB internal storage for local music playback, direct TWS earbud connectivity, and 300 sports modes.",
    category: "Wearables",
    brand: "Fire-Boltt",
    price: 3999,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
    imageFile: "fireboltt-invincible-plus.jpg",
  },
  {
    name: "boAt Ultima Call Max",
    description: "Large 2.0-inch HD display, advanced Bluetooth calling, 10-day battery life, live score updates, IP68 water resistance, and 100+ watch faces.",
    category: "Wearables",
    brand: "boAt",
    price: 2499,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80",
    imageFile: "boat-ultima-call-max.jpg",
  },

  // ===================== ELECTRONICS (13 new + 2 existing = 15) =====================
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise cancellation with dual processors, 8 microphones, 30-hour battery life, and crystal-clear hands-free calling.",
    category: "Electronics",
    brand: "Sony",
    price: 29990,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    imageFile: "sony-wh1000xm5.jpg",
  },
  {
    name: "Sony WF-1000XM5 Noise-Cancelling Earbuds",
    description: "Dynamic Driver X for rich vocals, bone conduction sensors for precise voice pickup, LDAC Hi-Res audio, and wireless charging case.",
    category: "Electronics",
    brand: "Sony",
    price: 21990,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    imageFile: "sony-wf1000xm5.jpg",
  },
  {
    name: "Apple AirPods Pro (2nd Generation)",
    description: "Apple H2 headphone chip, up to 2x more Active Noise Cancellation, Adaptive Audio, Conversation Awareness, and MagSafe Case (USB-C).",
    category: "Electronics",
    brand: "Apple",
    price: 24900,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    imageFile: "airpods-pro-2.jpg",
  },
  {
    name: "Bose QuietComfort Ultra Headphones",
    description: "Groundbreaking spatialized Bose Immersive Audio, custom acoustic architecture, CustomTune sound calibration, and ultra-luxe comfort cushions.",
    category: "Electronics",
    brand: "Bose",
    price: 35900,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    imageFile: "bose-qc-ultra.jpg",
  },
  {
    name: "Marshall Stanmore III Bluetooth Speaker",
    description: "Iconic vintage speaker with wider stereo soundstage, Dynamic Loudness, RCA and 3.5mm inputs, and sustainable PVC-free build.",
    category: "Electronics",
    brand: "Marshall",
    price: 37999,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80",
    imageFile: "marshall-stanmore-3.jpg",
  },
  {
    name: "JBL Charge 5 Portable Speaker",
    description: "Optimized long-excursion driver, separate tweeter, dual JBL bass radiators, 20 hours of playtime, IP67 waterproof, and powerbank function.",
    category: "Electronics",
    brand: "JBL",
    price: 14999,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
    imageFile: "jbl-charge-5.jpg",
  },
  {
    name: "Apple iPad Pro 13\" (M4)",
    description: "Revolutionary Ultra Retina XDR tandem OLED display, Apple M4 chip, Apple Pencil Pro support, and thin 5.1mm aerospace design.",
    category: "Electronics",
    brand: "Apple",
    price: 129900,
    stock: 16,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    imageFile: "ipad-pro-13.jpg",
  },
  {
    name: "Samsung Galaxy Tab S9 Ultra",
    description: "Immense 14.6-inch Dynamic AMOLED 2X display, bundled S Pen, Snapdragon 8 Gen 2 for Galaxy, IP68 water resistance, and Samsung DeX.",
    category: "Electronics",
    brand: "Samsung",
    price: 108999,
    stock: 14,
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
    imageFile: "galaxy-tab-s9-ultra.jpg",
  },
  {
    name: "Logitech MX Master 3S Wireless Mouse",
    description: "Quiet Click switches, 8K DPI any-surface glass tracking, MagSpeed electromagnetic scroll wheel, and ergonomic thumb rest.",
    category: "Electronics",
    brand: "Logitech",
    price: 8995,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    imageFile: "logitech-mx-master-3s.jpg",
  },
  {
    name: "Logitech MX Mechanical Wireless Keyboard",
    description: "Low-profile tactile quiet mechanical switches, smart ambient backlighting, multi-device Easy-Switch pairing, and USB-C fast charging.",
    category: "Electronics",
    brand: "Logitech",
    price: 15995,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    imageFile: "logitech-mx-mechanical.jpg",
  },
  {
    name: "Sony PlayStation 5 Slim Console",
    description: "Sleeker design with 1TB SSD, 4K 120Hz gaming, ray tracing support, Tempest 3D AudioTech, and immersive DualSense haptic feedback.",
    category: "Electronics",
    brand: "Sony",
    price: 44990,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    imageFile: "ps5-slim.jpg",
  },
  {
    name: "Xbox Series X Console",
    description: "12 teraflops of GPU power, True 4K gaming, 1TB custom NVMe SSD, Quick Resume, Xbox Velocity Architecture, and 3D Spatial Audio.",
    category: "Electronics",
    brand: "Microsoft",
    price: 49990,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80",
    imageFile: "xbox-series-x.jpg",
  },
  {
    name: "Samsung 49\" Odyssey OLED G9 Gaming Monitor",
    description: "49-inch curved Dual QHD (5120x1440) OLED display, 240Hz refresh rate, 0.03ms response time, Neo Quantum Processor Pro, and CoreSync.",
    category: "Electronics",
    brand: "Samsung",
    price: 124990,
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    imageFile: "samsung-odyssey-g9.jpg",
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // 1. Ensure existing products are active and have complete fields
    await Product.updateMany(
      {},
      { $set: { isActive: true } }
    );
    console.log("Updated all existing products to isActive: true");

    // Fix category/brand for existing products if missing
    await Product.updateOne({ name: "iPhone 16" }, { $set: { category: "Mobile", brand: "Apple", isActive: true } });
    await Product.updateOne({ name: "Samsung Galaxy Watch 6" }, { $set: { category: "Wearables", brand: "Samsung", isActive: true } });
    await Product.updateOne({ name: "MacBook Air M3" }, { $set: { category: "Laptops", brand: "Apple", isActive: true } });
    await Product.updateOne({ name: "Wireless Gaming Mouse" }, { $set: { category: "Electronics", brand: "Redragon", isActive: true } });
    await Product.updateOne({ name: "Mechanical Keyboard" }, { $set: { category: "Electronics", brand: "Redragon", isActive: true } });

    console.log(`Starting to process and seed ${productsToSeed.length} new products...`);

    let addedCount = 0;
    let updatedCount = 0;

    for (const item of productsToSeed) {
      console.log(`Processing: [${item.category}] ${item.name}...`);
      const localOrWebPath = await downloadImage(item.imageUrl, item.imageFile);

      const existing = await Product.findOne({ name: item.name });

      if (existing) {
        existing.description = item.description;
        existing.price = item.price;
        existing.stock = item.stock;
        existing.category = item.category;
        existing.brand = item.brand;
        existing.isActive = true;
        if (!existing.images || existing.images.length === 0 || !existing.images[0].includes("products/")) {
          existing.images = [localOrWebPath];
        }
        await existing.save();
        updatedCount++;
      } else {
        await Product.create({
          name: item.name,
          description: item.description,
          price: item.price,
          stock: item.stock,
          category: item.category,
          brand: item.brand,
          isActive: true,
          images: [localOrWebPath],
        });
        addedCount++;
      }
    }

    console.log(`Seeding finished! Added: ${addedCount}, Updated: ${updatedCount}`);

    // Print final category statistics
    const allProducts = await Product.find({ isActive: true });
    console.log(`\n=== Total Active Products in Store: ${allProducts.length} ===`);
    const categoryCounts = {};
    allProducts.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    for (const [cat, count] of Object.entries(categoryCounts)) {
      console.log(`  - Category "${cat}": ${count} products`);
    }

  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

seed();
