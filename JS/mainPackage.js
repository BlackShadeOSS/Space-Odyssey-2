const menuToggle = document.querySelector(".menu-toggle");
const lines = document.querySelectorAll(".menu-line");
const mobileMenu = document.querySelector(".mobile-menu");

menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    mobileMenu.classList.toggle("close");
    lines.forEach((line) => {
        line.classList.toggle("line-toggled");
    });
});

// add display block to .mobile-menu.close after 0.6s
mobileMenu.style.opacity = "0";
setTimeout(() => {
    mobileMenu.style.opacity = "1";
}, 600);
