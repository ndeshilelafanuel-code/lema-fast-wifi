import { EquipmentItem, SetupTier, RoadmapStep, FaqItem } from '../types';

export const EQUIPMENT_ITEMS: EquipmentItem[] = [
  {
    id: 'core-router',
    name: {
      sw: 'Kipanga Njia Kikuu (MikroTik Core Router)',
      en: 'Core Gateway Router (MikroTik RouterBOARD)'
    },
    category: 'core',
    description: {
      sw: 'Moyo wa mtandao wako. Hufanya kazi ya kugawa intaneti, kusimamia ukurasa wa kuingia (Captive Portal), kuweka kiwango cha spidi kwa kila mteja (Bandwidth Queues), na kuruhusu vocha.',
      en: 'The heart of your network. Manages internet distribution, captive login portals, user bandwidth throttling, and voucher authentication.'
    },
    recommendedModels: [
      'MikroTik hEX (RB750Gr3) - Chaguo Bora la Kuanzia! Inastahimili wateja 80-100 na inafanya kazi kikamilifu na Ruijie RAP62-OD.',
      'MikroTik hEX S (RB760iGS) - Kijana wa hEX mwenye SFP port ya Fiber na PoE.',
      'MikroTik RB5009UG+S+IN - Mnyama wa kazi kwa wateja 150-500+ na kupanua mtandao mkubwa.',
      'MikroTik hAP ax² au ax³ - Kama unataka router yenye Wi-Fi ya ndani kwa ajili ya ofisini/nyumbani kwako pia.'
    ],
    estimatedCostTzs: { min: 160000, max: 450000 },
    estimatedCostUsd: { min: 65, max: 180 },
    whyNeeded: {
      sw: 'Bila router ya kibiashara kama MikroTik, huwezi kugawa vocha, huwezi kupunguza mteja asimalize bando ya wengine, na huwezi kutoza pesa. Hata hivyo, ukichagua kutumia AP zenye "Built-in Hotspot Controller" (kama Ruijie Reyee au TP-Link Omada), unaweza kuanza bila MikroTik!',
      en: 'Without a specialized business router like MikroTik, advanced queueing and Mikhmon vouchers are not possible. However, if choosing smart APs with built-in cloud hotspot controllers (Ruijie Reyee or TP-Link Omada), you can start without MikroTik!'
    },
    isEssential: true,
    isOptionalInApOnly: true
  },
  {
    id: 'outdoor-ap',
    name: {
      sw: 'Kituo cha Kurushia Mawimbi Nje (Outdoor Access Point)',
      en: 'Outdoor Wireless Access Point (Omni / Sector)'
    },
    category: 'wireless',
    description: {
      sw: 'Kifaa kinachorusha mawimbi ya WiFi kwa nguvu hewani ili simu na vifaa vya wateja viweze kukamata mtandao mita 100 hadi 400 kutoka kwenye mlingoti wako. Ukichagua mfumo wa "AP Tu Bila MikroTik", chagua AP zenye Cloud Hotspot ya ndani (Ruijie Reyee au TP-Link Omada).',
      en: 'Transmits high-gain WiFi signals over the air 100m to 400m away. If deploying "AP-Only without MikroTik", choose smart APs with built-in Cloud Hotspot & Voucher systems (Ruijie Reyee or TP-Link Omada).'
    },
    recommendedModels: [
      'Ruijie Reyee RG-RAP62-OD (AX3000) - Chaguo la Kipekee la Wi-Fi 6! Mawimbi yenye nguvu zaidi, spidi kubwa na mduara mpana wa mita 250+. Inafaa kwa AP Tu au pamoja na MikroTik.',
      'Ruijie Reyee RG-RAP6202(G) - Bora zaidi kwa AP Tu ya kuanzia (Cloud Hotspot ya bure kwenye simu, Vocha za QR, Hakuna MikroTik inayohitajika)',
      'TP-Link EAP225-Outdoor (AC1200, Dual Band, Mduara 360°, ina Standalone Captive Portal & Omada Cloud Voucher)',
      'Ubiquiti UniFi AC Mesh (UAP-AC-M) - Inasaidia UniFi Hotspot Voucher Manager',
      'MikroTik BaseBox 2 / Groove 52 (Inahitaji RouterOS au MikroTik)'
    ],
    estimatedCostTzs: { min: 220000, max: 480000 },
    estimatedCostUsd: { min: 90, max: 195 },
    whyNeeded: {
      sw: 'Router za kawaida za ndani hazina uwezo wa kupenya kuta za nyumba za mtaani au kufika mbali. Access point ya nje inastahimili jua na mvua na inabeba watumiaji wengi kwa pamoja.',
      en: 'Indoor home routers cannot penetrate brick walls or broadcast outdoors. Outdoor APs are weatherproof and support high client concurrency.'
    },
    isEssential: true
  },
  {
    id: 'internet-source',
    name: {
      sw: 'Chanzo Imara cha Intaneti (ISP Internet Feed)',
      en: 'Dedicated Internet Connection (Fiber / Starlink / 4G)'
    },
    category: 'core',
    description: {
      sw: 'Mkataba wa intaneti ya jumla (Wholesale Bandwidth) isiyo na kikomo cha data (Unlimited). Inaweza kuwa Fiber Optic, Starlink, au 4G/5G Enterprise Router.',
      en: 'An uncapped wholesale internet subscription. Usually delivered via commercial fiber optic, Starlink satellite terminal, or 4G/5G business router.'
    },
    recommendedModels: [
      'Fiber Optic (TTCL, Zuku, Liquid, SimbaNet, Halotel, Tigo/Vodacom Fiber) - Spidi ya kuanzia 30Mbps hadi 100Mbps',
      'Starlink Standard / Priority (Inafaa maeneo ya mikoani, vijijini au yasiyo na fiber)',
      '4G/5G Enterprise Router yenye simcard ya Unlimited Data (Plan ya Kibiashara)'
    ],
    estimatedCostTzs: { min: 100000, max: 350000 },
    estimatedCostUsd: { min: 40, max: 140 },
    whyNeeded: {
      sw: 'Hiki ndicho "bidhaa" unayoiuza. Intaneti lazima iwe ya haraka na ya uhakika ili wateja wanunue vocha kila siku.',
      en: 'This is the raw product you are reselling. It must be fast, uncapped, and reliable so customers return daily.'
    },
    isEssential: true
  },
  {
    id: 'power-backup',
    name: {
      sw: 'Mfumo wa Umeme Usiokatika (Power Backup / Solar / UPS)',
      en: 'Uninterruptible Power Backup (Solar / UPS / Battery)'
    },
    category: 'power',
    description: {
      sw: 'Mfumo wa kuhakikisha WiFi yako haizimiki hata umeme wa TANESCO / gridi ya taifa ukikatika. Wakati umeme unakatika, ndipo wateja wanapohitaji intaneti zaidi!',
      en: 'Ensures your WiFi never goes dark when the national grid fails. Power outages are peak demand hours when cellular towers get congested!'
    },
    recommendedModels: [
      'Mfumo wa Solar: Paneli ya 150W - 200W + Betri ya 100Ah Deep Cycle au Lithium + MPPT Controller',
      'UPS ya Kibiashara (1000VA - 1500VA yenye kutoa masaa 3-6 kwa vifaa vya DC)',
      'Mini DC UPS ya 12V/24V (Inayounganishwa moja kwa moja bila kupoteza umeme)'
    ],
    estimatedCostTzs: { min: 180000, max: 750000 },
    estimatedCostUsd: { min: 75, max: 300 },
    whyNeeded: {
      sw: 'Kukatika kwa umeme huua biashara na kuharibu vifaa. Ukiwa na sola, mtandao wako unadumu masaa 24/7 bila usumbufu.',
      en: 'Grid drops cause customer churn and can fry electronics. Solar or continuous DC UPS keeps uptime at 99.9%.'
    },
    isEssential: true
  },
  {
    id: 'cabling-poe',
    name: {
      sw: 'Waya za Nje za Cat6 & PoE Switch / Injector',
      en: 'Outdoor Shielded Cat6 Cable & PoE Supply'
    },
    category: 'cabling',
    description: {
      sw: 'Waya maalum za kuzuia jua na maji (Outdoor UV Resistant Cat6 FTP) zinazosafirisha umeme na mtandao pamoja (PoE) kwenda kwenye mnara.',
      en: 'Heavy-duty UV-resistant outdoor shielded Cat6 cables that carry both electricity and internet data (PoE) up your mast.'
    },
    recommendedModels: [
      'D-Link / Giganet / Siemon Outdoor Cat6 FTP Cable (Roli au Mita 50-100)',
      'RJ45 Shielded Connectors & Boots',
      'Gigabit PoE Injector au PoE Switch ya Port 4/8 (48V au 24V Passive)'
    ],
    estimatedCostTzs: { min: 90000, max: 220000 },
    estimatedCostUsd: { min: 35, max: 90 },
    whyNeeded: {
      sw: 'Waya za kawaida za ndani (Indoor) hupasuka baada ya miezi 3 ya jua na mvua, na kusababisha mtandao kukatika. Tumia Cat6 ya nje pekee.',
      en: 'Ordinary indoor patch cords degrade and crack under outdoor tropical sun within months. Shielded outdoor cable is non-negotiable.'
    },
    isEssential: true
  },
  {
    id: 'mast-pole',
    name: {
      sw: 'Mlingoti / Mnara na Vifaa vya Usalama (Mast & Earthing)',
      en: 'Galvanized Mast, Guy Wires & Lightning Protection'
    },
    category: 'structure',
    description: {
      sw: 'Bomba la chuma (Galvanized Steel Pipe) la futi 20 hadi 35 lililoinuliwa juu ya paa au ardhini, pamoja na kamba za kushikilia upepo na kikinga radi.',
      en: 'A 20ft to 35ft galvanized iron pole securely guy-wired to roof brackets, with copper earth rod to divert lightning strikes.'
    },
    recommendedModels: [
      'Bomba la Chuma cha pua (Class B Galvanized Pipe) Futi 20-30',
      'Kamba za chuma (Guy Wires) & Turnbuckles',
      'Kifaa cha kuzuia radi (Lightning Arrester) na Kigingi cha Shaba (Copper Earth Rod)'
    ],
    estimatedCostTzs: { min: 120000, max: 380000 },
    estimatedCostUsd: { min: 50, max: 155 },
    whyNeeded: {
      sw: 'Kuinua kifaa cha kurushia mawimbi juu kunasaidia mawimbi kuruka juu ya mabati na miti, na kuongeza eneo la wateja mara nne.',
      en: 'Elevating the transmitter provides line-of-sight clearance over tin roofs and vegetation, dramatically increasing coverage range.'
    },
    isEssential: true
  },
  {
    id: 'enclosure-box',
    name: {
      sw: 'Sanduku la Nje la Vifaa (Weatherproof Outdoor Enclosure)',
      en: 'Weatherproof Outdoor Cabinet Box (IP65)'
    },
    category: 'structure',
    description: {
      sw: 'Sanduku lililoundwa kuzuia maji ya mvua, joto kali na vumbi, linalofungwa kufuli ili kulinda router, PoE na vifaa vya umeme.',
      en: 'Lockable IP65-rated outdoor enclosure box protecting routers, surge arresters, and power supplies from rain, dust, and theft.'
    },
    recommendedModels: [
      'Outdoor Fiber/Telecom Plastic or Metal Enclosure Box (30x40x20cm)',
      'Kufuli imara na feni ndogo ya kupuliza hewa (Ventilation fan)'
    ],
    estimatedCostTzs: { min: 45000, max: 130000 },
    estimatedCostUsd: { min: 18, max: 55 },
    whyNeeded: {
      sw: 'Inalinda mtaji wako dhidi ya mvua, unyevu, joto na wizi wa vifaa.',
      en: 'Shields sensitive electronics against moisture ingress, sun overheating, and physical tampering.'
    },
    isEssential: false
  },
  {
    id: 'billing-software',
    name: {
      sw: 'Mfumo wa Vocha & Malipo (Mikhmon / Billing Portal)',
      en: 'Hotspot Billing & Automated Mobile Money Software'
    },
    category: 'core',
    description: {
      sw: 'Programu ya kutengeneza vocha zenye msimbo wa QR, kuweka muda, na kuunganisha malipo ya moja kwa moja ya M-Pesa / Tigo Pesa / Airtel Money.',
      en: 'Software to generate printable QR vouchers, track user sessions, and connect automated M-Pesa/Tigo/Airtel mobile money payments.'
    },
    recommendedModels: [
      'Mikhmon v3 / v4 (Bure kabisa, inafanya kazi kwenye kompyuta, simu au web server ndogo)',
      'Mfumo wa Malipo ya Simu (Paypack / Beem / Selcom API au Kijisanduku cha Android SMS Gateway)',
      'Printa ya Thermal (58mm au 80mm) kwa ajili ya kuchapisha vocha za karatasi'
    ],
    estimatedCostTzs: { min: 30000, max: 180000 },
    estimatedCostUsd: { min: 12, max: 70 },
    whyNeeded: {
      sw: 'Huu ndio mashine yako ya fedha. Huwezi kuuza WiFi kwa kumpa kila mtu nenosiri la kawaida (Password); lazima kila mtumiaji awe na vocha yake.',
      en: 'This is your cash register. Never give out a shared WPA password; individual vouchers prevent freeloading and automate revenue.'
    },
    isEssential: true
  }
];

