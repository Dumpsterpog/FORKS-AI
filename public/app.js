window.onload = function () {
  // Set volume and allow user interaction to start music


  // Load particles
particlesJS('particles-js', {
  "particles": {
    "number": {
      "value": 100,
      "density": {
        "enable": true,
        "value_area": 1000
      }
    },
    "color": {
      "value": ["#ff0000", "#ffa500", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#ee82ee"]
    },
    "shape": {
      "type": "star"
    },
    "opacity": {
      "value": 0.8,
      "random": true
    },
    "size": {
      "value": 6,
      "random": true
    },
    "line_linked": {
      "enable": false  // ✅ turn off connecting lines
    },
    "move": {
      "enable": true,
      "speed": 5,
      "direction": "left",
      "straight": false
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "bubble"     // ✅ makes them bubble on hover
      },
      "onclick": {
        "enable": true,
        "mode": "repulse"    // ✅ makes them explode on click
      },
      "resize": true
    },
    "modes": {
      "bubble": {
        "distance": 250,
        "size": 8,
        "duration": 2,
        "opacity": 1,
        "speed": 3  
      },
      "repulse": {
        "distance": 300,
        "duration": 0.4
      }
    }
  },
  "retina_detect": true
});
}
// document.getElementById('subscribe-form').addEventListener('submit', function (e) {
//   e.preventDefault();
//   const email = document.getElementById('email-input').value;
//   alert(`Thanks! We'll notify you at ${email}`);
//   // Optionally send this to Firebase or your backend here
//   this.reset();
// });
document.getElementById('subscribe-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = e.target.email.value.trim();
  const statusMsg = document.getElementById('status-msg');
  const submitBtn = document.getElementById("subscribe-btn");

  if (!email) return;

  statusMsg.textContent = "Running background checks......";
  statusMsg.style.color = "#a2ff00";
  statusMsg.classList.add("custom-font");
  submitBtn.disabled = true;

  // ✅ Use your Render URL instead of localhost
  const baseURL = "https://forks-ai.onrender.com";

  try {
    // Step 1: Check if email already exists
    const checkRes = await fetch(`${baseURL}/check?email=${encodeURIComponent(email)}`);
    const checkData = await checkRes.json();

    if (checkData.length > 0) {
      statusMsg.textContent = "You've already subscribed! We’ll notify you once it’s launched.";
      statusMsg.classList.add("custom-font");
      statusMsg.style.color = "#a2ff00";
      statusMsg.classList.add("custom-font");
              e.target.reset();
    } else {
      // Step 2: Save new email
      const data = { data: [{ email }] };

        const saveRes = await fetch(`${baseURL}/subscribe`, {
         method: "POST",
         headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(data)
         });

      if (saveRes.ok) {
        statusMsg.textContent = "Thanks for subscribing! We’ll notify you once it’s launched.";
        statusMsg.classList.add("custom-font");
        statusMsg.style.color = "#a2ff00";
      } else {
        throw new Error("oops! An error occurred.");
      }
    }
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Something went wrong.......";
    statusMsg.style.color = "#ff5c5c";
  } finally {
    submitBtn.disabled = false;
  }
});