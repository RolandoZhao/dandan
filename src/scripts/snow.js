/**
 * Snow Animation Effect
 * Creates floating snowflakes on the homepage
 */

class SnowEffect {
    constructor(container) {
        this.container = container;
        this.snowflakes = [];
        this.maxSnowflakes = 50;
        this.init();
    }

    init() {
        // Create snowflake container
        this.snowContainer = document.createElement('div');
        this.snowContainer.className = 'snow-container';
        this.container.appendChild(this.snowContainer);

        // Generate initial snowflakes
        for (let i = 0; i < this.maxSnowflakes; i++) {
            setTimeout(() => this.createSnowflake(), i * 200);
        }
    }

    createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';

        // Random properties
        const size = Math.random() * 4 + 2;
        const startX = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.6 + 0.2;

        snowflake.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startX}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      opacity: ${opacity};
    `;

        this.snowContainer.appendChild(snowflake);

        // Remove and recreate after animation
        snowflake.addEventListener('animationend', () => {
            snowflake.remove();
            this.createSnowflake();
        });
    }
}

// Initialize snow effect
document.addEventListener('DOMContentLoaded', () => {
    const home = document.querySelector('.home');
    if (home) {
        new SnowEffect(home);
    }
});
