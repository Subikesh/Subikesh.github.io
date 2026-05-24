// Card identifiers — KEEP IN SYNC with $cards in css/style.sass (line 6).
// Order determines DOM id (e.g. "about" -> #about-card) and matches the SASS loop.
const CARDS = ["about", "project", "resume", "contact"];

document.addEventListener("DOMContentLoaded", () => {
    // Wire interactions immediately — they don't depend on data and should work
    // even if the fetch below fails (e.g. opening index.html via file://).
    wireInteractions();

    fetch("data.json")
        .then(r => r.json())
        .then(data => {
            renderMeta(data.meta);
            renderAbout(data.about);
            renderProjects(data.projects);
            renderResume(data.resume);
            initTooltips();
            hidePreloader();
        })
        .catch(err => {
            console.error("Failed to load portfolio data — content sections will be empty. If you opened index.html via file://, run `python -m http.server 8000` and visit http://localhost:8000/ instead.", err);
            initTooltips();
            hidePreloader();
        });
});

function renderMeta(meta) {
    if (!meta) return;

    if (meta.pageTitle) document.title = meta.pageTitle;

    if (meta.description) {
        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) descTag.setAttribute("content", meta.description);
    }

    const h1 = document.querySelector(".name-header h1");
    if (h1 && meta.name) {
        const parts = meta.name.trim().split(/\s+/);
        const first = parts.shift();
        const rest = parts.join(" ");
        h1.innerHTML = rest
            ? `${escapeHtml(first)} <span class="non-overflow">${escapeHtml(rest)}</span>`
            : escapeHtml(first);
    }

    const designation = document.querySelector(".designation");
    if (designation && meta.designation) designation.textContent = meta.designation;

    const socialWrap = document.querySelector(".social .non-overflow");
    if (socialWrap && Array.isArray(meta.social)) {
        socialWrap.innerHTML = meta.social.map(s => (
            `<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener" `
            + `data-bs-toggle="tooltip" data-bs-placement="bottom" title="${escapeAttr(s.label)}">`
            + `<span class="${escapeAttr(s.icon)}"></span></a>`
        )).join("   ");
    }

    const resumeBtn = document.getElementById("resume-download");
    if (resumeBtn && meta.resumePdf) resumeBtn.setAttribute("href", meta.resumePdf);

    const contactForm = document.getElementById("contact-form");
    if (contactForm && meta.contactFormUrl) contactForm.setAttribute("src", meta.contactFormUrl);
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
        const img = p.image
            ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.alt || p.title || "")}" loading="lazy" class="card-img-top">`
            : "";
        const points = Array.isArray(p.points) && p.points.length
            ? `<ul>${p.points.map(pt => `<li>${escapeHtml(pt)}</li>`).join("")}</ul>`
            : "";
        const tags = Array.isArray(p.tags) && p.tags.length
            ? p.tags.map(t => `<button class="btn btn-sm text-dark"> ${escapeHtml(t)}</button>`).join("")
            : "";
        const buttons = Array.isArray(p.buttons)
            ? p.buttons.map(b =>
                `<a href="${escapeAttr(b.url)}" target="_blank" rel="noopener" class="btn btn-outline-light">${escapeHtml(b.text)}</a>`
              ).join("")
            : "";

        return `
            <div class="col-md-4">
                <div class="card text-white bg-dark mb-3">
                    ${img}
                    <div class="card-body">
                        <h4 class="card-title">${escapeHtml(p.title || "")}</h4>
                        <div class="card-text">
                            ${escapeHtml(p.description || "")}
                            ${points}
                            ${tags}
                        </div>
                        ${buttons}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function renderResume(resume) {
    const leftEl = document.querySelector('[data-render="resume-left"]');
    const rightEl = document.querySelector('[data-render="resume-right"]');
    if (!leftEl || !rightEl || !Array.isArray(resume)) return;

    let left = "";
    let right = "";

    for (const section of resume) {
        const heading = section.heading || "";
        const target = heading === "Skills" ? "right" : "left";
        const html = renderResumeSection(section);
        if (target === "right") right += html;
        else left += html;
    }

    leftEl.innerHTML = left;
    rightEl.innerHTML = right;
}

function renderResumeSection(section) {
    let html = `<h3>${escapeHtml(section.heading)}</h3><hr>`;

    if (Array.isArray(section.ul)) {
        html += `<ul>${section.ul.map(item => `<li>${renderResumeLeaf(item)}</li>`).join("")}</ul>`;
    }

    if (Array.isArray(section.list)) {
        if (section.heading === "Skills") {
            // Skills uses h4 sub-headings, no outer <ul>
            html += section.list.map(sub => renderSkillsGroup(sub)).join("");
        } else {
            // Experience uses an outer <ul> of jobs
            html += `<ul>${section.list.map(job => `<li>${renderExperienceJob(job)}</li>`).join("")}</ul>`;
        }
    }

    return html;
}

function renderSkillsGroup(group) {
    let html = `<h4>${escapeHtml(group.heading)}</h4><ul>`;
    if (Array.isArray(group.ul)) {
        for (const item of group.ul) {
            if (typeof item === "string") {
                // NOTE: skill strings may contain inline <i> icon HTML — see CLAUDE.md
                html += `<li>${item}</li>`;
            } else if (item && Array.isArray(item.ul)) {
                html += `<li>${escapeHtml(item.title || "")}<ul>`
                    + item.ul.map(leaf => `<li>${escapeHtml(leaf)}</li>`).join("")
                    + `</ul></li>`;
            } else if (item && item.title) {
                html += `<li>${escapeHtml(item.title)}</li>`;
            }
        }
    }
    html += `</ul>`;
    return html;
}

function renderExperienceJob(job) {
    let html = `<b>${escapeHtml(job.heading || "")}</b><br>`
        + `<span class="small">${escapeHtml(job.period || "")}</span>`;
    if (job.content) html += `<p>${escapeHtml(job.content)}</p>`;
    if (Array.isArray(job.ol)) {
        html += `<ol>` + job.ol.map(sub => (
            `<li><b>${escapeHtml(sub.title || "")}</b><ul>`
            + (sub.ul || []).map(pt => `<li>${escapeHtml(pt)}</li>`).join("")
            + `</ul></li>`
        )).join("") + `</ol>`;
    }
    if (Array.isArray(job.ul)) {
        html += `<ul>` + job.ul.map(pt => `<li>${escapeHtml(pt)}</li>`).join("") + `</ul>`;
    }
    return html;
}

function renderResumeLeaf(item) {
    // Top-level section.ul entries are simple strings (e.g. Languages list)
    return typeof item === "string" ? escapeHtml(item) : "";
}

function wireInteractions() {
    const cards = CARDS
        .map(name => document.getElementById(name + "-card"))
        .filter(Boolean);
    const info = document.getElementById("info-card");

    function setActive(targetCard) {
        for (const card of cards) {
            const title = card.querySelector(".section-title");
            if (card === targetCard) {
                card.classList.add("active");
                if (title) title.classList.add("display-3");
            } else {
                card.classList.remove("active");
                if (title) title.classList.remove("display-3");
            }
        }
    }

    function infoWalkthrough() {
        cards.forEach((card, i) => {
            setTimeout(() => {
                cards.forEach(c => c.classList.remove("hovered"));
                card.classList.add("hovered");
            }, i * 900);
        });
        setTimeout(() => {
            cards.forEach(c => c.classList.remove("hovered"));
        }, cards.length * 900);
    }

    document.addEventListener("click", (event) => {
        if (info && info.contains(event.target)) {
            infoWalkthrough();
        }
        let clicked = null;
        for (const card of cards) {
            if (card.contains(event.target)) { clicked = card; break; }
        }
        setActive(clicked);
    });

    const activateOnKey = (el) => {
        el.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                el.click();
            }
        });
    };
    cards.forEach(activateOnKey);
    if (info) activateOnKey(info);
}

function initTooltips() {
    if (!window.bootstrap || !window.bootstrap.Tooltip) return;
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
    const info = document.getElementById("info-card");
    if (info) new bootstrap.Tooltip(info);
}

function hidePreloader() {
    const el = document.querySelector(".preloader");
    if (!el) return;
    el.style.transition = "opacity 0.6s ease";
    el.style.opacity = "0";
    setTimeout(() => {
        el.style.display = "none";
        document.body.classList.remove("js-loader");
    }, 600);
}

function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
    return escapeHtml(str);
}
