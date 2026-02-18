function toggleFaq(el) {
    var ans = el.nextElementSibling;
    var wasOpen = el.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-q').forEach(function (q) { q.classList.remove('open'); });
    document.querySelectorAll('.faq-a').forEach(function (a) { a.classList.remove('open'); });

    // Toggle clicked
    if (!wasOpen) {
        el.classList.add('open');
        ans.classList.add('open');
    }
}
