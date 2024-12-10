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

let lastUsedMode = null;
let lastUsedData = null;

document.addEventListener("DOMContentLoaded", () => {
  // Render the recipe
  function renderRecipe(recipe) {
    const recipeDisplay = document.getElementById("recipeDisplay");

    if (!recipeDisplay) {
      console.error("Missing required DOM element: recipeDisplay");
      return;
    }

    // Format and display the recipe
    const formattedRecipe = recipe
      .replace(/^### (.*)/gm, '<h3>$1</h3>') // Convert ### headers
      .replace(/^#### (.*)/gm, '<h4>$1</h4>') // Convert #### headers
      .replace(/\*\*(.*?)\*\*/gm, '<b>$1</b>') // Convert **text** to bold
      .replace(/^\- (.*)/gm, '<br>&bull; $1') // Convert - to list items with new lines
      .replace(/\n\n/g, '<br><br>'); // Add line breaks for new paragraphs

    recipeDisplay.innerHTML = formattedRecipe;
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
            renderRecipe(data.recipe); // Display the full recipe
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
            renderRecipe(data.recipe); // Display the full recipe
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
              renderRecipe(data.recipe); // Display the full recipe
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
      window.location.href = "/";
    });
  }
});