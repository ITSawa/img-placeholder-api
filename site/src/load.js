document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Предотвращаем перезагрузку страницы

    const formData = new FormData(this);

    try {
      const response = await fetch("/user/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Если успешный ответ от сервера
        showSuccessMessage(result.message);
      } else {
        // Если ошибка от сервера
        showErrorMessage(result.message);
      }
    } catch (error) {
      // Если ошибка при отправке запроса
      showErrorMessage("An error occurred while uploading the image.");
    }
  });

// Функция для отображения сообщения об успехе
function showSuccessMessage(message) {
  const modal = document.getElementById("load-mine-modal");

  // Очищаем содержимое модала
  modal.innerHTML = "";

  // Вставляем сообщение об успехе
  modal.innerHTML = `
    <div class="load-mine">
      <h2>Success!</h2>
      <p>${message}</p>
    </div>
  `;

  // Через 4 секунды восстанавливаем форму
  setTimeout(() => {
    resetForm(modal);
  }, 4000);
}

// Функция для отображения сообщения об ошибке
function showErrorMessage(message) {
  const modal = document.getElementById("load-mine-modal");

  // Очищаем содержимое модала
  modal.innerHTML = "";

  // Вставляем сообщение об ошибке
  modal.innerHTML = `
    <div class="load-mine">
      <h2>Error!</h2>
      <p>${message}</p>
    </div>
  `;

  // Через 4 секунды восстанавливаем форму
  setTimeout(() => {
    resetForm(modal);
  }, 4000);
}

// Функция для восстановления формы
function resetForm(modal) {
  // Вставляем обратно исходное содержимое
  modal.innerHTML = `
    <div class="load-mine">
      <h2>You can load your own image!</h2>
      <p>After the loading image is sent to administrator for approval</p>

      <form id="uploadForm" enctype="multipart/form-data">
        <input
          type="text"
          name="image-name"
          id="image-name"
          placeholder="Image Name"
          required
        />
        <input
          type="text"
          name="image-author"
          id="image-author"
          placeholder="Image Author"
          required
        />
        <input type="file" name="image" id="image" required />
        <button type="submit">Send</button>
      </form>
    </div>
  `;

  // Добавляем обработчик для формы
  document
    .getElementById("uploadForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Предотвращаем перезагрузку страницы

      const formData = new FormData(this);

      try {
        const response = await fetch("/user/upload-image", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          // Если успешный ответ от сервера
          showSuccessMessage(result.message);
        } else {
          // Если ошибка от сервера
          showErrorMessage(result.message);
        }
      } catch (error) {
        // Если ошибка при отправке запроса
        showErrorMessage("An error occurred while uploading the image.");
      }
    });
}
