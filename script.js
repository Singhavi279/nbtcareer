document.addEventListener('DOMContentLoaded', () => {
  /* ========================================================
     1. Scroll Reveal Animations (Intersection Observer)
     ======================================================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only reveal once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ========================================================
     2. Smooth Scrolling for Anchor Links
     ======================================================== */
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  
  scrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // If it's just "#", ignore
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Offset for the fixed glass nav
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });

  /* ========================================================
     3. Hero Form UI Flow (Phone -> OTP -> Details)
     ======================================================== */
  const viewMobile = document.getElementById('view-mobile');
  const viewOtp = document.getElementById('view-otp');
  const viewDetails = document.getElementById('view-details');
  const viewSuccess = document.getElementById('view-success');

  const inputPhone = document.getElementById('reg-phone');
  const inputOtp = document.getElementById('reg-otp');
  const displayPhone = document.getElementById('display-phone');
  
  const btnSendOtp = document.getElementById('btn-send-otp');
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  const btnEditPhone = document.getElementById('edit-phone');
  const form = document.getElementById('heroRegistrationForm');

  // Helper to standard view change
  const switchView = (fromView, toView) => {
    fromView.classList.remove('active-view');
    toView.classList.add('active-view');
  };

  btnSendOtp.addEventListener('click', () => {
    const phoneVal = inputPhone.value.trim();
    const phoneGroup = inputPhone.closest('.form-group');

    // Basic validation
    if (!/^[0-9]{10}$/.test(phoneVal)) {
      phoneGroup.classList.add('has-error');
      return;
    }
    phoneGroup.classList.remove('has-error');

    // Move to OTP view
    displayPhone.textContent = '+91 ' + phoneVal;
    switchView(viewMobile, viewOtp);
    inputOtp.focus();
  });

  btnEditPhone.addEventListener('click', (e) => {
    e.preventDefault();
    switchView(viewOtp, viewMobile);
    inputPhone.focus();
  });

  btnVerifyOtp.addEventListener('click', () => {
    const otpVal = inputOtp.value.trim();
    const otpGroup = inputOtp.closest('.form-group');

    // Fake OTP verify (assume any 4 digits work for demo, except blank)
    if (!/^[0-9]{4}$/.test(otpVal)) {
      otpGroup.classList.add('has-error');
      return;
    }
    otpGroup.classList.remove('has-error');

    // Move to Full Details view
    switchView(viewOtp, viewDetails);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Minimal HTML5 validness check done by browser form if submit event fires,
    // assuming valid. Let's move to success view.
    switchView(viewDetails, viewSuccess);
  });


  /* ========================================================
     4. Exit Intent Popup Logic
     ======================================================== */
  const exitPopup = document.getElementById('exitPopup');
  const closePopupBtns = document.querySelectorAll('.close-popup, .js-close-popup');
  let hasTriggeredExit = false;

  const showExitPopup = (e) => {
    if (e.clientY <= 0 && !hasTriggeredExit) {
      exitPopup.classList.add('show');
      hasTriggeredExit = true;
      document.removeEventListener('mouseleave', showExitPopup);
    }
  };

  // Only trigger on desktop-ish devices
  if (window.innerWidth > 768) {
    // Add small delay so it doesn't trigger accidentally immediately on load
    setTimeout(() => {
      document.addEventListener('mouseleave', showExitPopup);
    }, 2000);
  }

  closePopupBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // If it's the anchor button, smooth scroll handles the rest, just close popup
      if(btn.tagName !== 'A') {
        e.preventDefault();
      }
      exitPopup.classList.remove('show');
    });
  });

  // Close on outside click
  exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) {
      exitPopup.classList.remove('show');
    }
  });

});
