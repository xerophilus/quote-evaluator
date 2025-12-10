'use client';

import { useState, useEffect } from 'react';
import EmailCaptureForm from './EmailCaptureForm';
import { trackEngagement, trackEmail } from '@/lib/analytics';

export default function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup has already been shown or email was already captured
    const hasShownBefore = localStorage.getItem('exit_intent_shown');
    const hasEmailDiscount = localStorage.getItem('email_discount');
    
    if (hasShownBefore || hasEmailDiscount) {
      setHasShown(true);
      return;
    }

    let exitTimer: NodeJS.Timeout;
    let mouseLeaveTimer: NodeJS.Timeout;

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from the top of the window
      if (e.clientY <= 0 && !hasShown) {
        // Add small delay to avoid accidental triggers
        mouseLeaveTimer = setTimeout(() => {
          if (!hasShown) {
            setShowPopup(true);
            setHasShown(true);
            localStorage.setItem('exit_intent_shown', 'true');
            
            // Track exit intent trigger
            trackEmail.exitIntentTriggered('mouse_leave');
            trackEngagement.userBehavior('exit_intent_triggered');
          }
        }, 100);
      }
    };

    // Time-based backup trigger (after 45 seconds on page)
    const handleTimeBasedTrigger = () => {
      exitTimer = setTimeout(() => {
        if (!hasShown && !showPopup) {
          setShowPopup(true);
          setHasShown(true);
          localStorage.setItem('exit_intent_shown', 'true');
          
          // Track time-based trigger
          trackEmail.exitIntentTriggered('time_based');
          trackEngagement.userBehavior('time_based_popup_triggered');
        }
      }, 45000); // 45 seconds
    };

    // Scroll-based trigger (if user scrolls more than 50% down and then back up quickly)
    let maxScrollPercent = 0;
    let lastScrollY = 0;
    
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      // Track max scroll depth
      if (scrollPercent > maxScrollPercent) {
        maxScrollPercent = scrollPercent;
      }
      
      // If user scrolled past 50% and is now scrolling back up quickly
      if (maxScrollPercent > 50 && window.scrollY < lastScrollY - 50 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        localStorage.setItem('exit_intent_shown', 'true');
        
        // Track scroll-based trigger
        trackEmail.exitIntentTriggered('scroll_back');
        trackEngagement.userBehavior('scroll_back_popup_triggered');
      }
      
      lastScrollY = window.scrollY;
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start the time-based trigger
    handleTimeBasedTrigger();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(exitTimer);
      clearTimeout(mouseLeaveTimer);
    };
  }, [hasShown, showPopup]);

  const handleClose = () => {
    setShowPopup(false);
    
    // Track popup dismissal
    trackEmail.exitIntentDismissed();
    trackEngagement.userBehavior('exit_intent_popup_closed');
    
    // Don't show again for this session, but allow it to show on future visits
    // (we only set 'exit_intent_shown' when popup is triggered, not closed)
  };

  const handleEmailCapture = () => {
    // Email capture success is handled in the EmailCaptureForm component
    // This popup will close automatically after successful email capture
  };

  if (!showPopup) return null;

  return (
    <EmailCaptureForm 
      source="exit_intent"
      onClose={handleClose}
      isModal={true}
    />
  );
}