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

  const countUpElements = document.querySelectorAll('.js-count-up');

  const animateCount = (element) => {
    const target = Number(element.dataset.target || 0);
    const suffix = element.dataset.suffix || '';
    const duration = 1400;
    const startTime = performance.now();

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      element.textContent = `${value}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${target}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.45
  });

  countUpElements.forEach(el => counterObserver.observe(el));

  /* ========================================================
     2. Smooth Scrolling for Anchor Links
     ======================================================== */
  const scrollLinks = document.querySelectorAll('a[href^="#"]');

  scrollLinks.forEach(link => {
    link.addEventListener('click', function (e) {
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

    const checkedPass = document.querySelector('input[name="pass_type"]:checked');
    const isPaid = checkedPass && checkedPass.value === 'paid';
    
    if (isPaid) {
      const termsCheckbox = document.getElementById('reg-terms-checkbox');
      if (termsCheckbox && !termsCheckbox.checked) {
        alert("Please acknowledge the booking terms & conditions to proceed.");
        return;
      }
    }

    const successMessageEl = document.getElementById('success-pass-message');
    if (successMessageEl) {
      if (isPaid) {
        successMessageEl.textContent = 'We will send your entry pass via email and WhatsApp shortly.';
      } else {
        successMessageEl.textContent = 'We will send your entry pass via email shortly.';
      }
    }

    // Minimal HTML5 validness check done by browser form if submit event fires,
    // assuming valid. Let's move to success view.
    switchView(viewDetails, viewSuccess);

    // Clear local storage upon successful submission
    localStorage.removeItem('nbtCareerFormState');
  });

  // --- Live Activity Alert Logic (Marquee) ---
  const marqueeEl = document.getElementById('dynamic-marquee-text');
  const activityIcon = document.querySelector('.live-activity-icon');

  if (marqueeEl) {
    let currentViewers = 50;
    marqueeEl.textContent = `${currentViewers} people are filling this form right now`;

    marqueeEl.addEventListener('animationiteration', () => {
      if (currentViewers < 150) {
        const pace = Math.floor(Math.random() * (7 - 3 + 1)) + 3;
        currentViewers = Math.min(150, currentViewers + pace);
      } else {
        const drift = Math.floor(Math.random() * 11) - 5;
        currentViewers = Math.max(140, Math.min(150, currentViewers + drift));
      }
      marqueeEl.textContent = `${currentViewers} people are filling this form right now`;
      if (activityIcon) activityIcon.textContent = '🔥';
    });
  }

  // --- Pass Selection & Persistence Logic ---
  const btnSubmitFinal = document.getElementById('btn-submit');
  const passRadios = document.querySelectorAll('input[name="pass_type"]');
  const termsWrapper = document.getElementById('terms-acknowledgement-wrapper');
  const termsCheckbox = document.getElementById('reg-terms-checkbox');
  const termsAccordion = document.getElementById('terms-accordion-content');
  const toggleTermsLink = document.getElementById('toggle-terms-details');
  const timeSlotGroup = document.getElementById('time-slot-group');
  const regTimeSlot = document.getElementById('reg-time-slot');

  const updatePassUI = (isPaid) => {
    if (isPaid) {
      btnSubmitFinal.textContent = 'Pay INR 399 & Register';
      if (termsWrapper) termsWrapper.style.display = 'block';
      if (termsCheckbox) termsCheckbox.required = true;
      if (timeSlotGroup) timeSlotGroup.style.display = 'block';
      if (regTimeSlot) regTimeSlot.required = true;
    } else {
      btnSubmitFinal.textContent = 'Get Free Visitor Pass';
      if (termsWrapper) termsWrapper.style.display = 'none';
      if (termsCheckbox) {
        termsCheckbox.required = false;
        termsCheckbox.checked = false;
        if (termsAccordion) termsAccordion.style.display = 'none';
      }
      if (timeSlotGroup) timeSlotGroup.style.display = 'none';
      if (regTimeSlot) {
        regTimeSlot.required = false;
      }
    }
  };

  passRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      updatePassUI(e.target.value === 'paid');
    });
  });

  if (termsCheckbox && termsAccordion) {
    termsCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        termsAccordion.style.display = 'block';
      } else {
        termsAccordion.style.display = 'none';
      }
    });
  }

  if (toggleTermsLink && termsCheckbox) {
    toggleTermsLink.addEventListener('click', (e) => {
      e.preventDefault();
      termsCheckbox.checked = !termsCheckbox.checked;
      termsCheckbox.dispatchEvent(new Event('change'));
    });
  }

  const saveFormState = () => {
    const dataObj = {};
    const fieldsToSave = [
      'reg-phone', 'reg-name', 'reg-email', 'reg-type', 'reg-school',
      'reg-stream', 'reg-pass-year', 'reg-institute', 'reg-domain',
      'reg-grad-year', 'reg-city', 'reg-time-slot'
    ];
    fieldsToSave.forEach(id => {
      const el = document.getElementById(id);
      if (el) dataObj[id] = el.value;
    });

    const checkedPass = document.querySelector('input[name="pass_type"]:checked');
    if (checkedPass) {
      dataObj['pass_type'] = checkedPass.value;
    }

    localStorage.setItem('nbtCareerFormState', JSON.stringify(dataObj));
  };

  const loadFormState = () => {
    const saved = localStorage.getItem('nbtCareerFormState');
    if (saved) {
      try {
        const dataObj = JSON.parse(saved);
        Object.keys(dataObj).forEach(key => {
          if (key === 'pass_type') {
            const matchingRadio = document.querySelector(`input[name="pass_type"][value="${dataObj[key]}"]`);
            if (matchingRadio) {
              matchingRadio.checked = true;
              matchingRadio.dispatchEvent(new Event('change'));
            }
          } else {
            const el = document.getElementById(key);
            if (el) {
              el.value = dataObj[key];
              el.dispatchEvent(new Event('change'));
            }
          }
        });
      } catch (e) {
        console.error('Error loading form state', e);
      }
    }
  };

  form.addEventListener('input', saveFormState);
  form.addEventListener('change', saveFormState);

  // Initialize state from local storage
  loadFormState();


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
      if (btn.tagName !== 'A') {
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

  /* ========================================================
     5. Form Conditional Fields
     ======================================================== */
  const regType = document.getElementById('reg-type');
  const studentFields = document.getElementById('student-fields');
  const graduateFields = document.getElementById('graduate-fields');

  if (regType) {
    regType.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'student') {
        studentFields.style.display = 'block';
        graduateFields.style.display = 'none';
      } else if (val === 'graduate') {
        studentFields.style.display = 'none';
        graduateFields.style.display = 'block';
      } else {
        studentFields.style.display = 'none';
        graduateFields.style.display = 'none';
      }
    });
  }

  /* ========================================================
     6. Sticky CTA on Scroll
     ======================================================== */
  const stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    window.addEventListener('scroll', () => {
      // Show when scrolled past hero section (~400px)
      if (window.scrollY > 400) {
        stickyCta.classList.add('show');
      } else {
        stickyCta.classList.remove('show');
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      exitPopup.classList.remove('show');
      partnerModal.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
  });

  /* ========================================================
     7. Partner Modal
     ======================================================== */
  const partnerModal = document.getElementById('partnerModal');
  const partnerModalClose = document.getElementById('partnerModalClose');
  const partnerForm = document.getElementById('partnerForm');

  const pViewPhone = document.getElementById('p-view-phone');
  const pViewOtp = document.getElementById('p-view-otp');
  const pViewDetails = document.getElementById('p-view-details');
  const pViewSuccess = document.getElementById('p-view-success');

  const pPhone = document.getElementById('p-phone');
  const pOtp = document.getElementById('p-otp');
  const pDisplayPhone = document.getElementById('p-display-phone');
  const pEditPhone = document.getElementById('p-edit-phone');
  const pName = document.getElementById('p-name');
  const pEmail = document.getElementById('p-email');
  const pDesignation = document.getElementById('p-designation');
  const pCompany = document.getElementById('p-company');

  const pBtnSendOtp = document.getElementById('p-btn-send-otp');
  const pBtnVerifyOtp = document.getElementById('p-btn-verify-otp');

  const pSwitchView = (from, to) => {
    from.classList.remove('active-view');
    to.classList.add('active-view');
  };

  const openPartnerModal = (e) => {
    if (e) e.preventDefault();
    // Reset to first step each time
    [pViewOtp, pViewDetails, pViewSuccess].forEach(v => v.classList.remove('active-view'));
    pViewPhone.classList.add('active-view');
    partnerForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
    partnerForm.querySelectorAll('input, textarea').forEach(i => i.value = '');
    partnerModal.classList.add('show');
    document.body.classList.add('modal-open');
    pPhone.focus();
  };

  const closePartnerModal = () => {
    partnerModal.classList.remove('show');
    document.body.classList.remove('modal-open');
  };

  // Wire all partner CTA triggers
  document.querySelectorAll('.js-open-partner-modal').forEach(el => {
    el.addEventListener('click', openPartnerModal);
  });

  partnerModalClose.addEventListener('click', closePartnerModal);

  partnerModal.addEventListener('click', (e) => {
    if (e.target === partnerModal) closePartnerModal();
  });

  // Step 1: Send OTP
  pBtnSendOtp.addEventListener('click', () => {
    const val = pPhone.value.trim();
    const grp = pPhone.closest('.form-group');
    if (!/^[0-9]{10}$/.test(val)) { grp.classList.add('has-error'); return; }
    grp.classList.remove('has-error');
    pDisplayPhone.textContent = '+91 ' + val;
    pSwitchView(pViewPhone, pViewOtp);
    pOtp.focus();
  });

  // Edit phone
  pEditPhone.addEventListener('click', (e) => {
    e.preventDefault();
    pSwitchView(pViewOtp, pViewPhone);
    pPhone.focus();
  });

  // Step 2: Verify OTP
  pBtnVerifyOtp.addEventListener('click', () => {
    const val = pOtp.value.trim();
    const grp = pOtp.closest('.form-group');
    if (!/^[0-9]{4}$/.test(val)) { grp.classList.add('has-error'); return; }
    grp.classList.remove('has-error');
    pSwitchView(pViewOtp, pViewDetails);
    pName.focus();
  });

  // Step 3: Submit details
  partnerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    [[pName, v => v.length > 0],
    [pEmail, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    [pDesignation, v => v.length > 0],
    [pCompany, v => v.length > 0]
    ].forEach(([input, test]) => {
      const grp = input.closest('.form-group');
      if (!test(input.value.trim())) {
        grp.classList.add('has-error');
        valid = false;
      } else {
        grp.classList.remove('has-error');
      }
    });

    if (!valid) return;
    pSwitchView(pViewDetails, pViewSuccess);
  });

});
