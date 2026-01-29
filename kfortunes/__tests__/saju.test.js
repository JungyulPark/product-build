/**
 * Saju Calculator Unit Tests
 * 사주팔자 계산 단위 테스트
 */

// Load Saju module
const path = require('path');
const Saju = require(path.join(__dirname, '../js/saju.js'));

describe('Saju Calculator', () => {

  describe('STEMS and BRANCHES data', () => {
    test('should have 10 heavenly stems', () => {
      expect(Saju.STEMS).toHaveLength(10);
    });

    test('should have 12 earthly branches', () => {
      expect(Saju.BRANCHES).toHaveLength(12);
    });

    test('should have 5 elements', () => {
      expect(Object.keys(Saju.ELEMENTS)).toHaveLength(5);
      expect(Saju.ELEMENTS).toHaveProperty('wood');
      expect(Saju.ELEMENTS).toHaveProperty('fire');
      expect(Saju.ELEMENTS).toHaveProperty('earth');
      expect(Saju.ELEMENTS).toHaveProperty('metal');
      expect(Saju.ELEMENTS).toHaveProperty('water');
    });

    test('each stem should have required properties', () => {
      Saju.STEMS.forEach(stem => {
        expect(stem).toHaveProperty('hanja');
        expect(stem).toHaveProperty('korean');
        expect(stem).toHaveProperty('element');
        expect(stem).toHaveProperty('yin');
        expect(['wood', 'fire', 'earth', 'metal', 'water']).toContain(stem.element);
      });
    });

    test('each branch should have required properties', () => {
      Saju.BRANCHES.forEach(branch => {
        expect(branch).toHaveProperty('hanja');
        expect(branch).toHaveProperty('korean');
        expect(branch).toHaveProperty('animal');
        expect(branch).toHaveProperty('element');
      });
    });
  });

  describe('calculateYearPillar', () => {
    test('should calculate 1984 as 甲子 (Wood Rat)', () => {
      const result = Saju.calculateYearPillar(1984);
      expect(result.stem.hanja).toBe('甲');
      expect(result.stem.element).toBe('wood');
      expect(result.branch.animal).toBe('Rat');
    });

    test('should calculate 1990 as 庚午 (Metal Horse)', () => {
      const result = Saju.calculateYearPillar(1990);
      expect(result.stem.hanja).toBe('庚');
      expect(result.stem.element).toBe('metal');
      expect(result.branch.animal).toBe('Horse');
    });

    test('should calculate 2000 as 庚辰 (Metal Dragon)', () => {
      const result = Saju.calculateYearPillar(2000);
      expect(result.stem.hanja).toBe('庚');
      expect(result.branch.animal).toBe('Dragon');
    });

    test('should calculate 2024 as 甲辰 (Wood Dragon)', () => {
      const result = Saju.calculateYearPillar(2024);
      expect(result.stem.hanja).toBe('甲');
      expect(result.branch.animal).toBe('Dragon');
    });

    test('should follow 60-year cycle', () => {
      const year1 = Saju.calculateYearPillar(1984);
      const year2 = Saju.calculateYearPillar(2044);
      expect(year1.stem.hanja).toBe(year2.stem.hanja);
      expect(year1.branch.hanja).toBe(year2.branch.hanja);
    });
  });

  describe('calculateMonthPillar', () => {
    test('should return valid pillar structure', () => {
      const result = Saju.calculateMonthPillar(1990, 5);
      expect(result).toHaveProperty('stem');
      expect(result).toHaveProperty('branch');
      expect(result.stem).toHaveProperty('hanja');
      expect(result.branch).toHaveProperty('hanja');
    });

    test('should handle all months (1-12)', () => {
      for (let month = 1; month <= 12; month++) {
        const result = Saju.calculateMonthPillar(2000, month);
        expect(result.stem).toBeDefined();
        expect(result.branch).toBeDefined();
      }
    });
  });

  describe('calculateDayPillar', () => {
    test('should return valid pillar structure', () => {
      const result = Saju.calculateDayPillar(1990, 1, 1);
      expect(result).toHaveProperty('stem');
      expect(result).toHaveProperty('branch');
    });

    test('should calculate consistently for same date', () => {
      const result1 = Saju.calculateDayPillar(1990, 6, 15);
      const result2 = Saju.calculateDayPillar(1990, 6, 15);
      expect(result1.stem.hanja).toBe(result2.stem.hanja);
      expect(result1.branch.hanja).toBe(result2.branch.hanja);
    });

    test('should change day by day', () => {
      const day1 = Saju.calculateDayPillar(2000, 1, 1);
      const day2 = Saju.calculateDayPillar(2000, 1, 2);
      // Day pillars should be different for consecutive days
      const isSame = day1.stem.hanja === day2.stem.hanja &&
                     day1.branch.hanja === day2.branch.hanja;
      expect(isSame).toBe(false);
    });

    test('should follow 60-day cycle', () => {
      const day1 = Saju.calculateDayPillar(2000, 1, 1);
      const day61 = Saju.calculateDayPillar(2000, 3, 1); // Jan 1 + 60 days = Mar 1
      expect(day1.stem.hanja).toBe(day61.stem.hanja);
      expect(day1.branch.hanja).toBe(day61.branch.hanja);
    });
  });

  describe('calculateHourPillar', () => {
    test('should return null for empty hour', () => {
      const dayStem = Saju.STEMS[0];
      expect(Saju.calculateHourPillar(dayStem, null)).toBeNull();
      expect(Saju.calculateHourPillar(dayStem, undefined)).toBeNull();
      expect(Saju.calculateHourPillar(dayStem, '')).toBeNull();
    });

    test('should return valid pillar for valid hour', () => {
      const dayStem = Saju.STEMS[0]; // 甲
      const result = Saju.calculateHourPillar(dayStem, 12);
      expect(result).toHaveProperty('stem');
      expect(result).toHaveProperty('branch');
    });

    test('should handle all hours (0-23)', () => {
      const dayStem = Saju.STEMS[0];
      for (let hour = 0; hour <= 23; hour++) {
        const result = Saju.calculateHourPillar(dayStem, hour);
        expect(result).not.toBeNull();
        expect(result.stem).toBeDefined();
        expect(result.branch).toBeDefined();
      }
    });
  });

  describe('calculate (main function)', () => {
    test('should return complete result structure', () => {
      const result = Saju.calculate(1990, 6, 15, null, 'male');

      expect(result).toHaveProperty('fourPillars');
      expect(result).toHaveProperty('dayMaster');
      expect(result).toHaveProperty('elementCount');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('interpretation');
    });

    test('should have all four pillars', () => {
      const result = Saju.calculate(1990, 6, 15, 12, 'female');

      expect(result.fourPillars).toHaveProperty('year');
      expect(result.fourPillars).toHaveProperty('month');
      expect(result.fourPillars).toHaveProperty('day');
      expect(result.fourPillars).toHaveProperty('hour');
    });

    test('should have null hour pillar when hour not provided', () => {
      const result = Saju.calculate(1990, 6, 15, null, 'male');
      expect(result.fourPillars.hour).toBeNull();
    });

    test('should set correct gender', () => {
      const male = Saju.calculate(1990, 6, 15, null, 'male');
      const female = Saju.calculate(1990, 6, 15, null, 'female');

      expect(male.gender).toBe('male');
      expect(female.gender).toBe('female');
    });

    test('dayMaster should be from day pillar stem', () => {
      const result = Saju.calculate(1990, 6, 15, null, 'male');
      expect(result.dayMaster).toBe(result.fourPillars.day.stem);
    });
  });

  describe('analyzeElements', () => {
    test('should count all five elements', () => {
      const result = Saju.calculate(1990, 6, 15, 12, 'male');

      expect(result.elementCount).toHaveProperty('wood');
      expect(result.elementCount).toHaveProperty('fire');
      expect(result.elementCount).toHaveProperty('earth');
      expect(result.elementCount).toHaveProperty('metal');
      expect(result.elementCount).toHaveProperty('water');
    });

    test('should have total of 6-8 elements (with or without hour)', () => {
      const withHour = Saju.calculate(1990, 6, 15, 12, 'male');
      const withoutHour = Saju.calculate(1990, 6, 15, null, 'male');

      const totalWithHour = Object.values(withHour.elementCount).reduce((a, b) => a + b, 0);
      const totalWithoutHour = Object.values(withoutHour.elementCount).reduce((a, b) => a + b, 0);

      expect(totalWithHour).toBe(8); // 4 pillars * 2 (stem + branch)
      expect(totalWithoutHour).toBe(6); // 3 pillars * 2
    });
  });

  describe('getInterpretation', () => {
    test('should return interpretation with all required fields', () => {
      const result = Saju.calculate(1990, 6, 15, null, 'male');
      const interp = result.interpretation;

      expect(interp).toHaveProperty('personality');
      expect(interp).toHaveProperty('career');
      expect(interp).toHaveProperty('love');
      expect(interp).toHaveProperty('strength');
      expect(interp).toHaveProperty('weakness');
      expect(interp).toHaveProperty('luckyElement');
      expect(interp).toHaveProperty('luckyNumbers');
      expect(interp).toHaveProperty('luckyColors');
      expect(interp).toHaveProperty('luckyDirection');
    });

    test('career should be an array', () => {
      const result = Saju.calculate(1990, 6, 15, null, 'male');
      expect(Array.isArray(result.interpretation.career)).toBe(true);
      expect(result.interpretation.career.length).toBeGreaterThan(0);
    });

    test('luckyNumbers should be an array of 2 numbers', () => {
      const result = Saju.calculate(1990, 6, 15, null, 'male');
      expect(Array.isArray(result.interpretation.luckyNumbers)).toBe(true);
      expect(result.interpretation.luckyNumbers).toHaveLength(2);
    });
  });

  describe('calculateCompatibility', () => {
    const person1 = { year: 1990, month: 6, day: 15, hour: null, gender: 'male' };
    const person2 = { year: 1992, month: 3, day: 20, hour: null, gender: 'female' };

    test('should return score between 20 and 100', () => {
      const result = Saju.calculateCompatibility(person1, person2);
      expect(result.score).toBeGreaterThanOrEqual(20);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('should return both person data', () => {
      const result = Saju.calculateCompatibility(person1, person2);
      expect(result).toHaveProperty('person1');
      expect(result).toHaveProperty('person2');
      expect(result.person1).toHaveProperty('dayMaster');
      expect(result.person2).toHaveProperty('dayMaster');
    });

    test('should return analysis with rating and description', () => {
      const result = Saju.calculateCompatibility(person1, person2);
      expect(result).toHaveProperty('analysis');
      expect(result.analysis).toHaveProperty('rating');
      expect(result.analysis).toHaveProperty('emoji');
      expect(result.analysis).toHaveProperty('description');
      expect(result.analysis).toHaveProperty('strengths');
      expect(result.analysis).toHaveProperty('challenges');
    });

    test('strengths and challenges should be arrays', () => {
      const result = Saju.calculateCompatibility(person1, person2);
      expect(Array.isArray(result.analysis.strengths)).toBe(true);
      expect(Array.isArray(result.analysis.challenges)).toBe(true);
    });

    test('same person should have high compatibility', () => {
      const result = Saju.calculateCompatibility(person1, person1);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Element relationships', () => {
    test('wood generates fire', () => {
      expect(Saju.ELEMENTS.wood.generates).toBe('fire');
    });

    test('fire generates earth', () => {
      expect(Saju.ELEMENTS.fire.generates).toBe('earth');
    });

    test('earth generates metal', () => {
      expect(Saju.ELEMENTS.earth.generates).toBe('metal');
    });

    test('metal generates water', () => {
      expect(Saju.ELEMENTS.metal.generates).toBe('water');
    });

    test('water generates wood', () => {
      expect(Saju.ELEMENTS.water.generates).toBe('wood');
    });

    test('wood controls earth', () => {
      expect(Saju.ELEMENTS.wood.controls).toBe('earth');
    });

    test('fire controls metal', () => {
      expect(Saju.ELEMENTS.fire.controls).toBe('metal');
    });

    test('earth controls water', () => {
      expect(Saju.ELEMENTS.earth.controls).toBe('water');
    });

    test('metal controls wood', () => {
      expect(Saju.ELEMENTS.metal.controls).toBe('wood');
    });

    test('water controls fire', () => {
      expect(Saju.ELEMENTS.water.controls).toBe('fire');
    });
  });

  describe('Helper functions', () => {
    test('getLuckyNumbers returns correct numbers for each element', () => {
      expect(Saju.getLuckyNumbers('wood')).toEqual([3, 8]);
      expect(Saju.getLuckyNumbers('fire')).toEqual([2, 7]);
      expect(Saju.getLuckyNumbers('earth')).toEqual([5, 10]);
      expect(Saju.getLuckyNumbers('metal')).toEqual([4, 9]);
      expect(Saju.getLuckyNumbers('water')).toEqual([1, 6]);
    });

    test('getLuckyDirection returns correct direction for each element', () => {
      expect(Saju.getLuckyDirection('wood')).toBe('East');
      expect(Saju.getLuckyDirection('fire')).toBe('South');
      expect(Saju.getLuckyDirection('earth')).toBe('Center');
      expect(Saju.getLuckyDirection('metal')).toBe('West');
      expect(Saju.getLuckyDirection('water')).toBe('North');
    });

    test('getLuckyColors returns array for each element', () => {
      const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
      elements.forEach(element => {
        const colors = Saju.getLuckyColors(element);
        expect(Array.isArray(colors)).toBe(true);
        expect(colors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Validation', () => {
    const SajuError = require(path.join(__dirname, '../js/saju.js')).SajuError;

    describe('Date Validation', () => {
      test('isValidDate returns valid for correct date', () => {
        const result = Saju.isValidDate(1990, 6, 15);
        expect(result.valid).toBe(true);
      });

      test('isValidDate returns invalid for non-integer year', () => {
        const result = Saju.isValidDate('1990', 6, 15);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('integers');
      });

      test('isValidDate returns invalid for year out of range', () => {
        const result = Saju.isValidDate(1800, 6, 15);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Year');
      });

      test('isValidDate returns invalid for month out of range', () => {
        const result = Saju.isValidDate(1990, 13, 15);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Month');
      });

      test('isValidDate returns invalid for day out of range', () => {
        const result = Saju.isValidDate(1990, 2, 30);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Day');
      });

      test('isValidDate handles February leap year correctly', () => {
        // 2000 is a leap year
        expect(Saju.isValidDate(2000, 2, 29).valid).toBe(true);
        expect(Saju.isValidDate(2000, 2, 30).valid).toBe(false);

        // 1900 is not a leap year
        expect(Saju.isValidDate(1900, 2, 29).valid).toBe(false);
      });
    });

    describe('Hour Validation', () => {
      test('isValidHour returns valid and isEmpty for null', () => {
        const result = Saju.isValidHour(null);
        expect(result.valid).toBe(true);
        expect(result.isEmpty).toBe(true);
      });

      test('isValidHour returns valid for valid hour string', () => {
        const result = Saju.isValidHour('12');
        expect(result.valid).toBe(true);
        expect(result.isEmpty).toBe(false);
      });

      test('isValidHour returns invalid for hour > 23', () => {
        const result = Saju.isValidHour(24);
        expect(result.valid).toBe(false);
      });

      test('isValidHour returns invalid for negative hour', () => {
        const result = Saju.isValidHour(-1);
        expect(result.valid).toBe(false);
      });
    });

    describe('Gender Validation', () => {
      test('isValidGender accepts male', () => {
        expect(Saju.isValidGender('male').valid).toBe(true);
      });

      test('isValidGender accepts female', () => {
        expect(Saju.isValidGender('female').valid).toBe(true);
      });

      test('isValidGender rejects other values', () => {
        expect(Saju.isValidGender('other').valid).toBe(false);
        expect(Saju.isValidGender('').valid).toBe(false);
        expect(Saju.isValidGender(null).valid).toBe(false);
      });
    });

    describe('calculate() error handling', () => {
      test('throws SajuError for invalid date', () => {
        expect(() => {
          Saju.calculate(1990, 2, 30, null, 'male');
        }).toThrow(SajuError);
      });

      test('throws SajuError for invalid gender', () => {
        expect(() => {
          Saju.calculate(1990, 6, 15, null, 'unknown');
        }).toThrow(SajuError);
      });

      test('error has correct code for invalid date', () => {
        try {
          Saju.calculate(1990, 13, 15, null, 'male');
        } catch (e) {
          expect(e.code).toBe(Saju.ERROR_CODES.INVALID_DATE);
        }
      });

      test('error has correct code for invalid gender', () => {
        try {
          Saju.calculate(1990, 6, 15, null, 'invalid');
        } catch (e) {
          expect(e.code).toBe(Saju.ERROR_CODES.INVALID_GENDER);
        }
      });
    });

    describe('SajuError class', () => {
      test('SajuError is an instance of Error', () => {
        const error = new SajuError('Test error');
        expect(error instanceof Error).toBe(true);
      });

      test('SajuError has correct name', () => {
        const error = new SajuError('Test error');
        expect(error.name).toBe('SajuError');
      });

      test('SajuError has default code', () => {
        const error = new SajuError('Test error');
        expect(error.code).toBe('SAJU_ERROR');
      });

      test('SajuError accepts custom code', () => {
        const error = new SajuError('Test error', 'CUSTOM_CODE');
        expect(error.code).toBe('CUSTOM_CODE');
      });
    });
  });
});