export const SETUP_TIERS: SetupTier[] = [
  {
    id: 'starter',
    name: {
      sw: 'Kiwango cha Kuanzia (Kibanda / Duka / Hotspot ya Mtaa)',
      en: 'Starter Setup (Shop / Cafe / Local Spot)'
    },
    tagline: {
      sw: 'Bora kwa mtaji mdogo, duka la mtaani, kijiwe cha kahawa, au stendi ndogo',
      en: 'Ideal for low initial capital, retail kiosks, neighborhood cafes, or bus stands'
    },
    capacity: {
      sw: 'Wateja 25 hadi 50 kwa wakati mmoja',
      en: '25 to 50 concurrent active users'
    },
    coverageRadius: {
      sw: 'Mita 100 hadi 180 (mduara)',
      en: '100m to 180m radius'
    },
    idealFor: {
      sw: 'Maeneo yenye mikusanyiko ya watu: maduka, stendi ya bodaboda, saluni, kumbi za mpira, au mitaa ya makazi',
      en: 'High-density community clusters: market stalls, motorcycle stages, gaming lounges, student hostels'
    },
    estimatedCapitalTzs: 780000,
    estimatedCapitalUsd: 310,
    equipmentIds: ['core-router', 'outdoor-ap', 'cabling-poe', 'mast-pole', 'billing-software']
  },
  {
    id: 'medium',
    name: {
      sw: 'Kiwango cha Kati (Eneo la Chuo / Mtaa Mzima / Soko Kuu)',
      en: 'Medium Setup (Campus / Full Neighborhood / Market)'
    },
    tagline: {
      sw: 'Mawimbi ya masafa mapana na mfumo kamili wa sola usiozima kamwe',
      en: 'Extended multi-direction range with 24/7 dedicated solar battery backup'
    },
    capacity: {
      sw: 'Wateja 80 hadi 200 kwa wakati mmoja',
      en: '80 to 200 concurrent active users'
    },
    coverageRadius: {
      sw: 'Mita 300 hadi 600 (inaweza kuwa na AP mbili au tatu)',
      en: '300m to 600m with 2–3 coordinated APs'
    },
    idealFor: {
      sw: 'Mazingira ya wanafunzi wa vyuo, masoko ya wilaya, vijiji vikubwa, na mitaa yenye nyumba nyingi',
      en: 'College hostel zones, bustling township centers, dense residential settlements'
    },
    estimatedCapitalTzs: 2200000,
    estimatedCapitalUsd: 880,
    equipmentIds: ['core-router', 'outdoor-ap', 'power-backup', 'cabling-poe', 'mast-pole', 'enclosure-box', 'billing-software']
  },
  {
    id: 'pro',
    name: {
      sw: 'Kiwango cha Juu (WISP wa Mji Mdogo / Minara Mingi)',
      en: 'Pro WISP (Multi-Sector Urban Grid / Local ISP)'
    },
    tagline: {
      sw: 'Mfumo wa kitaalamu wenye Sector Antennas 3, mnara imara, na link za Point-to-Point',
      en: 'Carrier-grade triple sector deployment with Point-to-Point backhaul links'
    },
    capacity: {
      sw: 'Wateja 300 hadi 800+ kwa wakati mmoja',
      en: '300 to 800+ concurrent active users'
    },
    coverageRadius: {
      sw: 'Kilomita 1 hadi 3 (yenye Point-to-Point na Sector 120°)',
      en: '1km to 3km coverage footprint'
    },
    idealFor: {
      sw: 'Miji midogo isiyo na fiber, vitongoji vikubwa, hoteli na viwanja vya mikusanyiko',
      en: 'Townships lacking fixed broadband, holiday resort clusters, regional trading hubs'
    },
    estimatedCapitalTzs: 5800000,
    estimatedCapitalUsd: 2320,
    equipmentIds: ['core-router', 'outdoor-ap', 'power-backup', 'cabling-poe', 'mast-pole', 'enclosure-box', 'billing-software']
  }
];

