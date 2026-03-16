// Dynamically set active nav link based on current page
function setActiveNavLink() {
    const normalize = (url) => {
        try {
            const u = new URL(url, window.location.origin);
            let p = u.pathname.replace(/^\/+/g, '').replace(/\/+$/g, '');
            if (p.endsWith('.html')) p = p.slice(0, -5);
            return p || 'index';
        } catch {
            return url;
        }
    };

    const currentPage = normalize(window.location.href);

    const navLinks = document.querySelectorAll('.nav-links a');

    // Remove active class from all links and add to matching one
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = normalize(href);
        const isActive = currentPage === linkPage;

        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Run immediately when script loads (before DOM is fully parsed)
setActiveNavLink();

// Also run when DOM is ready in case of timing issues
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setActiveNavLink);
}
