console.log('add_recipe.js is executing...');

const form = document.getElementById("recipe-form");
const statusMsg = document.getElementById("status-message");

// Handle form submission
form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form default submission
    statusMsg.textContent = "";
    statusMsg.className = "";

    console.log("Form submit triggered.");

    // Gather form data
    const data = {
        title: form.title.value.trim(),
        category: form.category.value,
        contributor: form.contributor.value.trim(),
        ingredients: form.ingredients.value.trim(),
        instructions: form.instructions.value.trim()
    };

    // Basic client-side validation
    const missingFields = validateForm(data);
    if (missingFields.length > 0) {
        statusMsg.textContent = `Error: Missing the following required fields: ${missingFields.join(', ')}.`;
        statusMsg.classList.add("error");
        console.log("Form validation failed:", missingFields);
        return;
    }

    // Proceed to API call
    await submitRecipe(data);
});

// Validate form data for missing fields
function validateForm(data) {
    const missingFields = [];
    for (const [key, value] of Object.entries(data)) {
        if (!value) {
            missingFields.push(key);
        }
    }
    return missingFields;
}

// Submit the recipe to the backend API
async function submitRecipe(data) {
    const API_URL = "http://localhost:8080/recipes";

    console.log("submitRecipe - START");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            statusMsg.textContent = `✅ Recipe added! ID: ${result.id}`;
            statusMsg.classList.add("success");
            form.reset();  // Reset form after submission
            console.log("Recipe added successfully. ID:", result.id);
        } else {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            const contentType = response.headers.get("Content-Type") || "";

            if (contentType.includes("application/json")) {
                const err = await response.json();
                errorMessage = `Error: ${err.error || response.statusText}`;
            } else {
                const text = await response.text();
                errorMessage = `Error: ${text || response.statusText}`;
            }

            statusMsg.textContent = errorMessage;
            statusMsg.classList.add("error");
            console.log("Error during submission:", errorMessage);
        }
    } catch (networkError) {
        statusMsg.textContent = `Network error: ${networkError.message}`;
        statusMsg.classList.add("error");
        console.log("Network error:", networkError.message);
    }

    console.log("submitRecipe - END");
}
