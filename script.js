document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registrationForm");
  const submitBtn = form.querySelector(".submit-btn");

  function validateName(name) {
    if (!name.trim()) {
      return "Full name is required.";
    }
    if (name.trim().length < 2) {
      return "Full name must be at least 2 characters long.";
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return "Full name can only contain letters and spaces.";
    }
    return "";
  }

  function validateEmail(email) {
    if (!email.trim()) {
      return "Email address is required.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    return "";
  }

  function validateAge(age) {
    if (!age) {
      return "Age is required.";
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return "Please enter a valid age between 1 and 120.";
    }
    return "";
  }

  function validateGender() {
    const genderInputs = document.querySelectorAll('input[name="gender"]');
    for (let input of genderInputs) {
      if (input.checked) {
        return "";
      }
    }
    return "Please select your gender.";
  }
  async function validatePincode() {
    const pin = document.getElementById("pincode").value.trim();
    const error = document.getElementById("pincode-error");

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      error.innerText = "Enter valid 6 digit PIN code";
      return false;
    }

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pin}`,
      );
      const data = await response.json();

      if (data[0].Status === "Success") {
        error.innerText = "";
        return true;
      } else {
        error.innerText = "PIN code does not exist";
        return false;
      }
    } catch (err) {
      error.innerText = "Unable to verify PIN code";
      return false;
    }
  }

  function validateTerms() {
    const termsCheckbox = document.getElementById("terms");
    if (!termsCheckbox.checked) {
      return "You must agree to the Terms and Conditions.";
    }
    return "";
  }

  // Show error function
  function showError(inputId, errorMessage) {
    const errorElement = document.getElementById(inputId + "-error");
    errorElement.textContent = errorMessage;
    errorElement.style.display = errorMessage ? "block" : "none";
  }

  // Validate individual field
  async function validateField(fieldName) {
    let error = "";
    switch (fieldName) {
      case "name":
        error = validateName(document.getElementById("name").value);
        break;
      case "email":
        error = validateEmail(document.getElementById("email").value);
        break;
      case "age":
        error = validateAge(document.getElementById("age").value);
        break;
      case "gender":
        error = validateGender();
        break;
      case "terms":
        error = validateTerms();
        break;
      case "pincode":
        // pincode sets its own error message internally, just return the boolean
        return await validatePincode();
    }
    showError(fieldName, error);
    return !error;
  }

  // Real-time validation on blur
  const inputs = ["name", "email", "age"];
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("blur", () => validateField(id));
    input.addEventListener("input", () => {
      if (document.getElementById(id + "-error").textContent) {
        validateField(id);
      }
    });
  });

  // Pincode validation on blur
  document
    .getElementById("pincode")
    .addEventListener("blur", () => validateField("pincode"));

  // Gender validation on change
  const genderInputs = document.querySelectorAll('input[name="gender"]');
  genderInputs.forEach((input) => {
    input.addEventListener("change", () => validateField("gender"));
  });

  // Terms validation on change
  document
    .getElementById("terms")
    .addEventListener("change", () => validateField("terms"));

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fields = ["name", "email", "age", "pincode", "gender", "terms"];
    const results = await Promise.all(
      fields.map((field) => validateField(field)),
    );
    const isValid = results.every(Boolean);

    if (isValid) {
      // Simulation
      submitBtn.textContent = "Submitting...";
      submitBtn.disabled = true;

      setTimeout(() => {
        alert("Form submitted successfully!");
        form.reset();
        submitBtn.textContent = "Submit";
        submitBtn.disabled = false;

        // Clear all error messages
        fields.forEach((field) => showError(field, ""));
      }, 2000);
    } else {
      // Focus on first invalid field
      const firstInvalidIndex = results.findIndex((r) => !r);
      if (firstInvalidIndex !== -1) {
        const firstInvalidField = fields[firstInvalidIndex];
        const el = document.getElementById(firstInvalidField);
        if (el) el.focus();
      }
    }
  });

  // Accessibility: Enter key support for radio buttons
  genderInputs.forEach((input) => {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        this.checked = true;
        validateField("gender");
      }
    });
  });

  // Prevent form submission on Enter for non-submit elements
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.type !== "submit") {
      e.preventDefault();
    }
  });
});
