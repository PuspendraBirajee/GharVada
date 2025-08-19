// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const icon = togglePassword.querySelector("i");
const text = togglePassword.querySelector("span");

togglePassword.addEventListener("click", function () {
  const type = password.type === "password" ? "text" : "password";
  password.type = type;

  if (type === "password") {
    icon.classList.replace("fa-eye-slash", "fa-eye");
    text.textContent = "Show";
  } else {
    icon.classList.replace("fa-eye", "fa-eye-slash");
    text.textContent = " Hide";
  }
});
