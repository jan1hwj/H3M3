function showThumbnail(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const thumbnail = document.getElementById('thumbnailPreview');
            thumbnail.src = e.target.result;
            thumbnail.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    }
}

function uploadImage() {
    const formData = new FormData(document.getElementById('uploadForm'));
    fetch('/upload_image', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.ingredients) {
            document.getElementById('ingredientsList').value = data.ingredients.join(', ');
        } else {
            alert('Failed to recognize ingredients. Please try again.');
        }
    })
    .catch(error => console.error('Error:', error));
}