"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"
import { SyncBadge, type SyncStatus } from "@/components/tff/SyncBadge"
import { hasSupabaseConfig } from "@/lib/supabase/status"
import {
  fetchShoppingData,
  upsertShoppingStatus,
  createCloudShoppingItem,
  archiveCloudShoppingItem,
} from "@/lib/supabase/shopping-sync"

type Mode = "basket" | "queue" | "phase2"
type RetainerPriority = "Core" | "Useful" | "Optional"
type RetainerFrequency = "Weekly" | "Monthly" | "As needed"
type UpgradePriority = "Core Upgrade" | "Useful Upgrade" | "Luxury" | "Later"
type CostTier = "€" | "€€" | "€€€"

interface RetainerItem {
  id: string
  name: string
  category: string
  priority: RetainerPriority
  frequency: RetainerFrequency
  purpose: string
  note: string
}

interface UpgradeItem {
  id: string
  name: string
  category: string
  priority: UpgradePriority
  cost: CostTier
  purpose: string
  why: string
  buyingNote: string
}

const RETAINER_ITEMS: RetainerItem[] = [
  { id: "eggs", name: "Eggs", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Complete amino acid profile, choline, fat-soluble vitamins.", note: "Buy 12–18/week. Pasture-raised preferred for better omega-3 ratio." },
  { id: "ground_beef", name: "Ground Beef / Steak", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Red meat for zinc, iron, creatine, B12, and saturated fat.", note: "~1 kg/week. 80/20 ground works well for batch cooking. Grass-fed where cost allows." },
  { id: "chicken", name: "Chicken (Breast / Thighs)", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Lean, versatile protein. Thighs add fat and cook without drying out.", note: "Batch on Sunday. Works in rice bowls, stir-fry, soups. Freeze half for mid-week." },
  { id: "salmon", name: "Salmon / Oily Fish", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Omega-3 EPA/DHA alongside protein. Reduces reliance on supplements.", note: "2+ servings/week. Frozen fillets are cost-effective and just as nutritious." },
  { id: "greek_yogurt", name: "Greek Yogurt", category: "Protein Sources", priority: "Useful", frequency: "Weekly", purpose: "Protein + probiotics. Slow-digesting casein for satiety.", note: "Full-fat preferred. Use as a sauce base or with fruit for breakfast." },
  { id: "cottage_cheese", name: "Cottage Cheese", category: "Protein Sources", priority: "Useful", frequency: "Weekly", purpose: "Slow-digest casein — useful pre-bed protein option.", note: "Pair with fruit or use in cooked dishes." },
  { id: "canned_fish", name: "Canned Tuna / Sardines", category: "Protein Sources", priority: "Useful", frequency: "As needed", purpose: "Shelf-stable backup protein. Sardines have higher omega-3 than tuna.", note: "Keep 6–8 cans stocked. Water-packed tuna or olive-oil sardines." },
  { id: "whey_protein", name: "Whey Protein", category: "Protein Sources", priority: "Optional", frequency: "Monthly", purpose: "Convenience top-up for high-demand days or missed meals.", note: "Not a food replacement. Use when whole-food targets are hard to hit." },
  { id: "white_rice", name: "White Rice", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Clean, easy-to-digest carb. Rapid gastric emptying — good post-training.", note: "Buy 2–5 kg bags. Rice cooker makes batch prep near-zero effort." },
  { id: "potatoes", name: "Potatoes / Sweet Potatoes", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Dense carb + potassium + vitamin C. One of the most satiating foods.", note: "Batch-bake on Sunday. White potato ranks highest on satiety index." },
  { id: "oats", name: "Oats (Rolled / Steel Cut)", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Slow-release carb, beta-glucan fibre, iron.", note: "Overnight oats save morning time. Bulk bags cut cost significantly." },
  { id: "fruit", name: "Fruit (Varied)", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Micronutrients, natural fructose, fibre, polyphenols.", note: "Bananas pre-workout. Berries for antioxidants. Rotate seasonally." },
  { id: "bread", name: "Sourdough / Quality Bread", category: "Carb Sources", priority: "Useful", frequency: "Weekly", purpose: "Practical carb vehicle. Sourdough fermentation improves digestion profile.", note: "Freeze half the loaf to prevent waste." },
  { id: "honey", name: "Honey", category: "Carb Sources", priority: "Optional", frequency: "Monthly", purpose: "Quick carb + trace antimicrobial compounds.", note: "Raw or Manuka preferred. Use pre-training or for sweetening." },
  { id: "olive_oil", name: "Extra Virgin Olive Oil", category: "Fats", priority: "Core", frequency: "Monthly", purpose: "Monounsaturated fat + polyphenols. Primary cooking and dressing oil.", note: "Cold-pressed, dark bottle. Avoid for very high-heat cooking." },
  { id: "butter_ghee", name: "Butter / Ghee", category: "Fats", priority: "Useful", frequency: "Monthly", purpose: "High smoke point cooking fat. Fat-soluble vitamins A, D, K.", note: "Grass-fed where possible. Ghee better for high heat." },
  { id: "avocados", name: "Avocados", category: "Fats", priority: "Useful", frequency: "Weekly", purpose: "Monounsaturated fat + fibre + potassium + folate.", note: "Buy 3–4/week. Ripen on counter, refrigerate when ready." },
  { id: "nuts", name: "Mixed Nuts", category: "Fats", priority: "Useful", frequency: "Monthly", purpose: "Portable fat + minerals — zinc, selenium, magnesium.", note: "Unsalted, raw or dry-roasted. 2 Brazil nuts/day covers selenium." },
  { id: "dark_chocolate", name: "Dark Chocolate (85%+)", category: "Fats", priority: "Optional", frequency: "Monthly", purpose: "Flavonoids + iron + fat. Mood and satiety with minimal sugar.", note: "2–3 squares/day. Bulk bars are better value." },
  { id: "leafy_greens", name: "Leafy Greens (Spinach / Arugula)", category: "Vegetables & Micronutrients", priority: "Core", frequency: "Weekly", purpose: "Magnesium, folate, nitrates, vitamin K, iron.", note: "200–300g/week. Wilt into almost anything — eggs, rice, soups." },
  { id: "broccoli", name: "Broccoli / Cruciferous Veg", category: "Vegetables & Micronutrients", priority: "Core", frequency: "Weekly", purpose: "DIM, sulforaphane, fibre, vitamin C, folate.", note: "Fresh or frozen both work. Steam rather than boil." },
  { id: "garlic_onions", name: "Garlic & Onions", category: "Vegetables & Micronutrients", priority: "Core", frequency: "Weekly", purpose: "Allicin, quercetin, prebiotic fibre. Flavour base for most meals.", note: "Always keep stocked. Mince a batch and store in fridge." },
  { id: "tomatoes", name: "Tomatoes (Fresh + Canned)", category: "Vegetables & Micronutrients", priority: "Useful", frequency: "Weekly", purpose: "Lycopene, potassium, vitamin C. Lycopene increases when cooked.", note: "Keep both fresh and canned stocked." },
  { id: "frozen_veg", name: "Frozen Mixed Veg", category: "Vegetables & Micronutrients", priority: "Useful", frequency: "Monthly", purpose: "No-prep micronutrient volume. Convenient fallback when fresh runs low.", note: "Add to rice bowls, stews, scrambles without cutting." },
  { id: "herbs", name: "Fresh Herbs / Ginger / Turmeric", category: "Vegetables & Micronutrients", priority: "Optional", frequency: "Weekly", purpose: "Micronutrients + polyphenols + anti-inflammatory compounds.", note: "Freeze ginger root and grate directly from frozen." },
  { id: "salt", name: "Sea Salt / Himalayan Salt", category: "Hydration & Minerals", priority: "Core", frequency: "Monthly", purpose: "Sodium + trace minerals for electrolyte balance.", note: "Season food to taste. Avoid heavily processed iodised table salt." },
  { id: "electrolyte_mix", name: "Electrolyte Mix", category: "Hydration & Minerals", priority: "Useful", frequency: "Monthly", purpose: "Sodium + potassium + magnesium replenishment on training days.", note: "Low-sugar options preferred. Use on training or hot days." },
  { id: "mineral_water", name: "Mineral Water", category: "Hydration & Minerals", priority: "Useful", frequency: "Weekly", purpose: "Trace minerals beyond filtered or soft tap water.", note: "Optional if tap water is mineral-rich." },
  { id: "lemon_lime", name: "Lemons / Limes", category: "Hydration & Minerals", priority: "Useful", frequency: "Weekly", purpose: "Citric acid, vitamin C, water flavouring without sweeteners.", note: "Squeeze into water, dressings, or meals." },
  { id: "magnesium_glycinate", name: "Magnesium Glycinate", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Sleep quality, muscle relaxation, nervous system support.", note: "400mg elemental/day. Take 30–60 min pre-bed." },
  { id: "glycine", name: "Glycine", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Sleep depth + collagen precursor. Reduces core body temperature pre-sleep.", note: "3–5g pre-bed in water or tea." },
  { id: "creatine", name: "Creatine Monohydrate", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Strength, power output, neurological function, cellular energy.", note: "5g/day year-round. No loading needed. Creapure grade preferred." },
  { id: "omega3", name: "Omega-3 Fish Oil", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "EPA/DHA for inflammation resolution, cardiovascular health, brain.", note: "2–3g combined EPA/DHA daily. Refrigerate after opening." },
  { id: "vit_d3_k2", name: "Vitamin D3 + K2 (MK-7)", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Essential with limited sun exposure. Immune, hormonal, bone.", note: "3000–5000 IU D3 + 100mcg K2 with a fat-containing meal." },
  { id: "zinc", name: "Zinc", category: "Supplements", priority: "Useful", frequency: "Monthly", purpose: "Testosterone synthesis, immune function, sleep quality.", note: "15–30mg before bed. Separate from calcium." },
  { id: "taurine", name: "Taurine", category: "Supplements", priority: "Useful", frequency: "Monthly", purpose: "Intracellular hydration, mitochondrial function, heart rhythm.", note: "1–2g/day with water. Low risk, wide benefit profile." },
  { id: "kestose", name: "Kestose / Prebiotic Fibre", category: "Supplements", priority: "Optional", frequency: "Monthly", purpose: "Gut microbiome support — selectively feeds Bifidobacteria.", note: "2–5g/day. Start low to reduce gas." },
  { id: "meal_prep_containers", name: "Meal Prep Containers (Glass)", category: "Kitchen Basics", priority: "Core", frequency: "As needed", purpose: "Batch cooking and storage without plastic leaching.", note: "Uniform sizes stack better. 1L containers cover most portions." },
  { id: "parchment_paper", name: "Parchment Paper", category: "Kitchen Basics", priority: "Useful", frequency: "Monthly", purpose: "Non-stick baking without added fats.", note: "Unbleached preferred. Buy in 30m rolls." },
  { id: "paper_towels", name: "Paper Towels", category: "Kitchen Basics", priority: "Useful", frequency: "Weekly", purpose: "Kitchen hygiene, surface drying, fat-draining cooked meat.", note: "Stock 4–6 rolls at a time." },
  { id: "freezer_bags", name: "Freezer Bags / Silicone Bags", category: "Kitchen Basics", priority: "Useful", frequency: "Monthly", purpose: "Portioning and freezer storage for batch-cooked proteins.", note: "Reusable silicone bags are the better long-term option." },
]

const UPGRADE_ITEMS: UpgradeItem[] = [
  { id: "blackout_curtains", name: "Blackout Curtains", category: "Sleep Environment", priority: "Core Upgrade", cost: "€€", purpose: "Blocks morning light that triggers early cortisol rise and waking.", why: "Even dim morning light can shift sleep timing forward over time.", buyingNote: "Blackout lining on existing curtains is cheaper than replacing. Check for light gaps at edges." },
  { id: "sleep_mask", name: "Sleep Mask (Contoured)", category: "Sleep Environment", priority: "Core Upgrade", cost: "€", purpose: "Immediate blackout — no installation, travels well.", why: "Retinal light exposure suppresses melatonin even through closed eyelids.", buyingNote: "Contoured silk or memory foam masks avoid pressure on eyes." },
  { id: "earplugs", name: "Earplugs", category: "Sleep Environment", priority: "Core Upgrade", cost: "€", purpose: "Blocks ambient noise that fragments sleep without fully waking you.", why: "Noise causes micro-arousals that reduce deep sleep percentage.", buyingNote: "Experiment with foam and wax types. Mack's wax earplugs suit side sleepers." },
  { id: "white_noise", name: "White Noise / Sound Machine", category: "Sleep Environment", priority: "Useful Upgrade", cost: "€€", purpose: "Consistent masking sound that smooths out variable noise spikes.", why: "Consistent sound masks variable noise that causes arousals.", buyingNote: "Physical device beats a phone app: no screen glow, no notifications." },
  { id: "air_purifier", name: "Air Purifier (HEPA + Carbon)", category: "Air & Light", priority: "Core Upgrade", cost: "€€", purpose: "Removes fine particulates, VOCs, dust, and allergens from bedroom air.", why: "Indoor air is often 2–5× more polluted than outdoor.", buyingNote: "HEPA + activated carbon filter. Size for room volume. Run during sleep on low/medium." },
  { id: "sunrise_alarm", name: "Sunrise Alarm Clock", category: "Air & Light", priority: "Useful Upgrade", cost: "€€", purpose: "Gradual light wake mimics dawn — lower cortisol spike than jarring alarm.", why: "Light-based waking aligns with circadian biology.", buyingNote: "Philips Wake-Up Light is well-validated. Pairs best with blackout curtains." },
  { id: "warm_bulbs", name: "Warm / Red Evening Bulbs", category: "Air & Light", priority: "Useful Upgrade", cost: "€", purpose: "Reduces blue-light exposure 2–3 hours before bed.", why: "Blue light (~470nm) most strongly suppresses melatonin.", buyingNote: "Swap bedroom and living room bulbs. Target <2200K for evening." },
  { id: "co2_monitor", name: "CO2 / Air Quality Monitor", category: "Air & Light", priority: "Useful Upgrade", cost: "€€", purpose: "Tracks CO2 and VOC levels in the bedroom.", why: "CO2 above ~1000ppm may impair sleep quality and next-day cognition.", buyingNote: "Aranet4 is considered reliable. Open window if CO2 rises above 800ppm." },
  { id: "quality_sheets", name: "High-Quality Bedsheets", category: "Bedroom / Bedding", priority: "Core Upgrade", cost: "€€", purpose: "Temperature regulation and skin comfort during sleep.", why: "Synthetic sheets trap heat and may reduce deep sleep time.", buyingNote: "Percale cotton (200–300 thread count) or linen. Wash before first use." },
  { id: "better_pillow", name: "Better Pillow", category: "Bedroom / Bedding", priority: "Core Upgrade", cost: "€€", purpose: "Cervical alignment during sleep reduces neck tension.", why: "Wrong pillow height compresses the cervical spine causing micro-arousals.", buyingNote: "Match loft to sleep position: side sleepers need higher loft." },
  { id: "weighted_blanket", name: "Weighted Blanket", category: "Bedroom / Bedding", priority: "Useful Upgrade", cost: "€€", purpose: "Deep pressure stimulation that may support sleep onset.", why: "Some individuals find deep pressure associated with lower pre-sleep tension.", buyingNote: "7–12% of bodyweight. Try before buying — not for everyone." },
  { id: "mattress_topper", name: "Mattress Topper", category: "Bedroom / Bedding", priority: "Later", cost: "€€€", purpose: "Improves a poor mattress without a full replacement.", why: "Sleep surface quality affects spinal alignment and sleep staging.", buyingNote: "Defer to full mattress replacement when possible. Latex > memory foam." },
  { id: "food_scale", name: "Food Scale (Digital, 0.1g)", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€", purpose: "Accurate portioning for macro tracking and recipe consistency.", why: "Volume measurements are unreliable. Weight removes portion variance.", buyingNote: "Any reliable 0.1g resolution, 5kg max digital scale. Not an area to overspend." },
  { id: "water_bottle", name: "Glass / Stainless Water Bottle", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€", purpose: "Removes plastic BPA/phthalate exposure from daily hydration.", why: "Plastics leach compounds into liquids over time, especially with heat.", buyingNote: "32oz stainless or glass. Wide mouth for easy cleaning." },
  { id: "blender", name: "Blender", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€€", purpose: "Protein shakes, smoothies, sauces, soups — high variety, minimal prep.", why: "Makes high-protein, high-vegetable meals fast enough for training days.", buyingNote: "600–800W mid-range is enough. Nutribullet or Ninja for single-serve." },
  { id: "glass_containers", name: "Glass Meal Prep Containers (Set)", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€", purpose: "Batch cooking and food storage without plastic leaching when reheated.", why: "Plastic containers leach BPA/phthalates when heated. Glass is inert.", buyingNote: "Uniform sizes stack better. Locking lids required for transport." },
  { id: "slow_cooker", name: "Slow Cooker / Instant Pot", category: "Kitchen Tools", priority: "Useful Upgrade", cost: "€€", purpose: "Batch cooking with minimal active time.", why: "Reduces weekly cooking effort — increases long-term dietary adherence.", buyingNote: "Instant Pot combines pressure + slow cooker. 6L covers 2–4 meal portions." },
  { id: "cast_iron", name: "Cast Iron Pan", category: "Kitchen Tools", priority: "Useful Upgrade", cost: "€€", purpose: "Durable high-heat cooking surface. Adds small amounts of dietary iron.", why: "Teflon pans degrade and release PFAS when scratched or overheated.", buyingNote: "Season before first use. Lodge 10\" or 12\" is reliable and cost-effective." },
  { id: "kitchen_timer", name: "Physical Kitchen Timer", category: "Kitchen Tools", priority: "Useful Upgrade", cost: "€", purpose: "Reduces screen time during cooking.", why: "Every phone pickup during meal prep becomes a potential distraction loop.", buyingNote: "Simple dial or digital. Not worth overthinking." },
  { id: "foam_roller", name: "Foam Roller", category: "Recovery Tools", priority: "Core Upgrade", cost: "€", purpose: "Myofascial release + pre-training mobility work.", why: "Reduces perceived muscle soreness when used consistently.", buyingNote: "Medium density, 45cm length is versatile." },
  { id: "massage_ball", name: "Massage Ball / Lacrosse Ball", category: "Recovery Tools", priority: "Core Upgrade", cost: "€", purpose: "Targeted trigger point work on glutes, feet, upper back.", why: "A foam roller cannot reach specific spots. Ball allows precise pressure.", buyingNote: "Lacrosse ball is best value. Get two — one for feet, one for soft tissue." },
  { id: "resistance_bands", name: "Resistance Bands Set", category: "Recovery Tools", priority: "Useful Upgrade", cost: "€", purpose: "Mobility warm-ups, activation work, travel-friendly training.", why: "Banded activation reduces injury risk in lower body training.", buyingNote: "Loop bands for glutes + long bands for shoulder mobility." },
  { id: "cold_hot_pack", name: "Cold / Hot Pack (Dual Use)", category: "Recovery Tools", priority: "Useful Upgrade", cost: "€", purpose: "Acute inflammation management and heat therapy for chronic tightness.", why: "Cold reduces acute swelling; heat improves blood flow for chronic tension.", buyingNote: "A gel pack that works frozen and microwaved. Keep one in the freezer." },
  { id: "pullup_bar", name: "Doorframe Pull-Up Bar", category: "Recovery Tools", priority: "Useful Upgrade", cost: "€", purpose: "Decompression hangs + bodyweight pulling volume without a gym.", why: "Passive hanging decompresses spine and improves shoulder mobility.", buyingNote: "No-screw doorframe versions work in most standard frames." },
  { id: "training_shoes", name: "Flat-Sole Training Shoes", category: "Training Gear", priority: "Core Upgrade", cost: "€€", purpose: "Stable base for squats, deadlifts, and hinge patterns.", why: "Running shoes with cushioned heels introduce forward lean in compound lifts.", buyingNote: "Converse All-Star, Nike Metcon, or Adidas Powerlift. Flat sole is the requirement." },
  { id: "gym_belt", name: "Weightlifting Belt (Leather)", category: "Training Gear", priority: "Useful Upgrade", cost: "€€", purpose: "Intra-abdominal pressure support for heavy compound sets.", why: "A belt cues better bracing technique. For 80%+ effort sets only.", buyingNote: "10mm single-prong leather for longevity. Velcro loses tension over time." },
  { id: "lifting_straps", name: "Lifting Straps", category: "Training Gear", priority: "Useful Upgrade", cost: "€", purpose: "Grip support for high-volume pulling when grip fatigues first.", why: "Removes grip as the limiting factor on back work.", buyingNote: "Basic cotton straps are fine. Lasso or figure-8 style both work." },
  { id: "jump_rope", name: "Speed Jump Rope", category: "Training Gear", priority: "Useful Upgrade", cost: "€", purpose: "Conditioning, coordination, low-equipment warm-up.", why: "Effective in 5–10 min bouts before training or as active rest.", buyingNote: "Aluminium handles with steel cable. No need for a premium brand." },
  { id: "sleep_tracker", name: "Sleep Tracker (Oura / Whoop)", category: "Wearables / Tracking", priority: "Later", cost: "€€€", purpose: "HRV tracking, sleep staging, readiness scoring.", why: "High-signal data when trended over weeks — not for day-to-day decisions.", buyingNote: "Oura ring is less intrusive. Whoop requires subscription. Build habits first." },
  { id: "smart_scale", name: "Smart Scale (Body Composition)", category: "Wearables / Tracking", priority: "Useful Upgrade", cost: "€€", purpose: "Body composition trends over time.", why: "BIA is not highly accurate but weekly trends are directionally useful.", buyingNote: "Withings Body+ or Renpho. Same time every morning for consistency." },
  { id: "hr_monitor", name: "Chest Strap Heart Rate Monitor", category: "Wearables / Tracking", priority: "Useful Upgrade", cost: "€€", purpose: "Accurate HR zone tracking during cardio and conditioning.", why: "Wrist-based HR is unreliable during exercise. Chest strap is near-ECG accurate.", buyingNote: "Polar H10 pairs with most apps. Long battery life. One-time buy." },
  { id: "blue_light_glasses", name: "Blue Light Glasses (Amber Tint)", category: "Workstation / Focus", priority: "Useful Upgrade", cost: "€", purpose: "Reduces blue-light exposure during evening screen use.", why: "Amber-tinted lenses filter the wavelengths most associated with melatonin suppression.", buyingNote: "Amber tint required — not the lightly-tinted clear versions. Uvex Bikers are cheap and effective." },
  { id: "ergonomic_cushion", name: "Lumbar / Ergonomic Cushion", category: "Workstation / Focus", priority: "Useful Upgrade", cost: "€€", purpose: "Improves sitting posture and reduces lower back load.", why: "Poor sitting posture compresses discs and creates anterior hip tilt over time.", buyingNote: "Lumbar roll or coccyx cushion for existing chair." },
  { id: "focus_timer", name: "Physical Focus Timer", category: "Workstation / Focus", priority: "Useful Upgrade", cost: "€", purpose: "Time-blocks deep work without triggering phone distraction.", why: "Visual time-boxing improves focus session length and completion rate.", buyingNote: "Time Timer, Time Cube, or any mechanical countdown." },
  { id: "standing_desk", name: "Standing Desk Converter", category: "Workstation / Focus", priority: "Later", cost: "€€€", purpose: "Alternating sit/stand posture reduces sedentary load.", why: "Prolonged sitting may be associated with metabolic markers independent of exercise.", buyingNote: "Measure desk depth and monitor height before ordering." },
  { id: "infrared_sauna", name: "Infrared Sauna (Personal)", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Heat stress, cardiovascular conditioning, relaxation.", why: "Regular sauna use (4+/week) can be associated with cardiovascular markers in observational data.", buyingNote: "1-person far-infrared unit. High ROI if used consistently. Requires dedicated space." },
  { id: "cold_plunge", name: "Cold Plunge / Ice Bath", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Cold adaptation, recovery, mood, norepinephrine protocols.", why: "Cold exposure may significantly increase norepinephrine. Timing and protocol matter.", buyingNote: "Try consistent cold shower protocols first before investing." },
  { id: "red_light_panel", name: "Red Light / Infrared Panel", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Photobiomodulation: mitochondrial stimulation, skin, muscle recovery.", why: "630–850nm wavelengths have emerging evidence for tissue and mitochondrial function.", buyingNote: "Research irradiance output before buying — varies widely by brand." },
  { id: "quality_mattress", name: "High-End Mattress", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Foundation of sleep quality. Surface pressure affects sleep staging.", why: "Sleep occupies 1/3 of life. A poor mattress has compounding negative effects.", buyingNote: "Latex hybrid or quality pocket spring. 7–10 year investment. Try in store." },
]

const RETAINER_CATEGORIES = [
  "Protein Sources",
  "Carb Sources",
  "Fats",
  "Vegetables & Micronutrients",
  "Hydration & Minerals",
  "Supplements",
  "Kitchen Basics",
]

const UPGRADE_CATEGORIES = [
  "Sleep Environment",
  "Air & Light",
  "Bedroom / Bedding",
  "Kitchen Tools",
  "Recovery Tools",
  "Training Gear",
  "Wearables / Tracking",
  "Workstation / Focus",
  "Optional Luxury Upgrades",
]

const START_HERE_IDS = new Set([
  "eggs", "ground_beef", "salmon", "white_rice", "potatoes", "oats", "fruit",
  "leafy_greens", "broccoli", "garlic_onions", "olive_oil", "salt",
  "magnesium_glycinate", "glycine", "creatine", "omega3", "vit_d3_k2",
  "meal_prep_containers",
])

const FIRST_UPGRADES = [
  { text: "High-quality bedsheets", id: "quality_sheets" },
  { text: "Blackout curtains or sleep mask", id: "blackout_curtains" },
  { text: "Air purifier", id: "air_purifier" },
  { text: "Water bottle (glass or stainless)", id: "water_bottle" },
  { text: "Meal prep containers (glass)", id: "glass_containers" },
  { text: "Better pillow", id: "better_pillow" },
]

const PHASE2_FEATURES = [
  { title: "Recurring Weekly Basket", desc: "Auto-generate a weekly shopping list based on your active protocols and macro targets." },
  { title: "Budget Planning", desc: "Track monthly spend on food and supplements. Set a budget and see allocation by category." },
  { title: "Inventory Tracking", desc: "Log what you have in stock so the basket only shows items you actually need to buy." },
  { title: "Supplement Refill Reminders", desc: "Automatic alerts when a supplement is likely running low based on dose and purchase date." },
  { title: "Upgrade Budget Queue", desc: "Assign a monthly savings allocation to the upgrade queue. Flag items when threshold is met." },
  { title: "Macro-Linked Shopping", desc: "Shopping list auto-adjusts quantities based on your active calorie and protein targets." },
  { title: "Meal-Template-Linked Shopping", desc: "Shopping list auto-populates from your active meal templates in the Nutrition module." },
  { title: "Dashboard Shopping Card", desc: "A live shopping widget on the dashboard showing what you need to buy this week." },
  { title: "Supabase Sync for Custom Items", desc: "Custom retainer items and upgrade queue items sync to your account across devices." },
]

const LS_RETAINER = "tff_retainer_checked"
const LS_UPGRADE = "tff_upgrade_status"
const LS_CUSTOM_RETAINER = "tff_custom_retainer"
const LS_CUSTOM_UPGRADE = "tff_custom_upgrade"
const LS_CLOUD_IDS = "tff_shopping_cloud_ids"

const RETAINER_PRIORITY_VARIANT: Record<RetainerPriority, "core" | "default" | "na"> = {
  Core: "core",
  Useful: "default",
  Optional: "na",
}

const UPGRADE_PRIORITY_VARIANT: Record<UpgradePriority, "core" | "default" | "depends" | "na"> = {
  "Core Upgrade": "core",
  "Useful Upgrade": "default",
  "Luxury": "depends",
  "Later": "na",
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        background: "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "14px 18px",
        minWidth: 90,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{value}</div>
      <div className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>{label}</div>
    </div>
  )
}

function RetainerCard({
  item,
  checked,
  onToggle,
  onDelete,
}: {
  item: RetainerItem
  checked: boolean
  onToggle: () => void
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const isCustom = !!onDelete
  const hasDetail = !!(item.purpose || item.note)

  return (
    <TffCard style={{ marginBottom: 8, padding: 0, opacity: checked ? 0.65 : 1 }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Checkbox */}
        <button
          onClick={onToggle}
          aria-label={checked ? "Uncheck" : "Check"}
          style={{
            padding: "0 14px",
            background: "none",
            border: "none",
            borderRight: "1px solid var(--border-soft)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "1px solid",
              borderColor: checked ? "var(--accent)" : "var(--border)",
              borderRadius: 3,
              background: checked ? "var(--accent)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {checked && <span style={{ fontSize: 10, color: "var(--bg)", lineHeight: 1, fontWeight: 700 }}>✓</span>}
          </div>
        </button>

        {/* Name row */}
        <div
          onClick={hasDetail ? () => setOpen((o) => !o) : undefined}
          style={{
            flex: 1,
            padding: "12px 14px",
            cursor: hasDetail ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--t-base)",
                fontWeight: 600,
                color: checked ? "var(--text-4)" : "var(--text)",
                textDecoration: checked ? "line-through" : "none",
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
              {isCustom && (
                <span className="mono" style={{ fontSize: 8, color: "var(--text-4)", marginLeft: 6, letterSpacing: "0.08em" }}>
                  CUSTOM
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <TffBadge variant={RETAINER_PRIORITY_VARIANT[item.priority]}>{item.priority}</TffBadge>
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em" }}>
                {item.frequency.toUpperCase()}
              </span>
            </div>
          </div>
          {isCustom ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              aria-label="Delete item"
              style={{
                padding: "4px 6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-4)",
                fontSize: 14,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          ) : hasDetail ? (
            <span style={{ color: "var(--text-4)", fontSize: 11, flexShrink: 0 }}>
              {open ? "▲" : "▼"}
            </span>
          ) : null}
        </div>
      </div>

      {open && hasDetail && (
        <div style={{ padding: "10px 16px 14px", borderTop: "1px solid var(--border-soft)" }}>
          {item.purpose && (
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", margin: "0 0 6px", lineHeight: 1.6 }}>
              {item.purpose}
            </p>
          )}
          {item.note && (
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0, lineHeight: 1.5 }}>
              {item.note}
            </p>
          )}
        </div>
      )}
    </TffCard>
  )
}

function UpgradeCard({
  item,
  status,
  onStatusChange,
  onDelete,
}: {
  item: UpgradeItem
  status: "none" | "planned" | "bought"
  onStatusChange: (s: "none" | "planned" | "bought") => void
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const isCustom = !!onDelete
  const hasDetail = !!(item.purpose || item.why || item.buyingNote)

  return (
    <TffCard style={{ marginBottom: 8, padding: 0, opacity: status === "bought" ? 0.65 : 1 }}>
      {/* Name row */}
      <div
        onClick={hasDetail ? () => setOpen((o) => !o) : undefined}
        style={{
          padding: "12px 14px",
          cursor: hasDetail ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "var(--t-base)",
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
            {isCustom && (
              <span className="mono" style={{ fontSize: 8, color: "var(--text-4)", marginLeft: 6, letterSpacing: "0.08em" }}>
                CUSTOM
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <TffBadge variant={UPGRADE_PRIORITY_VARIANT[item.priority]}>{item.priority}</TffBadge>
            <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em", fontWeight: 600 }}>
              {item.cost}
            </span>
          </div>
        </div>
        {isCustom ? (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            aria-label="Delete item"
            style={{
              padding: "4px 6px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-4)",
              fontSize: 14,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        ) : hasDetail ? (
          <span style={{ color: "var(--text-4)", fontSize: 11, flexShrink: 0 }}>
            {open ? "▲" : "▼"}
          </span>
        ) : null}
      </div>

      {/* Status buttons */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "8px 14px 10px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        {(["planned", "bought"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(status === s ? "none" : s)}
            className="mono"
            style={{
              padding: "4px 10px",
              fontSize: 9,
              letterSpacing: "0.08em",
              border: "1px solid",
              borderColor: status === s ? "var(--accent)" : "var(--border)",
              background: status === s ? "var(--accent)" : "transparent",
              color: status === s ? "var(--bg)" : "var(--text-4)",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Expanded detail */}
      {open && hasDetail && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--border-soft)" }}>
          {item.purpose && (
            <div style={{ marginTop: 12, marginBottom: 10 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>PURPOSE</div>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>{item.purpose}</p>
            </div>
          )}
          {item.why && (
            <div style={{ marginBottom: 10 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>WHY IT MATTERS</div>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>{item.why}</p>
            </div>
          )}
          {item.buyingNote && (
            <div>
              <div className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}>BUYING NOTE</div>
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>{item.buyingNote}</p>
            </div>
          )}
        </div>
      )}
    </TffCard>
  )
}

const SEL: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: "var(--t-small)" as string,
  background: "var(--panel-2)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  color: "var(--text)",
}

export default function ShoppingPage() {
  const [mode, setMode] = useState<Mode>("basket")

  // Persistence state
  const [retainerChecked, setRetainerChecked] = useState<Set<string>>(new Set())
  const [upgradeStatus, setUpgradeStatus] = useState<Record<string, "planned" | "bought">>({})
  const [customRetainer, setCustomRetainer] = useState<RetainerItem[]>([])
  const [customUpgrade, setCustomUpgrade] = useState<UpgradeItem[]>([])
  const [cloudIdMap, setCloudIdMap] = useState<Record<string, string>>({})
  const [loaded, setLoaded] = useState(false)

  // Sync status
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")

  // Basket filters
  const [bSearch, setBSearch] = useState("")
  const [bCategory, setBCategory] = useState("all")
  const [bPriority, setBPriority] = useState("all")
  const [bFrequency, setBFrequency] = useState("all")

  // Queue filters
  const [qSearch, setQSearch] = useState("")
  const [qCategory, setQCategory] = useState("all")
  const [qPriority, setQPriority] = useState("all")
  const [qCost, setQCost] = useState("all")

  // Quick add basket
  const [bAddOpen, setBAddOpen] = useState(false)
  const [bAddName, setBAddName] = useState("")
  const [bAddCategory, setBAddCategory] = useState(RETAINER_CATEGORIES[0])
  const [bAddPriority, setBAddPriority] = useState<RetainerPriority>("Core")
  const [bAddFrequency, setBAddFrequency] = useState<RetainerFrequency>("Weekly")

  // Quick add queue
  const [qAddOpen, setQAddOpen] = useState(false)
  const [qAddName, setQAddName] = useState("")
  const [qAddCategory, setQAddCategory] = useState(UPGRADE_CATEGORIES[0])
  const [qAddPriority, setQAddPriority] = useState<UpgradePriority>("Useful Upgrade")
  const [qAddCost, setQAddCost] = useState<CostTier>("€€")

  // Load from localStorage
  useEffect(() => {
    try {
      const r1 = localStorage.getItem(LS_RETAINER)
      if (r1) setRetainerChecked(new Set(JSON.parse(r1) as string[]))
      const r2 = localStorage.getItem(LS_UPGRADE)
      if (r2) setUpgradeStatus(JSON.parse(r2) as Record<string, "planned" | "bought">)
      const r3 = localStorage.getItem(LS_CUSTOM_RETAINER)
      if (r3) setCustomRetainer(JSON.parse(r3) as RetainerItem[])
      const r4 = localStorage.getItem(LS_CUSTOM_UPGRADE)
      if (r4) setCustomUpgrade(JSON.parse(r4) as UpgradeItem[])
      const r5 = localStorage.getItem(LS_CLOUD_IDS)
      if (r5) setCloudIdMap(JSON.parse(r5) as Record<string, string>)
    } catch (_e) { /* ignore */ }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_RETAINER, JSON.stringify([...retainerChecked]))
  }, [retainerChecked, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_UPGRADE, JSON.stringify(upgradeStatus))
  }, [upgradeStatus, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_CUSTOM_RETAINER, JSON.stringify(customRetainer))
  }, [customRetainer, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_CUSTOM_UPGRADE, JSON.stringify(customUpgrade))
  }, [customUpgrade, loaded])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_CLOUD_IDS, JSON.stringify(cloudIdMap))
  }, [cloudIdMap, loaded])

  // Initial cloud sync — runs once after hydration
  useEffect(() => {
    if (!loaded) return
    if (!hasSupabaseConfig) {
      setSyncStatus("local")
      return
    }
    setSyncStatus("syncing")

    fetchShoppingData().then((result) => {
      if (!result.ok) {
        setSyncStatus(result.reason === "unauthenticated" ? "unauthenticated" : "error")
        return
      }

      const { statuses, customItems } = result.data

      // Merge remote statuses into local — remote wins for known items
      if (statuses.length > 0) {
        setRetainerChecked((prev) => {
          const next = new Set(prev)
          for (const row of statuses) {
            if (row.mode === "retainer") {
              if (row.status === "checked") next.add(row.item_id)
              else next.delete(row.item_id)
            }
          }
          return next
        })
        setUpgradeStatus((prev) => {
          const next = { ...prev }
          for (const row of statuses) {
            if (row.mode === "upgrade") {
              if (row.status === "planned" || row.status === "bought") {
                next[row.item_id] = row.status as "planned" | "bought"
              } else {
                delete next[row.item_id]
              }
            }
          }
          return next
        })
      }

      // Merge remote custom items — compute synchronously then set state
      if (customItems.length > 0) {
        const cloudMapUpdates: Record<string, string> = {}

        // Retainer merge: values from closure are current at effect run time
        const retainerById = new Map(customRetainer.map((i) => [i.id, i]))
        let newCustomRetainer = [...customRetainer]
        for (const row of customItems.filter((r) => r.mode === "retainer")) {
          const localId = row.client_id
          if (localId && retainerById.has(localId)) {
            cloudMapUpdates[localId] = row.id
          } else {
            const newId = localId ?? `custom_retainer_remote_${row.id.slice(0, 8)}`
            if (!retainerById.has(newId)) {
              newCustomRetainer = [
                ...newCustomRetainer,
                {
                  id: newId,
                  name: row.name,
                  category: row.category ?? RETAINER_CATEGORIES[0],
                  priority: (row.priority as RetainerPriority) ?? "Useful",
                  frequency: (row.frequency as RetainerFrequency) ?? "Monthly",
                  purpose: row.purpose ?? "",
                  note: row.note ?? "",
                },
              ]
              cloudMapUpdates[newId] = row.id
            }
          }
        }

        // Upgrade merge
        const upgradeById = new Map(customUpgrade.map((i) => [i.id, i]))
        let newCustomUpgrade = [...customUpgrade]
        for (const row of customItems.filter((r) => r.mode === "upgrade")) {
          const localId = row.client_id
          if (localId && upgradeById.has(localId)) {
            cloudMapUpdates[localId] = row.id
          } else {
            const newId = localId ?? `custom_upgrade_remote_${row.id.slice(0, 8)}`
            if (!upgradeById.has(newId)) {
              newCustomUpgrade = [
                ...newCustomUpgrade,
                {
                  id: newId,
                  name: row.name,
                  category: row.category ?? UPGRADE_CATEGORIES[0],
                  priority: (row.priority as UpgradePriority) ?? "Useful Upgrade",
                  cost: (row.cost_tier as CostTier) ?? "€€",
                  purpose: row.purpose ?? "",
                  why: "",
                  buyingNote: row.note ?? "",
                },
              ]
              cloudMapUpdates[newId] = row.id
            }
          }
        }

        setCustomRetainer(newCustomRetainer)
        setCustomUpgrade(newCustomUpgrade)
        if (Object.keys(cloudMapUpdates).length > 0) {
          setCloudIdMap((prev) => ({ ...prev, ...cloudMapUpdates }))
        }
      }

      setSyncStatus("synced")
    })
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Retainer actions
  const toggleRetainer = (id: string) => {
    setRetainerChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        void upsertShoppingStatus("retainer", id, "unchecked")
      } else {
        next.add(id)
        void upsertShoppingStatus("retainer", id, "checked")
      }
      return next
    })
  }

  const addCustomRetainerItem = () => {
    if (!bAddName.trim()) return
    const id = `custom_retainer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newItem: RetainerItem = {
      id,
      name: bAddName.trim(),
      category: bAddCategory,
      priority: bAddPriority,
      frequency: bAddFrequency,
      purpose: "",
      note: "",
    }
    setCustomRetainer((prev) => [...prev, newItem])
    setBAddName("")
    setBAddOpen(false)

    createCloudShoppingItem({
      clientId: id,
      mode: "retainer",
      name: newItem.name,
      category: newItem.category,
      priority: newItem.priority,
      frequency: newItem.frequency,
    }).then((cloudId) => {
      if (cloudId) setCloudIdMap((prev) => ({ ...prev, [id]: cloudId }))
    })
  }

  const deleteCustomRetainerItem = (id: string) => {
    setCustomRetainer((prev) => prev.filter((i) => i.id !== id))
    setRetainerChecked((prev) => { const n = new Set(prev); n.delete(id); return n })
    const cloudId = cloudIdMap[id]
    if (cloudId) {
      void archiveCloudShoppingItem(cloudId)
      setCloudIdMap((prev) => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  // Upgrade actions
  const setUpgrade = (id: string, s: "none" | "planned" | "bought") => {
    setUpgradeStatus((prev) => {
      const next = { ...prev }
      if (s === "none") {
        delete next[id]
        void upsertShoppingStatus("upgrade", id, "unchecked")
      } else {
        next[id] = s
        void upsertShoppingStatus("upgrade", id, s)
      }
      return next
    })
  }

  const addCustomUpgradeItem = () => {
    if (!qAddName.trim()) return
    const id = `custom_upgrade_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    const newItem: UpgradeItem = {
      id,
      name: qAddName.trim(),
      category: qAddCategory,
      priority: qAddPriority,
      cost: qAddCost,
      purpose: "",
      why: "",
      buyingNote: "",
    }
    setCustomUpgrade((prev) => [...prev, newItem])
    setQAddName("")
    setQAddOpen(false)

    createCloudShoppingItem({
      clientId: id,
      mode: "upgrade",
      name: newItem.name,
      category: newItem.category,
      priority: newItem.priority,
      costTier: newItem.cost,
    }).then((cloudId) => {
      if (cloudId) setCloudIdMap((prev) => ({ ...prev, [id]: cloudId }))
    })
  }

  const deleteCustomUpgradeItem = (id: string) => {
    setCustomUpgrade((prev) => prev.filter((i) => i.id !== id))
    setUpgradeStatus((prev) => { const n = { ...prev }; delete n[id]; return n })
    const cloudId = cloudIdMap[id]
    if (cloudId) {
      void archiveCloudShoppingItem(cloudId)
      setCloudIdMap((prev) => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  // Combined item arrays
  const allBasketItems = useMemo(() => [...RETAINER_ITEMS, ...customRetainer], [customRetainer])
  const allQueueItems = useMemo(() => [...UPGRADE_ITEMS, ...customUpgrade], [customUpgrade])

  // Basket filtering
  const bIsFiltering = bSearch.trim() !== "" || bCategory !== "all" || bPriority !== "all" || bFrequency !== "all"

  const filteredBasket = useMemo(() => {
    return allBasketItems.filter((item) => {
      const q = bSearch.toLowerCase()
      const matchSearch = q === "" || item.name.toLowerCase().includes(q) || item.purpose.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      const matchCat = bCategory === "all" || item.category === bCategory
      const matchPri = bPriority === "all" || (item.priority as string) === bPriority
      const matchFreq = bFrequency === "all" || (item.frequency as string) === bFrequency
      return matchSearch && matchCat && matchPri && matchFreq
    })
  }, [allBasketItems, bSearch, bCategory, bPriority, bFrequency])

  const groupedBasket = useMemo(() => {
    if (bIsFiltering) return null
    const map: Record<string, RetainerItem[]> = {}
    for (const cat of RETAINER_CATEGORIES) map[cat] = []
    for (const item of allBasketItems) {
      if (map[item.category] !== undefined) map[item.category].push(item)
    }
    return map
  }, [bIsFiltering, allBasketItems])

  // Queue filtering
  const qIsFiltering = qSearch.trim() !== "" || qCategory !== "all" || qPriority !== "all" || qCost !== "all"

  const filteredQueue = useMemo(() => {
    return allQueueItems.filter((item) => {
      const q = qSearch.toLowerCase()
      const matchSearch = q === "" || item.name.toLowerCase().includes(q) || item.purpose.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      const matchCat = qCategory === "all" || item.category === qCategory
      const matchPri = qPriority === "all" || (item.priority as string) === qPriority
      const matchCost = qCost === "all" || (item.cost as string) === qCost
      return matchSearch && matchCat && matchPri && matchCost
    })
  }, [allQueueItems, qSearch, qCategory, qPriority, qCost])

  const groupedQueue = useMemo(() => {
    if (qIsFiltering) return null
    const map: Record<string, UpgradeItem[]> = {}
    for (const cat of UPGRADE_CATEGORIES) map[cat] = []
    for (const item of allQueueItems) {
      if (map[item.category] !== undefined) map[item.category].push(item)
    }
    return map
  }, [qIsFiltering, allQueueItems])

  // Stats
  const checkedCount = retainerChecked.size
  const coreBasketCount = RETAINER_ITEMS.filter((i) => i.priority === "Core").length
  const boughtCount = Object.values(upgradeStatus).filter((s) => s === "bought").length
  const plannedCount = Object.values(upgradeStatus).filter((s) => s === "planned").length
  const coreUpgradeCount = UPGRADE_ITEMS.filter((i) => i.priority === "Core Upgrade").length

  const modeOptions: { id: Mode; label: string }[] = [
    { id: "basket", label: "Retainer Basket" },
    { id: "queue", label: "Upgrade Queue" },
    { id: "phase2", label: "Phase 2" },
  ]

  return (
    <div>
      <PageHeader
        crumb="INDEX · 08 / SHOPPING"
        title="Shopping"
        subtitle="Retainer basket for recurring buys. Upgrade queue for one-off investments."
      />

      {/* Mode tabs */}
      <div style={{ padding: "0 24px 20px" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
          {modeOptions.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="mono"
              style={{
                padding: "6px 14px",
                fontSize: 10,
                letterSpacing: "0.1em",
                border: "1px solid",
                borderColor: mode === m.id ? "var(--accent)" : "var(--border)",
                background: mode === m.id ? "var(--accent)" : "transparent",
                color: mode === m.id ? "var(--bg)" : "var(--text-3)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {m.label.toUpperCase()}
            </button>
          ))}
          <div style={{ marginLeft: 8 }}>
            <SyncBadge status={syncStatus} />
          </div>
        </div>
      </div>

      {/* ── RETAINER BASKET ── */}
      {mode === "basket" && (
        <div style={{ padding: "0 24px 40px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard value={allBasketItems.length} label="TOTAL ITEMS" />
            <StatCard value={coreBasketCount} label="CORE ITEMS" />
            <StatCard value={checkedCount} label="CHECKED" />
            {customRetainer.length > 0 && <StatCard value={customRetainer.length} label="CUSTOM" />}
          </div>

          {/* Start Here card */}
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>Start Here Basket</span>
              <TffBadge variant="core">Core Essentials</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "0 0 12px", lineHeight: 1.6 }}>
              Minimum viable basket. Get these stocked before anything else.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {RETAINER_ITEMS.filter((i) => START_HERE_IDS.has(i.id)).map((item) => (
                <span
                  key={item.id}
                  className="mono"
                  onClick={() => toggleRetainer(item.id)}
                  style={{
                    fontSize: 9,
                    padding: "3px 8px",
                    background: retainerChecked.has(item.id) ? "var(--accent)" : "var(--panel-2)",
                    border: "1px solid",
                    borderColor: retainerChecked.has(item.id) ? "var(--accent)" : "var(--border)",
                    borderRadius: 3,
                    color: retainerChecked.has(item.id) ? "var(--bg)" : "var(--text-3)",
                    cursor: "pointer",
                  }}
                >
                  {retainerChecked.has(item.id) ? "✓ " : ""}{item.name}
                </span>
              ))}
            </div>
          </TffCard>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search basket..."
              value={bSearch}
              onChange={(e) => setBSearch(e.target.value)}
              style={{ flex: "1 1 160px", padding: "8px 12px", fontSize: "var(--t-small)", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)", outline: "none" }}
            />
            <select value={bCategory} onChange={(e) => setBCategory(e.target.value)} style={SEL}>
              <option value="all">All Categories</option>
              {RETAINER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={bPriority} onChange={(e) => setBPriority(e.target.value)} style={SEL}>
              <option value="all">All Priorities</option>
              <option value="Core">Core</option>
              <option value="Useful">Useful</option>
              <option value="Optional">Optional</option>
            </select>
            <select value={bFrequency} onChange={(e) => setBFrequency(e.target.value)} style={SEL}>
              <option value="all">All Frequencies</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="As needed">As needed</option>
            </select>
            {bIsFiltering && (
              <button onClick={() => { setBSearch(""); setBCategory("all"); setBPriority("all"); setBFrequency("all") }} className="mono" style={{ padding: "8px 12px", fontSize: 10, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}>
                CLEAR
              </button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 8, flexWrap: "wrap" }}>
            {bIsFiltering ? (
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                {filteredBasket.length} ITEM{filteredBasket.length !== 1 ? "S" : ""} FOUND
              </span>
            ) : <span />}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setBAddOpen((o) => !o)}
                className="mono"
                style={{ padding: "5px 12px", fontSize: 9, letterSpacing: "0.08em", background: bAddOpen ? "var(--accent)" : "transparent", border: "1px solid", borderColor: bAddOpen ? "var(--accent)" : "var(--border)", borderRadius: 4, color: bAddOpen ? "var(--bg)" : "var(--text-3)", cursor: "pointer" }}
              >
                + ADD ITEM
              </button>
              <button
                onClick={() => {
                  const prev = retainerChecked
                  setRetainerChecked(new Set())
                  prev.forEach((id) => void upsertShoppingStatus("retainer", id, "unchecked"))
                }}
                className="mono"
                style={{ padding: "5px 12px", fontSize: 9, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
              >
                RESET CHECKMARKS
              </button>
            </div>
          </div>

          {/* Quick Add form */}
          {bAddOpen && (
            <TffCard style={{ marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 12 }}>ADD CUSTOM ITEM</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Item name..."
                  value={bAddName}
                  onChange={(e) => setBAddName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomRetainerItem()}
                  autoFocus
                  style={{ flex: "1 1 180px", padding: "8px 12px", fontSize: "var(--t-small)", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)", outline: "none" }}
                />
                <select value={bAddCategory} onChange={(e) => setBAddCategory(e.target.value)} style={SEL}>
                  {RETAINER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={bAddPriority} onChange={(e) => setBAddPriority(e.target.value as RetainerPriority)} style={SEL}>
                  <option value="Core">Core</option>
                  <option value="Useful">Useful</option>
                  <option value="Optional">Optional</option>
                </select>
                <select value={bAddFrequency} onChange={(e) => setBAddFrequency(e.target.value as RetainerFrequency)} style={SEL}>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={addCustomRetainerItem}
                  disabled={!bAddName.trim()}
                  className="mono"
                  style={{ padding: "6px 16px", fontSize: 10, letterSpacing: "0.08em", background: bAddName.trim() ? "var(--accent)" : "var(--panel-2)", border: "1px solid", borderColor: bAddName.trim() ? "var(--accent)" : "var(--border)", borderRadius: 4, color: bAddName.trim() ? "var(--bg)" : "var(--text-4)", cursor: bAddName.trim() ? "pointer" : "default" }}
                >
                  ADD
                </button>
                <button onClick={() => { setBAddOpen(false); setBAddName("") }} className="mono" style={{ padding: "6px 12px", fontSize: 10, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}>
                  CANCEL
                </button>
              </div>
            </TffCard>
          )}

          {/* Item list */}
          {bIsFiltering ? (
            filteredBasket.length === 0 ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>No items match.</p>
            ) : (
              filteredBasket.map((item) => (
                <RetainerCard
                  key={item.id}
                  item={item}
                  checked={retainerChecked.has(item.id)}
                  onToggle={() => toggleRetainer(item.id)}
                  onDelete={item.id.startsWith("custom_") ? () => deleteCustomRetainerItem(item.id) : undefined}
                />
              ))
            )
          ) : (
            groupedBasket && RETAINER_CATEGORIES.map((cat) => {
              const items = groupedBasket[cat]
              if (!items?.length) return null
              const doneCount = items.filter((i) => retainerChecked.has(i.id)).length
              return (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <SectionHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{cat}</span>
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>{doneCount}/{items.length}</span>
                    </div>
                  </SectionHeader>
                  {items.map((item) => (
                    <RetainerCard
                      key={item.id}
                      item={item}
                      checked={retainerChecked.has(item.id)}
                      onToggle={() => toggleRetainer(item.id)}
                      onDelete={item.id.startsWith("custom_") ? () => deleteCustomRetainerItem(item.id) : undefined}
                    />
                  ))}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── UPGRADE QUEUE ── */}
      {mode === "queue" && (
        <div style={{ padding: "0 24px 40px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard value={allQueueItems.length} label="TOTAL UPGRADES" />
            <StatCard value={coreUpgradeCount} label="CORE UPGRADES" />
            <StatCard value={plannedCount} label="PLANNED" />
            <StatCard value={boughtCount} label="BOUGHT" />
            {customUpgrade.length > 0 && <StatCard value={customUpgrade.length} label="CUSTOM" />}
          </div>

          {/* First Upgrades card */}
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>First Upgrades</span>
              <TffBadge variant="core">Start Here</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "0 0 12px", lineHeight: 1.6 }}>
              When extra money appears, buy in this order.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FIRST_UPGRADES.map((u, i) => (
                <div key={u.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", flexShrink: 0, letterSpacing: "0.08em", width: 18 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "var(--t-small)", color: "var(--text-2)", flex: 1 }}>{u.text}</span>
                  {upgradeStatus[u.id] === "bought" && <TffBadge variant="core">Bought</TffBadge>}
                  {upgradeStatus[u.id] === "planned" && <TffBadge variant="default">Planned</TffBadge>}
                </div>
              ))}
            </div>
          </TffCard>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search upgrades..."
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
              style={{ flex: "1 1 160px", padding: "8px 12px", fontSize: "var(--t-small)", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)", outline: "none" }}
            />
            <select value={qCategory} onChange={(e) => setQCategory(e.target.value)} style={SEL}>
              <option value="all">All Categories</option>
              {UPGRADE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={qPriority} onChange={(e) => setQPriority(e.target.value)} style={SEL}>
              <option value="all">All Priorities</option>
              <option value="Core Upgrade">Core Upgrade</option>
              <option value="Useful Upgrade">Useful Upgrade</option>
              <option value="Luxury">Luxury</option>
              <option value="Later">Later</option>
            </select>
            <select value={qCost} onChange={(e) => setQCost(e.target.value)} style={SEL}>
              <option value="all">All Cost Tiers</option>
              <option value="€">€ — Budget</option>
              <option value="€€">€€ — Mid</option>
              <option value="€€€">€€€ — Investment</option>
            </select>
            {qIsFiltering && (
              <button onClick={() => { setQSearch(""); setQCategory("all"); setQPriority("all"); setQCost("all") }} className="mono" style={{ padding: "8px 12px", fontSize: 10, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}>
                CLEAR
              </button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 8, flexWrap: "wrap" }}>
            {qIsFiltering ? (
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                {filteredQueue.length} UPGRADE{filteredQueue.length !== 1 ? "S" : ""} FOUND
              </span>
            ) : <span />}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setQAddOpen((o) => !o)}
                className="mono"
                style={{ padding: "5px 12px", fontSize: 9, letterSpacing: "0.08em", background: qAddOpen ? "var(--accent)" : "transparent", border: "1px solid", borderColor: qAddOpen ? "var(--accent)" : "var(--border)", borderRadius: 4, color: qAddOpen ? "var(--bg)" : "var(--text-3)", cursor: "pointer" }}
              >
                + ADD UPGRADE
              </button>
              <button
                onClick={() => {
                  const prev = upgradeStatus
                  setUpgradeStatus({})
                  Object.keys(prev).forEach((id) => void upsertShoppingStatus("upgrade", id, "unchecked"))
                }}
                className="mono"
                style={{ padding: "5px 12px", fontSize: 9, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
              >
                RESET STATUS
              </button>
            </div>
          </div>

          {/* Quick Add form */}
          {qAddOpen && (
            <TffCard style={{ marginBottom: 16 }}>
              <div className="mono" style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 12 }}>ADD CUSTOM UPGRADE</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Upgrade name..."
                  value={qAddName}
                  onChange={(e) => setQAddName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomUpgradeItem()}
                  autoFocus
                  style={{ flex: "1 1 180px", padding: "8px 12px", fontSize: "var(--t-small)", background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text)", outline: "none" }}
                />
                <select value={qAddCategory} onChange={(e) => setQAddCategory(e.target.value)} style={SEL}>
                  {UPGRADE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={qAddPriority} onChange={(e) => setQAddPriority(e.target.value as UpgradePriority)} style={SEL}>
                  <option value="Core Upgrade">Core Upgrade</option>
                  <option value="Useful Upgrade">Useful Upgrade</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Later">Later</option>
                </select>
                <select value={qAddCost} onChange={(e) => setQAddCost(e.target.value as CostTier)} style={SEL}>
                  <option value="€">€ — Budget</option>
                  <option value="€€">€€ — Mid</option>
                  <option value="€€€">€€€ — Investment</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={addCustomUpgradeItem}
                  disabled={!qAddName.trim()}
                  className="mono"
                  style={{ padding: "6px 16px", fontSize: 10, letterSpacing: "0.08em", background: qAddName.trim() ? "var(--accent)" : "var(--panel-2)", border: "1px solid", borderColor: qAddName.trim() ? "var(--accent)" : "var(--border)", borderRadius: 4, color: qAddName.trim() ? "var(--bg)" : "var(--text-4)", cursor: qAddName.trim() ? "pointer" : "default" }}
                >
                  ADD
                </button>
                <button onClick={() => { setQAddOpen(false); setQAddName("") }} className="mono" style={{ padding: "6px 12px", fontSize: 10, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}>
                  CANCEL
                </button>
              </div>
            </TffCard>
          )}

          {/* Item list */}
          {qIsFiltering ? (
            filteredQueue.length === 0 ? (
              <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)" }}>No upgrades match.</p>
            ) : (
              filteredQueue.map((item) => (
                <UpgradeCard
                  key={item.id}
                  item={item}
                  status={upgradeStatus[item.id] ?? "none"}
                  onStatusChange={(s) => setUpgrade(item.id, s)}
                  onDelete={item.id.startsWith("custom_") ? () => deleteCustomUpgradeItem(item.id) : undefined}
                />
              ))
            )
          ) : (
            groupedQueue && UPGRADE_CATEGORIES.map((cat) => {
              const items = groupedQueue[cat]
              if (!items?.length) return null
              const boughtInCat = items.filter((i) => upgradeStatus[i.id] === "bought").length
              return (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <SectionHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{cat}</span>
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>{boughtInCat}/{items.length} BOUGHT</span>
                    </div>
                  </SectionHeader>
                  {items.map((item) => (
                    <UpgradeCard
                      key={item.id}
                      item={item}
                      status={upgradeStatus[item.id] ?? "none"}
                      onStatusChange={(s) => setUpgrade(item.id, s)}
                      onDelete={item.id.startsWith("custom_") ? () => deleteCustomUpgradeItem(item.id) : undefined}
                    />
                  ))}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── PHASE 2 ── */}
      {mode === "phase2" && (
        <div style={{ padding: "0 24px 40px" }}>
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 6 }}>
              <TffBadge variant="depends">Phase 2 — Not Yet Active</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.6 }}>
              Phase 2 adds automation, budget planning, and inventory tracking. Both the Retainer Basket and Upgrade Queue are fully functional now.
            </p>
          </TffCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PHASE2_FEATURES.map((f, i) => (
              <TffCard key={i}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", flexShrink: 0, marginTop: 3, letterSpacing: "0.08em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{f.title}</div>
                    <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              </TffCard>
            ))}
          </div>
        </div>
      )}

      {/* Storage note */}
      <div style={{ padding: "0 24px 32px" }}>
        <p className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.08em" }}>
          {syncStatus === "synced" || syncStatus === "syncing"
            ? "CHECKMARKS AND CUSTOM ITEMS SYNC TO CLOUD · LOCALSTORAGE FALLBACK ACTIVE"
            : "CHECKMARKS AND CUSTOM ITEMS STORED IN BROWSER LOCALSTORAGE"}
        </p>
      </div>
    </div>
  )
}
