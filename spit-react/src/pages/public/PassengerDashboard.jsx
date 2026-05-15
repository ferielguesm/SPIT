import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PassengerAPI, PostAPI } from '../../api';

// â”€â”€ Real Tunisia destination data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DESTINATION_GUIDES = {
  'Tunis': {
    emoji: 'ðŸ™ï¸',
    tagline: 'The vibrant capital â€” where ancient medina meets modern boulevards',
    mustEat: [
      { name: 'Lablabi', where: 'CafÃ© Halfaouine, Medina', desc: 'Chickpea soup with harissa, olive oil and a poached egg â€” the ultimate Tunisian breakfast', price: '2â€“4 TND' },
      { name: 'Brik Ã  l\'oeuf', where: 'Rue de la Kasbah stalls', desc: 'Crispy pastry filled with egg, tuna and capers. Eat it in one bite!', price: '1.5â€“3 TND' },
      { name: 'Makroudh', where: 'PÃ¢tisserie Nabeul, Avenue Habib Bourguiba', desc: 'Semolina pastry stuffed with dates and fried in honey', price: '0.5 TND each' },
    ],
    mustSee: [
      { name: 'Medina of Tunis', type: 'UNESCO Heritage', desc: 'One of the Arab world\'s finest medieval cities. Explore the Zitouna Mosque, souks of gold, perfume and cloth.', hours: 'Open daily 8:00â€“18:00', entry: 'Free' },
      { name: 'Bardo National Museum', type: 'Museum', desc: 'World\'s largest collection of Roman mosaics. Absolutely unmissable.', hours: 'Tueâ€“Sun 9:00â€“17:00', entry: '11 TND' },
      { name: 'Sidi Bou Said', type: 'Village', desc: '20 min from Tunis â€” iconic blue-and-white village with sea views and jasmine-scented alleys.', hours: 'Open 24/7', entry: 'Free' },
    ],
    transport: 'Metro Line 1 covers the city center. Taxis are metered â€” insist on the meter. Louages (shared taxis) to suburbs.',
    tips: ['Bargain in the souks â€” start at 40% of asking price', 'Friday afternoons most shops close', 'Dress modestly in the Medina', 'Best coffee: CafÃ© de Paris on Avenue Bourguiba'],
    weather: 'Mediterranean â€” hot dry summers (35Â°C), mild winters (12Â°C)',
    currency: '1 EUR â‰ˆ 3.3 TND Â· ATMs widely available on Avenue Bourguiba',
  },
  'Djerba': {
    emoji: 'ðŸŒŠ',
    tagline: 'The Island of Dreams â€” beaches, flamingos and 3,000 years of history',
    mustEat: [
      { name: 'Poisson grillÃ©', where: 'Restaurant du Port, Houmt Souk', desc: 'Freshly grilled sea bream with chermoula sauce and Djerbian salad', price: '15â€“25 TND' },
      { name: 'Ojja aux crevettes', where: 'La Mamma, Midoun', desc: 'Spicy tomato and egg stew with giant prawns â€” a Djerbian specialty', price: '12â€“18 TND' },
      { name: 'Asida', where: 'Local homes & Houmt Souk market', desc: 'Sweet semolina porridge with butter and honey â€” traditional breakfast', price: '3â€“5 TND' },
    ],
    mustSee: [
      { name: 'El Ghriba Synagogue', type: 'Religious Site', desc: 'One of Africa\'s oldest synagogues, over 2,500 years old. Stunning blue-and-white interior.', hours: 'Monâ€“Fri 8:00â€“18:00', entry: '5 TND' },
      { name: 'Houmt Souk', type: 'Market Town', desc: 'The island\'s capital â€” labyrinthine souks, fondouks (caravanserais) and the Borj el Kebir fortress.', hours: 'Daily 8:00â€“20:00', entry: 'Free' },
      { name: 'Flamingo Lagoon (Sebkhet el Amel)', type: 'Nature', desc: 'Thousands of pink flamingos gather here from October to March. Rent a bike to reach it.', hours: 'Open 24/7', entry: 'Free' },
    ],
    transport: 'Rent a bicycle or scooter â€” the island is flat and perfect for cycling. Yellow taxis available in Houmt Souk.',
    tips: ['Visit El Ghriba during the annual pilgrimage (May) for a unique experience', 'Best beaches: Sidi Mahrez and Aghir', 'Buy local pottery and woven baskets in Midoun market', 'Swim with sea turtles at Borj el Kastil'],
    weather: 'Sunny 300 days/year. Sea swimming: Mayâ€“October. Winter mild at 15Â°C.',
    currency: 'Most hotels accept cards. Carry cash for markets and small restaurants.',
  },
  'Hammamet': {
    emoji: 'ðŸ–ï¸',
    tagline: 'Tunisia\'s premier beach resort â€” jasmine gardens and turquoise waters',
    mustEat: [
      { name: 'Grilled Octopus', where: 'Restaurant Barberousse, Old Medina', desc: 'Tender octopus grilled over charcoal with lemon and harissa', price: '18â€“28 TND' },
      { name: 'Salade MÃ©chouia', where: 'Any local restaurant', desc: 'Roasted pepper and tomato salad with tuna and olive oil â€” the perfect starter', price: '4â€“7 TND' },
      { name: 'Bambalouni', where: 'Beach vendors', desc: 'Hot fried doughnuts dusted with sugar â€” the ultimate beach snack', price: '1 TND' },
    ],
    mustSee: [
      { name: 'Hammamet Medina & Kasbah', type: 'Historic Site', desc: 'Compact 15th-century medina with whitewashed walls, a kasbah with sea views, and artisan shops.', hours: 'Daily 8:00â€“18:00', entry: '3 TND (kasbah)' },
      { name: 'Yasmine Hammamet', type: 'Resort Area', desc: 'Modern marina with restaurants, water parks (Carthageland, Aqua Palace) and a replica Medina.', hours: 'Varies by attraction', entry: 'Varies' },
      { name: 'Pupput Roman Site', type: 'Archaeology', desc: 'Ruins of a Roman town with mosaics and baths, right in the middle of the modern city.', hours: 'Tueâ€“Sun 9:00â€“17:00', entry: '5 TND' },
    ],
    transport: 'Louages to Tunis (1.5h, 7 TND). Local taxis for beach hopping. Bikes available to rent near the medina.',
    tips: ['North beach (near medina) is less crowded than south beach', 'Book water sports early in the morning', 'Evening stroll along the corniche is magical', 'Jasmine sellers outside the medina â€” buy a bracelet for 1 TND'],
    weather: 'Best: Juneâ€“September. Sea temp reaches 28Â°C in August.',
    currency: 'Resort hotels accept cards. Cash needed for medina and beach vendors.',
  },
  'Tozeur': {
    emoji: 'ðŸœï¸',
    tagline: 'Gateway to the Sahara â€” oases, Star Wars sets and endless golden dunes',
    mustEat: [
      { name: 'Couscous au Chameau', where: 'Restaurant du Soleil, Tozeur center', desc: 'Slow-cooked camel meat couscous with seven vegetables â€” a desert delicacy', price: '15â€“22 TND' },
      { name: 'Dattes Deglet Nour', where: 'Oasis market stalls', desc: 'The world\'s finest dates, grown in Tozeur\'s palm groves. Buy directly from farmers.', price: '8â€“15 TND/kg' },
      { name: 'Zrir', where: 'Local homes & CafÃ© Nomade', desc: 'Toasted sesame and honey paste â€” traditional Saharan energy food', price: '5â€“8 TND' },
    ],
    mustSee: [
      { name: 'Chott el Djerid', type: 'Natural Wonder', desc: 'Largest salt lake in the Sahara â€” shimmering mirages and surreal landscapes. Drive across the causeway at sunset.', hours: 'Open 24/7', entry: 'Free' },
      { name: 'Star Wars Filming Locations', type: 'Pop Culture', desc: 'Mos Espa set (Tatooine) and Sidi Bouhlel canyon used in Episodes I, IV and V. Guided tours available.', hours: 'Daily 8:00â€“18:00', entry: '10â€“15 TND (guided tour)' },
      { name: 'Tozeur Oasis (Chak Wak)', type: 'Nature', desc: '1,000-year-old palm grove with 400,000 trees. Walk the irrigation channels built by the Aghlabids.', hours: 'Daily 7:00â€“19:00', entry: '5 TND' },
    ],
    transport: 'Rent a 4x4 for dune excursions (from 80 TND/day). Camel treks from 30 TND/hour. Louages to Tunis (6h, 25 TND).',
    tips: ['Sunrise camel trek to the dunes is unmissable â€” book the night before', 'Bring a scarf for sand and sun protection', 'Best dunes: Ong Jemel (1h from Tozeur)', 'Visit in spring (Marchâ€“May) or autumn â€” summer is 45Â°C+'],
    weather: 'Desert climate. Spring/Autumn ideal (20â€“30Â°C). Summer extreme (40â€“48Â°C). Winter cold nights (5Â°C).',
    currency: 'Mostly cash economy. ATM in Tozeur center. Bring enough TND before heading into the desert.',
  },
  'Carthage': {
    emoji: 'ðŸ›ï¸',
    tagline: 'Walk among 3,000 years of history â€” Phoenician, Roman and Byzantine ruins',
    mustEat: [
      { name: 'FricassÃ©', where: 'Sidi Bou Said village (5 min away)', desc: 'Small fried sandwich with tuna, olives, harissa and capers â€” the perfect snack between ruins', price: '1.5â€“3 TND' },
      { name: 'Seafood Platter', where: 'Restaurant Didon, Byrsa Hill', desc: 'Fresh catch with panoramic views over the Gulf of Tunis', price: '35â€“55 TND' },
    ],
    mustSee: [
      { name: 'Antonine Baths', type: 'Roman Ruins', desc: 'Third largest Roman baths in the world, right on the seafront. The scale is breathtaking.', hours: 'Daily 8:00â€“19:00', entry: '8 TND' },
      { name: 'Byrsa Hill & Carthage Museum', type: 'Museum', desc: 'Hilltop with Punic ruins and a museum of Carthaginian artifacts. Best views of the Gulf.', hours: 'Tueâ€“Sun 9:00â€“17:00', entry: '8 TND' },
      { name: 'Tophet (Punic Sanctuary)', type: 'Archaeological Site', desc: 'Ancient Phoenician sacred precinct with thousands of burial urns. Haunting and fascinating.', hours: 'Daily 8:00â€“17:00', entry: '5 TND' },
    ],
    transport: 'TGM train from Tunis Marine (30 min, 1.5 TND). Multiple stops: Carthage SalammbÃ´, Dermech, Hannibal, Byrsa.',
    tips: ['Buy a combined ticket covering all 6 Carthage sites (20 TND)', 'Combine with Sidi Bou Said (next TGM stop)', 'Hire a local guide at the entrance for context (20â€“30 TND)', 'Best light for photos: early morning'],
    weather: 'Mediterranean. Comfortable year-round. Summer 30â€“35Â°C, winter 12â€“18Â°C.',
    currency: 'Cards accepted at museum. Cash for transport and street food.',
  },
  'Kairouan': {
    emoji: 'ðŸ•Œ',
    tagline: 'The fourth holiest city in Islam â€” a living medieval city of mosques and sweets',
    mustEat: [
      { name: 'Makroudh de Kairouan', where: 'PÃ¢tisserie Rahmouni, Rue de la RÃ©publique', desc: 'The original and best â€” semolina pastry with date filling, fried and soaked in honey', price: '0.5â€“1 TND each' },
      { name: 'Asida Zgougou', where: 'Local restaurants during Mouloud', desc: 'Pine nut pudding with rose water â€” a Kairouan specialty for religious festivals', price: '3â€“5 TND' },
      { name: 'Chorba Frik', where: 'Restaurant Sabra, Medina', desc: 'Hearty lamb and cracked wheat soup with tomato and coriander', price: '5â€“8 TND' },
    ],
    mustSee: [
      { name: 'Great Mosque of Kairouan', type: 'Religious Site', desc: 'Founded in 670 AD â€” one of the oldest and most important mosques in the world. Non-Muslims can visit the courtyard.', hours: 'Daily 8:00â€“14:00 (closed Fri mornings)', entry: '8 TND' },
      { name: 'Aghlabid Basins', type: 'Historic Engineering', desc: '9th-century water reservoirs â€” a marvel of medieval hydraulic engineering. Still intact after 1,200 years.', hours: 'Daily 8:00â€“18:00', entry: '5 TND' },
      { name: 'Medina Souks', type: 'Market', desc: 'Buy hand-woven carpets (Kairouan is Tunisia\'s carpet capital), leather goods and pottery directly from artisans.', hours: 'Daily 8:00â€“18:00', entry: 'Free' },
    ],
    transport: 'Louages from Tunis (2h, 10 TND) or Sousse (1h, 5 TND). Taxis within the city are cheap (2â€“5 TND).',
    tips: ['Dress modestly â€” this is a holy city', 'Carpet prices are negotiable â€” take your time', 'Visit the Bir Barouta (sacred well) inside the medina', 'Best time: spring or autumn â€” summer is very hot (40Â°C+)'],
    weather: 'Semi-arid. Hot summers (40Â°C), cool winters (8Â°C). Spring ideal.',
    currency: 'Mostly cash. ATMs near the medina entrance.',
  },
  'Sfax': {
    emoji: 'ðŸ´',
    tagline: 'Tunisia\'s second city â€” authentic, un-touristy and famous for its seafood',
    mustEat: [
      { name: 'Poisson Ã  la Sfaxienne', where: 'Restaurant Le Corail, Port area', desc: 'Whole fish baked with tomatoes, capers, olives and preserved lemon â€” the city\'s signature dish', price: '20â€“35 TND' },
      { name: 'Bsissa', where: 'Medina market', desc: 'Roasted barley flour mixed with olive oil and spices â€” ancient Berber energy food', price: '3â€“5 TND' },
      { name: 'Jarboua (Sfax pastry)', where: 'PÃ¢tisserie Sfaxienne, Medina', desc: 'Almond and pistachio pastry unique to Sfax', price: '1â€“2 TND each' },
    ],
    mustSee: [
      { name: 'Sfax Medina', type: 'UNESCO Heritage', desc: 'One of Tunisia\'s best-preserved medinas â€” less touristy than Tunis, more authentic. The 9th-century walls are intact.', hours: 'Daily 8:00â€“18:00', entry: 'Free' },
      { name: 'Kerkennah Islands', type: 'Nature', desc: 'Flat, tranquil islands 30 min by ferry. Famous for octopus fishing, clear water and total relaxation.', hours: 'Ferry: 6 daily departures', entry: 'Ferry: 3 TND' },
      { name: 'Sfax Archaeological Museum', type: 'Museum', desc: 'Excellent collection of Roman mosaics and Punic artifacts from the region.', hours: 'Tueâ€“Sun 9:00â€“17:00', entry: '5 TND' },
    ],
    transport: 'Train from Tunis (3.5h, 15 TND). Ferry to Kerkennah from the port (30 min). Taxis within city 3â€“8 TND.',
    tips: ['Sfax is a working city â€” great for authentic Tunisia without tourist prices', 'Olive oil from Sfax region is world-class â€” buy some to take home', 'The fish market at the port opens at 6am', 'Kerkennah: rent a bicycle on the island (5 TND/day)'],
    weather: 'Mediterranean. Hot summers (35Â°C), mild winters (13Â°C).',
    currency: 'Cards in hotels. Cash for medina and markets.',
  },
  'Tabarka': {
    emoji: 'ðŸ¤¿',
    tagline: 'Coral reefs, jazz and cork forests â€” Tunisia\'s most beautiful northern coast',
    mustEat: [
      { name: 'Langouste grillÃ©e', where: 'Restaurant Mimosas, Port', desc: 'Grilled spiny lobster with garlic butter â€” Tabarka is famous for its lobster', price: '45â€“80 TND' },
      { name: 'Soupe de poisson', where: 'Les Aiguilles restaurant', desc: 'Rich fish soup with rouille and croutons, made from the morning\'s catch', price: '8â€“12 TND' },
    ],
    mustSee: [
      { name: 'The Needles (Les Aiguilles)', type: 'Natural Wonder', desc: 'Dramatic rock formations rising from the sea. Best viewed from the Genoese fortress at sunset.', hours: 'Open 24/7', entry: 'Free' },
      { name: 'Genoese Fortress', type: 'Historic Site', desc: '16th-century Genoese fort on a rocky island connected to the mainland. Panoramic views.', hours: 'Daily 8:00â€“18:00', entry: '3 TND' },
      { name: 'Ain Draham (30km)', type: 'Nature', desc: 'Mountain village in cork oak forests â€” hiking, wild boar hunting season (Octâ€“Jan), and cool air.', hours: 'Open 24/7', entry: 'Free' },
    ],
    transport: 'Louages from Tunis (3h, 18 TND). Car rental recommended to explore the region.',
    tips: ['Diving season: Mayâ€“October. Book with Loisirs de Tabarka dive center', 'Tabarka Jazz Festival: July â€” book accommodation months ahead', 'Coral reef at 5â€“15m depth â€” suitable for beginners', 'Buy cork products (bowls, coasters) â€” unique to this region'],
    weather: 'Cooler than rest of Tunisia. Summer 28Â°C, winter 10Â°C. Rain Octâ€“March.',
    currency: 'Limited ATMs â€” bring cash from Tunis.',
  },
};

