// Cache common DOM references once.
const header = document.querySelector(".site-header");
const navToggle = document.getElementById("nav-toggle");
const navLinksContainer = document.getElementById("primary-nav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const scrollProgress = document.getElementById("scroll-progress");

// Mobile nav toggle.
if (navToggle && navLinksContainer) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinksContainer.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Smooth scrolling for anchor links with sticky-header offset.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    const headerOffset = header ? header.offsetHeight + 8 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });

    // Close mobile menu after selecting an item.
    if (navLinksContainer && navLinksContainer.classList.contains("open")) {
      navLinksContainer.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });
});

// Highlight nav link based on the section currently in view.
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const currentId = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle("active", isActive);
      });
    });
  },
  {
    threshold: 0.5,
    rootMargin: "-20% 0px -30% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

// Reveal elements as they enter the viewport.
if (revealItems.length > 0) {
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${(index % 6) * 60}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -5% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

// Scroll progress indicator.
if (scrollProgress) {
  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const width = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    scrollProgress.style.width = `${width}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

// Dynamic current year for footer.
const yearEl = document.getElementById("current-year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Contact form submission to your email via FormSubmit.
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm && formStatus) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (window.location.protocol === "file:") {
      formStatus.textContent =
        "Form cannot send from file://. Run the site on localhost (for example: python -m http.server 5500) and try again.";
      formStatus.style.color = "#b91c1c";
      return;
    }

    const formData = new FormData(contactForm);
    const senderEmail = formData.get("email");
    if (typeof senderEmail === "string" && senderEmail.trim()) {
      formData.set("_replyto", senderEmail.trim());
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    formStatus.textContent = "Sending message...";
    formStatus.style.color = "#1d4ed8";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      const sendFailed = !response.ok || result.success === false || result.success === "false";
      if (sendFailed) {
        throw new Error(result.message || "Message failed to send.");
      }

      formStatus.textContent = "Message sent successfully. Check your inbox for new contact emails.";
      formStatus.style.color = "#166534";
      contactForm.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Could not send right now. Please email me directly at mainzabruce06@gmail.com.";
      formStatus.textContent = errorMessage;
      formStatus.style.color = "#b91c1c";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });
}
