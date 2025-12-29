import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Try to import SplitText plugin, but handle if it's not available
let GSAPSplitText: any = null;
try {
  // SplitText is a premium plugin, may not be available
  GSAPSplitText = require('gsap/SplitText');
  if (GSAPSplitText) {
    gsap.registerPlugin(ScrollTrigger, GSAPSplitText.SplitText, useGSAP);
  }
} catch (e) {
  console.warn('GSAP SplitText plugin not available, using fallback');
}

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  style: customStyle,
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Check if fonts are already loaded
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
      return;
    }

    // Wait for all fonts to load
    const loadFonts = async () => {
      try {
        await document.fonts.ready;
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Set to true anyway to prevent infinite waiting
        setFontsLoaded(true);
      }
    };

    loadFonts();

    // Fallback timeout in case fonts take too long
    const timeout = setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('Fonts loading timeout, proceeding anyway');
        setFontsLoaded(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;

      const el = ref.current as HTMLElement & {
        _rbsplitInstance?: GSAPSplitText;
      };

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;
      // If SplitText plugin is not available, use fallback
      if (!GSAPSplitText || !GSAPSplitText.SplitText) {
        // Simple fallback: just animate the element itself
        gsap.fromTo(
          el,
          { ...from },
          {
            ...to,
            duration,
            ease,
            scrollTrigger: {
              trigger: el,
              start: `top ${(1 - threshold) * 100}%`,
              once: true,
            },
            onComplete: () => {
              if (onLetterAnimationComplete && !animationCompletedRef.current) {
                animationCompletedRef.current = true;
                onLetterAnimationComplete();
              }
            }
          }
        );
        return;
      }

      let targets: Element[] = [];
      const assignTargets = (self: any) => {
        if (splitType.includes('chars') && self.chars?.length) targets = self.chars;
        if (!targets.length && splitType.includes('words') && self.words?.length) targets = self.words;
        if (!targets.length && splitType.includes('lines') && self.lines?.length) targets = self.lines;
        if (!targets.length) targets = self.chars || self.words || self.lines || [];
      };
      
      try {
        const SplitTextClass = GSAPSplitText.SplitText || GSAPSplitText;
        const splitInstance = new SplitTextClass(el, {
          type: splitType,
          smartWrap: true,
          autoSplit: splitType === 'lines',
          linesClass: 'split-line',
          wordsClass: 'split-word',
          charsClass: 'split-char',
          reduceWhiteSpace: false,
          onSplit: (self: any) => {
            assignTargets(self);
            return gsap.fromTo(
              targets,
              { ...from },
              {
                ...to,
                duration,
                ease,
                stagger: delay / 1000,
                scrollTrigger: {
                  trigger: el,
                  start,
                  once: true,
                  fastScrollEnd: true,
                  anticipatePin: 0.4
                },
                onComplete: () => {
                  animationCompletedRef.current = true;
                  onLetterAnimationComplete?.();
                },
                willChange: 'transform, opacity',
                force3D: true
              }
            );
          }
        });
        el._rbsplitInstance = splitInstance;
        
        return () => {
          ScrollTrigger.getAll().forEach(st => {
            if (st.trigger === el) st.kill();
          });
          try {
            splitInstance.revert();
          } catch (_) {}
          el._rbsplitInstance = undefined;
        };
      } catch (error) {
        console.error('SplitText animation error:', error);
      }
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete
      ],
      scope: ref
    }
  );

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      display: 'inline',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      willChange: 'transform, opacity',
      opacity: fontsLoaded ? undefined : 0,
      transition: fontsLoaded ? 'none' : 'opacity 0.3s ease',
      ...customStyle
    };
    const classes = `split-parent ${className}`;
    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref} style={style} className={classes}>
            {text}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref} style={style} className={classes}>
            {text}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref} style={style} className={classes}>
            {text}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref} style={style} className={classes}>
            {text}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref} style={style} className={classes}>
            {text}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref} style={style} className={classes}>
            {text}
          </h6>
        );
      case 'span':
        return (
          <span ref={ref as any} style={style} className={classes}>
            {text}
          </span>
        );
      default:
        return (
          <p ref={ref} style={style} className={classes}>
            {text}
          </p>
        );
    }
  };
  return renderTag();
};

export default SplitText;
