import type { Lang } from "./types";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "kn", label: "ಕನ್ನಡ" },
  { id: "ta", label: "தமிழ்" },
  { id: "te", label: "తెలుగు" },
];

const dict: Record<Lang, Record<string, string>> = {
  en: {
    navHome: "Home",
    navJourney: "How it works",
    navRoles: "Who uses it",
    navAbout: "About",
    ctaInspector: "Open inspector",
    ctaOfficer: "Officer desk",
    ctaCitizen: "Citizen scan",
    eyebrow: "Legal Metrology · Packaged Commodities",
    heroTitle1: "E-Niriksha",
    heroTitle2: "Field to proof.",
    heroTag: "साक्ष्य से समीक्षा तक",
    heroDesc:
      "A working field-to-desk system for packaged commodities: capture what is seen, seal provenance, map declarations, and keep every finding with the authorised officer.",
    note: "Prototype for demonstration. Not an official Government of India portal.",
    ribbon: "Photograph  ·  GPS + accuracy  ·  Capture time  ·  SHA-256  ·  Officer review",
  },
  hi: {
    navHome: "मुख्य पृष्ठ",
    navJourney: "प्रक्रिया",
    navRoles: "उपयोगकर्ता",
    navAbout: "परिचय",
    ctaInspector: "निरीक्षक खोलें",
    ctaOfficer: "अधिकारी डेस्क",
    ctaCitizen: "नागरिक स्कैन",
    eyebrow: "विधिक माप विज्ञान · पैकेज्ड वस्तुएँ",
    heroTitle1: "ई-निरीक्षा",
    heroTitle2: "क्षेत्र से प्रमाण तक।",
    heroTag: "साक्ष्य से समीक्षा तक",
    heroDesc:
      "पैकेज्ड वस्तुओं के लिए एक कार्यशील प्रणाली: जो दिखे उसे दर्ज करें, स्रोत सुरक्षित रखें, घोषणाएँ नक्शे पर लाएँ, और अंतिम निष्कर्ष अधिकृत अधिकारी के पास रखें।",
    note: "प्रदर्शन प्रोटोटाइप। यह भारत सरकार का आधिकारिक पोर्टल नहीं है।",
    ribbon: "फ़ोटो  ·  जीपीएस  ·  समय  ·  SHA-256  ·  अधिकारी समीक्षा",
  },
  kn: {
    navHome: "ಮುಖಪುಟ",
    navJourney: "ವಿಧಾನ",
    navRoles: "ಬಳಕೆದಾರರು",
    navAbout: "ಪರಿಚಯ",
    ctaInspector: "ಪರಿಶೀಲಕರನ್ನು ತೆರೆಯಿರಿ",
    ctaOfficer: "ಅಧಿಕಾರಿ ಡೆಸ್ಕ್",
    ctaCitizen: "ನಾಗರಿಕ ಸ್ಕ್ಯಾನ್",
    eyebrow: "ಕಾನೂನು ಮಾಪನ ವಿಜ್ಞಾನ · ಪ್ಯಾಕೇಜ್ ಸರಕುಗಳು",
    heroTitle1: "ಇ-ನಿರೀಕ್ಷಾ",
    heroTitle2: "ಕ್ಷೇತ್ರದಿಂದ ಸಾಕ್ಷ್ಯಕ್ಕೆ.",
    heroTag: "ಸಾಕ್ಷ್ಯದಿಂದ ಪರಿಶೀಲನೆಗೆ",
    heroDesc:
      "ಪ್ಯಾಕೇಜ್ ಮಾಡಿದ ವಸ್ತುಗಳಿಗಾಗಿ ಕಾರ್ಯನಿರತ ವ್ಯವಸ್ಥೆ: ಕಂಡದ್ದನ್ನು ದಾಖಲಿಸಿ, ಮೂಲವನ್ನು ಉಳಿಸಿ, ಘೋಷಣೆಗಳನ್ನು ನಕ್ಷೆ ಮಾಡಿ, ಅಂತಿಮ ನಿರ್ಧಾರವನ್ನು ಅಧಿಕಾರಿಯಲ್ಲೇ ಇರಿಸಿ.",
    note: "ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಮಾದರಿ. ಇದು ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಅಲ್ಲ.",
    ribbon: "ಫೋಟೋ  ·  ಜಿಪಿಎಸ್  ·  ಸಮಯ  ·  SHA-256  ·  ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ",
  },
  ta: {
    navHome: "முகப்பு",
    navJourney: "செயல்முறை",
    navRoles: "பயனர்கள்",
    navAbout: "பற்றி",
    ctaInspector: "ஆய்வாளரைத் திற",
    ctaOfficer: "அதிகாரி மேசை",
    ctaCitizen: "குடிமக்கள் ஸ்கேன்",
    eyebrow: "சட்ட அளவியல் · பொதி செய்யப்பட்ட பொருட்கள்",
    heroTitle1: "இ-நிரீக்ஷா",
    heroTitle2: "களத்திலிருந்து ஆதாரம்.",
    heroTag: "சான்றில் இருந்து பரிசீலனைக்கு",
    heroDesc:
      "பொதி செய்யப்பட்ட பொருட்களுக்கான இயங்கும் அமைப்பு: காண்பதைப் பதிவு செய்து, மூலத்தைப் பாதுகாத்து, அறிவிப்புகளை வரைபடமாக்கி, இறுதி முடிவை அதிகாரியிடமே வைத்திருக்கிறது.",
    note: "காட்சி முன்மாதிரி. இது இந்திய அரசின் அதிகாரப்பூர்வ தளம் அல்ல.",
    ribbon: "புகைப்படம்  ·  GPS  ·  நேரம்  ·  SHA-256  ·  அதிகாரி சரிபார்ப்பு",
  },
  te: {
    navHome: "హోమ్",
    navJourney: "విధానం",
    navRoles: "వినియోగదారులు",
    navAbout: "గురించి",
    ctaInspector: "ఇన్‌స్పెక్టర్ తెరవండి",
    ctaOfficer: "అధికారి డెస్క్",
    ctaCitizen: "పౌర స్కాన్",
    eyebrow: "లీగల్ మెట్రాలజీ · ప్యాకేజ్డ్ వస్తువులు",
    heroTitle1: "ఈ-నిరీక్ష",
    heroTitle2: "క్షేత్రం నుండి రుజువు.",
    heroTag: "సాక్ష్యం నుండి సమీక్ష వరకు",
    heroDesc:
      "ప్యాకేజ్డ్ వస్తువుల కోసం పనిచేసే వ్యవస్థ: కనిపించినదాన్ని నమోదు చేసి, మూలాన్ని భద్రపరచి, ప్రకటనలను మ్యాప్ చేసి, తుది నిర్ణయాన్ని అధికారికే వదిలిపెడుతుంది.",
    note: "ప్రదర్శన నమూనా. ఇది భారత ప్రభుత్వ అధికారిక పోర్టల్ కాదు.",
    ribbon: "ఫోటో  ·  GPS  ·  సమయం  ·  SHA-256  ·  అధికారి సమీక్ష",
  },
};

export function t(lang: Lang, key: string): string {
  return dict[lang]?.[key] ?? dict.en[key] ?? key;
}
