// Portfolio — renders content from data.json into [data-render] containers and
// wires the page interactions (theme, nav, reveals, FAB, toasts).
//
// Section ids (hero/about/work/resume/contact) are the sync contract with
// index.html nav links and css/style.sass — keep them aligned when renaming.

const SECTION_IDS = ["about", "work", "resume", "contact"];

document.addEventListener("DOMContentLoaded", () => {
    // Wire interactions immediately — they don't depend on data and should work
    // even if the fetch below fails (e.g. opening index.html via file://).
    initTheme();
    initNav();
    initFab();
    initFooterYear();

    fetch("data.json")
        .then(r => r.json())
        .then(data => {
            renderMeta(data.meta);
            renderAbout(data.about);
            renderProjects(data.projects);
            renderResume(data.resume);
            initCopyEmail(data.meta);
            initReveals();
        })
        .catch(err => {
            console.error("Failed to load portfolio data — content sections will be empty. If you opened index.html via file://, run `python -m http.server 8000` and visit http://localhost:8000/ instead.", err);
            initReveals();
        });
});

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

function renderMeta(meta) {
    if (!meta) return;

    if (meta.pageTitle) document.title = meta.pageTitle;

    if (meta.description) {
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) descTag.setAttribute("content", meta.description);
    }

    const h1 = document.querySelector(".hero-name");
    if (h1 && meta.name) {
        const parts = meta.name.trim().split(/\s+/);
        const first = parts.shift();
        const rest = parts.join(" ");
        h1.innerHTML = rest
            ? `${escapeHtml(first)} <span class="no-wrap">${escapeHtml(rest)}</span>`
            : escapeHtml(first);
    }

    const designation = document.querySelector('[data-render="designation"]');
    if (designation && meta.designation) designation.textContent = meta.designation;

    if (Array.isArray(meta.social)) {
        const html = socialLinksHtml(meta.social);
        document.querySelectorAll('[data-render="nav-social"], [data-render="contact-social"], [data-render="footer-social"]')
            .forEach(el => { el.innerHTML = html; });
    }

    const resumeBtn = document.getElementById("resume-download");
    if (resumeBtn && meta.resumePdf) resumeBtn.setAttribute("href", meta.resumePdf);

    const contactForm = document.getElementById("contact-form");
    if (contactForm && meta.contactFormUrl) contactForm.setAttribute("src", meta.contactFormUrl);
}

function socialLinksHtml(social) {
    return social.map(s => (
        `<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener" `
        + `title="${escapeAttr(s.label)}" aria-label="${escapeAttr(s.label)}">`
        + `<span class="${escapeAttr(s.icon)}" aria-hidden="true"></span></a>`
    )).join("");
}

function renderAbout(about) {
    const el = document.querySelector('[data-render="about"]');
    if (!el || !about || !Array.isArray(about.content)) return;
    el.innerHTML = about.content.map(p => `<p>${escapeHtml(p)}</p>`).join("");
}

function renderProjects(projects) {
    const el = document.querySelector('[data-render="projects"]');
    if (!el || !Array.isArray(projects)) return;

    el.innerHTML = projects.map(p => {
        const frame = p.frame === "phone" ? "phone" : "browser";
        const img = p.image
            ? `<div class="device device--${frame}"><div class="device-screen">`
              + `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.alt || p.title || "")}" loading="lazy">`
              + `</div></div>`
            : "";
        const points = Array.isArray(p.points) && p.points.length
            ? `<ul class="project-points">${p.points.map(pt => `<li>${escapeHtml(pt)}</li>`).join("")}</ul>`
            : "";
        const tags = Array.isArray(p.tags) && p.tags.length
            ? `<ul class="chips">${p.tags.map(t => `<li class="chip">${escapeHtml(t)}</li>`).join("")}</ul>`
            : "";
        const buttons = Array.isArray(p.buttons) && p.buttons.length
            ? `<div class="project-links">${p.buttons.map(b =>
                `<a class="btn btn--ghost btn--sm" href="${escapeAttr(b.url)}" target="_blank" rel="noopener">${escapeHtml(b.text)}</a>`
              ).join("")}</div>`
            : "";

        return `<article class="project reveal${p.featured ? " project--featured" : ""}">`
            + img
            + `<div class="project-info">`
            + `<h3>${escapeHtml(p.title || "")}</h3>`
            + (p.description ? `<p>${escapeHtml(p.description)}</p>` : "")
            + points + tags + buttons
            + `</div></article>`;
    }).join("");
}

