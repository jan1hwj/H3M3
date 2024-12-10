// Your Ingredients section
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

let lastUsedMode = null;
let lastUsedData = null;

document.addEventListener("DOMContentLoaded", () => {
  let recipeSteps = [];
  let currentStep = 0;

  // Render the current recipe step
  function renderStep() {
    const recipeDisplay = document.getElementById("recipeDisplay");
    const stepCounter = document.getElementById("stepCounter");

    if (!recipeDisplay || !stepCounter) {
      console.error("Missing required DOM elements: recipeDisplay or stepCounter");
      return;
    }

    if (recipeSteps.length === 0) {
      recipeDisplay.textContent = "No recipe generated yet.";
      stepCounter.textContent = "Step 0 of 0";
      return;
    }

    recipeDisplay.textContent = recipeSteps[currentStep]; // Display current step
    stepCounter.textContent = `Step ${currentStep + 1} of ${recipeSteps.length}`;
    updateButtons();
  }

  // Update button states
  function updateButtons() {
    document.getElementById("prevStepBtn").disabled = currentStep === 0;
    document.getElementById("nextStepBtn").disabled = currentStep === recipeSteps.length - 1;
  }

  // Handle Quick Generation button
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
        .then((response) => response.json())
        .then((data) => {
          if (data.recipe) {
            recipeSteps = data.recipe;
            currentStep = 0;
            renderStep();
          } else {
            alert("Failed to generate recipe. Please try again.");
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  }

  // Handle Customization Mode button
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
        .then((response) => response.json())
        .then((data) => {
          if (data.recipe) {
            recipeSteps = data.recipe;
            currentStep = 0;
            renderStep();
          } else {
            alert("Failed to generate customized recipe. Please try again.");
          }
        })
        .catch((error) => console.error("Error:", error));
    });
  }

  // Handle Shuffle button
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
          .then((response) => response.json())
          .then((data) => {
            if (data.recipe) {
              recipeSteps = data.recipe;
              currentStep = 0;
              renderStep();
            } else {
              alert("Failed to shuffle recipe. Please try again.");
            }
          })
          .catch((error) => console.error("Error:", error));
      } else {
        alert("Please generate a recipe first before using the shuffle button.");
      }
    });
  }

  // Handle Restart button
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      lastUsedMode = null;
      lastUsedData = null;
      recipeSteps = [];
      currentStep = 0;
      window.location.href = "/";
    });
  }

  // Handle Next Step button
  const nextStepBtn = document.getElementById("nextStepBtn");
  if (nextStepBtn) {
    nextStepBtn.addEventListener("click", () => {
      if (currentStep < recipeSteps.length - 1) {
        currentStep++;
        renderStep();
      }
    });
  }

  // Handle Previous Step button
  const prevStepBtn = document.getElementById("prevStepBtn");
  if (prevStepBtn) {
    prevStepBtn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        renderStep();
      }
    });
  }

  renderStep();
});