// Fallback for destinations not in the guide
const DEFAULT_GUIDE = (dest) => ({
  emoji: 'ðŸ“',
  tagline: `Discover the beauty of ${dest}`,
  mustEat: [
    { name: 'Couscous', where: 'Local restaurants', desc: 'Tunisia\'s national dish â€” semolina with vegetables, lamb or chicken and harissa', price: '8â€“15 TND' },
    { name: 'Harissa', where: 'Any market', desc: 'Tunisia\'s famous chili paste â€” buy a jar to take home', price: '2â€“5 TND' },
    { name: 'Mint Tea', where: 'Any cafÃ©', desc: 'Sweet mint tea served in small glasses â€” the Tunisian social ritual', price: '1â€“2 TND' },
  ],
  mustSee: [
    { name: 'Local Medina', type: 'Historic Site', desc: 'Explore the old town, souks and traditional architecture', hours: 'Daily 8:00â€“18:00', entry: 'Free' },
    { name: 'Regional Museum', type: 'Museum', desc: 'Learn about the local history and culture', hours: 'Tueâ€“Sun 9:00â€“17:00', entry: '5 TND' },
  ],
  transport: 'Louages (shared taxis) connect most Tunisian cities. Local taxis are metered.',
  tips: ['Learn a few words of Arabic or French â€” locals appreciate it', 'Bargain respectfully in markets', 'Carry cash â€” many places don\'t accept cards', 'Dress modestly when visiting religious sites'],
  weather: 'Mediterranean to semi-arid depending on region.',
  currency: '1 EUR â‰ˆ 3.3 TND Â· 1 USD â‰ˆ 3.1 TND',
});