function renderResume(resume) {
    const el = document.querySelector('[data-render="resume"]');
    if (!el || !Array.isArray(resume)) return;

    const skills = resume.filter(s => s.heading === "Skills");
    const rest = resume.filter(s => s.heading !== "Skills");

    el.innerHTML = `<div class="resume-main">${rest.map(renderResumeSection).join("")}</div>`
        + `<div class="resume-skills">${skills.map(renderResumeSection).join("")}</div>`;
}

function renderResumeSection(section) {
    let body = "";
    if (section.heading === "Experience" && Array.isArray(section.list)) {
        body = `<ol class="timeline">${section.list.map(renderExperienceJob).join("")}</ol>`;
    } else if (section.heading === "Skills" && Array.isArray(section.list)) {
        body = section.list.map(renderSkillsGroup).join("");
    } else if (Array.isArray(section.ul)) {
        body = `<ul class="edu-list">${section.ul.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    }
    return `<div class="resume-block"><h3>${escapeHtml(section.heading)}</h3>${body}</div>`;
}

function renderExperienceJob(job) {
    const nested = Array.isArray(job.ol) && job.ol.length
        ? `<ol class="job-projects">${job.ol.map(proj => (
            `<li><strong>${escapeHtml(proj.title || "")}</strong>`
            + (Array.isArray(proj.ul) ? `<ul>${proj.ul.map(li => `<li>${escapeHtml(li)}</li>`).join("")}</ul>` : "")
            + `</li>`
          )).join("")}</ol>`
        : "";
    return `<li><h4 class="job-title">${escapeHtml(job.heading || "")}</h4>`
        + (job.period ? `<span class="period">${escapeHtml(job.period)}</span>` : "")
        + nested + `</li>`;
}

function renderSkillsGroup(group) {
    const items = Array.isArray(group.ul) ? group.ul.map(item => {
        if (item && typeof item === "object") {
            // Nested group, e.g. Dependency Injection -> Dagger/Hilt/Koin
            const children = Array.isArray(item.ul)
                ? item.ul.map(c => `<li class="chip">${escapeHtml(c)}</li>`).join("")
                : "";
            return `<li class="chip-group"><span class="chip-group-title">${escapeHtml(item.title || "")}</span>`
                + `<ul class="chips">${children}</ul></li>`;
        }
        // Skill strings are trusted data.json content and may intentionally
        // contain inline icon markup (e.g. <i class="fab fa-...">) — rendered
        // via innerHTML on purpose. Do NOT put untrusted input in these.
        return `<li class="chip">${item}</li>`;
    }).join("") : "";
    return `<div class="skills-group"><h4>${escapeHtml(group.heading || "")}</h4>`
        + `<ul class="chips chips--skills">${items}</ul></div>`;
}

// ---------------------------------------------------------------------------
// Theme (dark mode)
// ---------------------------------------------------------------------------

function initTheme() {
    const toggle = document.getElementById("theme-toggle");
    const apply = theme => {
        document.documentElement.dataset.theme = theme;
        if (toggle) toggle.setAttribute("aria-pressed", String(theme === "dark"));
        const icon = toggle && toggle.querySelector("i");
        if (icon) icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
        const label = toggle && toggle.querySelector(".qs-tile-label");
        if (label) label.textContent = theme === "dark" ? "Light theme" : "Dark theme";
    };

    // The boot script in <head> already set data-theme before first paint.
    apply(document.documentElement.dataset.theme || "light");

    if (toggle) {
        toggle.addEventListener("click", () => {
            const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            apply(next);
        });
    }

    // Follow OS changes only while the user hasn't chosen manually.
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
        if (!localStorage.getItem("theme")) apply(e.matches ? "dark" : "light");
    });
}

// ---------------------------------------------------------------------------
// Nav (mobile toggle, header shrink, active link highlight)
// ---------------------------------------------------------------------------

function initNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");

    const closeNav = () => {
        if (!nav || !toggle) return;
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-locked");
    };

    if (toggle && nav) {
        toggle.addEventListener("click", () => {
            const open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", String(open));
            document.body.classList.toggle("nav-locked", open);
        });
        nav.addEventListener("click", e => {
            if (e.target.closest("a")) closeNav();
        });
        document.addEventListener("keydown", e => {
            if (e.key === "Escape") closeNav();
        });
    }

    if (header) {
        const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    // Highlight the nav link of the section currently in view.
    const links = new Map(SECTION_IDS.map(id => [
        id, document.querySelector(`.nav-link[href="#${id}"]`)
    ]));
    const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
    if (sections.length && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const link = links.get(entry.target.id);
                if (!link) return;
                if (entry.isIntersecting) {
                    links.forEach(l => l && l.classList.remove("is-active"));
                    link.classList.add("is-active");
                }
            });
        }, { rootMargin: "-40% 0px -55% 0px" });
        sections.forEach(s => observer.observe(s));
    }
}

// ---------------------------------------------------------------------------
// Scroll reveals
// ---------------------------------------------------------------------------

function initReveals() {
    const targets = document.querySelectorAll(".reveal");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !("IntersectionObserver" in window)) {
        targets.forEach(el => el.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    targets.forEach(el => observer.observe(el));
}

// ---------------------------------------------------------------------------
// FAB (floating action button -> contact)
// ---------------------------------------------------------------------------

function initFab() {
    const fab = document.getElementById("fab");
    const hero = document.getElementById("hero");
    const contact = document.getElementById("contact");
    if (!fab || !hero || !contact) return;

    fab.hidden = false;
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            fab.classList.toggle("is-visible", !entry.isIntersecting);
        }).observe(hero);
    } else {
        fab.classList.add("is-visible");
    }

    fab.addEventListener("click", () => {
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        contact.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
}

// ---------------------------------------------------------------------------
// Toast (Android-style)
// ---------------------------------------------------------------------------

let toastTimer = null;

function toast(message) {
    const region = document.getElementById("toast-region");
    if (!region) return;
    region.innerHTML = "";
    clearTimeout(toastTimer);

    const pill = document.createElement("div");
    pill.className = "toast";
    pill.textContent = message;
    region.appendChild(pill);

    toastTimer = setTimeout(() => {
        pill.classList.add("is-leaving");
        pill.addEventListener("animationend", () => pill.remove(), { once: true });
    }, 2500);
}

// ---------------------------------------------------------------------------
// Copy email
// ---------------------------------------------------------------------------

function initCopyEmail(meta) {
    const btn = document.getElementById("copy-email");
    if (!btn || !meta || !Array.isArray(meta.social)) return;

    const mail = meta.social.find(s => typeof s.url === "string" && s.url.startsWith("mailto:"));
    if (!mail || !navigator.clipboard) return; // keep the button hidden; mailto link still works

    const email = mail.url.replace(/^mailto:/, "");
    btn.hidden = false;
    btn.addEventListener("click", () => {
        navigator.clipboard.writeText(email)
            .then(() => toast("Email copied"))
            .catch(() => toast(email));
    });
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

function initFooterYear() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
}

// ---------------------------------------------------------------------------
// Escaping helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
    return escapeHtml(str);
}
