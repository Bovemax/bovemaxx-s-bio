document.addEventListener('DOMContentLoaded', () => {
    const introSequence = document.getElementById('introSequence');
    const introImage = document.getElementById('introImage');
    const introVideo = document.getElementById('introVideo');

    const snowCanvas = document.getElementById('snowCanvas');
    const ctx = snowCanvas.getContext('2d');
    const bioWrapper = document.getElementById('bioWrapper');
    const bioElement = document.querySelector('.bio');

    const audio = document.getElementById('audio'); // Reference to the audio element
    const playPauseButton = document.querySelector('.play-pause i'); // Sync play/pause button
    const songTitleDisplay = document.querySelector('.song-title'); // Display song info

    // --- CONFIGURATION ---
    const videoBioAnimationStartTime = 10; // Start bio animation at 10 seconds
    const videoFadeOutStartTime = 12;      // Start fading out intro video at 12 seconds
    const audioStartTime = 11.903;         // Start audio at 11.903 seconds

    let bioAnimationStarted = false;
    let introFadeOutStarted = false;

    // Mouse trail variables
    let mouseMoved = false;

    const pointer = {
        x: 0.5 * window.innerWidth,
        y: 0.5 * window.innerHeight,
    };
    const params = {
        pointsNumber: 40,
        widthFactor: 0.3,
        mouseThreshold: 0.6,
        spring: 0.4,
        friction: 0.5,
    };

    const trail = new Array(params.pointsNumber);
    for (let i = 0; i < params.pointsNumber; i++) {
        trail[i] = {
            x: pointer.x,
            y: pointer.y,
            dx: 0,
            dy: 0,
        };
    }

    // Snowflake variables (example, adjust as needed)
    const snowflakes = [];
    const maxSnowflakes = 100;

    function setupCanvas() {
        snowCanvas.width = window.innerWidth;
        snowCanvas.height = window.innerHeight;
    }

    function updateMousePosition(eX, eY) {
        pointer.x = eX;
        pointer.y = eY;
    }

    function update(t) {
        ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

        // Update and draw snowflakes
        snowflakes.forEach((flake) => {
            flake.y += flake.speedY;
            flake.x += flake.speedX;

            if (flake.y > snowCanvas.height) flake.y = 0;
            if (flake.x > snowCanvas.width) flake.x = 0;
            if (flake.x < 0) flake.x = snowCanvas.width;

            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        });

        // Update and draw mouse trail
        if (!mouseMoved) {
            pointer.x = (0.5 + 0.3 * Math.cos(0.002 * t) * Math.sin(0.005 * t)) * window.innerWidth;
            pointer.y = (0.5 + 0.2 * Math.cos(0.005 * t) + 0.1 * Math.cos(0.01 * t)) * window.innerHeight;
        }

        trail.forEach((p, pIdx) => {
            const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
            const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;
            p.dx += (prev.x - p.x) * spring;
            p.dy += (prev.y - p.y) * spring;
            p.dx *= params.friction;
            p.dy *= params.friction;
            p.x += p.dx;
            p.y += p.dy;
        });

        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length - 1; i++) {
            const xc = 0.5 * (trail[i].x + trail[i + 1].x);
            const yc = 0.5 * (trail[i].y + trail[i + 1].y);
            ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
            ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.stroke();
        }
        ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
        ctx.stroke();

        window.requestAnimationFrame(update);
    }

    function initializeMouseTrailAndSnow() {
        // Initialize snowflakes
        for (let i = 0; i < maxSnowflakes; i++) {
            snowflakes.push({
                x: Math.random() * snowCanvas.width,
                y: Math.random() * snowCanvas.height,
                radius: Math.random() * 3 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 2 + 1,
            });
        }

        // Add event listeners for mouse trail
        window.addEventListener("click", e => updateMousePosition(e.pageX, e.pageY));
        window.addEventListener("mousemove", e => {
            mouseMoved = true;
            updateMousePosition(e.pageX, e.pageY);
        });
        window.addEventListener("touchmove", e => {
            mouseMoved = true;
            updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
        });
        window.addEventListener("resize", setupCanvas);

        setupCanvas();
        update(0);
    }

    // 1. Handle image click
    introImage.addEventListener('click', () => {
        introImage.classList.add('zoomed');
    });

    // 2. Handle end of image zoom transition
    introImage.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'transform' && introImage.classList.contains('zoomed')) {
            introImage.style.display = 'none'; // Hide the image

            // Make main content visible now, but bio is still opacity 0 and transformed
            bioWrapper.style.display = 'flex';

            introVideo.style.display = 'block'; // Show the video
            introVideo.play().catch(error => {
                console.error("Video autoplay failed:", error);
            });
        }
    });

    // 3. Handle video playback timing for animations and fade-out
    introVideo.addEventListener('timeupdate', () => {
        const currentTime = introVideo.currentTime;

        // Check to start bio animation
        if (!bioAnimationStarted && currentTime >= videoBioAnimationStartTime) {
            if (bioElement) {
                bioElement.classList.add('start-animation');
            }
            bioAnimationStarted = true;
            snowCanvas.style.display = 'block';

            // Start mouse trail and snow when bio animation starts
            initializeMouseTrailAndSnow();
        }

        // Check to start fading out intro sequence
        if (!introFadeOutStarted && currentTime >= videoFadeOutStartTime) {
            introVideo.pause(); // Pause the video as it starts to fade
            introSequence.style.opacity = '0'; // Start fading out the intro container
            introFadeOutStarted = true;
        }

        // Start audio playback at the exact time
        if (currentTime >= audioStartTime && audio.paused) {
            audio.play(); // Start playing the audio
            audio.volume = 0.5; // Set default volume
            songTitleDisplay.textContent = "オトノケ - Creepy Nuts"; // Update song title
            playPauseButton.classList.remove('fa-play');
            playPauseButton.classList.add('fa-pause');
        }
    });

    // 4. Handle end of intro container fade-out
    introSequence.addEventListener('transitionend', (event) => {
        // Ensure this only fires for the opacity transition and when fully transparent
        if (event.propertyName === 'opacity' && parseFloat(introSequence.style.opacity) === 0) {
            introSequence.style.display = 'none'; // Completely hide intro
        }
    });

    // Fallback: If the video ends before the specified times
    introVideo.addEventListener('ended', () => {
        // If bio hasn't started animating, start it now
        if (!bioAnimationStarted && bioElement) {
            bioElement.classList.add('start-animation');
            bioAnimationStarted = true;
            initializeMouseTrailAndSnow(); // Start mouse trail and snow if not already started
        }
        // If intro hasn't started fading, start it now
        if (!introFadeOutStarted) {
            introSequence.style.opacity = '0';
            introFadeOutStarted = true;
        }

        // Ensure audio starts playing if not already started
        if (audio.paused) {
            audio.play();
            audio.volume = 0.5;
            songTitleDisplay.textContent = "オトノケ - Creepy Nuts"; // Update song title
            playPauseButton.classList.remove('fa-play');
            playPauseButton.classList.add('fa-pause');
        }
    });
});