// Your Ingredients section
var coll = document.getElementsByClassName("collapsible");
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    const content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

// Global Variables
let lastUsedMode = null;
let lastUsedData = null;

let recipePages = [];
let currentPage = 0;

document.addEventListener("DOMContentLoaded", () => {
  
  // Render the recipe
  function renderRecipePage() {
    const recipeDisplay = document.getElementById("recipeDisplay");
  
    if (!recipeDisplay) {
      console.error("Missing required DOM element: recipeDisplay");
      return;
    }
  
    if (recipePages.length === 0) {
      recipeDisplay.innerHTML = "<p>No recipe generated yet.</p>";
      return;
    }
  
    recipeDisplay.innerHTML = recipePages[currentPage];
    updatePaginationButtons();
  }

  // Split the recipe into pages
  function paginateRecipe(recipe) {
    recipePages = [];

    // Page 1: Title and Ingredients
    const titleAndIngredients = `
      <h3>${recipe.title}</h3>
      <br>
      <h3>Ingredients:</h3>
      <ul>
        ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join("")}
      </ul>
    `;
    recipePages.push(titleAndIngredients);

    // Page 2+: Steps. Each page will contain 5 steps
    const stepsPerPage = 5;
    for (let i = 0; i < recipe.steps.length; i += stepsPerPage) {
      const stepsPage = `
        <h3>Steps:</h3>
        <ol start="${i + 1}">
          ${recipe.steps.slice(i, i + stepsPerPage).map(step => `<li>${step}</li>`).join("")}
        </ol>
      `;
      recipePages.push(stepsPage);
    }
  }

  // Pagination Buttons
  function updatePaginationButtons() {
    document.getElementById("prevStepBtn").disabled = currentPage === 0;
    document.getElementById("nextStepBtn").disabled = currentPage === recipePages.length - 1;
  }

  document.getElementById("prevStepBtn").addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      renderRecipePage();
    }
  });

  document.getElementById("nextStepBtn").addEventListener("click", () => {
    if (currentPage < recipePages.length - 1) {
      currentPage++;
      renderRecipePage();
    }
  });

  function renderRecipe(recipe) {
    paginateRecipe(recipe);
    currentPage = 0;
    renderRecipePage();
  }

  // Auto Mode
  const quickGenBtn = document.getElementById("quickGenBtn");
  if (quickGenBtn) {
    quickGenBtn.addEventListener("click", () => {
      const data = { ingredients: ingredientList };
      lastUsedMode = "auto";
      lastUsedData = data;

      fetch("/generate_recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(response => response.json())
        .then(data => {
          if (data.title) {
            renderRecipe(data);
          } else {
            alert("Failed to generate recipe. Please try again.");
          }
        })
        .catch(error => console.error("Error:", error));
    });
  }

  // Customization Mode
  const customGenBtn = document.getElementById("customGenBtn");
  if (customGenBtn) {
    customGenBtn.addEventListener("click", () => {
      const formData = new FormData(document.getElementById("customRecipeForm"));
      const data = {
        cuisine: formData.get("cuisine"),
        servings: formData.get("servings") || "1",
        flavor: formData.get("flavor"),
        ingredients: ingredientList,
      };

      lastUsedMode = "customization";
      lastUsedData = data;

      fetch("/generate_recipe_custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(response => response.json())
        .then(data => {
          if (data.title) {
            renderRecipe(data);
          } else {
            alert("Failed to generate customized recipe. Please try again.");
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  }

  // Shuffle Button
  const shuffleBtn = document.getElementById("shuffleBtn");
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", () => {
      if (lastUsedMode && lastUsedData) {
        const endpoint = lastUsedMode === "auto" ? "/generate_recipe" : "/generate_recipe_custom";

        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lastUsedData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP status ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            if (data.title && data.ingredients && data.steps) {
              renderRecipe(data);
            } else {
              alert("Failed to shuffle the recipe. Backend did not return a recipe.");
            }
          })
          .catch((error) => console.error("Error during shuffle:", error));
      } else {
        alert("Please generate a recipe first before using the shuffle button.");
      }
    });
  }

  // Restart Button
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      lastUsedMode = null;
      lastUsedData = null;
      window.location.href = "/";
    });
  }
});