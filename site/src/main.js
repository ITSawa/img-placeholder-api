// Function to fetch images from /images-random and update the image board

document.addEventListener("DOMContentLoaded", () => {
  const loadMoreElements = document.querySelectorAll("[id^='load-more-']");
  const fullscreenOverlay = document.getElementById("fullscreen-overlay");
  const fullscreenImage = document.getElementById("fullscreen-image");

  let imgIndexIncrement = 1;

  // Function to fetch image from server endpoint
  function fetchImageFromServer() {
    const endpoint = "/api/images-random"; // Replace with your actual endpoint URL
    return fetch(endpoint).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.blob();
    });
  }

  // Function to open image in fullscreen
  function openImgFullScreen(src) {
    fullscreenImage.src = src;
    fullscreenOverlay.style.display = "flex";

    fullscreenOverlay.onclick = () => {
      fullscreenOverlay.style.display = "none";
    };
  }

  const observers = [];

  loadMoreElements.forEach((element) => {
    let isLoading = false; // Loading indicator

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If the element is in, above the viewport, or within a certain distance below the viewport
          if (
            entry.isIntersecting ||
            entry.boundingClientRect.top < 0 ||
            entry.boundingClientRect.top < window.innerHeight + 200
          ) {
            console.log("Element is in, above, or close to the viewport");

            // If an image is not currently loading
            if (!isLoading) {
              isLoading = true; // Mark that loading has started

              const parentColumn = entry.target.parentElement;

              // Load the image
              fetchImageFromServer()
                .then((blob) => {
                  const imgURL = URL.createObjectURL(blob);
                  const img = document.createElement("img");
                  img.src = imgURL;
                  img.id = `img-${imgIndexIncrement++}`;
                  img.onclick = () => openImgFullScreen(img.src);

                  img.onload = () => {
                    parentColumn.insertBefore(img, entry.target); // Insert the image in the column
                    parentColumn.appendChild(entry.target); // Move load-more down after inserting the image
                    isLoading = false; // Reset loading flag after image loads
                  };

                  img.onerror = () => {
                    console.error("Error loading image.");
                    isLoading = false; // Reset loading flag in case of an error
                  };
                })
                .catch((error) => {
                  console.error("Error fetching image:", error);
                  isLoading = false; // Reset flag in case of an error
                });
            }
          } else if (entry.boundingClientRect.top > window.innerHeight + 200) {
            console.log("Element is too far down the viewport");
            // Do not load images that are too far down
            if (isLoading) {
              isLoading = false; // Reset loading flag
            }
          }
        });
      },
      {
        rootMargin: "0px 0px 200px 0px", // Trigger when the element is close to, in, or above the viewport
        threshold: 0, // Element should be at least partially visible in the viewport
      }
    );

    // Start observing the element
    observer.observe(element);
    observers.push(observer);
  });
});

window.addEventListener("load", function () {
  window.scrollTo(0, 0);
});

let scrollTimeout;

document.addEventListener("DOMContentLoaded", () => {
  const imageRange = document.getElementById("image-range");
  const rangeValue = document.getElementById("range-value");

  const localStorageRangeValue = localStorage.getItem("rangeValue");
  if (localStorageRangeValue) {
    imageRange.value = localStorageRangeValue;
    rangeValue.textContent = localStorageRangeValue;
    window.rangeValue = localStorageRangeValue;
  } else {
    imageRange.value = 5;
    rangeValue.textContent = 5;
    window.rangeValue = 5;
    localStorage.setItem("rangeValue", 5);
  }

  imageRange.addEventListener("input", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const rangeValue = document.getElementById("range-value");
      rangeValue.textContent = imageRange.value;
      window.rangeValue = imageRange.value;
      localStorage.setItem("rangeValue", imageRange.value);
    }, 100);
  });
});

document.body.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    // Время, на которое задерживается прокрутка
    const scrollSpeed = 0.8; // 1 - обычная скорость, 5 - в 5 раз медленнее

    // Получаем текущую позицию прокрутки
    let scrollPosition = window.scrollY || document.documentElement.scrollTop;

    // Вычисляем новое положение
    let newScrollPosition = scrollPosition + event.deltaY / scrollSpeed;

    // Прокручиваем страницу вручную
    window.scrollTo({
      top: newScrollPosition,
      behavior: "smooth",
    });
  },
  { passive: false }
);

document.addEventListener("DOMContentLoaded", () => {
  let autoScrollInterval;

  function togleAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    } else {
      autoScrollInterval = setInterval(() => {
        window.scrollBy(0, window.rangeValue * 10);
      }, 10);
    }
  }

  const startAutoScroll = document.getElementById("start-auto-scroll");
  startAutoScroll.addEventListener("click", togleAutoScroll);

  document.addEventListener("wheel", () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const navList = document.querySelector(".nav-list");
  const burger = document.querySelector(".burger");
  const body = document.querySelector("body");

  burger.addEventListener("click", () => {
    navList.classList.toggle("active");
    burger.classList.toggle("active");
    body.classList.toggle("no-scroll");
  });

  // header

  const headerContent = document.querySelector(".header-content");
  const header = document.querySelector("header");

  window.addEventListener("scroll", () => {
    headerContent.style.opacity =
      1 - (window.scrollY / header.offsetHeight) * 1.5;
  });

  console.log("All scripts successfully loaded.");

  // navbar buttons

  const infoForm = document.getElementById("info-modal");
  const contactForm = document.getElementById("contact-modal");
  const loadMineForm = document.getElementById("load-mine-modal");
  const navbar = document.querySelector(".navbar");

  function toggleModal(modal, show) {
    if (show) {
      body.classList.add("no-scroll");
      navbar.style.zIndex = 10;
      modal.style.display = "flex";
    } else {
      body.classList.remove("no-scroll");
      navbar.style.zIndex = 10000;
      modal.style.display = "none";
    }
  }

  function handleDoubleClick(modal) {
    modal.addEventListener("dblclick", () => toggleModal(modal, false));
  }

  handleDoubleClick(infoForm);
  handleDoubleClick(contactForm);
  handleDoubleClick(loadMineForm);

  window.showInfo = () => toggleModal(infoForm, true);
  window.closeInfo = () => toggleModal(infoForm, false);
  window.showContact = () => toggleModal(contactForm, true);
  window.closeContact = () => toggleModal(contactForm, false);
  window.openLoadMine = () => toggleModal(loadMineForm, true);
  window.closeLoadMine = () => toggleModal(loadMineForm, false);
});
