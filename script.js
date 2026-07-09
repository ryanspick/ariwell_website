const carousel = document.querySelector("[data-game-carousel]");
const dots = Array.from(document.querySelectorAll(".carousel-dots span"));
const mobileQuery = window.matchMedia("(max-width: 840px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let autoSwipeTimer = 0;
let activeIndex = 0;
let userPausedUntil = 0;

function getCards() {
  return carousel ? Array.from(carousel.querySelectorAll(".game-card")) : [];
}

function setActiveDot(index) {
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function scrollToCard(index, smooth = true) {
  const cards = getCards();
  const card = cards[index];
  if (!carousel || !card) return;

  activeIndex = index;
  carousel.scrollTo({
    left: card.offsetLeft - carousel.offsetLeft,
    behavior: smooth ? "smooth" : "auto",
  });
  setActiveDot(index);
}

function updateFromScroll() {
  if (!carousel) return;

  const cards = getCards();
  const carouselLeft = carousel.scrollLeft;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const distance = Math.abs(card.offsetLeft - carousel.offsetLeft - carouselLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  activeIndex = closestIndex;
  setActiveDot(closestIndex);
}

function stopAutoSwipe() {
  if (autoSwipeTimer) {
    window.clearInterval(autoSwipeTimer);
    autoSwipeTimer = 0;
  }
}

function startAutoSwipe() {
  stopAutoSwipe();

  if (!carousel || !mobileQuery.matches || reducedMotionQuery.matches) return;

  autoSwipeTimer = window.setInterval(() => {
    if (Date.now() < userPausedUntil) return;

    const cards = getCards();
    if (cards.length < 2) return;
    if (activeIndex >= cards.length - 1) {
      scrollToCard(0, false);
      return;
    }

    scrollToCard(activeIndex + 1);
  }, 3800);
}

function watchMediaQuery(query, callback) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", callback);
    return;
  }

  query.addListener(callback);
}

if (carousel) {
  setActiveDot(0);

  carousel.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateFromScroll);
  }, { passive: true });

  ["pointerdown", "touchstart", "wheel", "keydown"].forEach((eventName) => {
    carousel.addEventListener(eventName, () => {
      userPausedUntil = Date.now() + 9000;
    }, { passive: true });
  });

  watchMediaQuery(mobileQuery, () => scrollToCard(0, false));
  watchMediaQuery(mobileQuery, startAutoSwipe);
  watchMediaQuery(reducedMotionQuery, startAutoSwipe);
  window.addEventListener("resize", () => scrollToCard(activeIndex, false));

  startAutoSwipe();
}