export const ROADMAP_STEPS: RoadmapStep[] = [
  {
    number: '01',
    title: {
      sw: 'Utafiti wa Eneo & Wateja Walengwa',
      en: 'Site Survey & Target Demographics'
    },
    duration: {
      sw: 'Siku 2 - 4',
      en: '2 - 4 Days'
    },
    summary: {
      sw: 'Tafuta eneo lenye watu wengi wanaotumia simu lakini bando ya mitandao ya simu ni ghali au mtandao wao ni hafifu.',
      en: 'Identify a location with high smartphone foot traffic where cellular mobile data is either too expensive or spotty.'
    },
    details: {
      sw: [
        'Angalia maeneo kama: Hosteli za wanafunzi, stendi za mabasi/daladala, masoko, migahawa, viwanja vya mpira wa miguu, au mitaa ya vijana.',
        'Pima urefu wa majengo ya jirani ili kuhakikisha mlingoti wako utakuwa juu kuliko paa za bati za jirani.',
        'Uliza wakazi wa eneo hilo kuhusu changamoto zao za mtandao na bei wanayolipa kwa sasa kwa vifurushi vya mitandao ya simu.'
      ],
      en: [
        'Scout high-traffic zones: student quarters, bus depots, open-air markets, gaming joints, and dense residential wards.',
        'Assess surrounding building elevations to guarantee your mast antennas enjoy unobstructed line-of-sight.',
        'Poll local youth and merchants about current cellular data costs and network signal frustrations.'
      ]
    },
    proTip: {
      sw: 'Eneo zuri zaidi ni pale ambapo watu hukaa kwa muda mrefu (sitting foot traffic) kuliko pale watu wanapopita tu haraka.',
      en: 'A location where people sit or linger for 30+ minutes converts 4x better than a location where pedestrians rush through.'
    }
  },
  {
    number: '02',
    title: {
      sw: 'Kupata Chanzo Thabiti cha Intaneti (Wholesale Bandwidth)',
      en: 'Securing Raw Internet Bandwidth'
    },
    duration: {
      sw: 'Siku 3 - 7',
      en: '3 - 7 Days'
    },
    summary: {
      sw: 'Wasiliana na watoa huduma wa fiber optic au satelaiti kupata kifurushi cha kibiashara kisicho na kikomo (Unlimited).',
      en: 'Negotiate an uncapped commercial internet feed with local fiber carriers or deploy a satellite terminal.'
    },
    details: {
      sw: [
        'Chaguo A (Bora zaidi): Fiber Optic (k.m. TTCL, Zuku, Liquid, Airtel, Vodacom). Omba kifurushi cha kuanzia 30Mbps hadi 50Mbps kisicho na FUP (Fair Usage Policy).',
        'Chaguo B: Starlink (Standard au Priority). Inafaa sana kama hakuna waya wa fiber kwenye eneo lako. Inatoa 80Mbps - 200Mbps.',
        'Chaguo C: 4G/5G Enterprise Router yenye simcard ya Unlimited Data (Tumia kama suluhisho la dharura).'
      ],
      en: [
        'Option A (Gold standard): Dedicated fiber line (30Mbps to 100Mbps true uncapped).',
        'Option B: Starlink terminal if fiber has not reached your town yet (delivers 80–220Mbps low-latency downlink).',
        'Option C: Fixed 4G/5G commercial SIM line with unlimited business quota.'
      ]
    },
    proTip: {
      sw: 'Hakikisha mkataba wako na ISP hauwi wa nyumbani (Residential Home Plan) unaozuia kusambaza, bali ni wa kibiashara (SME / Business Plan).',
      en: 'Always choose an SME or business line that permits multi-user gateway routing rather than restrictive home terms.'
    }
  },
  {
    number: '03',
    title: {
      sw: 'Ununuzi wa Vifaa Sahihi vya Kazi',
      en: 'Procuring Tested Hardware'
    },
    duration: {
      sw: 'Siku 2 - 5',
      en: '2 - 5 Days'
    },
    summary: {
      sw: 'Nunua vifaa vinavyoaminika kutoka kwa mawakala wa MikroTik, Ubiquiti na TP-Link walioidhinishwa.',
      en: 'Source battle-tested enterprise gear from trusted telecommunications distributors.'
    },
    details: {
      sw: [
        'MikroTik hEX (RB750Gr3) au RB4011 - Nunua kifaa halisi chenye RouterOS Level 4 au zaidi.',
        'Access Point ya Nje: TP-Link EAP225-Outdoor au Ubiquiti UniFi AC Mesh.',
        'Waya wa Cat6 wa Nje (FTP Shielded) - Usikubali waya wa ndani kwa sababu utaharibika ndani ya miezi michache.',
        'Mfumo wa umeme: UPS au Sola yenye betri ya Deep Cycle.'
      ],
      en: [
        'MikroTik RouterBOARD with valid RouterOS Level 4 license.',
        'Weatherproof Outdoor Access Point (e.g. TP-Link EAP225-Outdoor or Ubiquiti AC Mesh).',
        'UV-resistant shielded Cat6 outdoor cable with grounded RJ45 modular jacks.',
        'Continuous DC UPS or solar controller battery setup.'
      ]
    },
    proTip: {
      sw: 'Kamwe usinunue router ya kawaida ya majumbani ya antena za ndani kwa matarajio ya kurusha WiFi mtaani—itazidiwa wateja 10 tu wakijiunga.',
      en: 'Never attempt to use consumer home wifi routers for street distribution; they freeze as soon as 12 smartphones connect.'
    }
  },
  {
    number: '04',
    title: {
      sw: 'Usanidi wa MikroTik & Mfumo wa Vocha (Mikhmon)',
      en: 'MikroTik Configuration & Mikhmon Voucher Setup'
    },
    duration: {
      sw: 'Siku 1 - 2',
      en: '1 - 2 Days'
    },
    summary: {
      sw: 'Sanidi Hotspot Server kwenye RouterOS, tengeneza kurasa nzuri za kuingia (Captive Portal), na uweke Mikhmon kwa ajili ya vocha.',
      en: 'Configure Hotspot Server on RouterOS, customize branded login portal, and initialize Mikhmon for voucher management.'
    },
    details: {
      sw: [
        'Kuweka IP Pool, DHCP Server, na Firewall NAT kwenye MikroTik kupitia program ya Winbox.',
        'Kuweka "Bandwidth Limiter" (Queue): Mfano kila mtumiaji apate 2Mbps au 3Mbps download na 1Mbps upload ili intaneti isilemewe na mtu mmoja anayepakua video.',
        'Kusanidi Mikhmon: Mfumo mwepesi unaokuwezesha kutengeneza vocha 500 kwa dakika 1 zenye Username na Password fupi (nambari 4 au 5) na QR code.',
        'Kuweka ukurasa wa Login wenye picha na nembo ya biashara yako, namba za mawasiliano na bei za vifurushi.'
      ],
      en: [
        'Set up IP pools, DHCP ranges, and NAT masquerade rules inside MikroTik Winbox.',
        'Create fair-share bandwidth queues (e.g. 2.5Mbps download cap per user) to stop video streaming from choking the network.',
        'Deploy Mikhmon to batch-print stylish QR code vouchers with simple 4-digit codes.',
        'Personalize your captive portal with local branding, customer care phone numbers, and package rate cards.'
      ]
    },
    proTip: {
      sw: 'Weka muda wa vocha uanze kuhesabu pale tu mteja anapoingia mara ya kwanza (First Login), na uishe hata asipokuwa mtandaoni (Uptime vs Validity).',
      en: 'Set voucher expiration mode to "Validity from first login" rather than raw connected uptime to prevent multi-week hoarding.'
    }
  },
  {
    number: '05',
    title: {
      sw: 'Ufungaji wa Mnara & Vifaa (Physical Installation)',
      en: 'Mast Mounting & Tower Rigging'
    },
    duration: {
      sw: 'Siku 1 - 2',
      en: '1 - 2 Days'
    },
    summary: {
      sw: 'Inua mlingoti wa chuma uliolindwa vizuri, funga access points na waya salama kwenye sanduku lisiloingia maji.',
      en: 'Erect galvanized steel pole on solid roof brackets, mount outdoor APs, and organize cables inside weatherproof enclosure.'
    },
    details: {
      sw: [
        'Funga bomba la chuma kwa uimara ukitumia kamba za chuma (Guy wires) pande zote 3 ili mlingoti usitikisike wakati wa upepo mkali.',
        'Weka kigingi cha ardhini (Copper Earth Rod) na kikinga radi (Lightning Arrester) ili kulinda vifaa vyako vya kielektroniki.',
        'Tumia waya mmoja wa Cat6 wenye PoE (Power over Ethernet) kwenda kwenye AP ili usihitaji kupandisha waya za umeme mkubwa wa 220V mnarani.',
        'Weka router na UPS ndani ya sanduku la nje (Enclosure box) lenye matundu ya uingizaji hewa na kufuli imara.'
      ],
      en: [
        'Secure mast with 3-point galvanized turnbuckle guy wires to eliminate wind sway.',
        'Install copper earth grounding rod and surge arrestors to safeguard hardware against atmospheric lightning strikes.',
        'Route a single PoE Cat6 ethernet cable to the rooftop antenna (avoid running hazardous 220V AC lines up the pole).',
        'House the router, power brick, and DC backup inside a vented, lockable outdoor weather enclosure.'
      ]
    },
    proTip: {
      sw: 'Hakikisha waya wa mtandao unaoingia kwenye AP una umbo la "Drip Loop" (mkunjo unaoning\'inia chini) kabla ya kuingia kwenye tundu ili matone ya mvua yasiingie ndani ya kifaa.',
      en: 'Always form a downward "drip loop" in the ethernet cable right before the entry gland so rainwater drips off instead of tracking into the port.'
    }
  },
  {
    number: '06',
    title: {
      sw: 'Mkakati wa Bei, Usambazaji & Uzinduzi Rasmi',
      en: 'Pricing Structure, Voucher Distribution & Launch'
    },
    duration: {
      sw: 'Siku 1 - 3',
      en: '1 - 3 Days'
    },
    summary: {
      sw: 'Chapisha mabango, gawa vocha za majaribio, fanya makubaliano na maduka ya mtaani, na zindua huduma yako.',
      en: 'Print signage, distribute promotional free trial vouchers, partner with local retail agents, and open for business.'
    },
    details: {
      sw: [
        'Tengeneza vifurushi vinavyovutia: Saa 2 (Tsh 500), Siku 1 (Tsh 1,000), Wiki 1 (Tsh 5,000), na Mwezi 1 (Tsh 20,000 hadi 25,000).',
        'Gawa vocha za majaribio za bure (dakika 15 za kwanza) ili wateja waone kasi ya mtandao na wavutiwe kununua.',
        'Fanya makubaliano na maduka 3 hadi 5 ya karibu (maduka ya vinywaji, maduka ya vifaa vya simu, mawakala wa fedha) wauze vocha zako kwa kupata kamisheni ya 10% - 15%.',
        'Weka bango kubwa linaloonekana wazi: "WIFI YA HARAKA HAPA - Tsh 500 TU".'
      ],
      en: [
        'Structure attractive, bite-sized price tiers: 2 Hours (Tsh 500), 24 Hours (Tsh 1,000), 7 Days (Tsh 5,000), Monthly (Tsh 20,000–25,000).',
        'Provide a free 15-minute trial session so first-time users can experience the blazing speed and get hooked.',
        'Recruit 3–5 nearby corner shops, mobile money kiosks, and barbershops as voucher re-sellers at 10%–15% commission.',
        'Mount high-visibility outdoor signage with simple connection steps: "FAST STREET WIFI AVAILABLE HERE".'
      ]
    },
    proTip: {
      sw: 'Wateja hawajali teknolojia unayotumia; wanajali spidi na kwamba haikatiki. Ukihakikisha YouTube na TikTok hazikwami, watakuwa wateja wako wa kudumu.',
      en: 'End customers do not care about networking jargon—they judge you on video streaming smoothness. If TikTok and YouTube load instantly, they will stick with you for years.'
    }
  }
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'tcra-license',
    question: {
      sw: 'Je, ninahitaji leseni ya TCRA / Serikali kuanzisha WiFi ya mtaani?',
      en: 'Do I need a formal telecom regulator license (e.g. TCRA) to run a street WiFi hotspot?'
    },
    answer: {
      sw: 'Kwa viwango vya kuanzia (Micro Hotspot mtaani au eneo la biashara yako), kwa kawaida unanunua intaneti ya kibiashara kutoka kwa ISP mwenye leseni (k.m. TTCL, Liquid, Zuku) na kuwapa wateja wako ufikiaji kupitia vocha. Unachohitaji mara moja ni usajili wa biashara (BRELA), TIN namba (TRA), na Leseni ya Biashara ya Halmashauri ya eneo lako. Hata hivyo, ukianza kujenga minara mirefu na kusambaza mtandao mji mzima au kuuza mtandao kwa makazi binafsi kama mtoa huduma huru (WISP), unapaswa kujiandikisha kama "Application Services / Reseller" chini ya TCRA ili kuwa rasmi kisheria 100%.',
      en: 'For small local hotspots within a localized neighborhood or commercial premise, you operate on top of a commercial subscription from a fully licensed ISP. You need standard local business registration (BRELA), Tax Identification Number (TIN), and Municipal Trading Permit. If you scale into a regional WISP erecting high transmission towers and cross-ward wireless links, registering for an Application Service License or Reseller permit from TCRA is the legally compliant pathway.'
    }
  },
  {
    id: 'starlink-usage',
    question: {
      sw: 'Je, ninaweza kutumia Starlink kama chanzo changu cha WiFi Hotspot?',
      en: 'Can I use Starlink as my primary internet backhaul for a hotspot business?'
    },
    answer: {
      sw: 'Ndiyo, watu wengi sasa hivi wanatumia Starlink kwa ufanisi mkubwa sana, hasa mikoani na maeneo ambayo waya za Fiber optic bado hazijafika. Starlink inatoa kasi ya 80Mbps hadi 220Mbps, ambayo inatosha kabisa kuhudumia wateja 60 hadi 150 kwa pamoja. Unachotakiwa kufanya ni kununua "Starlink Ethernet Adapter" (kama unatumia dish ya Standard) kisha unganisha waya wa mtandao moja kwa moja kwenye Router ya MikroTik (kwenye port ya WAN/Ether1). Kuanzia hapo MikroTik ndiyo itakayodhibiti vocha, spidi na watumiaji.',
      en: 'Yes, Starlink has become a game-changer across East Africa, particularly in provincial towns and peri-urban hubs where fiber has not arrived. Delivering 80–220Mbps, it comfortably supports 60–150 simultaneous users. Simply connect the Starlink Ethernet Adapter into your MikroTik router WAN port (Ether1). From there, MikroTik handles all hotspot captive portals, queue bandwidth allocation, and voucher authentication.'
    }
  },
  {
    id: 'mobile-money',
    question: {
      sw: 'Je, mteja anaweza kulipa kwa M-Pesa au Tigo Pesa na kupokea vocha moja kwa moja bila mimi kuwepo?',
      en: 'Can customers pay autonomously via M-Pesa / Tigo Pesa / Airtel Money and receive instant vouchers?'
    },
    answer: {
      sw: 'Ndiyo kabisa! Kuna mifumo ya "Automated Mobile Money Hotspot" (kama Paypack, Beem, au mifumo ya SMS Gateway/MikroTik API). Mteja anapounganisha WiFi, ukurasa wa mtandao unafunguka kwenye simu yake, anachagua kifurushi (k.m. Tsh 1,000 ya saa 24), anaandika namba yake ya simu, na anapokea ujumbe wa USSD kwenye simu yake wa kuweka neno la siri (PIN). Malipo yakikamilika, mfumo unamtengenezea vocha na kumuunganisha kiotomatiki papo hapo!',
      en: 'Yes! Automated mobile payment integration is standard practice. Payment gateway APIs (like Paypack, Beem, Selcom, or localized Android SMS forwarders) listen for transactions. When a customer taps a package on the captive portal and submits their phone number, a USSD STK-push prompt prompts their mobile PIN. Upon confirmation, the gateway creates a MikroTik active user and logs them in seamlessly.'
    }
  },
  {
    id: 'bandwidth-speed',
    question: {
      sw: 'Nahitaji intaneti ya spidi gani ili kuanzisha biashara hii?',
      en: 'How much wholesale bandwidth capacity do I need to start?'
    },
    answer: {
      sw: 'Kwa wanaoanza na wateja 30 hadi 60, intaneti ya 30Mbps hadi 50Mbps (Dedicated au Unlimited Fiber) inatosha sana. Siri kubwa ni kuweka "Bandwidth Queue" kwenye MikroTik: weka kila mtumiaji asipate zaidi ya 2Mbps hadi 3Mbps. Kwa kasi ya 2.5Mbps, simu ya mteja inaweza kucheza video ya YouTube ya 720p/1080p, kupiga simu ya WhatsApp ya video, na kutumia TikTok bila kukwama kabisa, huku mtandao wako ukiwa haulemewi!',
      en: 'For a starter hub serving 30–60 active users, a 30Mbps to 50Mbps uncapped pipe is optimal. The key is configuring fair per-user bandwidth limits on your MikroTik (typically 2.0Mbps to 3.0Mbps download, 1.0Mbps upload). At 2.5Mbps, HD video streaming, WhatsApp video calls, and TikTok operate flawlessly without one heavy downloader hogging the whole network.'
    }
  },
  {
    id: 'power-cuts',
    question: {
      sw: 'Nifanyeje kukabiliana na tatizo la kukatika kwa umeme wa TANESCO / gridi?',
      en: 'How do I handle frequent electrical grid blackouts?'
    },
    answer: {
      sw: 'Kukatika kwa umeme ndio fursa yako kubwa zaidi ya kupata faida, kwa sababu minara ya mitandao ya simu mara nyingi inazidiwa uwezo au inapoteza spidi umeme unapokatika. Weka mfumo wa sola wa 12V au 24V (Paneli 1 ya 150W au 200W, Solar Charge Controller ya MPPT, na betri ya 100Ah au betri ya Lithium). Vifaa vya mtandao (MikroTik na Access Point) hutumia umeme mdogo sana (kati ya wati 15 hadi 35 kwa pamoja), hivyo betri ndogo inaweza kuviwasha kwa zaidi ya masaa 12 hadi 24 mfululizo!',
      en: 'Power outages are actually your highest-earning window, because when the grid fails, cellular base stations get overwhelmed and crawl. Networking gear draws very modest power (15W to 35W total). A single 150W solar panel with an MPPT charge controller and 100Ah battery or small DC UPS keeps your entire mast running uninterrupted for 12 to 24 hours.'
    }
  },
  {
    id: 'ap-only-possibility',
    question: {
      sw: 'Je, inawezekana kabisa kuendesha biashara ya WiFi nikitumia AP tu bila kununua MikroTik?',
      en: 'Is it truly possible to run a street WiFi hotspot using ONLY an Access Point without buying MikroTik?'
    },
    answer: {
      sw: 'NDIYO KABISA! Inawezekana 100%, na watu wengi huanzia hapa kwa sababu ya mtaji mdogo. Ili kufanya hivi bila MikroTik, unatakiwa kununua AP maalum zenye mfumo wa ndani wa Cloud Hotspot & Vouchers kama vile "Ruijie Reyee RG-RAP6202(G)" au "TP-Link Omada EAP225-Outdoor". AP hizi huunganishwa moja kwa moja kwenye modemu ya ISP au Starlink yako, na unazisimamia kwa kutumia application ya bure kwenye simu yako (App ya Ruijie Reyee au Omada). Unaweza kutengeneza vocha, kuweka muda, na kupunguza spidi ya kila mteja moja kwa moja kutoka kwenye simu yako bila kompyuta wala MikroTik!',
      en: 'ABSOLUTELY YES! It is 100% possible and very popular for bootstrapped entrepreneurs on a tight budget. To do this without MikroTik, simply purchase a smart AP equipped with built-in Cloud Hotspot & Voucher firmware—such as the Ruijie Reyee RG-RAP6202(G) or TP-Link Omada EAP225-Outdoor. Connect the AP directly into your ISP or Starlink modem via PoE, and manage everything through their 100% free mobile app. You can generate vouchers, enforce per-user speed limits, and manage sales right from your smartphone with zero PC or MikroTik needed!'
    }
  }
];

