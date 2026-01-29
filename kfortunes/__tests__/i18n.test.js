/**
 * i18n (Internationalization) Unit Tests
 * 다국어 시스템 단위 테스트
 */

const path = require('path');
const i18n = require(path.join(__dirname, '../js/i18n.js'));

describe('i18n System', () => {

  beforeEach(() => {
    // Reset to default language before each test
    i18n.currentLang = 'en';
  });

  describe('Language Configuration', () => {
    test('should have 5 supported languages', () => {
      expect(Object.keys(i18n.languages)).toHaveLength(5);
    });

    test('should support en, ko, ja, zh, vi', () => {
      expect(i18n.languages).toHaveProperty('en');
      expect(i18n.languages).toHaveProperty('ko');
      expect(i18n.languages).toHaveProperty('ja');
      expect(i18n.languages).toHaveProperty('zh');
      expect(i18n.languages).toHaveProperty('vi');
    });

    test('each language should have name and flag', () => {
      Object.values(i18n.languages).forEach(lang => {
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('flag');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.flag).toBe('string');
      });
    });

    test('default language should be English', () => {
      expect(i18n.currentLang).toBe('en');
    });
  });

  describe('Translations Structure', () => {
    test('should have translations for all supported languages', () => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations).toHaveProperty(lang);
        expect(typeof i18n.translations[lang]).toBe('object');
      });
    });

    test('all languages should have same translation keys', () => {
      const englishKeys = Object.keys(i18n.translations.en);

      Object.keys(i18n.languages).forEach(lang => {
        // Check that all English keys exist in other languages
        englishKeys.forEach(key => {
          const hasKey = key in i18n.translations[lang];
          expect(hasKey).toBe(true);
        });
      });
    });
  });

  describe('Translation Keys - Navigation', () => {
    const navKeys = ['nav_fortune', 'nav_compatibility', 'nav_about'];

    test.each(navKeys)('should have translation for %s in all languages', (key) => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang][key]).toBeDefined();
        expect(typeof i18n.translations[lang][key]).toBe('string');
        expect(i18n.translations[lang][key].length).toBeGreaterThan(0);
      });
    });
  });

  describe('Translation Keys - Hero Section', () => {
    const heroKeys = ['hero_badge', 'hero_title', 'hero_tagline', 'hero_subtitle'];

    test.each(heroKeys)('should have translation for %s in all languages', (key) => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang][key]).toBeDefined();
        expect(typeof i18n.translations[lang][key]).toBe('string');
      });
    });
  });

  describe('Translation Keys - Form', () => {
    const formKeys = [
      'form_title', 'form_year', 'form_month', 'form_day',
      'form_hour', 'form_hour_unknown', 'form_gender',
      'form_male', 'form_female', 'form_submit'
    ];

    test.each(formKeys)('should have translation for %s in all languages', (key) => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang][key]).toBeDefined();
      });
    });
  });

  describe('Translation Keys - Result Page', () => {
    const resultKeys = [
      'result_title', 'result_birth_date', 'result_day_master',
      'result_four_pillars', 'result_elements', 'result_celebrity',
      'result_personality', 'result_career', 'result_love',
      'result_strength', 'result_weakness', 'result_lucky',
      'result_share', 'result_new'
    ];

    test.each(resultKeys)('should have translation for %s in all languages', (key) => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang][key]).toBeDefined();
      });
    });
  });

  describe('Translation Keys - Compatibility', () => {
    const compatKeys = [
      'compat_badge', 'compat_title', 'compat_subtitle',
      'compat_person1', 'compat_person2', 'compat_submit',
      'compat_result', 'compat_strengths', 'compat_challenges'
    ];

    test.each(compatKeys)('should have translation for %s in all languages', (key) => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang][key]).toBeDefined();
      });
    });
  });

  describe('Translation Keys - Footer', () => {
    const footerKeys = [
      'footer_copyright', 'footer_disclaimer',
      'footer_privacy', 'footer_terms', 'footer_contact', 'footer_faq'
    ];

    test.each(footerKeys)('should have translation for %s in all languages', (key) => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang][key]).toBeDefined();
      });
    });
  });

  describe('Translation Keys - Months', () => {
    test('all languages should have 12 months', () => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang].months).toBeDefined();
        expect(Array.isArray(i18n.translations[lang].months)).toBe(true);
        expect(i18n.translations[lang].months).toHaveLength(12);
      });
    });
  });

  describe('Translation Keys - Zodiac Hours', () => {
    test('all languages should have 12 zodiac hours', () => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang].zodiac_hours).toBeDefined();
        expect(Array.isArray(i18n.translations[lang].zodiac_hours)).toBe(true);
        expect(i18n.translations[lang].zodiac_hours).toHaveLength(12);
      });
    });
  });

  describe('t() Translation Function', () => {
    test('should return English translation by default', () => {
      i18n.currentLang = 'en';
      expect(i18n.t('hero_title')).toBe('KStar Match');
    });

    test('should return Korean translation when set to ko', () => {
      i18n.currentLang = 'ko';
      expect(i18n.t('nav_fortune')).toBe('성격분석');
    });

    test('should return Japanese translation when set to ja', () => {
      i18n.currentLang = 'ja';
      expect(i18n.t('nav_fortune')).toBe('性格分析');
    });

    test('should return Chinese translation when set to zh', () => {
      i18n.currentLang = 'zh';
      expect(i18n.t('nav_fortune')).toBe('性格分析');
    });

    test('should return Vietnamese translation when set to vi', () => {
      i18n.currentLang = 'vi';
      expect(i18n.t('nav_fortune')).toBe('Tính cách');
    });

    test('should fallback to English for unknown keys', () => {
      i18n.currentLang = 'ko';
      const result = i18n.t('nonexistent_key');
      // Should return the key itself as fallback
      expect(result).toBe('nonexistent_key');
    });

    test('should fallback to key when translation not found in any language', () => {
      const result = i18n.t('completely_unknown_key_12345');
      expect(result).toBe('completely_unknown_key_12345');
    });
  });

  describe('setLanguage() Function', () => {
    test('should set valid language and return true', () => {
      const result = i18n.setLanguage('ko');
      expect(result).toBe(true);
      expect(i18n.currentLang).toBe('ko');
    });

    test('should return false for invalid language', () => {
      const result = i18n.setLanguage('invalid');
      expect(result).toBe(false);
      expect(i18n.currentLang).toBe('en'); // Should remain unchanged
    });

    test('should set all supported languages', () => {
      ['en', 'ko', 'ja', 'zh', 'vi'].forEach(lang => {
        const result = i18n.setLanguage(lang);
        expect(result).toBe(true);
        expect(i18n.currentLang).toBe(lang);
      });
    });
  });

  describe('Content Quality', () => {
    test('translations should not be empty strings', () => {
      Object.keys(i18n.languages).forEach(lang => {
        Object.entries(i18n.translations[lang]).forEach(([key, value]) => {
          if (typeof value === 'string') {
            expect(value.length).toBeGreaterThan(0);
          }
        });
      });
    });

    test('hero_title should be consistent across languages', () => {
      // KStar Match should remain the same brand name
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang].hero_title).toBe('KStar Match');
      });
    });

    test('footer_copyright should contain 2026', () => {
      Object.keys(i18n.languages).forEach(lang => {
        expect(i18n.translations[lang].footer_copyright).toContain('2026');
      });
    });
  });

  describe('Special Characters', () => {
    test('Korean translations should contain Korean characters', () => {
      const koreanKeys = ['nav_fortune', 'form_title', 'form_male'];
      koreanKeys.forEach(key => {
        const value = i18n.translations.ko[key];
        // Korean Unicode range: \uAC00-\uD7AF
        expect(value).toMatch(/[\uAC00-\uD7AF]/);
      });
    });

    test('Japanese translations should contain Japanese characters', () => {
      const japaneseKeys = ['nav_fortune', 'form_title'];
      japaneseKeys.forEach(key => {
        const value = i18n.translations.ja[key];
        // Japanese Hiragana, Katakana, or Kanji
        expect(value).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/);
      });
    });

    test('Chinese translations should contain Chinese characters', () => {
      const chineseKeys = ['nav_fortune', 'form_title'];
      chineseKeys.forEach(key => {
        const value = i18n.translations.zh[key];
        // Chinese characters (CJK Unified Ideographs)
        expect(value).toMatch(/[\u4E00-\u9FFF]/);
      });
    });

    test('Vietnamese translations should contain Vietnamese characters', () => {
      const vietnameseKeys = ['hero_subtitle', 'form_title'];
      vietnameseKeys.forEach(key => {
        const value = i18n.translations.vi[key];
        // Vietnamese has Latin characters with diacritics
        expect(value).toMatch(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i);
      });
    });
  });
});
