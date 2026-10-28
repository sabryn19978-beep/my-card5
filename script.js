// ========================================
// السيرة الذاتية الرقمية - صابرين محمد هارون
// ========================================

// تفعيل تأثيرات الظهور (مع بقاء المحتوى ظاهراً إذا تعطّل الجافاسكربت)
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {

    // تحديث السنة تلقائياً في أسفل الصفحة
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = `© ${new Date().getFullYear()}`;
    }

    // تأثير بسيط عند الضغط على روابط واتساب
    const whatsappLinks = document.querySelectorAll(
        ".whatsapp-btn, .contact-whatsapp"
    );

    whatsappLinks.forEach((link) => {
        link.addEventListener("click", () => {
            link.classList.add("clicked");

            setTimeout(() => {
                link.classList.remove("clicked");
            }, 600);
        });
    });

    // إظهار الأقسام تدريجياً عند دخولها إلى الشاشة
    const elements = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
        elements.forEach((el) => el.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px -60px 0px"
        }
    );

    // إظهار ما هو ظاهر في الشاشة فوراً، وراقب ما هو أسفلها
    elements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        if (rect.top <= window.innerHeight * 0.95) {
            element.classList.add("visible");
        } else {
            observer.observe(element);
        }
    });
});
