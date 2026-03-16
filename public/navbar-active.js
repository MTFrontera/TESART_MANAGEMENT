// Dynamically set active nav link based on current page
function setActiveNavLink() {
    // Get the current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Remove active class from all links and add to matching one
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
        
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
