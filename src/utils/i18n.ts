/**
 * Jal-Nikaas: Multilingual i18n Dictionary
 * Supports English, Bengali (বাংলা), and Hindi (हिन्दी)
 * Designed for Eastern India agricultural context (West Bengal, Bihar, Assam)
 */

import { Language } from '../types';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    app_title: 'JAL-NIKAAS',
    app_subtitle: 'Agro-Drain Intelligence Platform',
    geography_tag: 'Eastern India Basin (Hooghly & Nadia)',
    demo_badge: 'Operational Prototype',
    simulation_active: 'Live Telemetry Simulation Active',
    simulation_paused: 'Simulation Paused',
    offline_status_online: 'Edge Gateway Synced',
    offline_status_offline: 'Offline Mode (Local Storage)',
    sync_pending: 'queued for sync',

    // Role Switcher
    role_farmer: 'Farmer View',
    role_officer: 'Panchayat Officer',
    role_switch_prompt: 'Switch View',
    farmer_tagline: 'Simple field waterlogging alerts & voice advisories for farmers',
    officer_tagline: 'Gram Panchayat drainage infrastructure decision-support & GIS intelligence',

    // Farmer Navigation
    farmer_nav_home: 'Home',
    farmer_nav_field: 'My Field Status',
    farmer_nav_alerts: 'Waterlogging Alerts',
    farmer_nav_recommendations: 'Recommendations',
    farmer_nav_map: 'Local Drainage Map',
    farmer_nav_settings: 'Language & Voice',

    // Panchayat Officer Navigation
    nav_overview: 'Overview Dashboard',
    nav_monitoring: 'Live Monitoring',
    nav_gis: 'GIS & Drainage Map',
    nav_alerts: 'Alert Centre',
    nav_crops: 'Crop Vulnerability',
    nav_farmers: 'Farmers & Plots',
    nav_reports: 'Reports & History',

    // Status & Simple Metrics
    total_locations: 'Monitored Locations',
    normal_risk: 'Normal Flow',
    backflow_risk: 'Backflow Risk',
    submergence_alert: 'Submergence Alert',
    sensor_fault: 'Sensor Fault',
    active_alerts: 'Active Alerts',
    network_uptime: 'Gateway Uptime',
    telemetry_interval: 'Telemetry Rate',

    // Simplified Status for Farmers
    status_safe: 'Safe - Normal Drainage',
    status_warning: 'Caution - Rising Water',
    status_critical: 'Danger - Severe Waterlogging',
    status_fault: 'Sensor Offline - Inspect Manually',

    // Risk Categories
    cat_NORMAL: 'Normal Gravity Flow',
    cat_BACKFLOW_RISK: 'Backflow / Reverse Flow Risk',
    cat_SUBMERGENCE_ALERT: 'Critical Inundation Alert',
    cat_SENSOR_FAULT: 'Sensor / Telemetry Fault',

    // Common UI
    location: 'Location',
    agricultural_area: 'Agricultural Area',
    select_your_area: 'Select Your Agricultural Area:',
    farm_side_level: 'Farm-Side Water Level',
    downstream_level: 'Downstream Canal Level',
    differential: 'Differential (Δh)',
    rate_of_rise: 'Rate of Rise (dh/dt)',
    last_updated: 'Last Reading',
    status: 'Status',
    actions: 'Actions',
    acknowledge: 'Acknowledge Alert',
    acknowledged: 'Acknowledged',
    recommended_action: 'Recommended Action',
    farmer_advisory: 'Farmer Advisory',
    configure_thresholds: 'Configure Risk Rules',
    export_csv: 'Export CSV Report',
    filter_by: 'Filter By',
    all_locations: 'All Locations',
    all_severities: 'All Severities',
    severity: 'Severity',
    time_range: 'Time Range',
    hours_6: 'Last 6 Hours',
    hours_24: 'Last 24 Hours',
    days_7: 'Last 7 Days',

    // Voice
    listen_voice: 'Listen to Voice Advisory',
    voice_playing: 'Playing Audio...',
    voice_stop: 'Stop Audio',
    voice_unsupported: 'Web Speech not supported in this browser',

    // Simulator controls
    pause: 'Pause',
    resume: 'Resume',
    simulate_storm: 'Simulate Heavy Rain Surge',
    simulate_backflow: 'Simulate Tidal Backflow',
    reset_simulation: 'Reset to Normal Flow',
    simulation_speed: 'Simulation Speed',

    // Disclaimer
    banner_disclaimer: 'Demonstration telemetry: readings are simulated to showcase differential hydraulic analysis and early-warning logic. Do not use for actual flood rescue operations.',
  },
  bn: {
    // Brand & Header
    app_title: 'জল-নিকাশ (JAL-NIKAAS)',
    app_subtitle: 'কৃষি জলনিকাশী ও জলাবদ্ধতা পূর্ব সতর্কবার্তা প্ল্যাটফর্ম',
    geography_tag: 'পূর্ব ভারত অববাহিকা (হুগলী ও নদীয়া জেলা)',
    demo_badge: 'কার্যকরী প্রোটোটাইপ',
    simulation_active: 'লাইভ টেলিমেট্রি সিমুলেশন চালু',
    simulation_paused: 'সিমুলেশন সাময়িক স্থগিত',
    offline_status_online: 'এজ গেটওয়ে সংযুক্ত',
    offline_status_offline: 'অফলাইন মোড (স্থানীয় স্টোরেজ)',
    sync_pending: 'সিঙ্কের জন্য অপেক্ষমান',

    // Role Switcher
    role_farmer: 'কৃষক পোর্টাল',
    role_officer: 'পঞ্চায়েত আধিকারিক',
    role_switch_prompt: 'ভিউ পরিবর্তন করুন',
    farmer_tagline: 'কৃষকদের জন্য সহজ ভাষায় জলাবদ্ধতার পূর্বাভাস ও ভয়েস পরামর্শ',
    officer_tagline: 'গ্রাম পঞ্চায়েতের জন্য নিকাশী পরিকাঠামো ও ভৌগোলিক বিশ্লেষণ ব্যবস্থা',

    // Farmer Navigation
    farmer_nav_home: 'হোম',
    farmer_nav_field: 'আমার জমির অবস্থা',
    farmer_nav_alerts: 'জলাবদ্ধতার সতর্কতা',
    farmer_nav_recommendations: 'জরুরি পরামর্শ',
    farmer_nav_map: 'স্থানীয় নিকাশী মানচিত্র',
    farmer_nav_settings: 'ভাষা ও ভয়েস',

    // Panchayat Officer Navigation
    nav_overview: 'সাধারণ বিবরণ',
    nav_monitoring: 'লাইভ পর্যবেক্ষণ',
    nav_gis: 'জিআইএস ও নিকাশী মানচিত্র',
    nav_alerts: 'সতর্কবার্তা কেন্দ্র',
    nav_crops: 'ফসল সংবেদনশীলতা',
    nav_farmers: 'কৃষক ও জমি তালিকা',
    nav_reports: 'প্রতিবেদন ও ইতিহাস',

    // Status & Metrics
    total_locations: 'নজরদারির স্থান',
    normal_risk: 'স্বাভাবিক প্রবাহ',
    backflow_risk: 'উল্টো স্রোতের ঝুঁকি (ব্যাকফ্লো)',
    submergence_alert: 'জলাবদ্ধতার সতর্কতা',
    sensor_fault: 'সেন্সর ত্রুটি',
    active_alerts: 'সক্রিয় সতর্কতা',
    network_uptime: 'গেটওয়ে আপটাইম',
    telemetry_interval: 'রিডিং ফ্রিকোয়েন্সি',

    // Simplified Status for Farmers
    status_safe: 'নিরাপদ - স্বাভাবিক নিকাশী',
    status_warning: 'সতর্কতা - জল বাড়ছে',
    status_critical: 'বিপদ - গুরুতর জলাবদ্ধতা',
    status_fault: 'সেন্সর বন্ধ - নিজ চোখে দেখুন',

    // Risk Categories
    cat_NORMAL: 'স্বাভাবিক অভিকর্ষ প্রবাহ',
    cat_BACKFLOW_RISK: 'উল্টো স্রোত / ব্যাকফ্লো ঝুঁকি',
    cat_SUBMERGENCE_ALERT: 'মারাত্মক জলাবদ্ধতা সতর্কতা',
    cat_SENSOR_FAULT: 'সেন্সর / টেলিমেট্রি ত্রুটি',

    // Common UI
    location: 'স্থান',
    agricultural_area: 'কৃষি অঞ্চল',
    select_your_area: 'আপনার কৃষি এলাকা নির্বাচন করুন:',
    farm_side_level: 'জমির প্রান্তের জলস্তর',
    downstream_level: 'খাল বা নালার জলস্তর',
    differential: 'পার্থক্য (Δh)',
    rate_of_rise: 'জল বৃদ্ধির গতি (dh/dt)',
    last_updated: 'সর্বশেষ আপডেট',
    status: 'অবস্থা',
    actions: 'পদক্ষেপ',
    acknowledge: 'সতর্কতা গ্রহণ করুন',
    acknowledged: 'গৃহীত হয়েছে',
    recommended_action: 'প্রস্তাবিত পদক্ষেপ',
    farmer_advisory: 'কৃষক পরামর্শ',
    configure_thresholds: 'ঝুঁকির নিয়ম রূপরেখা',
    export_csv: 'CSV রিপোর্ট ডাউনলোড',
    filter_by: 'ফিল্টার করুন',
    all_locations: 'সকল স্থান',
    all_severities: 'সকল তীব্রতা',
    severity: 'তীব্রতা',
    time_range: 'সময়সীমা',
    hours_6: 'গত ৬ ঘণ্টা',
    hours_24: 'গত ২৪ ঘণ্টা',
    days_7: 'গত ৭ দিন',

    // Voice
    listen_voice: 'পরামর্শ শুনুন (ভয়েস)',
    voice_playing: 'অডিও চলছে...',
    voice_stop: 'থামান',
    voice_unsupported: 'আপনার ব্রাউজারে ভয়েস সমর্থিত নয়',

    // Simulator controls
    pause: 'বিরতি',
    resume: 'চালু করুন',
    simulate_storm: 'ভারী বৃষ্টির অনুকরণ',
    simulate_backflow: 'ভাটার লক / উল্টো স্রোত অনুকরণ',
    reset_simulation: 'স্বাভাবিক অবস্থায় ফিরুন',
    simulation_speed: 'সিমুলেশন গতি',

    // Disclaimer
    banner_disclaimer: 'নমুনা টেলিমেট্রি: হাইড্রোলিক ডিফারেনশিয়াল এবং সতর্কবার্তা লজিক প্রদর্শনের উদ্দেশ্যে কৃত্রিম ডেটা ব্যবহৃত হচ্ছে।',
  },
  hi: {
    // Brand & Header
    app_title: 'जल-निकास (JAL-NIKAAS)',
    app_subtitle: 'कृषि जलभराव एवं जल निकासी पूर्व-चेतावनी प्रणाली',
    geography_tag: 'पूर्वी भारत बेसिन (हुगली एवं नादिया जिला)',
    demo_badge: 'संचालन प्रोटोटाइप',
    simulation_active: 'लाइव टेलीमेट्री सिमुलेशन सक्रिय',
    simulation_paused: 'सिमुलेशन रुका हुआ',
    offline_status_online: 'एज गेटवे कनेक्टेड',
    offline_status_offline: 'ऑफलाइन मोड (लोकल स्टोरेज)',
    sync_pending: 'सिंक हेतु कतारबद्ध',

    // Role Switcher
    role_farmer: 'किसान पोर्टल',
    role_officer: 'पंचायत अधिकारी',
    role_switch_prompt: 'दृश्य बदलें',
    farmer_tagline: 'किसानों के लिए सरल जलभराव चेतावनी एवं बोलकर सलाह',
    officer_tagline: 'ग्राम पंचायत हेतु जल निकासी बुनियादी ढांचा एवं जीआईएस निगरानी प्रणाली',

    // Farmer Navigation
    farmer_nav_home: 'होम',
    farmer_nav_field: 'खेत की स्थिति',
    farmer_nav_alerts: 'जलभराव अलर्ट',
    farmer_nav_recommendations: 'सुझाई गई सलाह',
    farmer_nav_map: 'स्थानीय जल निकासी मानचित्र',
    farmer_nav_settings: 'भाषा एवं आवाज',

    // Panchayat Officer Navigation
    nav_overview: 'मुख्य डैशबोर्ड',
    nav_monitoring: 'लाइव निगरानी',
    nav_gis: 'जीआईएस एवं जल निकासी मानचित्र',
    nav_alerts: 'चेतावनी केंद्र',
    nav_crops: 'फसल संवेदनशीलता',
    nav_farmers: 'किसान एवं भूखंड',
    nav_reports: 'रिपोर्ट एवं इतिहास',

    // Status & Metrics
    total_locations: 'निगरानी स्थल',
    normal_risk: 'सामान्य प्रवाह',
    backflow_risk: 'उल्टे बहाव का जोखिम (बैकफ्लो)',
    submergence_alert: 'जलभराव चेतावनी',
    sensor_fault: 'सेंसर खराबी',
    active_alerts: 'सक्रिय चेतावनियां',
    network_uptime: 'गेटवे अपटाइम',
    telemetry_interval: 'टेलीमेट्री अंतराल',

    // Simplified Status for Farmers
    status_safe: 'सुरक्षित - सामान्य जल निकासी',
    status_warning: 'सावधानी - जलस्तर बढ़ रहा है',
    status_critical: 'खतरा - गंभीर जलभराव',
    status_fault: 'सेंसर ऑफलाइन - स्वयं जांचें',

    // Risk Categories
    cat_NORMAL: 'सामान्य गुरुत्वाकर्षण प्रवाह',
    cat_BACKFLOW_RISK: 'बैकफ्लो / उल्टा जल प्रवाह जोखिम',
    cat_SUBMERGENCE_ALERT: 'गंभीर जलभराव चेतावनी',
    cat_SENSOR_FAULT: 'सेंसर / टेलीमेट्री खराबी',

    // Common UI
    location: 'स्थान',
    agricultural_area: 'कृषि क्षेत्र',
    select_your_area: 'अपना कृषि क्षेत्र चुनें:',
    farm_side_level: 'खेत की ओर जल स्तर',
    downstream_level: 'निचली नहर / नाले का जल स्तर',
    differential: 'जलस्तर अंतर (Δh)',
    rate_of_rise: 'जल स्तर वृद्धि दर (dh/dt)',
    last_updated: 'अंतिम अपडेट',
    status: 'स्थिति',
    actions: 'कार्रवाई',
    acknowledge: 'स्वीकार करें',
    acknowledged: 'स्वीकृत',
    recommended_action: 'सुझाई गई कार्रवाई',
    farmer_advisory: 'किसान सलाह',
    configure_thresholds: 'जोखिम नियम सेटिंग्स',
    export_csv: 'CSV रिपोर्ट डाउनलोड',
    filter_by: 'फ़िल्टर करें',
    all_locations: 'सभी स्थान',
    all_severities: 'सभी गंभीरता',
    severity: 'गंभीरता',
    time_range: 'समय सीमा',
    hours_6: 'पिछले 6 घंटे',
    hours_24: 'पिछले 24 घंटे',
    days_7: 'पिछले 7 दिन',

    // Voice
    listen_voice: 'सलाह सुनें (आवाज)',
    voice_playing: 'ऑडियो चल रहा है...',
    voice_stop: 'रोकें',
    voice_unsupported: 'आपके ब्राउज़र में आवाज समर्थित नहीं है',

    // Simulator controls
    pause: 'रोकें',
    resume: 'पुनः चालू करें',
    simulate_storm: 'भारी वर्षा का सिमुलेशन',
    simulate_backflow: 'बैकफ्लो प्रवाह का सिमुलेशन',
    reset_simulation: 'सामान्य स्थिति पर रीसेट',
    simulation_speed: 'सिमुलेशन गति',

    // Disclaimer
    banner_disclaimer: 'प्रदर्शनी टेलीमेट्री: हाइड्रोलिक अंतर विश्लेषण और चेतावनी प्रणाली को दर्शाने हेतु कृत्रिम डेटा का उपयोग किया गया है।',
  },
};

export function getTranslation(lang: Language, key: string, fallback = ''): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || fallback || key;
}
