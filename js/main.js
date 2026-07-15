(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').css('top', '0px');
        } else {
            $('.sticky-top').css('top', '-100px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        items: 1,
        dots: true,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });
    
    // Welcome modal show on page load and ensure page is at top
    document.addEventListener('DOMContentLoaded', function () {
        // Force scroll to top on load (prevents browser restoring previous scroll)
        try { window.scrollTo({ top: 0, behavior: 'auto' }); } catch (e) { window.scrollTo(0,0); }

        setTimeout(function () {
            var el = document.getElementById('welcomeModal');
            if (el && typeof bootstrap !== 'undefined') {
                var welcomeModal = new bootstrap.Modal(el);
                // trigger zoomIn animation on modal content
                var content = el.querySelector('.modal-content');
                if (content) {
                    content.classList.remove('animated','zoomIn');
                    // force reflow to restart animation
                    void content.offsetWidth;
                    content.classList.add('animated','zoomIn');
                }
                welcomeModal.show();
                var enterBtn = document.getElementById('enterSiteBtn');
                if (enterBtn) {
                    enterBtn.addEventListener('click', function () {
                        welcomeModal.hide();
                        // smooth scroll to top when user enters
                        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0,0); }
                    });
                }
            }
        }, 800);

        // Load video only when the user clicks the preview button
        var videoPlaceholder = document.querySelector('.video-placeholder');
        var introVideo = document.querySelector('.intro-video');
        var loadVideoBtn = document.getElementById('loadVideoBtn');
        if (loadVideoBtn && introVideo) {
            loadVideoBtn.addEventListener('click', function () {
                if (!introVideo.getAttribute('src')) {
                    introVideo.setAttribute('src', introVideo.getAttribute('data-src'));
                }
                introVideo.classList.remove('d-none');
                if (videoPlaceholder) {
                    videoPlaceholder.style.display = 'none';
                }
            });
        }

        // Video controls: play/pause, stop, fullscreen
        var playPauseBtn = document.getElementById('playPauseBtn');
        var stopBtn = document.getElementById('stopBtn');
        var fsBtn = document.getElementById('fsBtn');
        if (introVideo) {
            function updatePlayText() { if (playPauseBtn) playPauseBtn.textContent = introVideo.paused ? 'Play' : 'Pause'; }
            // initialize text
            updatePlayText();
            if (playPauseBtn) {
                playPauseBtn.addEventListener('click', function () {
                    if (introVideo.paused) { introVideo.play(); } else { introVideo.pause(); }
                    updatePlayText();
                });
            }
            if (stopBtn) {
                stopBtn.addEventListener('click', function () {
                    introVideo.pause();
                    try { introVideo.currentTime = 0; } catch (e) { introVideo.currentTime = 0; }
                    updatePlayText();
                });
            }
            if (fsBtn) {
                fsBtn.addEventListener('click', function () {
                    var target = introVideo;
                    if (target.requestFullscreen) { target.requestFullscreen(); }
                    else if (target.webkitRequestFullscreen) { target.webkitRequestFullscreen(); }
                    else if (target.mozRequestFullScreen) { target.mozRequestFullScreen(); }
                    else if (target.msRequestFullscreen) { target.msRequestFullscreen(); }
                });
            }
            introVideo.addEventListener('play', updatePlayText);
            introVideo.addEventListener('pause', updatePlayText);
        }
    });

})(jQuery);

