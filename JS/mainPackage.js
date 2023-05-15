const menuToggle = document.querySelector(".menu-toggle");
const lines = document.querySelectorAll(".menu-line");
const mobileMenu = document.querySelector(".mobile-menu");

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("resize", () => {
        adaptFooter();
    });

    setTimeout(() => {
        adaptFooter();
    }, 500);

    menuToggle.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
        mobileMenu.classList.toggle("close");
        lines.forEach((line) => {
            line.classList.toggle("line-toggled");
        });
    });

    mobileMenu.style.opacity = "0";
    setTimeout(() => {
        mobileMenu.style.opacity = "1";
    }, 600);
});

function adaptFooter() {
    if (document.querySelector(".footer-basic")) {
        const footer = document.querySelector(".footer-basic");
        if (document.body.scrollHeight <= window.innerHeight) {
            footer.classList.add("footer-basic-no-overflow");
            footer.classList.remove("footer-basic-overflow");
        } else if (document.body.scrollHeight > window.innerHeight) {
            footer.classList.add("footer-basic-overflow");
            footer.classList.remove("footer-basic-no-overflow");
        }
    }
}
