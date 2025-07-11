window.onload = function () {
  // Load particles
  particlesJS('particles-js', {
    particles: {
      number: { value: 100, density: { enable: true, value_area: 1000 } },
      color: { value: ["#ff0000", "#ffa500", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#ee82ee"] },
      shape: { type: "star" },
      opacity: { value: 0.8, random: true },
      size: { value: 6, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 5, direction: "left", straight: false }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "bubble" },
        onclick: { enable: true, mode: "repulse" },
        resize: true
      },
      modes: {
        bubble: { distance: 250, size: 8, duration: 2, opacity: 1, speed: 3 },
        repulse: { distance: 300, duration: 0.4 }
      }
    },
    retina_detect: true
  });
};

document.getElementById('subscribe-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = e.target.email.value.trim();
  const statusMsg = document.getElementById('status-msg');
  const submitBtn = document.getElementById("subscribe-btn");
  const loader = document.getElementById("loader");

  if (!email) return;

  // Show loader
  loader.style.display = "inline-block";

  statusMsg.textContent = "Running background checks......";
  statusMsg.style.color = "#a2ff00";
  statusMsg.classList.add("custom-font");
  submitBtn.disabled = true;

  const baseURL = "https://forks-ai.onrender.com";

  try {
    const checkRes = await fetch(`${baseURL}/check?email=${encodeURIComponent(email)}`);
    const checkData = await checkRes.json();

    if (checkData.length > 0) {
      statusMsg.textContent = "You've already subscribed! We’ll notify you once it’s launched.";
      statusMsg.style.color = "#a2ff00";
      e.target.reset();
    } else {
      const data = { data: [{ email }] };

      const saveRes = await fetch(`${baseURL}/subscribe`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (saveRes.ok) {
        statusMsg.textContent = "Thanks for subscribing! Check your Inbox & Spam folder.";
        statusMsg.style.color = "#a2ff00";
        e.target.reset();
      } else {
        const errorData = await saveRes.json();
        if (errorData?.error?.includes("Invalid")) {
          statusMsg.textContent = "Please enter a valid email address.";
          statusMsg.style.color = "#ff5c5c";
        } else {
          statusMsg.textContent = "Oops! Something went wrong.";
          statusMsg.style.color = "#ff5c5c";
        }
      }
    }
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Server error. Please try again later.";
    statusMsg.style.color = "#ff5c5c";
  } finally {
    // Hide loader
    loader.style.display = "none";
    submitBtn.disabled = false;
  }
});