// â”€â”€ Guide Modal Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GuideModal({ dest, guideTab, setGuideTab, onClose }) {
  const guide = DESTINATION_GUIDES[dest] || DEFAULT_GUIDE(dest);
  const tabs = [
    { id: 'eat',       icon: 'restaurant',     label: 'Must Eat' },
    { id: 'see',       icon: 'photo_camera',   label: 'Must See' },
    { id: 'tips',      icon: 'lightbulb',      label: 'Tips' },
    { id: 'transport', icon: 'directions_bus', label: 'Getting Around' },
  ];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 24, width: '100%', maxWidth: 620, maxHeight: '88vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 24px 64px var(--glass-shadow)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px 0', background: 'linear-gradient(135deg, var(--primary) 0%, #166874 100%)', color: 'white', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 32 }}>{guide.emoji}</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 6px', fontFamily: 'Manrope, sans-serif' }}>Guide for {dest}</h2>
              <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5, maxWidth: 420 }}>{guide.tagline}</p>
            </div>
            <button onClick={onClose} style={{ background: 'var(--glass-border)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>Ã—</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 16, marginTop: 10 }}>
            {[{ icon: 'wb_sunny', text: guide.weather }, { icon: 'payments', text: guide.currency }].map(({ icon, text }) => (
              <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--glass-border)', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setGuideTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 16px', background: guideTab === t.id ? 'white' : 'transparent', color: guideTab === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '10px 10px 0 0', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 24px' }}>
          {guideTab === 'eat' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Dishes you absolutely cannot leave {dest} without trying:</p>
              {guide.mustEat.map((item, i) => (
                <div key={i} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{item.name}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 999, flexShrink: 0, marginLeft: 8 }}>{item.price}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>{item.where}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          )}
          {guideTab === 'see' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Top attractions and experiences in {dest}:</p>
              {guide.mustSee.map((item, i) => (
                <div key={i} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{item.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', background: 'rgba(36,70,212,0.1)', padding: '2px 8px', borderRadius: 999, flexShrink: 0, marginLeft: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>{item.desc}</div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>{item.hours}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span className="material-symbols-outlined" style={{ fontSize: 13 }}>confirmation_number</span>{item.entry}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {guideTab === 'tips' && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Insider tips from people who know {dest} well:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {guide.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {guideTab === 'transport' && (
            <div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>How to get around {dest}:</p>
              <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>
                {guide.transport}
              </div>
              <div style={{ background: 'rgba(36,70,212,0.06)', border: '1px solid rgba(36,70,212,0.15)', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 18, flexShrink: 0, marginTop: 1 }}>info</span>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>Useful apps:</strong> Bolt and InDriver work in major Tunisian cities. Google Maps has good coverage. Download offline maps before your trip.
                </div>
              </div>
              <button onClick={() => window.open('https://www.google.com/maps/search/' + encodeURIComponent(dest + ', Tunisia'), '_blank')}
                style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>map</span>
                Open in Google Maps
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ── Currency Calculator Modal ──────────────────────────────
const CURRENCIES = [
  { code: 'TND', name: 'Tunisian Dinar',   flag: 'TN' },
  { code: 'EUR', name: 'Euro',             flag: 'EU' },
  { code: 'USD', name: 'US Dollar',        flag: 'US' },
  { code: 'GBP', name: 'British Pound',    flag: 'GB' },
  { code: 'DZD', name: 'Algerian Dinar',   flag: 'DZ' },
  { code: 'MAD', name: 'Moroccan Dirham',  flag: 'MA' },
  { code: 'SAR', name: 'Saudi Riyal',      flag: 'SA' },
  { code: 'AED', name: 'UAE Dirham',       flag: 'AE' },
  { code: 'CAD', name: 'Canadian Dollar',  flag: 'CA' },
  { code: 'CHF', name: 'Swiss Franc',      flag: 'CH' },
  { code: 'JPY', name: 'Japanese Yen',     flag: 'JP' },
  { code: 'CNY', name: 'Chinese Yuan',     flag: 'CN' },
  { code: 'TRY', name: 'Turkish Lira',     flag: 'TR' },
  { code: 'EGP', name: 'Egyptian Pound',   flag: 'EG' },
  { code: 'LYD', name: 'Libyan Dinar',     flag: 'LY' },
];

function CurrencyModal({ onClose }) {
  const [rates, setRates]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [amount, setAmount]     = useState('100');
  const [from, setFrom]         = useState('TND');
  const [to, setTo]             = useState('EUR');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/TND')
      .then(r => r.json())
      .then(data => {
        setRates(data.rates);
        setLastUpdated(new Date(data.time_last_update_utc).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
      })
      .catch(() => {
        // Fallback rates if API fails
        setRates({ EUR: 0.303, USD: 0.323, GBP: 0.255, DZD: 43.5, MAD: 3.24, SAR: 1.21, AED: 1.19, CAD: 0.44, CHF: 0.29, JPY: 48.2, CNY: 2.34, TRY: 10.5, EGP: 15.8, LYD: 1.56, TND: 1 });
      })
      .finally(() => setLoading(false));
  }, []);

  const convert = (val, fromCur, toCur) => {
    if (!rates || !val || isNaN(val)) return '';
    const inTND = fromCur === 'TND' ? parseFloat(val) : parseFloat(val) / rates[fromCur];
    const result = toCur === 'TND' ? inTND : inTND * rates[toCur];
    return result.toFixed(toCur === 'JPY' ? 0 : 2);
  };

  const swap = () => { setFrom(to); setTo(from); };
  const result = convert(amount, from, to);
  const rate = convert(1, from, to);

  const popularPairs = [
    { from: 'TND', to: 'EUR' }, { from: 'TND', to: 'USD' },
    { from: 'TND', to: 'GBP' }, { from: 'TND', to: 'DZD' },
    { from: 'EUR', to: 'TND' }, { from: 'USD', to: 'TND' },
  ];

  const inp = { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 10, padding: '12px 14px', fontSize: 18, fontWeight: 700, color: 'var(--text)', outline: 'none', boxSizing: 'border-box', fontFamily: 'Manrope, sans-serif' };
  const sel = { width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontWeight: 600, color: 'var(--text)', outline: 'none', cursor: 'pointer' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 24, width: '100%', maxWidth: 520, border: '1px solid var(--border)', boxShadow: '0 24px 64px var(--glass-shadow)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>currency_exchange</span>
                Currency Converter
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>
                {loading ? 'Fetching live rates…' : `Live rates · Updated ${lastUpdated}`}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: '#F59E0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              Fetching live exchange rates…
            </div>
          ) : (
            <>
              {/* Calculator */}
              <div style={{ background: 'var(--surface2)', borderRadius: 16, padding: '20px', marginBottom: 20, border: '1px solid var(--border)' }}>
                {/* From */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={inp}
                    min="0"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 8, alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>From</label>
                    <select value={from} onChange={e => setFrom(e.target.value)} style={sel}>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                    </select>
                  </div>
                  <button onClick={swap} style={{ height: 42, background: 'var(--primary)', border: 'none', borderRadius: 10, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s' }}
                    title="Swap currencies"
                    onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0deg)'}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>swap_horiz</span>
                  </button>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>To</label>
                    <select value={to} onChange={e => setTo(e.target.value)} style={sel}>
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Result */}
                <div style={{ marginTop: 16, background: 'var(--surface)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>
                    {amount || '0'} {from} =
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#F59E0B', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.5px' }}>
                    {result || '0'} <span style={{ fontSize: 18, color: 'var(--muted)' }}>{to}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                    1 {from} = {rate} {to}
                  </div>
                </div>
              </div>

              {/* Quick pairs */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Quick Conversions (1 TND)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {popularPairs.map(p => (
                    <div key={p.from + p.to}
                      onClick={() => { setFrom(p.from); setTo(p.to); setAmount('1'); }}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#F59E0B'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{p.from} → {p.to}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B' }}>{convert(1, p.from, p.to)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PassengerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [passenger, setPassenger]   = useState(null);
  const [stats, setStats]           = useState(null);
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showGuide, setShowGuide]   = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [guideTab, setGuideTab]     = useState('eat');
  const [refreshingRecs, setRefreshingRecs] = useState(false);

  useEffect(() => {
    if (!user?.id) { navigate('/login'); return; }
    Promise.all([
      PassengerAPI.getById(user.id),
      PassengerAPI.getStats(),
      PostAPI.getByAuthor(user.id).catch(() => []),
    ]).then(([p, s, ps]) => {
      setPassenger(p);
      setStats(s);
      setPosts(Array.isArray(ps) ? ps : []);
    }).catch(() => toast.error('Could not load data'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const refreshRecs = async () => {
    setRefreshingRecs(true);
    try {
      const updated = await PassengerAPI.recommend(user.id);
      setPassenger(updated);
      toast.success('Recommendations refreshed!');
    } catch { toast.error('Could not refresh'); }
    finally { setRefreshingRecs(false); }
  };

  if (loading) return (
    <div style={{ height: 'calc(100vh - 85px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Loading your dashboard…</div>
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  const t = passenger?.travel || {};
  const prefs = passenger?.preferences || {};
  const recs = passenger?.recommendations || [];
  const prefCount = Object.values(prefs).filter(Boolean).length;

  // Compute rank among same-destination travelers
  const sameDestCount = stats?.topDestinations?.[t.destination] || 0;
  const totalPassengers = stats?.totalPassengers || 1;
  const destPopularity = sameDestCount > 0 ? Math.round((sameDestCount / totalPassengers) * 100) : 0;

  // Budget context
  const budgetMap = { economy: { label: 'Economy', color: '#10b981', tip: 'Great choice — Tunisia is very affordable. Budget ~50 TND/day.' }, standard: { label: 'Standard', color: '#F59E0B', tip: 'Comfortable travel. Budget ~120 TND/day for hotels, meals and activities.' }, premium: { label: 'Premium', color: '#a78bfa', tip: 'Luxury experience. Budget ~300+ TND/day for 5-star hotels and private tours.' } };
  const budgetInfo = budgetMap[t.budget?.toLowerCase()] || budgetMap.standard;

  const card = { background: 'var(--surface)', borderRadius: 20, padding: '20px 24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' };
  const actionBtn = { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: 'var(--surface2)', cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' };

  return (
    <div style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 85px)', padding: '32px 40px', color: 'var(--text)' }}>

      {/* ── HERO GREETING ── */}
      <div style={{ ...card, marginBottom: 28, background: 'linear-gradient(135deg, var(--primary) 0%, #166874 100%)', border: 'none', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.75, marginBottom: 6 }}>Smart Passenger Intelligence Tunisia</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Manrope, sans-serif', marginBottom: 6 }}>Marhaba, {passenger?.firstName}! 👋</h1>
          <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>
            Your trip to <strong>{t.destination || '—'}</strong> · {t.duration || '—'} days · {t.purpose || '—'} · <span style={{ textTransform: 'capitalize' }}>{t.budget || '—'}</span> budget
          </p>
        </div>
        <button onClick={refreshRecs} disabled={refreshingRecs}
          style={{ padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, fontSize: 13, cursor: refreshingRecs ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: refreshingRecs ? 0.7 : 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>auto_awesome</span>
          {refreshingRecs ? 'Refreshing…' : 'Refresh Recommendations'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }}>

        {/* ── LEFT: STATS + RECS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { icon: 'recommend',     label: 'Recommendations', value: recs.length,                    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              { icon: 'photo_library', label: 'Posts',           value: posts.length,                   color: '#4facfe', bg: 'rgba(79,172,254,0.1)' },
              { icon: 'interests',     label: 'Interests',       value: prefCount + ' / 5',             color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { icon: 'groups',        label: 'Same Destination', value: sameDestCount + ' travelers',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
            ].map(({ icon, label, value, color, bg }) => (
              <div key={label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color, fontSize: 22 }}>{icon}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)' }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Destination popularity */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>Destination Insights</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>How your trip compares to other SPIT travelers</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: 'rgba(36,70,212,0.1)', padding: '4px 10px', borderRadius: 999 }}>Live data</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { label: 'Travelers to ' + (t.destination || '—'), value: sameDestCount, icon: 'flight_takeoff', color: 'var(--primary)' },
                { label: 'Destination popularity', value: destPopularity + '%', icon: 'trending_up', color: '#10b981' },
                { label: 'Avg trip duration', value: (stats?.averageAge ? Math.round(stats.averageAge / 5) + ' days' : '—'), icon: 'calendar_month', color: '#F59E0B' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <span className="material-symbols-outlined" style={{ color, fontSize: 20, display: 'block', marginBottom: 8 }}>{icon}</span>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Manrope, sans-serif', color: 'var(--text)', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
            {/* Popularity bar */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                <span>Popularity of {t.destination || 'your destination'} among SPIT users</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{destPopularity}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: destPopularity + '%', background: 'linear-gradient(90deg, var(--primary), #4facfe)', borderRadius: 999, transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>

          {/* Preferences breakdown */}
          <div style={card}>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Manrope, sans-serif', marginBottom: 4 }}>Your Travel Profile</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Interests that shape your recommendations</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { key: 'beach',      label: 'Beach',      icon: 'beach_access', color: '#06b6d4' },
                { key: 'culture',    label: 'Culture',    icon: 'museum',       color: '#a78bfa' },
                { key: 'desert',     label: 'Desert',     icon: 'landscape',    color: '#eab308' },
                { key: 'gastronomy', label: 'Food',       icon: 'restaurant',   color: '#f97316' },
                { key: 'sports',     label: 'Sports',     icon: 'sports',       color: '#10b981' },
              ].map(({ key, label, icon, color }) => {
                const active = prefs[key];
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: active ? color + '18' : 'var(--surface2)', border: '1px solid ' + (active ? color + '44' : 'var(--border)'), transition: 'all 0.2s' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: active ? color : 'var(--muted)' }}>{icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: active ? color : 'var(--muted)' }}>{label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong style={{ color: budgetInfo.color }}>Budget: {budgetInfo.label}</strong> — {budgetInfo.tip}
            </div>
          </div>

          {/* Recommendations */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>Your Recommendations</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>AI-generated based on your preferences</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>{recs.length} places</span>
            </div>
            {recs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 8, color: 'var(--border)' }}>explore</span>
                No recommendations yet.
                <button onClick={refreshRecs} style={{ display: 'block', margin: '12px auto 0', padding: '8px 20px', borderRadius: 10, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Generate Now</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {recs.map((r, i) => (
                  <div key={i} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '14px', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(36,70,212,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{r.destination}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{r.activity}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick actions */}
          <div style={card}>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Manrope, sans-serif', marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={actionBtn} onClick={() => window.open('https://www.booking.com/searchresults.html?ss=' + encodeURIComponent(t.destination || 'Tunisia'), '_blank')}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(36,70,212,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 22 }}>hotel</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Find Hotels</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>in {t.destination || 'Tunisia'}</div>
                </div>
              </div>
              <div style={actionBtn} onClick={() => setShowGuide(true)}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}>
                <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 22 }}>map</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Local Guide</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Food, sights & tips</div>
                </div>
              </div>
              <div style={actionBtn} onClick={() => setShowCurrency(true)}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}>
                <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: 22 }}>currency_exchange</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Currency Calculator</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>15 currencies · live rates</div>
                </div>
              </div>
              <div style={actionBtn} onClick={() => window.open('https://www.tripadvisor.com/Search?q=' + encodeURIComponent(t.destination || 'Tunisia'), '_blank')}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}>
                <span className="material-symbols-outlined" style={{ color: '#a78bfa', fontSize: 22 }}>travel_explore</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>TripAdvisor</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Reviews & activities</div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform stats */}
          <div style={card}>
            <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Manrope, sans-serif', marginBottom: 14 }}>Platform Stats</div>
            {[
              { label: 'Total Travelers',    value: stats?.totalPassengers || '—',                                                icon: 'groups',       color: 'var(--primary)' },
              { label: 'Average Age',        value: stats?.averageAge ? stats.averageAge.toFixed(1) + ' yrs' : '—',              icon: 'cake',         color: '#10b981' },
              { label: 'Top Destination',    value: stats?.topDestinations ? Object.keys(stats.topDestinations)[0] || '—' : '—', icon: 'location_on',  color: '#F59E0B' },
              { label: 'Most Popular Budget',value: stats?.travelsByBudget ? Object.entries(stats.travelsByBudget).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—' : '—', icon: 'payments', color: '#a78bfa' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color }}>{icon}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Top destinations from DB */}
          {stats?.topDestinations && Object.keys(stats.topDestinations).length > 0 && (
            <div style={card}>
              <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Manrope, sans-serif', marginBottom: 14 }}>Popular Destinations</div>
              {Object.entries(stats.topDestinations).slice(0, 5).map(([dest, count], i) => {
                const max = Object.values(stats.topDestinations)[0];
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={dest} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: dest === t.destination ? 'var(--primary)' : 'var(--text)' }}>
                        {dest === t.destination ? '📍 ' : ''}{dest}
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{count} travelers</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pct + '%', background: dest === t.destination ? 'var(--primary)' : 'var(--border)', borderRadius: 999, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showGuide && <GuideModal dest={t.destination || 'Tunis'} guideTab={guideTab} setGuideTab={setGuideTab} onClose={() => setShowGuide(false)} />}
      {showCurrency && <CurrencyModal onClose={() => setShowCurrency(false)} />}
    </div>
  );
}
