document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.querySelector('#togglePassword');
  const password = document.querySelector('#password');
  const loginForm = document.querySelector('#loginForm');
  const otpForm = document.querySelector('#otpForm');
  
  const loginStep = document.querySelector('#loginStep');
  const otpStep = document.querySelector('#otpStep');
  const displayEmail = document.querySelector('#displayEmail');
  const backToLogin = document.querySelector('#backToLogin');
  const otpInputs = document.querySelectorAll('.otp-input');
  const resendCode = document.querySelector('#resendCode');

  let generatedCode = '';

  // Toggle Password Visibility
  togglePassword.addEventListener('click', () => {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });

  // Handle Login Form Submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;

    // Generate random 4-digit code
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Display the email and show generated code in console (simulating email delivery)
    displayEmail.textContent = email;
    console.log(`[Email Simulation] 4-Digit verification code sent to ${email}: ${generatedCode}`);
    alert(`A 4-digit code (${generatedCode}) was sent to ${email}`);

    // Switch view to OTP Step
    loginStep.classList.add('hidden');
    otpStep.classList.remove('hidden');
    otpInputs[0].focus();
  });

  // OTP Inputs: Auto-advance to next input field
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      // Navigate backward on Backspace if current box is empty
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // Handle Verification Form Submission
  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let enteredCode = '';
    otpInputs.forEach(input => enteredCode += input.value);

    if (enteredCode === generatedCode) {
      alert('Verification successful! You are logged in.');
    } else {
      alert('Invalid code! Please check your entries and try again.');
    }
  });

  // Resend Code Trigger
  resendCode.addEventListener('click', (e) => {
    e.preventDefault();
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`[Resent Email] New verification code: ${generatedCode}`);
    alert(`A new 4-digit code (${generatedCode}) has been sent!`);
  });

  // Back to Login Step
  backToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    otpStep.classList.add('hidden');
    loginStep.classList.remove('hidden');
    otpInputs.forEach(input => input.value = '');
  });
});