export interface ApOnlyBrand {
  id: string;
  name: string;
  recommendedModel: string;
  appPlatform: string;
  costTzs: number;
  costUsd: number;
  keyFeatures: { sw: string[]; en: string[] };
  whyBestForApOnly: { sw: string; en: string };
  isTopPick?: boolean;
}

export const AP_ONLY_BRANDS: ApOnlyBrand[] = [
  {
    id: 'ruijie-reyee',
    name: 'Ruijie Reyee Cloud',
    recommendedModel: 'Reyee RG-RAP6202(G) Outdoor Gigabit AP',
    appPlatform: 'Ruijie Reyee App (Bure kwenye Android & iOS)',
    costTzs: 320000,
    costUsd: 128,
    isTopPick: true,
    keyFeatures: {
      sw: [
        'Cloud Hotspot ya bure 100% bila malipo ya mwezi au leseni',
        'Uwezo wa kutengeneza vocha (Vouchers) zenye QR code moja kwa moja kwenye simu',
        'Kuweka kiwango cha spidi (Rate Limiting) kwa kila mtumiaji (k.m. 2Mbps)',
        'Haikuhitaji kompyuta wala MikroTik—usanidi wote unakamilika kwa dakika 5 kwenye simu',
        'Mduara wa mita 150 hadi 250 nje kwenye jua na mvua (IP68)'
      ],
      en: [
        '100% Free Lifetime Cloud Hotspot management with zero subscription fees',
        'Generate printable QR vouchers directly inside the Reyee mobile app',
        'Built-in per-user bandwidth speed throttle (e.g. 2.5Mbps download)',
        'Zero PC or MikroTik required—100% phone app configuration in 5 minutes',
        'Rugged IP68 outdoor weatherproof casing covering 150m-250m radius'
      ]
    },
    whyBestForApOnly: {
      sw: 'Ndilo chaguo namba moja Afrika Mashariki kwa watu wasiotaka MikroTik. Reyee Cloud inakupa kila kitu ambacho ungekipata kwenye MikroTik + Mikhmon lakini bure ndani ya simu yako!',
      en: 'The #1 undisputed choice for entrepreneurs running without MikroTik. Reyee Cloud delivers voucher generation and rate limiting natively on mobile.'
    }
  },
  {
    id: 'tplink-omada',
    name: 'TP-Link Omada',
    recommendedModel: 'TP-Link EAP225-Outdoor (AC1200 Gigabit)',
    appPlatform: 'Omada App / Standalone Web GUI / Omada Cloud',
    costTzs: 240000,
    costUsd: 96,
    keyFeatures: {
      sw: [
        'Ina mfumo wa ndani wa "Standalone Captive Portal" unaofanya kazi bila controller',
        'Ukiunganisha na Omada Cloud Controller (bure) inapata uwezo wa kutoa vocha za kipekee',
        'Spidi kubwa ya Dual-Band (2.4GHz & 5GHz)',
        'Bei nafuu sana sokoni na inapatikana kirahisi madukani Kariakoo na mikoani',
        'Inabeba wateja 30 hadi 60 kwa wakati mmoja'
      ],
      en: [
        'Features standalone onboard captive portal operating without any external controller',
        'Supports unique QR/numeric vouchers when paired with free Omada Cloud Controller',
        'Fast dual-band 802.11ac wireless (up to 1200Mbps aggregate)',
        'Widely accessible and cost-effective across local East African supply shops',
        'Accommodates 30 to 60 concurrent active street users'
      ]
    },
    whyBestForApOnly: {
      sw: 'Inapatikana kwa urahisi sana madukani, ina bei nafuu, na inaweza kutumika kama AP ya kawaida sasa na baadae ukiamua kuweka MikroTik hutaibadili!',
      en: 'High local parts availability, great price point, and 100% reusable if you choose to graduate to MikroTik later.'
    }
  },
  {
    id: 'ubiquiti-unifi',
    name: 'Ubiquiti UniFi',
    recommendedModel: 'UniFi AC Mesh (UAP-AC-M)',
    appPlatform: 'UniFi Network App / UniFi Controller',
    costTzs: 380000,
    costUsd: 152,
    keyFeatures: {
      sw: [
        'Ubora wa daraja la juu (Carrier grade) na nguvu kubwa ya mawimbi',
        'Mfumo wa UniFi Guest Portal wenye vocha na malipo ya wageni',
        'Muundo mzuri na mwembamba usioonekana mkubwa mnarani',
        'Uwezo wa kujiunga na AP nyingine bila waya (Mesh backhaul)'
      ],
      en: [
        'Enterprise carrier-grade build quality and RF transmission fidelity',
        'Rich UniFi Guest Portal voucher architecture',
        'Discreet, sleek form factor with dual omni dipoles',
        'Zero-wire wireless mesh hopping to expand neighborhood range'
      ]
    },
    whyBestForApOnly: {
      sw: 'Inafaa kama una laptop unayoweza kuwasha UniFi Controller mara moja kutengeneza vocha, au kama unataka mtandao imara zaidi usiokwama.',
      en: 'Optimal if you have a laptop to run UniFi Controller for batch voucher creation, delivering bulletproof RF reliability.'
    }
  }
];

