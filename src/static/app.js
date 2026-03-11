document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
          <ul class="participants-list">
            ${details.participants.map(email => `
              <li>
                <span class="participant-email">${email}</span>
                <button class="remove-btn" data-email="${email}" data-activity="${name}" title="Unregister">&times;</button>
              </li>
            `).join('')}
          </ul>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        // attach listener for removal buttons after card added
        const removeButtons = activityCard.querySelectorAll('.remove-btn');
        removeButtons.forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const email = e.currentTarget.dataset.email;
            const activityName = e.currentTarget.dataset.activity;
            try {
              const resp = await fetch(
                `/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`,
                { method: 'DELETE' }
              );
              const resJson = await resp.json();
              if (resp.ok) {
                showMessage(resJson.message, 'info');
                fetchActivities();
              } else {
                showMessage(resJson.detail || 'Failed to remove', 'error');
              }
            } catch (err) {
              console.error('Error removing participant:', err);
              showMessage('Failed to remove participant', 'error');
            }
          });
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Utility for showing temporary messages
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove('hidden');
    setTimeout(() => messageDiv.classList.add('hidden'), 5000);
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, 'success');
        signupForm.reset();
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", 'error');
      }
    } catch (error) {
      console.error("Error signing up:", error);
      showMessage("Failed to sign up. Please try again.", 'error');
    }
  });

  // Initialize app
  fetchActivities();
});
