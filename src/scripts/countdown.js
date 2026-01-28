/**
 * Countdown Timer - 丹丹的粉雪之旅
 * Counts down to February 7, 2026
 */

const DEPARTURE_DATE = new Date('2026-02-07T00:00:00+08:00');

function updateCountdown() {
  const now = new Date();
  const diff = DEPARTURE_DATE - now;
  
  const countdownEl = document.getElementById('countdown-days');
  if (!countdownEl) return;
  
  if (diff <= 0) {
    countdownEl.textContent = '出发啦！';
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    countdownEl.textContent = days;
  } else {
    countdownEl.textContent = `${hours}小时`;
  }
}

// Update immediately and then every minute
updateCountdown();
setInterval(updateCountdown, 60000);