export interface ComparisonRow {
  feature: { sw: string; en: string };
  apOnly: { sw: string; en: string };
  mikrotikPlusAp: { sw: string; en: string };
  winner: 'ap-only' | 'mikrotik' | 'tie';
}

export const COMPARISON_METRICS: ComparisonRow[] = [
  {
    feature: { sw: 'Mtaji wa Kuanzia (Cost)', en: 'Starting Capital' },
    apOnly: {
      sw: 'Nafuu sana (Tsh 380,000 – 600,000) kwa sababu haununui MikroTik wala mikanda yake',
      en: 'Low ($150 – $240): No routerboard purchase required'
    },
    mikrotikPlusAp: {
      sw: 'Kati (Tsh 780,000 – 1,200,000) kwa sababu unanunua router ya MikroTik na AP',
      en: 'Moderate ($310 – $480): Routerboard + AP combo'
    },
    winner: 'ap-only'
  },
  {
    feature: { sw: 'Ugumu wa Usanidi (Setup Ease)', en: 'Configuration Difficulty' },
    apOnly: {
      sw: 'Rahisi mno! Dakika 5 hadi 10 kupitia application ya simu (Ruijie au Omada)',
      en: 'Extremely easy: 5–10 min setup using mobile smartphone app'
    },
    mikrotikPlusAp: {
      sw: 'Inahitaji maarifa ya Winbox, IP routing, firewall, na kusanidi Mikhmon',
      en: 'Moderate/Complex: Requires Winbox, NAT firewall, and Mikhmon scripts'
    },
    winner: 'ap-only'
  },
  {
    feature: { sw: 'Idadi ya Wateja (Capacity)', en: 'Concurrent User Capacity' },
    apOnly: {
      sw: 'Wateja 25 hadi 50 kwa wakati mmoja (inatosha duka, kijiwe, au kibanda)',
      en: '25–50 users concurrent (great for kiosk, cafe, or single block)'
    },
    mikrotikPlusAp: {
      sw: 'Wateja 100 hadi 500+ kwa wakati mmoja bila router kuzidiwa nguvu',
      en: '100–500+ users concurrent with zero CPU throttling'
    },
    winner: 'mikrotik'
  },
  {
    feature: { sw: 'Kutoa Vocha (Voucher Creation)', en: 'Voucher Generation' },
    apOnly: {
      sw: 'Inatoa vocha kupitia Reyee Cloud au Omada Controller (Code / QR)',
      en: 'Generates vouchers directly in Reyee or Omada Cloud'
    },
    mikrotikPlusAp: {
      sw: 'Mikhmon: Inatoa maelfu ya vocha za karatasi, QR, na templates nzuri zenye nembo',
      en: 'Mikhmon: High-volume batch printing with full custom templates'
    },
    winner: 'tie'
  },
  {
    feature: { sw: 'Malipo ya Moja kwa Moja ya M-Pesa', en: 'Automated Mobile Money STK-Push' },
    apOnly: {
      sw: 'Inahitaji External Web Portal au kuuza vocha kwa maduka mkononi',
      en: 'Requires external portal setup or over-the-counter voucher sales'
    },
    mikrotikPlusAp: {
      sw: 'Rahisi kuunganisha API ya moja kwa moja ya M-Pesa/Tigo Pesa/SMS Gateway',
      en: 'Standard MikroTik API integrations for autonomous M-Pesa STK-push'
    },
    winner: 'mikrotik'
  },
  {
    feature: { sw: 'Uwezo wa Kupanua Baadaye (Upgradability)', en: 'Future Scalability' },
    apOnly: {
      sw: 'AP uliyonunua (Reyee au TP-Link) bado unaweza kuichomeka kwenye MikroTik baadaye!',
      en: '100% reusable: Simply plug the same AP into a MikroTik when scaling'
    },
    mikrotikPlusAp: {
      sw: 'Tayari unakuwa na msingi wa mtandao mkubwa wa ISP wa mji mzima',
      en: 'Full carrier foundation already primed for multi-tower expansion'
    },
    winner: 'tie'
  }
];

