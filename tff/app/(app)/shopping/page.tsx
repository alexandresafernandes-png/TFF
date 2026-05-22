"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/tff/PageHeader"
import { TffCard } from "@/components/tff/TffCard"
import { TffBadge } from "@/components/tff/TffBadge"
import { SectionHeader } from "@/components/tff/SectionHeader"

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
  // Protein Sources
  { id: "eggs", name: "Eggs", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Complete amino acid profile, choline, fat-soluble vitamins.", note: "Buy 12–18/week. Pasture-raised preferred for better omega-3 ratio." },
  { id: "ground_beef", name: "Ground Beef / Steak", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Red meat for zinc, iron, creatine, B12, and saturated fat.", note: "~1 kg/week. 80/20 ground works well for batch cooking. Grass-fed where cost allows." },
  { id: "chicken", name: "Chicken (Breast / Thighs)", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Lean, versatile protein. Thighs add fat and cook without drying out.", note: "Batch on Sunday. Works in rice bowls, stir-fry, soups. Freeze half for mid-week." },
  { id: "salmon", name: "Salmon / Oily Fish", category: "Protein Sources", priority: "Core", frequency: "Weekly", purpose: "Omega-3 EPA/DHA alongside protein. Reduces reliance on supplements.", note: "2+ servings/week. Frozen fillets are cost-effective and just as nutritious." },
  { id: "greek_yogurt", name: "Greek Yogurt", category: "Protein Sources", priority: "Useful", frequency: "Weekly", purpose: "Protein + probiotics. Slow-digesting casein for satiety.", note: "Full-fat preferred. Use as a sauce base or with fruit for breakfast." },
  { id: "cottage_cheese", name: "Cottage Cheese", category: "Protein Sources", priority: "Useful", frequency: "Weekly", purpose: "Slow-digest casein — useful pre-bed protein option.", note: "Pair with fruit or use in cooked dishes. Try if Greek yogurt is getting repetitive." },
  { id: "canned_fish", name: "Canned Tuna / Sardines", category: "Protein Sources", priority: "Useful", frequency: "As needed", purpose: "Shelf-stable backup protein. Sardines have higher omega-3 than tuna.", note: "Keep 6–8 cans stocked as fallback. Water-packed tuna or olive-oil sardines." },
  { id: "whey_protein", name: "Whey Protein", category: "Protein Sources", priority: "Optional", frequency: "Monthly", purpose: "Convenience top-up for high-demand days or missed meals.", note: "Not a food replacement. Use when whole-food targets are hard to hit on schedule." },
  // Carb Sources
  { id: "white_rice", name: "White Rice", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Clean, easy-to-digest carb. Low fibre means rapid gastric emptying — good post-training.", note: "Buy 2–5 kg bags. Rice cooker makes batch prep near-zero effort." },
  { id: "potatoes", name: "Potatoes / Sweet Potatoes", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Dense carb + potassium + vitamin C. One of the most satiating foods.", note: "Batch-bake on Sunday. White potato ranks highest on satiety index." },
  { id: "oats", name: "Oats (Rolled / Steel Cut)", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Slow-release carb, beta-glucan fibre, iron.", note: "Overnight oats save morning time. Bulk bags cut cost significantly." },
  { id: "fruit", name: "Fruit (Varied)", category: "Carb Sources", priority: "Core", frequency: "Weekly", purpose: "Micronutrients, natural fructose, fibre, polyphenols.", note: "Bananas pre-workout. Berries for antioxidants. Rotate seasonally." },
  { id: "bread", name: "Sourdough / Quality Bread", category: "Carb Sources", priority: "Useful", frequency: "Weekly", purpose: "Practical carb vehicle. Sourdough fermentation improves digestion profile.", note: "Freeze half the loaf to prevent waste. Avoid mass-produced white bread." },
  { id: "honey", name: "Honey", category: "Carb Sources", priority: "Optional", frequency: "Monthly", purpose: "Quick carb + trace antimicrobial compounds.", note: "Raw or Manuka preferred. Useful pre-training or for sweetening without refined sugar." },
  // Fats
  { id: "olive_oil", name: "Extra Virgin Olive Oil", category: "Fats", priority: "Core", frequency: "Monthly", purpose: "Monounsaturated fat + polyphenols. Primary cooking and dressing oil.", note: "Cold-pressed, dark bottle. Avoid for very high-heat cooking — use ghee or butter instead." },
  { id: "butter_ghee", name: "Butter / Ghee", category: "Fats", priority: "Useful", frequency: "Monthly", purpose: "High smoke point cooking fat. Fat-soluble vitamins A, D, K.", note: "Grass-fed where possible. Ghee is clarified — better for high heat and longer shelf life." },
  { id: "avocados", name: "Avocados", category: "Fats", priority: "Useful", frequency: "Weekly", purpose: "Monounsaturated fat + fibre + potassium + folate.", note: "Buy 3–4/week. Ripen on counter, refrigerate when ready. Mash into meals easily." },
  { id: "nuts", name: "Mixed Nuts", category: "Fats", priority: "Useful", frequency: "Monthly", purpose: "Portable fat + minerals — zinc, selenium, magnesium depending on variety.", note: "Unsalted, raw or dry-roasted. 2 Brazil nuts/day covers selenium. Avoid roasted-in-oil." },
  { id: "dark_chocolate", name: "Dark Chocolate (85%+)", category: "Fats", priority: "Optional", frequency: "Monthly", purpose: "Flavonoids + iron + fat. Mood and satiety with minimal sugar.", note: "2–3 squares/day. Bulk bars are better value than small ones." },
  // Vegetables & Micronutrients
  { id: "leafy_greens", name: "Leafy Greens (Spinach / Arugula)", category: "Vegetables & Micronutrients", priority: "Core", frequency: "Weekly", purpose: "Magnesium, folate, nitrates, vitamin K, iron.", note: "200–300g/week. Wilt into almost anything — eggs, rice, stir-fry, soups." },
  { id: "broccoli", name: "Broccoli / Cruciferous Veg", category: "Vegetables & Micronutrients", priority: "Core", frequency: "Weekly", purpose: "DIM, sulforaphane, fibre, vitamin C, folate. Supports oestrogen clearance.", note: "Fresh or frozen both work. Steam rather than boil to retain more nutrients." },
  { id: "garlic_onions", name: "Garlic & Onions", category: "Vegetables & Micronutrients", priority: "Core", frequency: "Weekly", purpose: "Allicin, quercetin, prebiotic fibre. Flavour base for most meals.", note: "Always keep stocked. Whole garlic heads last weeks. Mince a batch and store in fridge." },
  { id: "tomatoes", name: "Tomatoes (Fresh + Canned)", category: "Vegetables & Micronutrients", priority: "Useful", frequency: "Weekly", purpose: "Lycopene, potassium, vitamin C. Lycopene concentration increases when cooked.", note: "Keep both fresh and canned. Tinned tomatoes are a meal-prep staple." },
  { id: "frozen_veg", name: "Frozen Mixed Veg", category: "Vegetables & Micronutrients", priority: "Useful", frequency: "Monthly", purpose: "No-prep micronutrient volume. Convenient fallback when fresh runs low.", note: "Add to rice bowls, stews, scrambles without cutting or washing." },
  { id: "herbs", name: "Fresh Herbs / Ginger / Turmeric", category: "Vegetables & Micronutrients", priority: "Optional", frequency: "Weekly", purpose: "Micronutrients + polyphenols + anti-inflammatory compounds.", note: "Freeze ginger root and grate directly from frozen. Parsley, coriander, turmeric rotate well." },
  // Hydration & Minerals
  { id: "salt", name: "Sea Salt / Himalayan Salt", category: "Hydration & Minerals", priority: "Core", frequency: "Monthly", purpose: "Sodium + trace minerals for electrolyte balance and adrenal function.", note: "Season food to taste. Avoid heavily processed iodised table salt for daily use." },
  { id: "electrolyte_mix", name: "Electrolyte Mix", category: "Hydration & Minerals", priority: "Useful", frequency: "Monthly", purpose: "Sodium + potassium + magnesium replenishment on training and high-sweat days.", note: "Low-sugar options preferred. Use on training days or hot days rather than daily." },
  { id: "mineral_water", name: "Mineral Water", category: "Hydration & Minerals", priority: "Useful", frequency: "Weekly", purpose: "Trace minerals (silica, calcium, magnesium) beyond filtered or soft tap water.", note: "Optional if tap water is mineral-rich. Useful if you use heavy filtration at home." },
  { id: "lemon_lime", name: "Lemons / Limes", category: "Hydration & Minerals", priority: "Useful", frequency: "Weekly", purpose: "Citric acid, vitamin C, water flavouring without sweeteners.", note: "Squeeze into water, dressings, or meals. Lasts a week refrigerated." },
  // Supplements
  { id: "magnesium_glycinate", name: "Magnesium Glycinate", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Sleep quality, muscle relaxation, nervous system support.", note: "400mg elemental/day. Take 30–60 min pre-bed. Glycinate has best absorption and tolerance." },
  { id: "glycine", name: "Glycine", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Sleep depth + collagen precursor. Reduces core body temperature pre-sleep.", note: "3–5g pre-bed in water or tea. Slightly sweet — easy to take consistently." },
  { id: "creatine", name: "Creatine Monohydrate", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Strength, power output, neurological function, cellular energy (ATP).", note: "5g/day year-round. No loading phase needed. Timing doesn't matter. Creapure grade preferred." },
  { id: "omega3", name: "Omega-3 Fish Oil", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "EPA/DHA for inflammation resolution, cardiovascular health, brain function.", note: "2–3g combined EPA/DHA daily. Refrigerate after opening to slow oxidation." },
  { id: "vit_d3_k2", name: "Vitamin D3 + K2 (MK-7)", category: "Supplements", priority: "Core", frequency: "Monthly", purpose: "Essential with limited sun exposure. Immune, hormonal, and bone function.", note: "3000–5000 IU D3 + 100mcg K2. Take with a fat-containing meal for absorption." },
  { id: "zinc", name: "Zinc", category: "Supplements", priority: "Useful", frequency: "Monthly", purpose: "Testosterone synthesis, immune function, sleep quality.", note: "15–30mg before bed. Separate from calcium. Monitor copper status if dosing high long-term." },
  { id: "taurine", name: "Taurine", category: "Supplements", priority: "Useful", frequency: "Monthly", purpose: "Intracellular hydration, mitochondrial function, heart rhythm, anxiety modulation.", note: "1–2g/day with water. Low risk, wide benefit profile. Cheap per dose." },
  { id: "kestose", name: "Kestose / Prebiotic Fibre", category: "Supplements", priority: "Optional", frequency: "Monthly", purpose: "Gut microbiome support — selectively feeds Bifidobacteria.", note: "2–5g/day. Start low to reduce gas. Mix into food or drinks." },
  // Kitchen Basics
  { id: "meal_prep_containers", name: "Meal Prep Containers (Glass)", category: "Kitchen Basics", priority: "Core", frequency: "As needed", purpose: "Batch cooking and storage without plastic leaching into food.", note: "Uniform sizes stack better. 1L containers cover most portions. Locking lids for transport." },
  { id: "parchment_paper", name: "Parchment Paper", category: "Kitchen Basics", priority: "Useful", frequency: "Monthly", purpose: "Non-stick baking without added fats. Easy cleanup for oven cooking.", note: "Unbleached preferred. Buy in 30m rolls — much cheaper per use." },
  { id: "paper_towels", name: "Paper Towels", category: "Kitchen Basics", priority: "Useful", frequency: "Weekly", purpose: "Kitchen hygiene, surface drying, fat-draining cooked meat.", note: "Stock 4–6 rolls at a time. Bamboo rolls last longer per sheet." },
  { id: "freezer_bags", name: "Freezer Bags / Silicone Bags", category: "Kitchen Basics", priority: "Useful", frequency: "Monthly", purpose: "Portioning and freezer storage for batch-cooked proteins and grains.", note: "Reusable silicone bags are the better long-term option. Stock a box of each." },
]

const UPGRADE_ITEMS: UpgradeItem[] = [
  // Sleep Environment
  { id: "blackout_curtains", name: "Blackout Curtains", category: "Sleep Environment", priority: "Core Upgrade", cost: "€€", purpose: "Blocks morning light that triggers early cortisol rise and waking.", why: "Even dim morning light can shift sleep timing forward over time, reducing sleep duration.", buyingNote: "Blackout lining added to existing curtains is cheaper than replacing. Check for light gaps at edges." },
  { id: "sleep_mask", name: "Sleep Mask (Contoured)", category: "Sleep Environment", priority: "Core Upgrade", cost: "€", purpose: "Immediate blackout — no installation, travels well.", why: "Retinal light exposure suppresses melatonin even through closed eyelids in sensitive individuals.", buyingNote: "Contoured silk or memory foam masks avoid pressure on eyes. Avoid flat fabric ones." },
  { id: "earplugs", name: "Earplugs", category: "Sleep Environment", priority: "Core Upgrade", cost: "€", purpose: "Blocks ambient noise that fragments sleep without fully waking you.", why: "Noise causes micro-arousals that reduce deep sleep percentage even if you don't recall waking.", buyingNote: "Experiment with foam and wax types. Mack's wax earplugs are comfortable for side sleepers." },
  { id: "white_noise", name: "White Noise / Sound Machine", category: "Sleep Environment", priority: "Useful Upgrade", cost: "€€", purpose: "Consistent masking sound that smooths out variable noise spikes.", why: "Silence is not optimal — consistent sound masks variable noise that causes arousals.", buyingNote: "Dedicated physical device beats a phone app: no screen glow, no notifications." },
  // Air & Light
  { id: "air_purifier", name: "Air Purifier (HEPA + Carbon)", category: "Air & Light", priority: "Core Upgrade", cost: "€€", purpose: "Removes fine particulates, VOCs, dust, and allergens from bedroom air during sleep.", why: "Indoor air is often 2–5× more polluted than outdoor. Poor air quality measurably degrades recovery.", buyingNote: "HEPA + activated carbon filter. Size for room volume. Run during sleep on low/medium." },
  { id: "sunrise_alarm", name: "Sunrise Alarm Clock", category: "Air & Light", priority: "Useful Upgrade", cost: "€€", purpose: "Gradual light wake mimics dawn — lower cortisol spike than jarring audio alarm.", why: "Light-based waking aligns with circadian biology. Pairs best with blackout curtains so dawn comes on your schedule.", buyingNote: "Philips Wake-Up Light is well-validated. Check bulb color temperature (aim for warm sunrise colours)." },
  { id: "warm_bulbs", name: "Warm / Red Evening Bulbs", category: "Air & Light", priority: "Useful Upgrade", cost: "€", purpose: "Reduces blue-light exposure in the 2–3 hours before bed without requiring glasses.", why: "Blue light (~470nm) most strongly suppresses melatonin. Warm amber (<2200K) is much safer.", buyingNote: "Swap bedroom and living room bulbs. Smart bulbs can auto-schedule warm mode after sunset." },
  { id: "co2_monitor", name: "CO2 / Air Quality Monitor", category: "Air & Light", priority: "Useful Upgrade", cost: "€€", purpose: "Tracks CO2 and VOC levels — high CO2 is associated with worse sleep quality.", why: "Bedroom CO2 above ~1000ppm may impair sleep quality and next-day cognition.", buyingNote: "Aranet4 is considered reliable. Open a window slightly if CO2 rises above 800ppm during sleep." },
  // Bedroom / Bedding
  { id: "quality_sheets", name: "High-Quality Bedsheets", category: "Bedroom / Bedding", priority: "Core Upgrade", cost: "€€", purpose: "Temperature regulation and skin comfort during sleep.", why: "Synthetic or low-quality sheets trap heat and may reduce deep sleep time in warm environments.", buyingNote: "Percale cotton (200–300 thread count) or linen. Avoid microfibre. Wash before first use." },
  { id: "better_pillow", name: "Better Pillow", category: "Bedroom / Bedding", priority: "Core Upgrade", cost: "€€", purpose: "Cervical alignment during sleep reduces neck tension and nocturnal arousals.", why: "Wrong pillow height compresses the cervical spine causing micro-arousals and morning stiffness.", buyingNote: "Match loft to sleep position: side sleepers need higher, back/front sleepers lower. Try before buying." },
  { id: "weighted_blanket", name: "Weighted Blanket", category: "Bedroom / Bedding", priority: "Useful Upgrade", cost: "€€", purpose: "Deep pressure stimulation that may support sleep onset and reduce pre-sleep anxiety.", why: "Some individuals find deep pressure associated with lower pre-sleep tension. Not universal.", buyingNote: "7–12% of bodyweight. Try at a hotel or friend's first — some people dislike the constraint." },
  { id: "mattress_topper", name: "Mattress Topper", category: "Bedroom / Bedding", priority: "Later", cost: "€€€", purpose: "Improves a poor mattress without a full replacement.", why: "Sleep surface quality affects spinal alignment and sleep stage distribution.", buyingNote: "Defer to full mattress replacement when possible. Latex > memory foam for temperature neutrality." },
  // Kitchen Tools
  { id: "food_scale", name: "Food Scale (Digital, 0.1g)", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€", purpose: "Accurate portioning for macro tracking and recipe consistency.", why: "Volume measurements are unreliable. Weight is the only way to consistently hit targets.", buyingNote: "Any reliable 0.1g resolution, 5kg max digital scale works. Not an area to overspend." },
  { id: "water_bottle", name: "Glass / Stainless Water Bottle", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€", purpose: "Removes plastic BPA/phthalate exposure from daily hydration.", why: "Plastics leach compounds into liquids over time, especially with temperature changes.", buyingNote: "32oz stainless or glass. Wide mouth for easy cleaning. S'well, Hydro Flask, or basic stainless." },
  { id: "blender", name: "Blender", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€€", purpose: "Protein shakes, smoothies, sauces, soups — increases variety with near-zero prep time.", why: "Makes high-protein, high-vegetable meals fast enough to use on training days.", buyingNote: "600–800W mid-range is enough. Nutribullet or Ninja for single-serve. Don't need a Vitamix." },
  { id: "glass_containers", name: "Glass Meal Prep Containers (Set)", category: "Kitchen Tools", priority: "Core Upgrade", cost: "€", purpose: "Batch cooking and food storage without plastic leaching when reheated.", why: "Plastic containers leach BPA and phthalates when heated. Glass is inert and lasts years.", buyingNote: "Uniform sizes stack more efficiently. Locking lids required for transport." },
  { id: "slow_cooker", name: "Slow Cooker / Instant Pot", category: "Kitchen Tools", priority: "Useful Upgrade", cost: "€€", purpose: "Batch cooking with minimal active time. Reliable for proteins, grains, stews.", why: "Reduces weekly cooking effort significantly — increases long-term dietary adherence.", buyingNote: "Instant Pot combines pressure + slow cooker. 6L covers 2–4 meal portions per batch." },
  { id: "cast_iron", name: "Cast Iron Pan", category: "Kitchen Tools", priority: "Useful Upgrade", cost: "€€", purpose: "Durable high-heat cooking surface. Adds small amounts of dietary iron.", why: "Teflon pans degrade over time and release PFAS when scratched or overheated.", buyingNote: "Season before first use. Lodge 10\" or 12\" is reliable and cost-effective." },
  { id: "kitchen_timer", name: "Physical Kitchen Timer", category: "Kitchen Tools", priority: "Useful Upgrade", cost: "€", purpose: "Reduces screen time during cooking.", why: "Every phone pickup during meal prep becomes a potential distraction loop.", buyingNote: "Simple dial or digital. Any hardware kitchen timer works — not worth overthinking." },
  // Recovery Tools
  { id: "foam_roller", name: "Foam Roller", category: "Recovery Tools", priority: "Core Upgrade", cost: "€", purpose: "Myofascial release + pre-training mobility work.", why: "Reduces perceived muscle soreness and improves tissue quality when used consistently.", buyingNote: "Medium density. 45cm length is versatile. High-density for experienced users." },
  { id: "massage_ball", name: "Massage Ball / Lacrosse Ball", category: "Recovery Tools", priority: "Core Upgrade", cost: "€", purpose: "Targeted trigger point work on glutes, feet, upper back, pecs.", why: "A foam roller cannot reach specific spots. A ball allows precise pressure where you need it.", buyingNote: "Lacrosse ball is best bang for buck. Get two — one for feet, one for soft tissue." },
  { id: "resistance_bands", name: "Resistance Bands Set", category: "Recovery Tools", priority: "Useful Upgrade", cost: "€", purpose: "Mobility warm-ups, activation work, travel-friendly training.", why: "Banded activation reduces injury risk in lower body training and improves hip function.", buyingNote: "Loop bands for glute activation + long bands for shoulder mobility. Fabric bands are more durable." },
  { id: "cold_hot_pack", name: "Cold / Hot Pack (Dual Use)", category: "Recovery Tools", priority: "Useful Upgrade", cost: "€", purpose: "Acute inflammation management and heat therapy for chronic tightness.", why: "Cold reduces acute swelling; heat improves local blood flow for chronic muscle tension.", buyingNote: "A gel pack that works frozen and microwaved. Keep one in the freezer." },
  { id: "pullup_bar", name: "Doorframe Pull-Up Bar", category: "Recovery Tools", priority: "Useful Upgrade", cost: "€", purpose: "Decompression hangs + bodyweight pulling volume without a gym.", why: "Passive hanging decompresses the spine and improves shoulder mobility with minimal time.", buyingNote: "No-screw doorframe versions work in most standard frames. Verify weight rating." },
  // Training Gear
  { id: "training_shoes", name: "Flat-Sole Training Shoes", category: "Training Gear", priority: "Core Upgrade", cost: "€€", purpose: "Stable base for squats, deadlifts, and hinge patterns.", why: "Running shoes with cushioned heels introduce forward lean and reduce force transfer in compound lifts.", buyingNote: "Converse All-Star, Nike Metcon, or Adidas Powerlift. Flat sole is the requirement — brand is preference." },
  { id: "gym_belt", name: "Weightlifting Belt (Leather)", category: "Training Gear", priority: "Useful Upgrade", cost: "€€", purpose: "Intra-abdominal pressure support for heavy compound sets.", why: "A belt cues better bracing technique. Appropriate for 80%+ effort sets — not warm-ups.", buyingNote: "10mm single-prong leather for longevity. Velcro loses tension over time. Measure waist, not trouser size." },
  { id: "lifting_straps", name: "Lifting Straps", category: "Training Gear", priority: "Useful Upgrade", cost: "€", purpose: "Grip support for high-volume pulling when grip fatigues before target muscles.", why: "Removes grip as the limiting factor on back work, enabling higher total pulling volume.", buyingNote: "Basic cotton straps are fine. Lasso or figure-8 style both work — try both." },
  { id: "jump_rope", name: "Speed Jump Rope", category: "Training Gear", priority: "Useful Upgrade", cost: "€", purpose: "Conditioning, coordination, and low-equipment warm-up.", why: "Effective in 5–10 min bouts before training or as active rest between strength sets.", buyingNote: "Aluminium handles with steel cable. Any basic speed rope works — no need for a premium brand." },
  // Wearables / Tracking
  { id: "sleep_tracker", name: "Sleep Tracker (Oura / Whoop)", category: "Wearables / Tracking", priority: "Later", cost: "€€€", purpose: "HRV tracking, sleep staging, readiness scoring.", why: "High-signal data when trended over weeks — not for day-to-day decisions. Phase 1 can proceed without it.", buyingNote: "Oura ring is less intrusive. Whoop requires subscription. Build habits first, then add tracking." },
  { id: "smart_scale", name: "Smart Scale (Body Composition)", category: "Wearables / Tracking", priority: "Useful Upgrade", cost: "€€", purpose: "Body composition trends over time: weight, estimated fat%, muscle mass.", why: "BIA is not highly accurate but weekly trends are directionally useful for tracking progress.", buyingNote: "Withings Body+ or Renpho. Measure same time every morning after waking for consistency." },
  { id: "hr_monitor", name: "Chest Strap Heart Rate Monitor", category: "Wearables / Tracking", priority: "Useful Upgrade", cost: "€€", purpose: "Accurate HR zone tracking during cardio and conditioning work.", why: "Wrist-based HR is unreliable during exercise due to motion. Chest strap is near-ECG accuracy.", buyingNote: "Polar H10 pairs with most apps and devices. Long battery life. One-time buy." },
  // Workstation / Focus
  { id: "blue_light_glasses", name: "Blue Light Glasses (Amber Tint)", category: "Workstation / Focus", priority: "Useful Upgrade", cost: "€", purpose: "Reduces blue-light exposure during evening screen use.", why: "Amber-tinted lenses filter the wavelengths most associated with melatonin suppression.", buyingNote: "Amber tint required — not the lightly-tinted 'clear' versions. Uvex Bikers are well-reviewed and cheap." },
  { id: "ergonomic_cushion", name: "Lumbar / Ergonomic Cushion", category: "Workstation / Focus", priority: "Useful Upgrade", cost: "€€", purpose: "Improves sitting posture and reduces lower back load during long sessions.", why: "Poor sitting posture compresses discs and creates anterior hip tilt over time.", buyingNote: "Lumbar roll or coccyx cushion for existing chair. Inexpensive — no need for premium brand." },
  { id: "focus_timer", name: "Physical Focus Timer", category: "Workstation / Focus", priority: "Useful Upgrade", cost: "€", purpose: "Time-blocks deep work without triggering phone distraction.", why: "Visual time-boxing improves session length and completion rate without a screen.", buyingNote: "Time Timer, Time Cube, or any mechanical countdown. Analog keeps you phone-free." },
  { id: "standing_desk", name: "Standing Desk Converter", category: "Workstation / Focus", priority: "Later", cost: "€€€", purpose: "Alternating sit/stand posture reduces sedentary load during work hours.", why: "Prolonged sitting may be associated with metabolic and cardiovascular markers independent of exercise.", buyingNote: "Measure desk depth and monitor height before ordering. Full electric desk is better than a converter long-term." },
  // Optional Luxury Upgrades
  { id: "infrared_sauna", name: "Infrared Sauna (Personal)", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Heat stress, cardiovascular conditioning, relaxation.", why: "Regular sauna use (4+/week) can be associated with cardiovascular and longevity markers in observational data.", buyingNote: "1-person far-infrared unit. High ROI if used consistently. Requires dedicated space and power circuit." },
  { id: "cold_plunge", name: "Cold Plunge / Ice Bath", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Cold adaptation, recovery, mood, norepinephrine protocols.", why: "Cold exposure may significantly increase norepinephrine and dopamine. Timing and protocol matter.", buyingNote: "Try cold shower protocols consistently first before investing. Confirm you'll actually use it." },
  { id: "red_light_panel", name: "Red Light / Infrared Panel", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Photobiomodulation: mitochondrial stimulation, skin, muscle recovery.", why: "630–850nm wavelengths have emerging evidence for tissue and mitochondrial function.", buyingNote: "Research irradiance output before buying — varies widely by brand. Protocols matter more than wattage labels." },
  { id: "quality_mattress", name: "High-End Mattress", category: "Optional Luxury Upgrades", priority: "Luxury", cost: "€€€", purpose: "Foundation of sleep quality. Surface pressure affects sleep staging and spinal alignment.", why: "Sleep occupies 1/3 of life. A poor mattress has compounding negative effects year over year.", buyingNote: "Latex hybrid or quality pocket spring. 7–10 year investment. Try in store if possible — firmness is personal." },
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
  { title: "Dashboard Shopping Card", desc: "A live shopping widget on the dashboard showing what you need to buy this week." },
]

const LS_RETAINER = "tff_retainer_checked"
const LS_UPGRADE = "tff_upgrade_status"

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
}: {
  item: RetainerItem
  checked: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)

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
            {checked && (
              <span style={{ fontSize: 10, color: "var(--bg)", lineHeight: 1, fontWeight: 700 }}>✓</span>
            )}
          </div>
        </button>

        {/* Expand row */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            padding: "12px 14px",
            cursor: "pointer",
            textAlign: "left",
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
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              <TffBadge variant={RETAINER_PRIORITY_VARIANT[item.priority]}>{item.priority}</TffBadge>
              <span
                className="mono"
                style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.06em" }}
              >
                {item.frequency.toUpperCase()}
              </span>
            </div>
          </div>
          <span style={{ color: "var(--text-4)", fontSize: 11, flexShrink: 0 }}>
            {open ? "▲" : "▼"}
          </span>
        </button>
      </div>

      {open && (
        <div style={{ padding: "10px 16px 14px", borderTop: "1px solid var(--border-soft)" }}>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", margin: "0 0 6px", lineHeight: 1.6 }}>
            {item.purpose}
          </p>
          <p style={{ fontSize: "var(--t-small)", color: "var(--text-4)", margin: 0, lineHeight: 1.5 }}>
            {item.note}
          </p>
        </div>
      )}
    </TffCard>
  )
}

function UpgradeCard({
  item,
  status,
  onStatusChange,
}: {
  item: UpgradeItem
  status: "none" | "planned" | "bought"
  onStatusChange: (s: "none" | "planned" | "bought") => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <TffCard style={{ marginBottom: 8, padding: 0, opacity: status === "bought" ? 0.65 : 1 }}>
      {/* Name row */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "12px 14px",
          cursor: "pointer",
          textAlign: "left",
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
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <TffBadge variant={UPGRADE_PRIORITY_VARIANT[item.priority]}>{item.priority}</TffBadge>
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--text-3)",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              {item.cost}
            </span>
          </div>
        </div>
        <span style={{ color: "var(--text-4)", fontSize: 11, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Status buttons row */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "8px 14px 10px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <button
          onClick={() => onStatusChange(status === "planned" ? "none" : "planned")}
          className="mono"
          style={{
            padding: "4px 10px",
            fontSize: 9,
            letterSpacing: "0.08em",
            border: "1px solid",
            borderColor: status === "planned" ? "var(--accent)" : "var(--border)",
            background: status === "planned" ? "var(--accent)" : "transparent",
            color: status === "planned" ? "var(--bg)" : "var(--text-4)",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          PLANNED
        </button>
        <button
          onClick={() => onStatusChange(status === "bought" ? "none" : "bought")}
          className="mono"
          style={{
            padding: "4px 10px",
            fontSize: 9,
            letterSpacing: "0.08em",
            border: "1px solid",
            borderColor: status === "bought" ? "var(--accent)" : "var(--border)",
            background: status === "bought" ? "var(--accent)" : "transparent",
            color: status === "bought" ? "var(--bg)" : "var(--text-4)",
            borderRadius: 3,
            cursor: "pointer",
          }}
        >
          BOUGHT
        </button>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid var(--border-soft)" }}>
          <div style={{ marginTop: 12, marginBottom: 10 }}>
            <div
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
            >
              PURPOSE
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-2)", margin: 0, lineHeight: 1.6 }}>
              {item.purpose}
            </p>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
            >
              WHY IT MATTERS
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              {item.why}
            </p>
          </div>
          <div>
            <div
              className="mono"
              style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em", marginBottom: 4 }}
            >
              BUYING NOTE
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              {item.buyingNote}
            </p>
          </div>
        </div>
      )}
    </TffCard>
  )
}

export default function ShoppingPage() {
  const [mode, setMode] = useState<Mode>("basket")
  const [retainerChecked, setRetainerChecked] = useState<Set<string>>(new Set())
  const [upgradeStatus, setUpgradeStatus] = useState<Record<string, "planned" | "bought">>({})
  const [loaded, setLoaded] = useState(false)

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

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_RETAINER)
      if (raw) setRetainerChecked(new Set(JSON.parse(raw) as string[]))
      const raw2 = localStorage.getItem(LS_UPGRADE)
      if (raw2) setUpgradeStatus(JSON.parse(raw2) as Record<string, "planned" | "bought">)
    } catch {}
    setLoaded(true)
  }, [])

  // Persist retainer
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_RETAINER, JSON.stringify([...retainerChecked]))
  }, [retainerChecked, loaded])

  // Persist upgrade
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(LS_UPGRADE, JSON.stringify(upgradeStatus))
  }, [upgradeStatus, loaded])

  const toggleRetainer = (id: string) => {
    setRetainerChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setUpgrade = (id: string, s: "none" | "planned" | "bought") => {
    setUpgradeStatus((prev) => {
      const next = { ...prev }
      if (s === "none") delete next[id]
      else next[id] = s
      return next
    })
  }

  // Basket filtering
  const bIsFiltering = bSearch.trim() !== "" || bCategory !== "all" || bPriority !== "all" || bFrequency !== "all"

  const filteredBasket = useMemo(() => {
    return RETAINER_ITEMS.filter((item) => {
      const q = bSearch.toLowerCase()
      const matchSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      const matchCat = bCategory === "all" || item.category === bCategory
      const matchPri = bPriority === "all" || (item.priority as string) === bPriority
      const matchFreq = bFrequency === "all" || (item.frequency as string) === bFrequency
      return matchSearch && matchCat && matchPri && matchFreq
    })
  }, [bSearch, bCategory, bPriority, bFrequency])

  const groupedBasket = useMemo(() => {
    if (bIsFiltering) return null
    const map: Record<string, RetainerItem[]> = {}
    for (const cat of RETAINER_CATEGORIES) map[cat] = []
    for (const item of RETAINER_ITEMS) {
      if (map[item.category]) map[item.category].push(item)
    }
    return map
  }, [bIsFiltering])

  // Queue filtering
  const qIsFiltering = qSearch.trim() !== "" || qCategory !== "all" || qPriority !== "all" || qCost !== "all"

  const filteredQueue = useMemo(() => {
    return UPGRADE_ITEMS.filter((item) => {
      const q = qSearch.toLowerCase()
      const matchSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      const matchCat = qCategory === "all" || item.category === qCategory
      const matchPri = qPriority === "all" || (item.priority as string) === qPriority
      const matchCost = qCost === "all" || (item.cost as string) === qCost
      return matchSearch && matchCat && matchPri && matchCost
    })
  }, [qSearch, qCategory, qPriority, qCost])

  const groupedQueue = useMemo(() => {
    if (qIsFiltering) return null
    const map: Record<string, UpgradeItem[]> = {}
    for (const cat of UPGRADE_CATEGORIES) map[cat] = []
    for (const item of UPGRADE_ITEMS) {
      if (map[item.category]) map[item.category].push(item)
    }
    return map
  }, [qIsFiltering])

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

  const selectStyle = {
    padding: "8px 10px",
    fontSize: "var(--t-small)",
    background: "var(--panel-2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text)",
  } as const

  return (
    <div>
      <PageHeader
        crumb="INDEX · 08 / SHOPPING"
        title="Shopping"
        subtitle="Retainer basket for recurring buys. Upgrade queue for one-off investments."
      />

      {/* Mode tabs */}
      <div style={{ padding: "0 24px 20px" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
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
        </div>
      </div>

      {/* ── RETAINER BASKET ── */}
      {mode === "basket" && (
        <div style={{ padding: "0 24px 40px" }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard value={RETAINER_ITEMS.length} label="TOTAL ITEMS" />
            <StatCard value={coreBasketCount} label="CORE ITEMS" />
            <StatCard value={checkedCount} label="CHECKED" />
          </div>

          {/* Start Here card */}
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>
                Start Here Basket
              </span>
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
              style={{
                flex: "1 1 160px",
                padding: "8px 12px",
                fontSize: "var(--t-small)",
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text)",
                outline: "none",
              }}
            />
            <select value={bCategory} onChange={(e) => setBCategory(e.target.value)} style={selectStyle}>
              <option value="all">All Categories</option>
              {RETAINER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={bPriority} onChange={(e) => setBPriority(e.target.value)} style={selectStyle}>
              <option value="all">All Priorities</option>
              <option value="Core">Core</option>
              <option value="Useful">Useful</option>
              <option value="Optional">Optional</option>
            </select>
            <select value={bFrequency} onChange={(e) => setBFrequency(e.target.value)} style={selectStyle}>
              <option value="all">All Frequencies</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="As needed">As needed</option>
            </select>
            {bIsFiltering && (
              <button
                onClick={() => { setBSearch(""); setBCategory("all"); setBPriority("all"); setBFrequency("all") }}
                className="mono"
                style={{ padding: "8px 12px", fontSize: 10, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Reset + count row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            {bIsFiltering ? (
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                {filteredBasket.length} ITEM{filteredBasket.length !== 1 ? "S" : ""} FOUND
              </span>
            ) : (
              <span />
            )}
            <button
              onClick={() => setRetainerChecked(new Set())}
              className="mono"
              style={{ padding: "5px 12px", fontSize: 9, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
            >
              RESET CHECKMARKS
            </button>
          </div>

          {/* Flat or grouped */}
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
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                        {doneCount}/{items.length}
                      </span>
                    </div>
                  </SectionHeader>
                  {items.map((item) => (
                    <RetainerCard
                      key={item.id}
                      item={item}
                      checked={retainerChecked.has(item.id)}
                      onToggle={() => toggleRetainer(item.id)}
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
          {/* Stats */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard value={UPGRADE_ITEMS.length} label="TOTAL UPGRADES" />
            <StatCard value={coreUpgradeCount} label="CORE UPGRADES" />
            <StatCard value={plannedCount} label="PLANNED" />
            <StatCard value={boughtCount} label="BOUGHT" />
          </div>

          {/* First Upgrades card */}
          <TffCard style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)" }}>
                First Upgrades
              </span>
              <TffBadge variant="core">Start Here</TffBadge>
            </div>
            <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: "0 0 12px", lineHeight: 1.6 }}>
              When extra money appears, buy in this order.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FIRST_UPGRADES.map((u, i) => (
                <div key={u.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className="mono"
                    style={{ fontSize: 9, color: "var(--text-4)", flexShrink: 0, letterSpacing: "0.08em", width: 18 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "var(--t-small)", color: "var(--text-2)", flex: 1 }}>
                    {u.text}
                  </span>
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
              style={{
                flex: "1 1 160px",
                padding: "8px 12px",
                fontSize: "var(--t-small)",
                background: "var(--panel-2)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                color: "var(--text)",
                outline: "none",
              }}
            />
            <select value={qCategory} onChange={(e) => setQCategory(e.target.value)} style={selectStyle}>
              <option value="all">All Categories</option>
              {UPGRADE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={qPriority} onChange={(e) => setQPriority(e.target.value)} style={selectStyle}>
              <option value="all">All Priorities</option>
              <option value="Core Upgrade">Core Upgrade</option>
              <option value="Useful Upgrade">Useful Upgrade</option>
              <option value="Luxury">Luxury</option>
              <option value="Later">Later</option>
            </select>
            <select value={qCost} onChange={(e) => setQCost(e.target.value)} style={selectStyle}>
              <option value="all">All Cost Tiers</option>
              <option value="€">€ — Budget</option>
              <option value="€€">€€ — Mid</option>
              <option value="€€€">€€€ — Investment</option>
            </select>
            {qIsFiltering && (
              <button
                onClick={() => { setQSearch(""); setQCategory("all"); setQPriority("all"); setQCost("all") }}
                className="mono"
                style={{ padding: "8px 12px", fontSize: 10, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Reset + count row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            {qIsFiltering ? (
              <span className="mono" style={{ fontSize: 9, color: "var(--text-4)", letterSpacing: "0.1em" }}>
                {filteredQueue.length} UPGRADE{filteredQueue.length !== 1 ? "S" : ""} FOUND
              </span>
            ) : (
              <span />
            )}
            <button
              onClick={() => setUpgradeStatus({})}
              className="mono"
              style={{ padding: "5px 12px", fontSize: 9, letterSpacing: "0.08em", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-4)", cursor: "pointer" }}
            >
              RESET UPGRADE STATUS
            </button>
          </div>

          {/* Flat or grouped */}
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
                      <span className="mono" style={{ fontSize: 9, color: "var(--text-4)" }}>
                        {boughtInCat}/{items.length} BOUGHT
                      </span>
                    </div>
                  </SectionHeader>
                  {items.map((item) => (
                    <UpgradeCard
                      key={item.id}
                      item={item}
                      status={upgradeStatus[item.id] ?? "none"}
                      onStatusChange={(s) => setUpgrade(item.id, s)}
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
                  <span
                    className="mono"
                    style={{ fontSize: 9, color: "var(--text-4)", flexShrink: 0, marginTop: 3, letterSpacing: "0.08em" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--t-base)", fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                      {f.title}
                    </div>
                    <p style={{ fontSize: "var(--t-small)", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </TffCard>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
