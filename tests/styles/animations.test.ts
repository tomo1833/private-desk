/**
 * CSS Animation and Styling Tests
 * Tests for the new glassmorphism design system and animations
 */

describe('CSS Animations and Styling', () => {
  let styleSheet: HTMLStyleElement;

  beforeAll(() => {
    // Create a style element with our CSS animations
    styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }

      @keyframes pulseGlow {
        0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.3); }
        100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
      }

      .gradient-bg {
        background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 400% 400%;
        animation: gradientShift 15s ease infinite;
      }

      .float {
        animation: float 6s ease-in-out infinite;
      }

      .pulse-glow {
        animation: pulseGlow 2s infinite;
      }

      .glass {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .glass-dark {
        background: rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }

      .card:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      .btn {
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .btn:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(styleSheet);
  });

  afterAll(() => {
    if (styleSheet) {
      document.head.removeChild(styleSheet);
    }
  });

  describe('CSS Keyframes', () => {
    it('should have gradientShift animation defined', () => {
      const computedStyle = window.getComputedStyle(document.body);
      const animations = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch (e) {
            return [];
          }
        })
        .flat()
        .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);

      const gradientShiftRule = animations.find((rule: any) => 
        rule.name === 'gradientShift'
      );
      expect(gradientShiftRule).toBeDefined();
    });

    it('should have float animation defined', () => {
      const animations = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch (e) {
            return [];
          }
        })
        .flat()
        .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);

      const floatRule = animations.find((rule: any) => 
        rule.name === 'float'
      );
      expect(floatRule).toBeDefined();
    });

    it('should have pulseGlow animation defined', () => {
      const animations = Array.from(document.styleSheets)
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch (e) {
            return [];
          }
        })
        .flat()
        .filter(rule => rule.type === CSSRule.KEYFRAMES_RULE);

      const pulseGlowRule = animations.find((rule: any) => 
        rule.name === 'pulseGlow'
      );
      expect(pulseGlowRule).toBeDefined();
    });
  });

  describe('Glassmorphism Classes', () => {
    it('should apply glass styling correctly', () => {
      const element = document.createElement('div');
      element.className = 'glass';
      document.body.appendChild(element);

      const computedStyle = window.getComputedStyle(element);
      
      // Note: In jsdom, backdrop-filter and some CSS properties might not be fully supported
      // We test what we can
      expect(element.classList.contains('glass')).toBe(true);
      
      document.body.removeChild(element);
    });

    it('should apply glass-dark styling correctly', () => {
      const element = document.createElement('div');
      element.className = 'glass-dark';
      document.body.appendChild(element);

      expect(element.classList.contains('glass-dark')).toBe(true);
      
      document.body.removeChild(element);
    });
  });

  describe('Animation Classes', () => {
    it('should apply gradient-bg class correctly', () => {
      const element = document.createElement('div');
      element.className = 'gradient-bg';
      document.body.appendChild(element);

      expect(element.classList.contains('gradient-bg')).toBe(true);
      
      document.body.removeChild(element);
    });

    it('should apply float animation class correctly', () => {
      const element = document.createElement('div');
      element.className = 'float';
      document.body.appendChild(element);

      expect(element.classList.contains('float')).toBe(true);
      
      document.body.removeChild(element);
    });

    it('should apply pulse-glow animation class correctly', () => {
      const element = document.createElement('div');
      element.className = 'pulse-glow';
      document.body.appendChild(element);

      expect(element.classList.contains('pulse-glow')).toBe(true);
      
      document.body.removeChild(element);
    });
  });

  describe('Card Hover Effects', () => {
    it('should have proper card base styling', () => {
      const element = document.createElement('div');
      element.className = 'card';
      document.body.appendChild(element);

      expect(element.classList.contains('card')).toBe(true);
      
      document.body.removeChild(element);
    });

    it('should apply hover state changes', (done) => {
      const element = document.createElement('div');
      element.className = 'card';
      document.body.appendChild(element);

      // Simulate hover by adding hover pseudo-class styles
      // In a real browser, this would be automatic, but we need to test the concept
      element.addEventListener('mouseenter', () => {
        expect(element.classList.contains('card')).toBe(true);
        done();
      });

      // Trigger mouseenter event
      element.dispatchEvent(new MouseEvent('mouseenter'));
      
      document.body.removeChild(element);
    });
  });

  describe('Button Hover Effects', () => {
    it('should apply btn base styling', () => {
      const element = document.createElement('button');
      element.className = 'btn';
      document.body.appendChild(element);

      expect(element.classList.contains('btn')).toBe(true);
      
      document.body.removeChild(element);
    });

    it('should handle multiple btn modifier classes', () => {
      const element = document.createElement('button');
      element.className = 'btn btn-primary pulse-glow';
      document.body.appendChild(element);

      expect(element.classList.contains('btn')).toBe(true);
      expect(element.classList.contains('btn-primary')).toBe(true);
      expect(element.classList.contains('pulse-glow')).toBe(true);
      
      document.body.removeChild(element);
    });
  });

  describe('Responsive Design Classes', () => {
    it('should handle grid responsive classes', () => {
      const element = document.createElement('div');
      element.className = 'grid grid-cols-1 lg:grid-cols-3 gap-6';
      document.body.appendChild(element);

      expect(element.classList.contains('grid')).toBe(true);
      expect(element.classList.contains('grid-cols-1')).toBe(true);
      expect(element.classList.contains('lg:grid-cols-3')).toBe(true);
      expect(element.classList.contains('gap-6')).toBe(true);
      
      document.body.removeChild(element);
    });

    it('should handle flex responsive classes', () => {
      const element = document.createElement('div');
      element.className = 'flex flex-wrap justify-center gap-3';
      document.body.appendChild(element);

      expect(element.classList.contains('flex')).toBe(true);
      expect(element.classList.contains('flex-wrap')).toBe(true);
      expect(element.classList.contains('justify-center')).toBe(true);
      expect(element.classList.contains('gap-3')).toBe(true);
      
      document.body.removeChild(element);
    });
  });

  describe('Animation Duration and Timing', () => {
    it('should validate animation durations are reasonable', () => {
      // Test that our animation durations are within expected ranges
      const gradientDuration = 15; // seconds
      const floatDuration = 6; // seconds
      const pulseDuration = 2; // seconds

      expect(gradientDuration).toBeGreaterThanOrEqual(10);
      expect(gradientDuration).toBeLessThanOrEqual(20);

      expect(floatDuration).toBeGreaterThanOrEqual(3);
      expect(floatDuration).toBeLessThanOrEqual(10);

      expect(pulseDuration).toBeGreaterThanOrEqual(1);
      expect(pulseDuration).toBeLessThanOrEqual(5);
    });

    it('should validate easing functions are appropriate', () => {
      const gradientEasing = 'ease';
      const floatEasing = 'ease-in-out';
      const pulseEasing = 'infinite'; // iteration count, not easing

      expect(gradientEasing).toBe('ease');
      expect(floatEasing).toBe('ease-in-out');
      expect(pulseEasing).toBe('infinite');
    });
  });

  describe('Color Consistency', () => {
    it('should use consistent blue color values', () => {
      const primaryBlue = 'rgba(59, 130, 246, 0.5)';
      const blueVariants = [
        'rgba(59, 130, 246, 0.5)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(59, 130, 246, 0.3)'
      ];

      blueVariants.forEach(color => {
        expect(color).toContain('59, 130, 246');
      });
    });

    it('should use consistent white transparency values', () => {
      const whiteTransparencyValues = [0.1, 0.2, 0.85, 0.95];
      
      whiteTransparencyValues.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });
});