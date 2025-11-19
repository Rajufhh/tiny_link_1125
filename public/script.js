/**
 * TinyLink - Client-Side JavaScript
 * 
 * This file handles:
 * - Form submission
 * - API communication
 * - Display of results
 * - Copy to clipboard functionality
 */

/**
 * Initialize event listeners when page loads
 */
document.addEventListener('DOMContentLoaded', function() {
  // Get the form element
  const urlForm = document.getElementById('urlForm');
  
  // Add submit event listener
  urlForm.addEventListener('submit', handleFormSubmit);
});

/**
 * Handle form submission
 * 
 * @param {Event} e - The form submission event
 */
async function handleFormSubmit(e) {
  // Prevent the default form behavior (page refresh)
  e.preventDefault();

  // Get the input value
  const urlInput = document.getElementById('urlInput');
  const originalUrl = urlInput.value.trim();

  // Reset error and result sections
  hideError();
  hideResults();

  // Validate that URL is not empty
  if (!originalUrl) {
    showError('Please enter a URL');
    return;
  }

  // Show loading spinner
  showSpinner();

  try {
    // Make a POST request to our API
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalUrl: originalUrl
      })
    });

    // Parse the response as JSON
    const data = await response.json();

    // Hide loading spinner
    hideSpinner();

    // Check if the request was successful
    if (response.ok) {
      // Show the results
      displayResults(data);
    } else {
      // Show error message from server (FastAPI uses `detail`)
      showError(data.error || data.detail || 'Failed to shorten URL');
    }
  } catch (error) {
    // Handle network errors or other exceptions
    hideSpinner();
    console.error('Error:', error);
    showError('An error occurred. Please try again.');
  }
}

/**
 * Display the shortened URL results
 * 
 * @param {Object} data - The response data containing short URL info
 */
function displayResults(data) {
  // Populate the result fields with data
  document.getElementById('shortUrlDisplay').value = data.shortUrl;
  document.getElementById('shortCodeDisplay').value = data.shortCode;
  document.getElementById('originalUrlDisplay').value = data.originalUrl;
  document.getElementById('successMessage').textContent = 
    `✓ ${data.message}`;

  // Show the results section
  document.getElementById('resultsSection').style.display = 'block';

  // Scroll to results smoothly
  document.getElementById('resultsSection').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

/**
 * Show an error message to the user
 * 
 * @param {String} message - The error message to display
 */
function showError(message) {
  document.getElementById('errorMessage').textContent = `❌ ${message}`;
  document.getElementById('errorSection').style.display = 'block';

  // Scroll to error message
  document.getElementById('errorSection').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

/**
 * Hide the error message
 */
function hideError() {
  document.getElementById('errorSection').style.display = 'none';
}

/**
 * Hide the results section
 */
function hideResults() {
  document.getElementById('resultsSection').style.display = 'none';
}

/**
 * Show loading spinner
 */
function showSpinner() {
  document.getElementById('spinner').style.display = 'inline-block';
}

/**
 * Hide loading spinner
 */
function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';
}

/**
 * Copy the short URL to clipboard
 * Shows a temporary confirmation to the user
 */
function copyToClipboard(event) {
  // Get the short URL input element
  const shortUrlInput = document.getElementById('shortUrlDisplay');
  
  // Select all text in the input
  shortUrlInput.select();
  shortUrlInput.setSelectionRange(0, 99999); // For mobile devices

  try {
    // Copy to clipboard using modern API
    document.execCommand('copy');
    
    // Get the button that was clicked
    const copyButton = event ? event.target : document.querySelector('.btn-copy');
    
    // Store original text
    const originalText = copyButton.textContent;
    
    // Change button text to show success
    copyButton.textContent = '✓ Copied!';
    copyButton.style.backgroundColor = '#10b981';
    
    // Revert after 2 seconds
    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.style.backgroundColor = '';
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
    alert('Could not copy to clipboard');
  }
}

/**
 * Reset the form and hide results
 * This allows users to shorten another URL
 */
function resetForm() {
  // Clear the input field
  document.getElementById('urlInput').value = '';
  
  // Hide results and errors
  hideResults();
  hideError();
  
  // Focus on input for better UX
  document.getElementById('urlInput').focus();
  
  // Scroll to top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
