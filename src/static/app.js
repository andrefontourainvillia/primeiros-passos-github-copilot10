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
          <p><strong>Agenda:</strong> ${details.schedule}</p>
          <p><strong>Disponibilidade:</strong> ${spotsLeft} vagas disponíveis</p>
          <div class="participants-section">
            <h5>Participantes:</h5>
            ${details.participants.length > 0 
              ? `<ul class="participants-list">
                  ${details.participants.map(email => 
                    `<li data-activity="${name}" data-email="${email}">
                      ${email}
                      <span class="delete-icon" title="Remover participante">✖</span>
                    </li>`).join('')}
                 </ul>`
              : `<p><em>Nenhum participante inscrito ainda.</em></p>`
            }
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Falha ao carregar atividades. Por favor, tente novamente mais tarde.</p>";
      console.error("Erro ao buscar atividades:", error);
    }
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
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list to show the new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha na inscrição. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro na inscrição:", error);
    }
  });

  // Handle participant removal
  activitiesList.addEventListener("click", async (event) => {
    if (!event.target.classList.contains("delete-icon")) return;

    const listItem = event.target.closest("li");
    const email = listItem.dataset.email;
    const activity = listItem.dataset.activity;

    if (!confirm(`Tem certeza que deseja remover ${email} da atividade ${activity}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        listItem.remove();
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha ao remover participante. Por favor, tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro ao remover participante:", error);
    }
  });

  // Initialize app
  fetchActivities();
  
  // Event delegation for delete icons
  activitiesList.addEventListener('click', async (event) => {
    // Check if click was on a delete icon
    if (event.target.classList.contains('delete-icon')) {
      const listItem = event.target.parentElement;
      const activity = listItem.getAttribute('data-activity');
      const email = listItem.getAttribute('data-email');
      
      if (confirm(`Tem certeza que deseja remover ${email} da atividade ${activity}?`)) {
        try {
          const response = await fetch(
            `/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`,
            {
              method: "DELETE",
            }
          );
          
          const result = await response.json();
          
          if (response.ok) {
            // Show success message
            messageDiv.textContent = result.message;
            messageDiv.className = "success";
            
            // Refresh the activities list
            fetchActivities();
          } else {
            messageDiv.textContent = result.detail || "Ocorreu um erro";
            messageDiv.className = "error";
          }
          
          messageDiv.classList.remove("hidden");
          
          // Hide message after 5 seconds
          setTimeout(() => {
            messageDiv.classList.add("hidden");
          }, 5000);
        } catch (error) {
          messageDiv.textContent = "Falha ao remover participante. Por favor, tente novamente.";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
          console.error("Erro ao remover participante:", error);
        }
      }
    }
  });
});
