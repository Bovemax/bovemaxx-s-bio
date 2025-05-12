const bio = document.querySelector('.bio');
const bioSlide = document.querySelector('.bio-slide');
const bioToggle = document.querySelector('.bio-toggle');

if (bioToggle) {
    bioToggle.addEventListener('click', () => {
        console.log('Bio toggle clicked');
        bio.classList.toggle('bio-open');
        console.log('Bio classes:', bio.classList);

        bioSlide.classList.toggle('bio-slide-open');
        console.log('Bio slide classes:', bioSlide.classList);
    });
}